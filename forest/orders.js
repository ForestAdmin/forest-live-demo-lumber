const Liana = require('forest-express-sequelize');
const models = require('../models');

Liana.collection('orders', {
  fields: [{
    field: 'delivery_address',
    type: 'String',
    reference: 'addresses.id',
    get: function (order) {
      return models.addresses
        .findAll({
          include: [{
            model: models.customers,
            where: { id: order.customer_id },
            include: [{
              model: models.orders,
              where: { ref: order.ref }
            }]
          }],
        })
        .then((addresses) => {
          if (addresses) { return addresses[0]; }
        });
    }
  }]
});
