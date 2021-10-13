/* eslint-disable camelcase */

exports.up = (pgm) => {
  // sales
  pgm.createTable('sales', {
    id: {
      type: 'uuid',
      primaryKey: true,
    },
    office_id: {
      type: 'uuid',
      notNull: true,
    },
    date: {
      type: 'datetime',
      notNull: true,
    },
    invoice: {
      type: 'varchar(255)',
      notNull: true,
    },
    description: {
      type: 'text',
      notNull: false,
    },
    amount: {
      type: 'numeric(16,2)',
      notNull: false,
    },
    discount: {
      type: 'numeric(16,2)',
      notNull: false,
    },
    customer_id: {
      type: 'uuid',
      notNull: true,
    },
    created_by: {
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
        {
          references: 'users(id)',
          columns: 'created_by',
          onDelete: 'CASCADE',
        },
        {
          references: 'customers(id)',
          columns: 'customer_id',
          onDelete: 'CASCADE',
        },
      ],
    },
  });
  // sale_items
  pgm.createTable('sale_items', {
    id: {
      type: 'uuid',
      primaryKey: true,
      default: pgm.func('uuid_generate_v4()'),
    },
    sale_id: {
      type: 'uuid',
      notNull: true,
    },
    product_id: {
      type: 'uuid',
      notNull: true,
    },
    quantity: {
      type: 'numeric(16,2)',
      notNull: true,
    },
    price: {
      type: 'numeric(16,2)',
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
          references: 'sales(id)',
          columns: 'sale_id',
          onDelete: 'CASCADE',
        },
        {
          references: 'products(id)',
          columns: 'product_id',
          onDelete: 'CASCADE',
        },
      ],
    },
  });
  // purchases
  pgm.createTable('purchases', {
    id: {
      type: 'uuid',
      primaryKey: true,
    },
    office_id: {
      type: 'uuid',
      notNull: true,
    },
    date: {
      type: 'datetime',
      notNull: true,
    },
    invoice: {
      type: 'varchar(255)',
      notNull: true,
    },
    description: {
      type: 'text',
      notNull: false,
    },
    amount: {
      type: 'numeric(16,2)',
      notNull: false,
    },
    discount: {
      type: 'numeric(16,2)',
      notNull: false,
    },
    created_by: {
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
        {
          references: 'users(id)',
          columns: 'created_by',
          onDelete: 'CASCADE',
        },
      ],
    },
  });
  // purchase_item
  pgm.createTable('purchase_items', {
    id: {
      type: 'uuid',
      primaryKey: true,
      default: pgm.func('uuid_generate_v4()'),
    },
    purchase_id: {
      type: 'uuid',
      notNull: true,
    },
    product_id: {
      type: 'uuid',
      notNull: true,
    },
    quantity: {
      type: 'numeric(16,2)',
      notNull: true,
    },
    cost: {
      type: 'numeric(16,2)',
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
          references: 'purchases(id)',
          columns: 'purchase_id',
          onDelete: 'CASCADE',
        },
        {
          references: 'products(id)',
          columns: 'product_id',
          onDelete: 'CASCADE',
        },
      ],
    },
  });
};

exports.down = (pgm) => {
  pgm.dropTable('sale_items');
  pgm.dropTable('sales');
  pgm.dropTable('purchase_items');
  pgm.dropTable('purchases');
};
