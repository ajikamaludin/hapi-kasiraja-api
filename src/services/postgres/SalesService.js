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
    date, invoice, description, amount, discount, items, userId, officeId,
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
                sales(id, date, invoice, description, amount, discount, created_by, office_id)
              VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING id`,
        values: [id, date, invoice, description, amount, discount, userId, officeId],
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

  async getSales(companyId, { startDate, endDate }) {
    const query = {
      text: `SELECT 
              sales.id, invoice, date, amount, offices.name as office_name
            FROM sales 
            LEFT JOIN offices ON offices.id = sales.office_id
            WHERE 
              sales.office_id = (SELECT id FROM offices WHERE company_id = $1 LIMIT 1) 
            AND date::DATE BETWEEN $2 AND $3
            ORDER BY created_at DESC`,
      values: [companyId, startDate, endDate],
    };

    const results = await this._pool.query(query);

    return results.rows;
  }

  async getSaleById(saleId) {
    validateUuid(saleId);

    const query = {
      text: `SELECT 
                date, invoice, sales.description, amount, discount, users.name as creator, offices.name as office_name 
              FROM sales
              LEFT JOIN offices ON offices.id = sales.office_id
              LEFT JOIN users ON users.id = sales.created_by
              WHERE sales.id = $1`,
      values: [saleId],
    };

    const results = await this._pool.query(query);

    if (results.rowCount < 1) {
      throw new NotFoundError('transaksi tidak ditemukan');
    }

    const itemsQuery = {
      text: `SELECT 
              products.name, quantity, sale_items.price
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
