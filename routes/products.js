const P = require('bluebird');
const express = require('express');
const router = express.Router();
const Liana = require('forest-express-sequelize');
const faker = require('faker');
const parseDataUri = require('parse-data-uri');
const csv = require('csv');
const models = require('../models');

router.post('/products/actions/import-data', Liana.ensureAuthenticated,
  (req, res) => {
		let parsed = parseDataUri(req.body.data.attributes.values['CSV file']);

		csv.parse(parsed.data, { delimiter: ';' }, function (err, rows) {
			if (err) {
				res.status(400).send({ 
					error: `Cannot import data: ${err.message}` });
			} else {
				return P
					.each(rows, (row) => {
						let price = 0;
						switch (req.body.data.attributes.values['Type']) {
							case 'phone':
								price = faker.commerce.price(300, 1000) * 100;
								break;
							case 'dress':
								price = faker.commerce.price(10, 200) * 100;
								break;
							case 'toy':
								price = faker.commerce.price(5, 100) * 100;
								break;
						}

						return models.products.create({
							label: row[0].replace('//i5.walmartimages.com/asr/', '//s3-eu-west-1.amazonaws.com/forestadmin-test/livedemo/'),
							price: price,
							picture: row[1]
						});
					})
					.then(() => {
						res.send({ success: 'Data successfuly imported!' });
					});
			}
		});
  });

router.get('/products/:product_id/relationships/buyers', 
  Liana.ensureAuthenticated, (req, res, next) => {
    let limit = parseInt(req.query.page.size) || 10;
    let offset = (parseInt(req.query.page.number) - 1) * limit;

    let queryType = models.sequelize.QueryTypes.SELECT;

    let countQuery = `
      SELECT COUNT(*)
      FROM customers
      JOIN orders ON orders.customer_id = customers.id
      JOIN products ON orders.product_id = products.id
      WHERE product_id = ${req.params.product_id};
    `;

    let dataQuery = `
      SELECT customers.*
      FROM customers
      JOIN orders ON orders.customer_id = customers.id
      JOIN products ON orders.product_id = products.id
      WHERE product_id = ${req.params.product_id}
      LIMIT ${limit}
      OFFSET ${offset}
    `;

    return P
      .all([
        models.sequelize.query(countQuery, { type: queryType }),
        models.sequelize.query(dataQuery, { type: queryType })
      ])
      .spread((count, customers) => {
        return new Liana.ResourceSerializer(Liana, models.customers, customers, null, {}, {
          count: count[0].count
        }).perform();
      })
      .then((products) => {
        res.send(products);
      })
      .catch((err) => next(err));
  });

module.exports = router;
