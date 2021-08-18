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
        await client.query(`UPDATE stocks SET stock = '${+item.stock + +item.quantity}', purchase = '${+item.purchase + +item.quantity}' WHERE product_id = '${item.productId}'`);

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

  async getPurchases(companyId, { startDate, endDate }) {
    const query = {
      text: `SELECT 
              purchases.id, invoice, date, amount, offices.name as office_name
            FROM purchases 
            LEFT JOIN offices ON offices.id = purchases.office_id
            WHERE 
              purchases.office_id = (SELECT id FROM offices WHERE company_id = $1 LIMIT 1) 
            AND date::DATE BETWEEN $2 AND $3`,
      values: [companyId, startDate, endDate],
    };

    const results = await this._pool.query(query);

    return results.rows;
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
              ORDER BY created_at DESC`,
      values: [purchaseId],
    };

    const results = await this._pool.query(query);

    if (results.rowCount < 1) {
      throw new NotFoundError('transaksi tidak ditemukan');
    }

    const itemsQuery = {
      text: `SELECT 
              products.name, quantity, purchase_items.cost
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
