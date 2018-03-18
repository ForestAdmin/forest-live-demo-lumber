const Liana = require('forest-express-sequelize');

Liana.collection('deliveries', {
  fields: [{
    field: 'geoloc',
    type: 'String',
    get: (object) => {
      return `${object.lat},${object.lng}`;
    }
  }]
});
