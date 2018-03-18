const Liana = require('forest-express-sequelize');
const models = require('../models');

Liana.collection('legal_docs', {
  fields: [{ 
    field: 'id', 
    type: 'String' 
  }, { 
    field: 'url', 
    type: 'String', 
    widget: 'link',
    isReadOnly: true
  }, { 
    field: 'last_modified', 
    type: 'Date',
    isReadOnly: true
  }, { 
    field: 'size', 
    type: 'String',
    isReadOnly: true
  }, {
    field: 'is_verified', 
    type: 'Boolean',
    isReadOnly: false
  }]
});

