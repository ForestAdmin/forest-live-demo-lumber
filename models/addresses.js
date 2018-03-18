'use strict';

module.exports = (sequelize, DataTypes) => {
  var Address = sequelize.define('addresses', {
    'address_line_1': {
      type: DataTypes.STRING
    },
    'address_line_2': {
      type: DataTypes.STRING
    },
    'address_city': {
      type: DataTypes.STRING
    },
    'country': {
      type: DataTypes.STRING
    },
  }, {
    tableName: 'addresses',
    underscored: true,
    schema: process.env.DATABASE_SCHEMA,
  });

  Address.associate = (models) => {
		Address.belongsTo(models.customers);
  };

  return Address;
};


