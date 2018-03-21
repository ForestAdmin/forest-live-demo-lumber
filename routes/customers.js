const express = require('express');
const router = express.Router();
const Liana = require('forest-express-sequelize');
const models = require('../models');
const jwt = require('jsonwebtoken');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

router.post('/actions/generate-invoice', Liana.ensureAuthenticated, (req, res) => {
  let options = {
    root: __dirname + '/../public/',
    dotfiles: 'deny',
    headers: {
      'Access-Control-Expose-Headers': 'Content-Disposition',
      'Content-Disposition': 'attachment; filename="invoice-2342.pdf"'
    }
  };

  let fileName = 'invoice-2342.pdf';
  res.sendFile(fileName, options, (error) => {
    if (error) { next(error); }
  });
});

router.post('/actions/charge-credit-card', Liana.ensureAuthenticated, (req, res) => {
  let customerId = req.body.data.attributes.ids[0];
  let amount = req.body.data.attributes.values.amount * 100;
  let description = req.body.data.attributes.values.description;

  return models.customers
    .findById(customerId)
    .then((customer) => {
      return stripe.charges.create({
        amount: amount,
        currency: 'usd',
        customer: customer.stripe_id,
        description: description
      });
    })
    .then((response) => {
      res.send({
        html: `
        <p class="c-clr-1-4 l-mt l-mb">\$${response.amount / 100} USD has been successfuly charged.</p>

        <strong class="c-form__label--read c-clr-1-2">Credit card</strong>
        <p class="c-clr-1-4 l-mb">**** **** **** ${response.source.last4}</p>

        <strong class="c-form__label--read c-clr-1-2">Expire</strong>
        <p class="c-clr-1-4 l-mb">${response.source.exp_month}/${response.source.exp_year}</p>

        <strong class="c-form__label--read c-clr-1-2">Card type</strong>
        <p class="c-clr-1-4 l-mb">${response.source.brand}</p>

        <strong class="c-form__label--read c-clr-1-2">Country</strong>
        <p class="c-clr-1-4 l-mb">${response.source.country}</p>
        `
      });
    });
});

module.exports = router;
