/* eslint-disable camelcase */

exports.up = (pgm) => {
  // units
  pgm.createTable('units', {
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
  // categories
  pgm.createTable('categories', {
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
  // products
  pgm.createTable('products', {
    id: {
      type: 'uuid',
      primaryKey: true,
    },
    code: {
      type: 'varchar(255)',
      notNull: true,
    },
    name: {
      type: 'varchar(255)',
      notNull: true,
    },
    description: {
      type: 'text',
      notNull: false,
    },
    price: {
      type: 'numeric(16,2)',
      notNull: false,
    },
    cost: {
      type: 'numeric(16,2)',
      notNull: false,
    },
    cost_average: {
      type: 'numeric(16,2)',
      notNull: false,
    },
    company_id: {
      type: 'uuid',
      notNull: true,
    },
    category_id: {
      type: 'uuid',
      notNull: true,
    },
    unit_id: {
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
        {
          references: 'units(id)',
          columns: 'unit_id',
          onDelete: 'CASCADE',
        },
        {
          references: 'categories(id)',
          columns: 'category_id',
          onDelete: 'CASCADE',
        },
      ],
    },
  });
  // stocks
  pgm.createTable('stocks', {
    id: {
      type: 'uuid',
      primaryKey: true,
    },
    product_id: {
      type: 'uuid',
      notNull: true,
    },
    warehouse_id: {
      type: 'uuid',
      notNull: true,
    },
    stock: {
      type: 'numeric(16,2)',
      notNull: false,
    },
    sale: {
      type: 'numeric(16,2)',
      notNull: false,
    },
    purchase: {
      type: 'numeric(16,2)',
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
  }, {
    constraints: {
      foreignKeys: [
        {
          references: 'products(id)',
          columns: 'product_id',
          onDelete: 'CASCADE',
        },
        {
          references: 'warehouses(id)',
          columns: 'warehouse_id',
          onDelete: 'CASCADE',
        },
      ],
    },
  });
  // prices
  pgm.createTable('prices', {
    id: {
      type: 'uuid',
      primaryKey: true,
    },
    product_id: {
      type: 'uuid',
      notNull: true,
    },
    office_id: {
      type: 'uuid',
      notNull: true,
    },
    price: {
      type: 'numeric(16,2)',
      notNull: false,
    },
    cost: {
      type: 'numeric(16,2)',
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
  }, {
    constraints: {
      foreignKeys: [
        {
          references: 'products(id)',
          columns: 'product_id',
          onDelete: 'CASCADE',
        },
        {
          references: 'offices(id)',
          columns: 'office_id',
          onDelete: 'CASCADE',
        },
      ],
    },
  });

  pgm.createTable('customers', {
    id: {
      type: 'uuid',
      primaryKey: true,
    },
    name: {
      type: 'varchar(255)',
      notNull: true,
    },
    phone: {
      type: 'varchar(16)',
      notNull: false,
    },
    address: {
      type: 'text',
      notNull: false,
    },
    description: {
      type: 'text',
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
};

exports.down = (pgm) => {
  pgm.dropTable('customers');
  pgm.dropTable('prices');
  pgm.dropTable('stocks');
  pgm.dropTable('products');
  pgm.dropTable('categories');
  pgm.dropTable('units');
};
