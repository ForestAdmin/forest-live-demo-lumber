const express = require('express');
const router = express.Router();
const Liana = require('forest-express-sequelize');

router.delete('/companies/:companyId', Liana.ensureAuthenticated, 
	(req, res, next) => {
    if (req.user.data.teams.indexOf('Management') > -1) {
      next();
    } else {
      res.status(403).send('Sorry, you\'re now allowed to delete a company. Ask someone in the Management team.');
    }
	});

module.exports = router;

