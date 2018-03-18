'use strict';

module.exports = (sequelize, DataTypes) => {
  var Document = sequelize.define('documents', {
    'file_id': {
      type: DataTypes.STRING,
    },
    'is_verified': {
      type: DataTypes.BOOLEAN,
    }
  }, {
    tableName: 'documents',
    underscored: true,
    schema: process.env.DATABASE_SCHEMA,
    timestamps: false
  });

  Document.associate = (models) => {
  };

  return Document;
};


