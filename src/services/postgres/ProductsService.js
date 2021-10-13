const { Pool } = require('pg');
const uuid = require('uuid-random');
const { validateUuid } = require('../../utils');
const NotFoundError = require('../../exceptions/NotFoundError');
const InvariantError = require('../../exceptions/InvariantError');

class ProductsService {
  constructor() {
    this._pool = new Pool();
  }

  async getProducts(companyId, {
    page = 1, q = null, withStock = false, withCategory = false, categoryId, limit = 10,
  }) {
    const recordsQuery = await this._pool.query(`
      SELECT count(id) as total 
      FROM products 
      WHERE 
        company_id = '${companyId}' 
        ${q ? `AND (name ILIKE '%${q}%' OR code ILIKE '%${q}%')` : ''}
    `);

    const { total } = recordsQuery.rows[0];

    const totalPages = Math.ceil(total / limit);
    const offsets = limit * (page - 1);

    const query = {
      text: `SELECT 
              products.id, products.code, products.name, products.description, price, cost
              ${withStock === 'true' ? ', stock, sale, purchase' : ''}
              ${withCategory === 'true' ? ', categories.name as category_name' : ''}
            FROM products
            ${withStock === 'true' ? 'LEFT JOIN stocks ON stocks.product_id = products.id' : ''}
            ${withCategory === 'true' ? 'LEFT JOIN categories ON categories.id = products.category_id' : ''}
            WHERE products.company_id = $1
            ${categoryId ? `AND categories.id = '${categoryId}'` : ''}
            ${q ? `AND (products.name ILIKE '%${q}%' OR products.code ILIKE '%${q}%')` : ''}
            ORDER BY products.created_at DESC
            LIMIT $2 OFFSET $3`,
      values: [companyId, limit, offsets],
    };

    const { rows } = await this._pool.query(query);

    return {
      products: rows,
      meta: {
        totalPages,
        total,
        page,
      },
    };
  }

  async getProductById({ productId, companyId }) {
    validateUuid(productId);

    const query = {
      text: `SELECT 
              products.code, products.name, products.description, price, cost, cost_average, 
              categories.name as category_name,
              categories.id as category_id,
              stocks.stock
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
    code, name, description, price, cost, stock, categoryId, companyId,
  }) {
    const productId = uuid();
    const stockId = uuid();

    const productQuery = {
      text: `INSERT INTO products(id, code, name, description, price, cost, category_id, company_id, unit_id)
            VALUES
            ($1, $2, $3, $4, $5, $6, $7, $8, (SELECT id FROM units WHERE company_id = $8 LIMIT 1))`,
      values: [productId, code, name, description, price, cost, categoryId, companyId],
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
    code, name, description, price, cost, stock, categoryId,
  }) {
    validateUuid(productId);

    const productQuery = {
      text: `UPDATE products SET 
              code = $1, name = $2, description = $3, price = $4, 
              cost = $5, category_id = $6
            WHERE id = $7`,
      values: [code, name, description, price, cost, categoryId, productId],
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
