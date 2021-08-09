const bcrypt = require('bcrypt');

exports.up = async (pgm) => {
  pgm.sql('CREATE EXTENSION IF NOT EXISTS "uuid-ossp";');

  pgm.createTable('companies', {
    id: {
      type: 'uuid',
      primaryKey: true,
    },
    name: {
      type: 'varchar(255)',
      notNull: true,
    },
    description: {
      type: 'text',
      notNull: false,
    },
    address: {
      type: 'text',
      notNull: false,
    },
    phone: {
      type: 'varchar(16)',
      notNull: false,
    },
    email: {
      type: 'varchar(255)',
      notNull: false,
    },
    created_at: {
      type: 'timestamp without time zone',
      notNull: true,
      default: pgm.func('current_timestamp'),
    },
    updated_at: {
      type: 'timestamp without time zone',
      notNull: true,
      default: pgm.func('current_timestamp'),
    },
  });
  // offices
  pgm.createTable('offices', {
    id: {
      type: 'uuid',
      primaryKey: true,
    },
    name: {
      type: 'varchar(255)',
      notNull: true,
    },
    description: {
      type: 'text',
      notNull: false,
    },
    address: {
      type: 'text',
      notNull: false,
    },
    phone: {
      type: 'varchar(16)',
      notNull: false,
    },
    email: {
      type: 'varchar(255)',
      notNull: false,
    },
    company_id: {
      type: 'uuid',
      notNull: true,
    },
    created_at: {
      type: 'timestamp without time zone',
      notNull: true,
      default: pgm.func('current_timestamp'),
    },
    updated_at: {
      type: 'timestamp without time zone',
      notNull: true,
      default: pgm.func('current_timestamp'),
    },
  }, {
    constraints: {
      foreignKeys: [
        {
          references: 'companies(id)',
          columns: 'company_id',
          onDelete: 'CASCADE',
        },
      ],
    },
  });
  // warehouse
  pgm.createTable('warehouses', {
    id: {
      type: 'uuid',
      primaryKey: true,
    },
    name: {
      type: 'varchar(255)',
      notNull: true,
    },
    description: {
      type: 'text',
      notNull: false,
    },
    address: {
      type: 'text',
      notNull: false,
    },
    phone: {
      type: 'varchar(16)',
      notNull: false,
    },
    office_id: {
      type: 'uuid',
      notNull: true,
    },
    created_at: {
      type: 'timestamp without time zone',
      notNull: true,
      default: pgm.func('current_timestamp'),
    },
    updated_at: {
      type: 'timestamp without time zone',
      notNull: true,
      default: pgm.func('current_timestamp'),
    },
  }, {
    constraints: {
      foreignKeys: [
        {
          references: 'offices(id)',
          columns: 'office_id',
          onDelete: 'CASCADE',
        },
      ],
    },
  });
  // user
  pgm.createTable('users', {
    id: {
      type: 'uuid',
      primaryKey: true,
    },
    name: {
      type: 'varchar(255)',
      notNull: true,
    },
    email: {
      type: 'varchar(255)',
      notNull: false,
    },
    password: {
      type: 'varchar(255)',
      notNull: false,
    },
    role: {
      type: 'varchar(16)',
      notNull: false,
    },
    company_id: {
      type: 'uuid',
      notNull: true,
    },
    created_at: {
      type: 'timestamp without time zone',
      notNull: true,
      default: pgm.func('current_timestamp'),
    },
    updated_at: {
      type: 'timestamp without time zone',
      notNull: true,
      default: pgm.func('current_timestamp'),
    },
  }, {
    constraints: {
      foreignKeys: [
        {
          references: 'companies(id)',
          columns: 'company_id',
          onDelete: 'CASCADE',
        },
      ],
    },
  });
  // create default company, office, warehouse, users
  pgm.sql("INSERT INTO companies VALUES (uuid_generate_v4(), 'Toko 1', '', 'Klaten', '089999999', 'toko1@toko.com')");
  pgm.sql("INSERT INTO offices VALUES (uuid_generate_v4(), 'Toko 1', '', 'Klaten', '089999999', 'toko1@toko.com', (SELECT id FROM companies LIMIT 1))");
  pgm.sql("INSERT INTO warehouses VALUES  (uuid_generate_v4(), 'Toko 1', '', 'Klaten', '089999999', (SELECT id FROM offices LIMIT 1))");

  const password = await bcrypt.hash('password', 10);

  pgm.sql(`INSERT INTO users VALUES (uuid_generate_v4(), 'Admin', 'admin@mail.com', '${password}', 'admin', (SELECT id FROM companies LIMIT 1))`);
};

exports.down = (pgm) => {
  pgm.dropTable('users');
  pgm.dropTable('warehouses');
  pgm.dropTable('offices');
  pgm.dropTable('companies');
};
