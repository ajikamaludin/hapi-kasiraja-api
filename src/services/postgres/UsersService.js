const { Pool } = require('pg');
const bcrypt = require('bcrypt');
const uuid = require('uuid-random');
const AuthenticationError = require('../../exceptions/AuthenticationError');
const InvariantError = require('../../exceptions/InvariantError');
const NotFoundError = require('../../exceptions/NotFoundError');
const { validateUuid } = require('../../utils');

class UsersService {
  constructor() {
    this._pool = new Pool();
  }

  async verifyUserCredential(email, password) {
    const query = {
      text: 'SELECT id, company_id, password FROM users WHERE email = $1',
      values: [email],
    };
    const result = await this._pool.query(query);

    if (!result.rows.length) {
      throw new AuthenticationError('Kredensial yang Anda berikan salah');
    }

    const { id, company_id: companyId, password: hashedPassword } = result.rows[0];

    const match = await bcrypt.compare(password, hashedPassword);

    if (!match) {
      throw new AuthenticationError('Kredensial yang Anda berikan salah');
    }
    return { id, companyId };
  }

  async verifyNewEmail({ email }) {
    const query = {
      text: 'SELECT id FROM users WHERE email = $1',
      values: [email],
    };

    const result = await this._pool.query(query);

    if (result.rowCount >= 1) {
      throw new InvariantError('Email sudah digunakan');
    }
  }

  async addUser({
    name, email, password, companyId,
  }) {
    await this.verifyNewEmail({ email });

    const id = uuid();
    const hashedPassword = await bcrypt.hash(password, 12);

    const query = {
      text: 'INSERT INTO users(id, name, email, password, company_id, role) VALUES ($1, $2, $3, $4, $5, $6)',
      values: [id, name, email, hashedPassword, companyId, 'kasir'],
    };

    await this._pool.query(query);

    return id;
  }

  async getUsers(companyId, { startDate, endDate }) {
    // TODO: implement pagination leter
    const query = {
      text: 'SELECT name, email, role FROM users WHERE company_id = $1 AND created_at BETWEEN $2 AND $3',
      values: [companyId, startDate, endDate],
    };

    const result = await this._pool.query(query);

    return result.rows;
  }

  async getUserById({ userId, companyId }) {
    validateUuid(userId);

    const query = {
      text: 'SELECT name, email, role FROM users WHERE id = $1 AND company_id = $2',
      values: [userId, companyId],
    };

    const result = await this._pool.query(query);

    if (result.rowCount < 1) {
      throw new NotFoundError('User tidak ditemukan');
    }

    return result.rows[0];
  }

  async getMe(userId) {
    validateUuid(userId);

    const query = {
      text: `SELECT 
              users.name, users.email, offices.id as officeId, companies.id as companyId 
            FROM users 
            LEFT JOIN companies ON companies.id = users.company_id
            LEFT JOIN offices ON companies.id = offices.company_id
            WHERE users.id = $1`,
      values: [userId],
    };

    const result = await this._pool.query(query);

    if (result.rowCount < 1) {
      throw new NotFoundError('User tidak ditemukan');
    }

    return result.rows[0];
  }

  async updateUserById(userId, { name, email, password }) {
    validateUuid(userId);

    let hashedPassword = '';
    if (password) {
      hashedPassword = await bcrypt.hash(password, 12);
    }
    const updatedAt = new Date().toISOString();
    const query = {
      text: `UPDATE users SET name = $1, email = $2, updated_at = $3 ${password ? `, password = '${hashedPassword}'` : ''} WHERE id = $4`,
      values: [name, email, updatedAt, userId],
    };

    const result = await this._pool.query(query);

    if (result.rowCount < 1) {
      throw new NotFoundError('User tidak ditemukan');
    }
  }

  async deleteUserById(userId) {
    validateUuid(userId);

    const query = {
      text: 'DELETE FROM users WHERE id = $1',
      values: [userId],
    };

    const result = await this._pool.query(query);

    if (result.rowCount < 1) {
      throw new NotFoundError('User tidak ditemukan');
    }
  }
}

module.exports = UsersService;
