const { Pool } = require('pg');
const bcrypt = require('bcrypt');
const AuthenticationError = require('../../exceptions/AuthenticationError');
const InvariantError = require('../../exceptions/InvariantError');

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
      throw new InvariantError('Email sudah didaftarkan');
    }
  }
}

module.exports = UsersService;
