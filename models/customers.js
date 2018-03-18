'use strict';

module.exports = (sequelize, DataTypes) => {
  var Customer = sequelize.define('customers', {
    'firstname': {
      type: DataTypes.STRING,
    },
    'lastname': {
      type: DataTypes.STRING,
    },
    'email': {
      type: DataTypes.STRING,
    },
    'stripe_id': {
      type: DataTypes.STRING,
    }
  }, {
    tableName: 'customers',
    underscored: true,
    schema: process.env.DATABASE_SCHEMA,
  });

  Customer.associate = (models) => {
		Customer.hasOne(models.addresses);
		Customer.hasMany(models.orders);
  };

  return Customer;
};
