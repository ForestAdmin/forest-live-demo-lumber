'use strict';

module.exports = (sequelize, DataTypes) => {
  var Model = sequelize.define('appointments', {
    'name': {
      type: DataTypes.STRING,
    },
    'reason': {
      type: DataTypes.TEXT,
    },
    'start_date': {
      type: DataTypes.DATE,
    },
    'end_date': {
      type: DataTypes.DATE
    },
    'status': {
      type: DataTypes.ENUM('unconfirmed', 'confirmed'),
    },
  }, {
    tableName: 'appointments',
    underscored: true,
    schema: process.env.DATABASE_SCHEMA,
  });

  Model.associate = (models) => {
  };

  return Model;
};

