'use strict';

module.exports = (sequelize, DataTypes) => {
  var Model = sequelize.define('products', {
    'label': {
      type: DataTypes.STRING,
    },
		'price': {
			type: DataTypes.DOUBLE
		},
		'picture': {
			type: DataTypes.STRING
		}
  }, {
    tableName: 'products',
    underscored: true,
    schema: process.env.DATABASE_SCHEMA,
  });

  Model.associate = (models) => {
  };

  return Model;
};

