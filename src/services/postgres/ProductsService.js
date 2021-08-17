const { Pool } = require('pg');
const uuid = require('uuid-random');
const { validateUuid } = require('../../utils');
const NotFoundError = require('../../exceptions/NotFoundError');
const InvariantError = require('../../exceptions/InvariantError');

class ProductsService {
  constructor() {
    this._pool = new Pool();
  }

  async getProducts(companyId, { startDate, endDate, withStock }) {
    let query = {
      text: `SELECT 
              id, name, description, price, cost
            FROM products
            WHERE company_id = $1 AND created_at BETWEEN $2 AND $3`,
      values: [companyId, startDate, endDate],
    };

    if (withStock && withStock === 'true') {
      query = {
        text: `SELECT 
                name, description, price, cost, stock
              FROM products
              LEFT JOIN stocks ON stocks.product_id = products.id
              WHERE company_id = $1 AND products.created_at BETWEEN $2 AND $3`,
        values: [companyId, startDate, endDate],
      };
    }

    const results = await this._pool.query(query);

    return results.rows;
  }

  async getProductById({ productId, companyId }) {
    validateUuid(productId);

    const query = {
      text: `SELECT 
              products.name, products.description, price, cost, cost_average, categories.name as category_name, stocks.stock
            FROM products
            LEFT JOIN stocks ON stocks.product_id = products.id
            LEFT JOIN categories ON categories.id = products.category_id
            WHERE products.id = $1 AND products.company_id = $2`,
      values: [productId, companyId],
    };

    const result = await this._pool.query(query);

    if (result.rowCount < 1) {
      throw new NotFoundError('Product tidak ditemukan');
    }

    return result.rows[0];
  }

  async addProduct({
    name, description, price, cost, stock, categoryId, companyId,
  }) {
    const productId = uuid();
    const stockId = uuid();

    const productQuery = {
      text: `INSERT INTO products(id, name, description, price, cost, category_id, company_id, unit_id)
            VALUES
            ($1, $2, $3, $4, $5, $6, $7, (SELECT id FROM units WHERE company_id = $7 LIMIT 1))`,
      values: [productId, name, description, price, cost, categoryId, companyId],
    };

    // update stock default warehouse default office
    const stockQuery = {
      text: `INSERT INTO 
              stocks(id, product_id, stock, warehouse_id, sale, purchase)
            VALUES 
              ($1, $2, $3, (
                SELECT id FROM warehouses WHERE office_id = 
                  (SELECT id FROM offices WHERE company_id = $4 LIMIT 1) 
                LIMIT 1),
              0, 0)`,
      values: [stockId, productId, stock, companyId],
    };

    const client = await this._pool.connect();

    try {
      await client.query('BEGIN');
      await client.query(productQuery);
      await client.query(stockQuery);
      await client.query('COMMIT');
    } catch (err) {
      await client.query('ROLLBACK');
      throw new InvariantError(`Product gagal ditambahkan: ${err.message}`);
    } finally {
      client.release();
    }

    return productId;
  }

  async updateProductById(productId, {
    name, description, price, cost, stock, categoryId,
  }) {
    validateUuid(productId);

    const productQuery = {
      text: `UPDATE products SET 
              name = $1, description = $2, price = $3, 
              cost = $4, category_id = $5
            WHERE id = $6`,
      values: [name, description, price, cost, categoryId, productId],
    };

    // update stock all warehouses
    const stockQuery = {
      text: 'UPDATE stocks SET stock = $1 WHERE product_id = $2',
      values: [stock, productId],
    };

    try {
      await this._pool.query('BEGIN');
      await this._pool.query(productQuery);
      await this._pool.query(stockQuery);
      await this._pool.query('COMMIT');
    } catch (err) {
      await this._pool.query('ROLLBACK');
      throw new InvariantError('Product gagal diubah');
    }
  }

  async deleteProductById(productId) {
    validateUuid(productId);
    const query = {
      text: 'DELETE FROM products WHERE id = $1',
      values: [productId],
    };

    const result = await this._pool.query(query);

    if (result.rowCount < 1) {
      throw new NotFoundError('Product tidak ditemukan');
    }
  }
}

module.exports = ProductsService;
