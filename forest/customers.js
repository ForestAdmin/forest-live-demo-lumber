const { collection } = require('forest-express-sequelize');
const models = require('../models/');

// This file allows you to add to your Forest UI:
// - Smart actions: https://docs.forestadmin.com/documentation/reference-guide/actions/create-and-manage-smart-actions
// - Smart fields: https://docs.forestadmin.com/documentation/reference-guide/fields/create-and-manage-smart-fields
// - Smart relationships: https://docs.forestadmin.com/documentation/reference-guide/relationships/create-a-smart-relationship
// - Smart segments: https://docs.forestadmin.com/documentation/reference-guide/segments/smart-segments
collection('customers', {
  actions: [{
    name: 'Generate invoice',
    download: true
  }, {
    name: 'Charge credit card',
    type: 'single',
    fields: [{
      field: 'amount',
      isRequired: true,
      description: 'The amount (USD) to charge the credit card. Example: 42.50',
      type: 'Number'
    }, {
      field: 'description',
      isRequired: true,
      description: 'Explain the reason why you want to charge manually the customer here',
      type: 'String'
    }]
  }, {
    name: 'Return HTML',
    type: 'single',
  }, {
    name: 'Webhook',
    type: 'single',
  }, {
    name: 'Error 400',
    type: 'single',
  }, {
    name: 'Error 401',
    type: 'single',
  }, {
    name: 'Error 404',
    type: 'single',
  }, {
    name: 'Error 500',
    type: 'single',
  }, {
    name: 'With baseURL',
    type: 'single',
    baseUrl: 'https://foo.bar'
  }, {
    name: 'With a working baseURL',
    type: 'single',
    baseUrl: `${process.env.APPLICATION_URL || `http://localhost:${process.env.APPLICATION_PORT}`}`
  }, {
    name: 'With a specific endpoint',
    type: 'single',
    endpoint: "/forest/actions/specific"
  }],
  fields: [{
    field: 'fullname',
    type: 'String',
    get: (customer) => {
      return customer.firstname + ' ' + customer.lastname;
    },
    set: (customer, fullname) => {
      let names = fullname.split(' ');
      customer.firstname = names[0];
      customer.lastname = names[1];

      // Don't forget to return the customer.
      return customer;
    },
    search: function (query, search) {
      let s = models.sequelize;
      let split = search.split(' ');

      var searchCondition = s.and(
        { firstname: { $ilike: split[0] }},
        { lastname: { $ilike: split[1] }}
      );

      let searchConditions = _.find(query.where.$and, '$or');
      searchConditions.$or.push(searchCondition);
    }
  }, {
    field: 'full_address',
    type: 'String',
    get: (customer) => {
      return models.addresses
        .findOne({ where: { customer_id: customer.id } })
        .then((address) => {
          return address.addressLine1 + '\n' +
            address.addressLine2 + '\n' +
            address.addressCity + address.country;
        });
    }
  }, {
    field: 'age',
    type: 'Number',
    get: (customer) => {
      let diff = new Date() - new Date(customer.birth_date);
      return Math.floor(diff / 31557600000); // Divide by 1000*60*60*24*365.25
    }
  }]
});
