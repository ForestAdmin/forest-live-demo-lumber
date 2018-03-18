'use strict';
require('dotenv').load();
const P = require('bluebird');
const moment = require('moment');
const uuid = require('uuid/v4');
const sequelize = require('sequelize');
const faker = require('faker');
const models = require('../models');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

var iteration = [];

for (let i = 0 ; i < 100 ; ++i) {
	iteration.push(i);
}

return P
  .each(iteration, () => {
    let firstname = faker.name.firstName();
    let lastname = faker.name.lastName();
    let email = faker.internet.exampleEmail(firstname, lastname).toLowerCase();

    return models.customers
      .create({
        firstname: firstname,
        lastname: lastname,
        email: email
      })
      .then((customer) => {
         return stripe.customers
          .create({ email: email })
          .then((stripe_cus) => {
            customer.stripe_id = stripe_cus.id;
            return customer
              .save()
              .then(() => {
                let tokenPossibilities = ['tok_visa', 'tok_visa_debit', 'tok_mastercard', 'tok_mastercard_debit', 'tok_mastercard_prepaid', 'tok_amex', 'tok_discover', 'tok_diners', 'tok_jcb'];
                return stripe.customers.createSource(stripe_cus.id, { source: tokenPossibilities[Math.floor(Math.random() * tokenPossibilities.length)]});
              });
          })
          .then(() => customer);
      })
      .then((customer) => {
        return models.addresses
          .create({
            address_line_1: faker.address.streetAddress(),
            address_line_2: faker.address.secondaryAddress(),
            address_city: faker.address.city(),
            country: faker.address.country(),
            customer_id: customer.id
          })
          .then(() => customer);
      })
      .then((customer) => {
        let numberOfOrders = Math.floor(Math.random() * 25);
        let iterationj = [];

        for (let j = 0 ; j < numberOfOrders ; ++j) {
          iterationj.push(j);
        }

        return P.each(iterationj, () => {
          let statusPossibilities = ['Being processed', 'Ready for shipping', 'In transit', 'Shipped'];

          return models.products
            .findOne({
              order: sequelize.literal('random()')
            })
            .then((product) => {
              let availabilityPossibilies = [true, false];
              return models.deliveries
                .create({
                  phone: faker.phone.phoneNumber(),
                  lng: faker.address.longitude(),
                  lat: faker.address.latitude(),
                  is_delivered: availabilityPossibilies[Math.floor(Math.random() * availabilityPossibilies.length)]
                })
                .then((delivery) => [product, delivery, customer]);
            })
            .then(arr => {
              let product = arr[0];
              let delivery = arr[1];
              let customer = arr[2];

              let shipping_status = statusPossibilities[Math.floor(Math.random() * statusPossibilities.length)];
              let being_processed_at = faker.date.between(new Date(2017,1,1), new Date())
              let ready_for_shipping_at;
              let in_transit_at;
              let shipped_at;

              if (shipping_status === 'Ready for shipping' ||
                  shipping_status === 'In transit' ||
                  shipping_status === 'Shipped') {
                let hours = Math.floor(Math.random() * 48) + 1;
                ready_for_shipping_at = faker.date.between(being_processed_at, moment(being_processed_at).add('hours', hours).toDate());
              }

              if (shipping_status === 'In transit' ||
                  shipping_status === 'Shipped') {
                let hours = Math.floor(Math.random() * 6) + 1;
                in_transit_at = faker.date.between(ready_for_shipping_at, moment(ready_for_shipping_at).add('hours', hours).toDate());
              }

              if (shipping_status === 'Shipped') {
                let hours = Math.floor(Math.random() * 120) + 1;
                shipped_at = faker.date.between(in_transit_at, moment(in_transit_at).add('hours', hours).toDate());
              }

              return models.orders
                .create({
                  ref: uuid(),
                  shipping_status: shipping_status,
                  customer_id: customer.id,
                  product_id: product.id,
                  delivery_id: delivery.id,
                  being_processed_at: being_processed_at,
                  ready_for_shipping_at: ready_for_shipping_at,
                  in_transit_at: in_transit_at,
                  shipped_at: shipped_at,
                  created_at: faker.date.between(new Date(2017,1,1), new Date())
                })
                .then((order) => {
                  console.log('Create the charge for the order ' + order.ref);
                  return stripe.charges.create({
                    amount: product.price,
                    currency: 'usd',
                    customer: customer.stripe_id,
                    description: `Charge for the order ${order.ref}`
                  });
                });
            });
        });
      });
})
.then(() => process.exit(0));
