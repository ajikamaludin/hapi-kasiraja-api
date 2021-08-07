const { Pool } = require('pg');
const bcrypt = require('bcrypt');
const uuid = require('uuid-random');
const InvariantError = require('../../exceptions/InvariantError');

class RegistrationService {
  constructor(userService) {
    this._pool = new Pool();
    this._userService = userService;
  }

  async registerStore({ name, email, password }) {
    await this._userService.verifyNewEmail({ email });

    try {
      await this._pool.query('BEGIN');
      const companyId = uuid();
      const officeId = uuid();
      const warehouseId = uuid();
      const hashedPassword = await bcrypt.hash(password, 12);

      const createCompanyQuery = {
        text: 'INSERT INTO companies(id, name) VALUES ($1, $2)',
        values: [companyId, name],
      };

      const createOfficeQuery = {
        text: 'INSERT INTO offices(id, name, company_id) VALUES ($1, $2, $3)',
        values: [officeId, name, companyId],
      };

      const createWarehouseQuery = {
        text: 'INSERT INTO warehouses(id, name, office_id) VALUES ($1, $2, $3)',
        values: [warehouseId, name, officeId],
      };

      const createUserQuery = {
        text: 'INSERT INTO users(id, name, email, password, company_id) VALUES ((select uuid_generate_v4()), $1, $2, $3, $4)',
        values: [name, email, hashedPassword, companyId],
      };

      await this._pool.query(createCompanyQuery);
      await this._pool.query(createOfficeQuery);
      await this._pool.query(createWarehouseQuery);
      await this._pool.query(createUserQuery);
      await this._pool.query('COMMIT');
    } catch (err) {
      await this._pool.query('ROLLBACK');
      console.log(err);
      throw new InvariantError('Gagal melakukan registrasi');
    }
  }
}

module.exports = RegistrationService;
