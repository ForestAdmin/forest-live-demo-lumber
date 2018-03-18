const express = require('express');
const router = express.Router();
const AWS = require('aws-sdk');
const liana = require('forest-express-sequelize');
const uuid = require('uuid/v4');

router.put('/products/:productId', liana.ensureAuthenticated, 
	(req, res, next) => {
		// Create the S3 client.
		var s3Bucket = new AWS.S3({ params: { Bucket: process.env.S3_BUCKET }});

		// Parse the "data" URL scheme (RFC 2397).
		var rawData = req.body.data.attributes.picture;
		if (!rawData) { return next(); }

		var base64Image = rawData.replace(/^data:image\/\w+;base64,/, '');

		// Generate a random filename.
		var filename = `livedemo/${uuid()}`;

		var data = {
			Key: filename,
			Body: new Buffer(base64Image, 'base64'),
			ContentEncoding: 'base64',
			ACL: 'public-read'
		};

		// Upload the image.
		s3Bucket.upload(data, function(err, response) {
			if (err) { return err; }

			// Inject the new poster URL to the params.
			req.body.data.attributes.picture = response.Location;

			// Finally, call the default PUT behavior.
			next();
		});
	});

module.exports = router;
