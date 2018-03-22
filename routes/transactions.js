const express = require('express');
const router = express.Router();
const Liana = require('forest-express-sequelize');
const models = require('../models');

router.post('/actions/approve-transaction', Liana.ensureAuthenticated, 
  (req, res) => {
		let transactionId = req.body.data.attributes.ids[0];

		return models.transactions
			.update({ status: 'validated' }, { where: { id: transactionId }})
			.then(() => {
				res.send({ success: 'Transaction successfully approved.' });
			});
  });

router.post('/actions/reject-transaction', Liana.ensureAuthenticated, 
  (req, res) => { 
		let transactionId = req.body.data.attributes.ids[0];

		return models.transactions
			.update({ status: 'rejected' }, { where: { id: transactionId }})
			.then(() => {
				res.send({ success: 'Transaction successfully rejected.' });
			});
  });

module.exports = router;

