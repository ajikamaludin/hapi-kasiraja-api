const { Pool } = require('pg');
const uuid = require('uuid-random');
const NotFoundError = require('../../exceptions/NotFoundError');
const { validateUuid } = require('../../utils');

class CustomersService {
  constructor() {
    this._pool = new Pool();
  }

  async getCustomers(companyId, { page = 1, limit = 10, q = null }) {
    const recordsQuery = await this._pool.query(`
      SELECT count(id) as total 
      FROM customers 
      WHERE 
        company_id = '${companyId}' 
        ${q ? `AND (name ILIKE '%${q}%' OR phone ILIKE '%${q}%')` : ''}
    `);

    const { total } = recordsQuery.rows[0];

    const totalPages = Math.ceil(total / limit);
    const offsets = limit * (page - 1);

    const query = {
      text: `
        SELECT id, name, phone, description 
        FROM customers 
        WHERE company_id = $1
        ${q ? `AND (name ILIKE '%${q}%' OR phone ILIKE '%${q}%')` : ''}
        ORDER BY created_at DESC
        LIMIT $2 OFFSET $3`,
      values: [companyId, limit, offsets],
    };

    const { rows } = await this._pool.query(query);

    return {
      customers: rows,
      meta: {
        totalPages,
        total,
        page,
      },
    };
  }

  async getCustomerById(customerId) {
    validateUuid(customerId);

    const query = {
      text: 'SELECT name, phone, address, description FROM customers WHERE id = $1',
      values: [customerId],
    };

    const results = await this._pool.query(query);

    if (results.rowCount < 1) {
      throw new NotFoundError('Customer tidak ditemukan');
    }

    return results.rows[0];
  }

  async addCustomer({ name, phone, address, description, companyId }) {
    const id = uuid();
    const query = {
      text: 'INSERT INTO customers(id, name, phone, address, description, company_id) VALUES ($1, $2, $3, $4, $5, $6)',
      values: [id, name, phone, address, description, companyId],
    };

    await this._pool.query(query);

    return id;
  }

  async updateCustomerById(customerId, { name, phone, address, description }) {
    validateUuid(customerId);

    const query = {
      text: 'UPDATE customers SET name = $1, phone = $2, address = $3, description = $4 WHERE id = $5',
      values: [name, phone, address, description, customerId],
    };

    await this._pool.query(query);
  }

  async deleteCustomerById(customerId) {
    validateUuid(customerId);

    const query = {
      text: 'DELETE FROM customers WHERE id = $1',
      values: [customerId],
    };

    await this._pool.query(query);
  }
}

module.exports = CustomersService;
