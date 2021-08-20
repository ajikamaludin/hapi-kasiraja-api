const { Pool } = require('pg');
const uuid = require('uuid-random');
const InvariantError = require('../../exceptions/InvariantError');
const NotFoundError = require('../../exceptions/NotFoundError');
const { validateUuid } = require('../../utils');

class SalesService {
  constructor() {
    this._pool = new Pool();
  }

  async createTransaction({
    date, invoice, description, amount, discount, items, userId, officeId, customerId,
  }) {
    // check stock
    const stocksQuery = await this._pool.query(`
      SELECT product_id, stock, sale FROM stocks 
      WHERE product_id IN (${items.map((i) => `'${i.productId}'`).join()})`);
    const stocks = stocksQuery.rows;
    const itemsWithStock = items.map((item) => ({
      ...item,
      stock: stocks.find((sp) => sp.product_id === item.productId).stock,
      sale: stocks.find((sp) => sp.product_id === item.productId).sale,
    }));
    const checkStock = itemsWithStock
      .map((iws) => +iws.stock - +iws.quantity).every((i) => i >= 0);
    if (!checkStock) {
      throw new InvariantError('transaksi gagal: stock tidak cukup');
    }

    const client = await this._pool.connect();
    try {
      await client.query('BEGIN'); // transaction

      const id = uuid();
      const saleQuery = {
        text: `INSERT INTO 
                sales(id, date, invoice, description, amount, discount, created_by, office_id, customer_id)
              VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING id`,
        values: [id, date, invoice, description, amount, discount, userId, officeId, customerId],
      };

      const sale = await client.query(saleQuery);
      const saleId = sale.rows[0].id;

      await itemsWithStock.map(async (item) => {
        await client.query(`UPDATE stocks SET stock = '${+item.stock - +item.quantity}', sale = '${+item.sale + +item.quantity}' WHERE product_id = '${item.productId}'`);

        const itemQuery = {
          text: `INSERT INTO sale_items(sale_id, product_id, quantity, price) VALUES ('${saleId}', '${item.productId}', '${item.quantity}', '${item.price}')`,
        };

        await client.query(itemQuery);
      });

      await client.query('COMMIT');

      return saleId;
    } catch (error) {
      await client.query('ROLLBACK');
      throw new InvariantError(`transaksi gagal: ${error.message}`);
    } finally {
      client.release();
    }
  }

  async getSales(companyId, {
    startDate, endDate, page = 1, q = null, customerId, limit = 20,
  }) {
    const recordsQuery = await this._pool.query(`
      SELECT count(sales.id) as total 
      FROM sales 
      ${customerId ? `LEFT JOIN customers ON customers.id = sales.customer_id` : ''}
      WHERE 
        sales.office_id = (SELECT id FROM offices WHERE company_id = '${companyId}' LIMIT 1)
        ${q ? `AND invoice ILIKE '%${q}%'` : ''}
        ${customerId ? `AND customer_id = '${customerId}'` : ''}
    `);

    const { total } = recordsQuery.rows[0];

    const totalPages = Math.ceil(total / limit);
    const offsets = limit * (page - 1);

    const query = {
      text: `SELECT 
              sales.id, invoice, date, amount, 
              offices.name as office_name, 
              users.name as casier,
              customers.name as customer_name
            FROM sales 
            LEFT JOIN offices ON offices.id = sales.office_id
            LEFT JOIN users ON users.id = sales.created_by
            LEFT JOIN customers ON customers.id = sales.customer_id
            WHERE 
              sales.office_id = (SELECT id FROM offices WHERE company_id = $1 LIMIT 1)
            ${q ? `AND invoice ILIKE '%${q}%'` : ''}
            ${customerId ? `AND customer_id = '${customerId}'` : ''}
            AND date::DATE BETWEEN $2 AND $3
            ORDER BY sales.created_at DESC
            LIMIT $4 OFFSET $5
            `,
      values: [companyId, startDate, endDate, limit, offsets],
    };

    const { rows } = await this._pool.query(query);

    return {
      sales: rows,
      meta: {
        page,
        total,
        totalPages,
      },
    };
  }

  async getSaleById(saleId) {
    validateUuid(saleId);

    const query = {
      text: `SELECT 
                date, invoice, sales.description, amount, discount, 
                users.name as casier, 
                offices.name as office_name,
                customers.id as customer_id, customers.name as customer_name
              FROM sales
              LEFT JOIN offices ON offices.id = sales.office_id
              LEFT JOIN users ON users.id = sales.created_by
              LEFT JOIN customers ON customers.id = sales.customer_id
              WHERE sales.id = $1`,
      values: [saleId],
    };

    const results = await this._pool.query(query);

    if (results.rowCount < 1) {
      throw new NotFoundError('transaksi tidak ditemukan');
    }

    const itemsQuery = {
      text: `SELECT 
              products.id, products.code, products.name, quantity, sale_items.price
            FROM sale_items
            LEFT JOIN products ON products.id = sale_items.product_id
            WHERE sale_id = $1`,
      values: [saleId],
    };

    const items = await this._pool.query(itemsQuery);

    return {
      ...results.rows[0],
      items: items.rows,
    };
  }
}

module.exports = SalesService;
