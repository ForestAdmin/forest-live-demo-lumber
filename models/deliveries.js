'use strict';

module.exports = (sequelize, DataTypes) => {
  var Delivery = sequelize.define('deliveries', {
    'phone': {
      type: DataTypes.STRING
    },
    'lng': {
      type: DataTypes.DOUBLE,
    },
    'lat': {
      type: DataTypes.DOUBLE,
    },
    'is_delivered': {
      type: DataTypes.BOOLEAN,
    },
  }, {
    tableName: 'deliveries',
    underscored: true,
    schema: process.env.DATABASE_SCHEMA,
  });

  Delivery.associate = (models) => {
    Delivery.hasMany(models.orders);
  };

  return Delivery;
};

