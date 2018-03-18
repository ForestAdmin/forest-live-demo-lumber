const JSONAPISerializer = require('jsonapi-serializer').Serializer;

module.exports = new JSONAPISerializer('legal_docs', {
  attributes: ['url', 'last_modified', 'size', 'is_verified'],
  keyForAttribute: 'underscore_case'
});

