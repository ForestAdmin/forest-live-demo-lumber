'use strict';
require('dotenv').load();
const P = require('bluebird');
const sequelize = require('sequelize');
const faker = require('faker');
const models = require('../models');

var iteration = [];

for (let i = 0 ; i < 10000 ; ++i) {
	iteration.push(i);
}

return P.each(iteration, () => {
	let amount = faker.finance.amount(1, 2000) * 100;
	let vat_amount = 0.21 * amount;
	let fee_amount = 0.02 * amount;
	let statusPossibilities = ['to_validate', 'rejected', 'validated'];

	return models.companies.findOne({
		where: { status: 'live' },
		order: sequelize.literal('random()')
	}).then((beneficiaryCompany) => {
		return models.companies.findOne({
		where: { status: 'live' },
			order: sequelize.literal('random()')
		}).then((emitterCompany) => {
			models.transactions.create({
				beneficiary_iban: faker.finance.iban(),
				emitter_iban: faker.finance.iban(),
				vat_amount: vat_amount,
				amount: amount,
				fee_amount: fee_amount,
				note: faker.lorem.lines(2),
				emitter_bic: faker.finance.bic(),
				beneficiary_bic: faker.finance.bic(),
				reference: faker.random.alphaNumeric(8),
				created_at: faker.date.between(new Date(2017,1,1), new Date()),
				emitter_company_id: emitterCompany.id,
				beneficiary_company_id: beneficiaryCompany.id,
				status: statusPossibilities[Math.floor(Math.random() * statusPossibilities.length)]
			});
		});
	});
});

