'use strict';

module.exports = (sequelize, DataTypes) => {
  var Company = sequelize.define('companies', {
    'name': {
      type: DataTypes.STRING,
    },
    'industry': {
      type: DataTypes.STRING,
    },
    'headquarter': {
      type: DataTypes.STRING,
    },
    'description': {
      type: DataTypes.STRING
    },
    'status': {
      type: DataTypes.ENUM('signed_up', 'pending', 'approved', 'rejected', 'live'),
    },
		'certificate_of_incorporation_id': {
      type: DataTypes.UUID
		},
		'proof_of_address_id': {
      type: DataTypes.UUID
		},
		'bank_statement_id': {
      type: DataTypes.UUID
		},
		'passport_id': {
      type: DataTypes.UUID
		}
  }, {
    tableName: 'companies',
    underscored: true,
    schema: process.env.DATABASE_SCHEMA,
  });

  Company.associate = (models) => {
    Company.hasMany(models.transactions, {
			foreignKey: 'emitter_company_id',
			as: 'emitted_transactions'
    });

    Company.hasMany(models.transactions, {
			foreignKey: 'beneficiary_company_id',
			as: 'received_transactions'
    });
  };

  return Company;
};

