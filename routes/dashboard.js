const _ = require('lodash');
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

router.post('/stats/credit-card-country-repartition', Liana.ensureAuthenticated, (req, res) => {
  let repartition = [];

  let from = moment.utc('2018-03-01').unix();
  let to = moment.utc('2018-03-20').unix();

  return stripe.charges
    .list({ 
      created: { gte: from, lte: to }
    })
    .then((response) => {
      return P.each(response.data, (charge) => {
        let country = charge.source.country || 'Others';

        let entry = _.find(repartition, { key: country });
        if (!entry) {
          repartition.push({ key: country, value: 1 }); 
        } else {
          entry.value++;
        }
      });
    })
    .then(() => {
      let json = new Liana.StatSerializer({ 
        value: repartition 
      }).perform();

      res.send(json);
    });
});

router.post('/stats/charges-per-day', Liana.ensureAuthenticated, (req, res) => {
  let values = [];

  let from = moment.utc('2018-03-01').unix();
  let to = moment.utc('2018-03-31').unix();

  return stripe.charges
    .list({ 
      created: { gte: from, lte: to }
    })
    .then((response) => {
      return P.each(response.data, (charge) => {
        let date = moment.unix(charge.created).startOf('day').format('LLL');

        let entry = _.find(values, { label: date });
        if (!entry) {
          values.push({ label: date, values: { value: 1 } }); 
        } else {
          entry.values.value++;
        }
      });
    })
    .then(() => {
      let json = new Liana.StatSerializer({ 
        value: values 
      }).perform();

      res.send(json);
    });
});

module.exports = router;
