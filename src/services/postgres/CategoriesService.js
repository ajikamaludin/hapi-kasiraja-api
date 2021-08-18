const { Pool } = require('pg');
const uuid = require('uuid-random');
const NotFoundError = require('../../exceptions/NotFoundError');
const { validateUuid } = require('../../utils');

class CategoriesService {
  constructor() {
    this._pool = new Pool();
  }

  async getCategories(companyId, { page = 1, limit = 10, q = null }) {
    const recordsQuery = await this._pool.query(`
      SELECT count(id) as total 
      FROM categories 
      WHERE 
        company_id = '${companyId}' 
        ${q !== null ? `AND name ILIKE '%${q}%'` : ''}
    `);

    const { total } = recordsQuery.rows[0];

    const totalPages = Math.ceil(total / limit);
    const offsets = limit * (page - 1);

    const query = {
      text: `
        SELECT id, name, description 
        FROM categories 
        WHERE company_id = $1
        ${q !== null ? `AND name ILIKE '%${q}%'` : ''}
        LIMIT $2 OFFSET $3`,
      values: [companyId, limit, offsets],
    };

    const { rows } = await this._pool.query(query);

    return {
      categories: rows,
      meta: {
        totalPages,
        total,
        page,
      },
    };
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
