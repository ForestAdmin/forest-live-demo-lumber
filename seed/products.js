'use strict';
require('dotenv').load();
const P = require('bluebird');
const sequelize = require('sequelize');
const faker = require('faker');
const models = require('../models');
const moment = require('moment');

var iteration = [];

for (let i = 0 ; i < 10000 ; ++i) {
	iteration.push(i);
}

return P.each(iteration, () => {
	let startDate = faker.date.between(new Date(2017, 1, 1), new Date());
	let endDate = moment(startDate).add('minutes', 30);
	let statusPossibilities = ['unconfirmed', 'confirmed'];

	models.products.create({
		label: `${faker.commerce.productAdjective()} ${faker.commerce.product()}`,
		description: faker.lorem.sentence(),
		price: faker.commerce.price(1, 300) * 100,
		material: faker.commerce.productMaterial(),
		color: faker.commerce.color(),
		adjective: faker.commerce.productAdjective(),
	});
});

