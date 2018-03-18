'use strict';

module.exports = (sequelize, DataTypes) => {
  var Model = sequelize.define('transactions', {
    'beneficiary_iban': {
      type: DataTypes.STRING,
    },
    'emitter_iban': {
      type: DataTypes.STRING,
    },
    'vat_amount': {
      type: DataTypes.INTEGER,
    },
    'amount': {
      type: DataTypes.INTEGER
    },
    'fee_amount': {
      type: DataTypes.INTEGER
    },
    'note': {
      type: DataTypes.STRING
    },
    'emitter_bic': {
      type: DataTypes.STRING
    },
    'beneficiary_bic': {
      type: DataTypes.STRING
    },
    'reference': {
      type: DataTypes.STRING
    },
    'status': {
      type: DataTypes.ENUM('to_validate', 'rejected', 'validated')
		}
  }, {
    tableName: 'transactions',
    underscored: true,
    schema: process.env.DATABASE_SCHEMA,
  });

  Model.associate = (models) => {
		Model.belongsTo(models.companies, {
			foreignKey: 'emitter_company_id',
			as: '_emitter'
		});

		Model.belongsTo(models.companies, {
			foreignKey: 'beneficiary_company_id',
			as: '_beneficiary'
		});
  };

  return Model;
};
