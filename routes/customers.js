const express = require('express');
const router = express.Router();
const Liana = require('forest-express-sequelize');
const models = require('../models');
const jwt = require('jsonwebtoken');

router.post('/actions/generate-invoice', Liana.ensureAuthenticated, (req, res) => {
  let options = {
    root: __dirname + '/../public/',
    dotfiles: 'deny',
    headers: {
      'Access-Control-Expose-Headers': 'Content-Disposition',
      'Content-Disposition': 'attachment; filename="invoice-2342.pdf"'
    }
  };

  let fileName = 'invoice-2342.pdf';
  res.sendFile(fileName, options, (error) => {
    if (error) { next(error); }
  });
});

module.exports = router;
