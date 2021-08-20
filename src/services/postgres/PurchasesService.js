const { Pool } = require('pg');
const uuid = require('uuid-random');
const InvariantError = require('../../exceptions/InvariantError');
const NotFoundError = require('../../exceptions/NotFoundError');
const { validateUuid } = require('../../utils');

class PurchasesService {
  constructor() {
    this._pool = new Pool();
  }

  async createTransaction({
    date, invoice, description, amount, discount, items, userId, officeId,
  }) {
    const client = await this._pool.connect();
    try {
      await client.query('BEGIN'); // transaction

      const id = uuid();
      const purchasesQuery = {
        text: `INSERT INTO 
                purchases(id, date, invoice, description, amount, discount, created_by, office_id)
              VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING id`,
        values: [id, date, invoice, description, amount, discount, userId, officeId],
      };

      const purchase = await client.query(purchasesQuery);
      const purchaseId = purchase.rows[0].id;

      await items.map(async (item) => {
        const { rows } = await client.query(`SELECT stock, purchase FROM stocks WHERE product_id = '${item.productId}'`)
        await client.query(`UPDATE stocks SET stock = '${+rows[0].stock + +item.quantity}', purchase = '${+rows[0].purchase + +item.quantity}' WHERE product_id = '${item.productId}'`);

        const itemQuery = {
          text: `INSERT INTO purchase_items(purchase_id, product_id, quantity, cost) VALUES ('${purchaseId}', '${item.productId}', '${item.quantity}', '${item.cost}')`,
        };

        await client.query(itemQuery);
      });

      await client.query('COMMIT');

      return purchaseId;
    } catch (error) {
      await client.query('ROLLBACK');
      throw new InvariantError(`transaksi gagal: ${error.message}`);
    } finally {
      client.release();
    }
  }

  async getPurchases(companyId, { startDate, endDate, page = 1, q, limit = 20 }) {
    const recordsQuery = await this._pool.query(`
      SELECT count(purchases.id) as total 
      FROM purchases
      WHERE 
        purchases.office_id = (SELECT id FROM offices WHERE company_id = '${companyId}' LIMIT 1)
        ${q ? `AND invoice ILIKE '%${q}%'` : ''}
      AND date::DATE BETWEEN '${startDate}' AND '${endDate}'
    `);

    const { total } = recordsQuery.rows[0];

    const totalPages = Math.ceil(total / limit);
    const offsets = limit * (page - 1);

    const query = {
      text: `SELECT 
              purchases.id, invoice, date, amount,
              offices.name as office_name,
              users.name as creator
            FROM purchases 
            LEFT JOIN offices ON offices.id = purchases.office_id
            LEFT JOIN users ON users.id = purchases.created_by
            WHERE 
              purchases.office_id = (SELECT id FROM offices WHERE company_id = $1 LIMIT 1)
              ${q ? `AND invoice ILIKE '%${q}%'` : ''}
            AND date::DATE BETWEEN $2 AND $3
            ORDER BY purchases.created_at DESC
            LIMIT $4 OFFSET $5`,
      values: [companyId, startDate, endDate, limit, offsets],
    };

    const { rows } = await this._pool.query(query);

    return {
      purchases: rows,
      meta: {
        page,
        total,
        totalPages,
      },
    };
  }

  async getPurchaseById(purchaseId) {
    validateUuid(purchaseId);

    const query = {
      text: `SELECT 
                date, invoice, purchases.description, amount, discount, users.name as creator, offices.name as office_name 
              FROM purchases
              LEFT JOIN offices ON offices.id = purchases.office_id
              LEFT JOIN users ON users.id = purchases.created_by
              WHERE purchases.id = $1
              ORDER BY purchases.created_at DESC`,
      values: [purchaseId],
    };

    const results = await this._pool.query(query);

    if (results.rowCount < 1) {
      throw new NotFoundError('transaksi tidak ditemukan');
    }

    const itemsQuery = {
      text: `SELECT 
              products.id, products.code, products.name, quantity, purchase_items.cost
            FROM purchase_items
            LEFT JOIN products ON products.id = purchase_items.product_id
            WHERE purchase_id = $1`,
      values: [purchaseId],
    };

    const items = await this._pool.query(itemsQuery);

    return {
      ...results.rows[0],
      items: items.rows,
    };
  }
}

module.exports = PurchasesService;
