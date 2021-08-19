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

    const companyId = uuid();
    const officeId = uuid();
    const warehouseId = uuid();
    const unitId = uuid();
    const hashedPassword = await bcrypt.hash(password, 12);

    const createCompanyQuery = {
      text: 'INSERT INTO companies(id, name) VALUES ($1, $2)',
      values: [companyId, name],
    };

    const createOfficeQuery = {
      text: 'INSERT INTO offices(id, name, company_id) VALUES ($1, $2, $3)',
      values: [officeId, `office-${name}`, companyId],
    };

    const createWarehouseQuery = {
      text: 'INSERT INTO warehouses(id, name, office_id) VALUES ($1, $2, $3)',
      values: [warehouseId, `warehouse-${name}`, officeId],
    };

    const createUserQuery = {
      text: 'INSERT INTO users(id, name, email, password, role, company_id) VALUES ((select uuid_generate_v4()), $1, $2, $3, $4, $5)',
      values: [name, email, hashedPassword, 'admin', companyId],
    };

    const createUnitQuery = {
      text: 'INSERT INTO units(id, name, company_id) VALUES ($1, $2, $3)',
      values: [unitId, 'Buah', companyId],
    };

    const createCustomerQuery = {
      text: 'INSERT INTO customers(id, name, phone, address, description, company_id) VALUES ((select uuid_generate_v4()), $1, $2, $3, $4, $5)',
      values: ['Pelanggan Umum', '089', 'Klaten', '-', companyId]
    }

    const client = await this._pool.connect();
    try {
      await client.query('BEGIN');
      await client.query(createCompanyQuery);
      await client.query(createOfficeQuery);
      await client.query(createWarehouseQuery);
      await client.query(createUserQuery);
      await client.query(createUnitQuery);
      await client.query(createCustomerQuery);
      await client.query('COMMIT');
    } catch (err) {
      await client.query('ROLLBACK');
      throw new InvariantError(`Gagal melakukan registrasi: ${err.message}`);
    } finally {
      client.release();
    }
  }
}

module.exports = RegistrationService;
