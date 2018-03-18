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

	models.appointments.create({
		name: `${faker.name.firstName()} ${faker.name.lastName()}`,
		reason: faker.lorem.paragraph(),
		start_date: startDate,
		end_date: endDate,
		status: statusPossibilities[Math.floor(Math.random() * statusPossibilities.length)]
	});
});

