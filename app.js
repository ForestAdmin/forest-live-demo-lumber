'use strict';
var fs = require('fs');
var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var cors = require('express-cors');
var jwt = require('express-jwt');

var app = express();

app.use(favicon(path.join(__dirname, 'public', 'favicon.png')));
app.use(logger('dev'));
app.use(bodyParser.json({ limit: '10mb' }));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use(cors({
  allowedOrigins: ['*.forestadmin.com', 'localhost:4200'],
  headers: ['Authorization', 'X-Requested-With', 'Content-Type']
}));

app.use(jwt({
  secret: process.env.FOREST_AUTH_SECRET,
  credentialsRequired: false
}));

fs.readdirSync('./decorators/routes').forEach((file) => {
  if (file[0] !== '.') {
    app.use('/forest', require(`./decorators/routes/${file}`));
  }
});

fs.readdirSync('./routes').forEach((file) => {
  if (file[0] !== '.') {
    app.use('/forest', require('./routes/' + file));
  }
});

app.use(require('forest-express-sequelize').init({
  modelsDir: __dirname + '/models',
  envSecret: process.env.FOREST_ENV_SECRET,
  authSecret: process.env.FOREST_AUTH_SECRET,
  sequelize: require('./models').sequelize,
  integrations: {
    stripe: {
      apiKey: process.env.STRIPE_SECRET_KEY,
      mapping: 'customers.stripe_id',
      stripe: require('stripe')
    }
  }
}));

module.exports = app;
