const { Pool } = require('pg');
const uuid = require('uuid-random');
const NotFoundError = require('../../exceptions/NotFoundError');
const { validateUuid } = require('../../utils');

class UnitsService {
  constructor() {
    this._pool = new Pool();
  }

  async getUnits(companyId, { startDate, endDate }) {
    const query = {
      text: 'SELECT id, name, description FROM units WHERE company_id = $1 AND created_at::DATE BETWEEN $2 AND $3',
      values: [companyId, startDate, endDate],
    };

    const results = await this._pool.query(query);

    return results.rows;
  }

  async getUnitById(unitId) {
    validateUuid(unitId);

    const query = {
      text: 'SELECT name, description FROM units WHERE id = $1',
      values: [unitId],
    };

    const results = await this._pool.query(query);

    if (results.rowCount < 1) {
      throw new NotFoundError('Unit tidak ditemukan');
    }

    return results.rows[0];
  }

  async addUnit({ name, description, companyId }) {
    const id = uuid();
    const query = {
      text: 'INSERT INTO units(id, name, description, company_id) VALUES ($1, $2, $3, $4)',
      values: [id, name, description, companyId],
    };

    await this._pool.query(query);

    return id;
  }

  async updateUnitById(unitId, { name, description }) {
    validateUuid(unitId);

    const query = {
      text: 'UPDATE units SET name = $1, description = $2 WHERE id = $3',
      values: [name, description, unitId],
    };

    await this._pool.query(query);
  }

  async deleteUnitById(unitId) {
    validateUuid(unitId);

    const query = {
      text: 'DELETE FROM units WHERE id = $1',
      values: [unitId],
    };

    await this._pool.query(query);
  }
}

module.exports = UnitsService;
