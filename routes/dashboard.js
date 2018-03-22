const P = require('bluebird');
const express = require('express');
const router = express.Router();
const Liana = require('forest-express-sequelize');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const moment = require('moment');

router.post('/stats/mrr', Liana.ensureAuthenticated, (req, res) => {
  let mrr = 0;

  let from = moment.utc('2018-03-01').unix();
  let to = moment.utc('2018-03-31').unix();

  return stripe.charges
    .list({ 
      created: { gte: from, lte: to }
    })
    .then((response) => {
      return P.each(response.data, (charge) => {
        mrr += charge.amount;
      });
    })
    .then(() => {
      let json = new Liana.StatSerializer({ 
        value: mrr 
      }).perform();

      res.send(json);
    });
});

module.exports = router;
