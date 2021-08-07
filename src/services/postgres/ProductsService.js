const { Pool } = require('pg');
const uuid = require('uuid-random');
const { validateUuid } = require('../../utils');
const NotFoundError = require('../../exceptions/NotFoundError');
const InvariantError = require('../../exceptions/InvariantError');

class ProductsService {
  constructor() {
    this._pool = new Pool();
  }

  async getProducts(companyId, { startDate, endDate }) {
    const query = {
      text: `SELECT 
              name, description, price, cost
            FROM products
            WHERE company_id = $1 AND created_at BETWEEN $2 AND $3`,
      values: [companyId, startDate, endDate],
    };

    const results = await this._pool.query(query);

    return results.rows;
  }

  async getProduct({ productId, companyId }) {
    validateUuid(productId);

    const query = {
      text: `SELECT 
              product.name, product.description, price, cost, cost_average, categories.name as category_name, stocks.stock
            FROM products
            LEFT JOIN stocks.product_id ON products.id
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

    try {
      await this._pool.query('BEGIN');
      await this._pool.query(productQuery);
      await this._pool.query(stockQuery);
      await this._pool.query('COMMIT');
    } catch (err) {
      console.log(err);
      await this._pool.query('ROLLBACK');
      throw new InvariantError('Product gagal ditambahkan');
    }

    return productId;
  }

  async updateProduct(productId, {
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

  async deleteProduct(productId) {
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
