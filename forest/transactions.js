const Liana = require('forest-express-sequelize');
const models = require('../models');

Liana.collection('transactions', {
	actions: [{
		name: 'Approve Transaction'
	}, {
		name: 'Reject Transaction',
		fields: [{
			field: 'Reason',
			description: '⚠️ The reason will be sent to the customer ⚠️',
			type: 'String',
			widget: 'text area',
			isRequired: true
		}]
	}],
  fields: [{
    field: 'health_status',
    type: 'Enum',
		enums: ['suspicious', 'healthy'],
    get: function (object) {
			switch (object.status) {
				case 'to_validate':
					let statuses = ['suspicious', 'healthy'];
					return statuses[Math.floor(Math.random() * statuses.length)];
				case 'rejected':
					return 'suspicious';
				case 'validated':
					return 'healthy';
			}
    }
  }, {
    field: 'beneficiary_headquarter',
    type: 'String',
    get: function (object) {
			return object._beneficiary.headquarter;
    }
	}, {
    field: 'emitter_headquarter',
    type: 'String',
    get: function (object) {
			return object._emitter.headquarter;
    }
	}]
});
