const { Pool } = require('pg');
const uuid = require('uuid-random');
const NotFoundError = require('../../exceptions/NotFoundError');
const { validateUuid } = require('../../utils');

class CategoriesService {
  constructor() {
    this._pool = new Pool();
  }

  async getCategories(companyId, { startDate, endDate }) {
    const query = {
      text: 'SELECT id, name, description FROM categories WHERE company_id = $1 AND created_at BETWEEN $2 AND $3',
      values: [companyId, startDate, endDate],
    };

    const results = await this._pool.query(query);

    return results.rows;
  }

  async getCategoryById(categoryId) {
    validateUuid(categoryId);

    const query = {
      text: 'SELECT name, description FROM categories WHERE id = $1',
      values: [categoryId],
    };

    const results = await this._pool.query(query);

    if (results.rowCount < 1) {
      throw new NotFoundError('Category tidak ditemukan');
    }

    return results.rows[0];
  }

  async addCategory({ name, description, companyId }) {
    const id = uuid();
    const query = {
      text: 'INSERT INTO categories(id, name, description, company_id) VALUES ($1, $2, $3, $4)',
      values: [id, name, description, companyId],
    };

    await this._pool.query(query);

    return id;
  }

  async updateCategoryById(categoryId, { name, description }) {
    validateUuid(categoryId);

    const query = {
      text: 'UPDATE categories SET name = $1, description = $2 WHERE id = $3',
      values: [name, description, categoryId],
    };

    await this._pool.query(query);
  }

  async deleteCategoryById(categoryId) {
    validateUuid(categoryId);

    const query = {
      text: 'DELETE FROM categories WHERE id = $1',
      values: [categoryId],
    };

    await this._pool.query(query);
  }
}

module.exports = CategoriesService;
