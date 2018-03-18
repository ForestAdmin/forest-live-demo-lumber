const Liana = require('forest-express-sequelize');
const models = require('../models/');
const _ = require('lodash');

Liana.collection('customers', {
  actions: [{
    name: 'Generate invoice',
    download: true
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
          return address.address_line_1 + '\n' +
            address.address_line_2 + '\n' +
            address.address_city + address.country;
        });
    }
  }]
});
