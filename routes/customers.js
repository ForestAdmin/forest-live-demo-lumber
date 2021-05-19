const express = require('express');
const { PermissionMiddlewareCreator } = require('forest-express-sequelize');
const { customers } = require('../models');
const Liana = require('forest-express-sequelize');


const router = express.Router();
const permissionMiddlewareCreator = new PermissionMiddlewareCreator('customers');

// This file contains the logic of every route in Forest Admin for the collection customers:
// - Native routes are already generated but can be extended/overriden - Learn how to extend a route here: https://docs.forestadmin.com/documentation/v/v6/reference-guide/routes/extend-a-route
// - Smart action routes will need to be added as you create new Smart Actions - Learn how to create a Smart Action here: https://docs.forestadmin.com/documentation/v/v6/reference-guide/actions/create-and-manage-smart-actions

// Create a Customer
router.post('/customers', permissionMiddlewareCreator.create(), (request, response, next) => {
  // Learn what this route does here: https://docs.forestadmin.com/documentation/v/v6/reference-guide/routes/default-routes#create-a-record
  next();
});

// Update a Customer
router.put('/customers/:recordId', permissionMiddlewareCreator.update(), (request, response, next) => {
  // Learn what this route does here: https://docs.forestadmin.com/documentation/v/v6/reference-guide/routes/default-routes#update-a-record
  next();
});

// Delete a Customer
router.delete('/customers/:recordId', permissionMiddlewareCreator.delete(), (request, response, next) => {
  // Learn what this route does here: https://docs.forestadmin.com/documentation/v/v6/reference-guide/routes/default-routes#delete-a-record
  next();
});

// Get a list of Customers
router.get('/customers', permissionMiddlewareCreator.list(), (request, response, next) => {
  // Learn what this route does here: https://docs.forestadmin.com/documentation/v/v6/reference-guide/routes/default-routes#get-a-list-of-records
  next();
});

// Get a number of Customers
router.get('/customers/count', permissionMiddlewareCreator.list(), (request, response, next) => {
  // Learn what this route does here: https://docs.forestadmin.com/documentation/v/v6/reference-guide/routes/default-routes#get-a-number-of-records
  next();
});

// Get a Customer
router.get('/customers/:recordId(?!count)', permissionMiddlewareCreator.details(), (request, response, next) => {
  // Learn what this route does here: https://docs.forestadmin.com/documentation/v/v6/reference-guide/routes/default-routes#get-a-record
  next();
});

// Export a list of Customers
router.get('/customers.csv', permissionMiddlewareCreator.export(), (request, response, next) => {
  // Learn what this route does here: https://docs.forestadmin.com/documentation/v/v6/reference-guide/routes/default-routes#export-a-list-of-records
  next();
});

// Delete a list of Customers
router.delete('/customers', permissionMiddlewareCreator.delete(), (request, response, next) => {
  // Learn what this route does here: https://docs.forestadmin.com/documentation/v/v6/reference-guide/routes/default-routes#delete-a-list-of-records
  next();
});

router.post('/actions/generate-invoice', Liana.ensureAuthenticated, (req, res, next) => {
  console.log('APPELE')
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

router.post('/actions/charge-credit-card', Liana.ensureAuthenticated, (req, res, next) => {
  let customerId = req.body.data.attributes.ids[0];
  let amount = req.body.data.attributes.values.amount * 100;
  let description = req.body.data.attributes.values.description;

  return customers
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
