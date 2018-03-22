const express = require('express');
const router = express.Router();
const Liana = require('forest-express-sequelize');

router.get('/whoami', Liana.ensureAuthenticated, (req, res) => {
  res.send({ success: `You are ${req.user.data.first_name} ${req.user.data.last_name}.` });
});

module.exports = router;
