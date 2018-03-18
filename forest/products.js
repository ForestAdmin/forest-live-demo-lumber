const Liana = require('forest-express-sequelize');
const models = require('../models');

Liana.collection('products', {
	actions: [{
		name: 'Import data',
		endpoint: '/forest/products/actions/import-data',
		type: 'global',
		fields: [{
			field: 'CSV file',
			description: 'A semicolon separated values file stores tabular data (numbers and text) in plain text',
			type: 'File',
			isRequired: true
		}, {
			field: 'Type',
			description: 'Specify the product type to import',
			type: 'Enum',
			enums: ['phone', 'dress', 'toy'],
			isRequired: true
		}]
	}],
  fields: [{
    field: 'buyers',
    type: ['String'],
    reference: 'customers.id'
  }],
  segments: [{
    name: 'Bestsellers',
    where: (product) => {
      return models.sequelize.query(`
        SELECT products.id, COUNT(orders.*)
        FROM products
        JOIN orders ON orders.product_id = products.id
        GROUP BY products.id
        ORDER BY count DESC
        LIMIT 10;
      `, { type: models.sequelize.QueryTypes.SELECT })
      .then((products) => {
        let productIds = products.map((product) => product.id);
        return { id: { in: productIds }};
      });
    }
  }]
});
