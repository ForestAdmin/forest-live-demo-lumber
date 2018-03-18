'use strict';

module.exports = (sequelize, DataTypes) => {
  var Order = sequelize.define('orders', {
		'ref': {
			type: DataTypes.UUID,
			primaryKey: true,
			defaultValue: DataTypes.UUIDV1
		},
    'shipping_status': {
      type: DataTypes.ENUM('Being processed', 'Ready for shipping', 'In transit', 'Shipped')
    },
    'being_processed_at': {
      type: DataTypes.DATE
    },
    'ready_for_shipping_at': {
      type: DataTypes.DATE
    },
    'in_transit_at': {
      type: DataTypes.DATE
    },
    'shipped_at': {
      type: DataTypes.DATE
    },
  }, {
    tableName: 'orders',
    underscored: true,
    schema: process.env.DATABASE_SCHEMA,
  });

  Order.associate = (models) => {
    Order.belongsTo(models.products);
    Order.belongsTo(models.customers);
    Order.belongsTo(models.deliveries);
  };

  return Order;
};

