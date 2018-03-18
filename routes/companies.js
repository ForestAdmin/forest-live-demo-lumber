const P = require('bluebird');
const express = require('express');
const router = express.Router();
const liana = require('forest-express-sequelize');
const parseDataUri = require('parse-data-uri');
const csv = require('csv');
const models = require('../models');
const uuid = require('uuid/v4');
const S3Helper = require('../services/s3-helper');

router.post('/actions/import-data', liana.ensureAuthenticated,
  (req, res) => {
		let parsed = parseDataUri(req.body.data.attributes.values['CSV file']);

		csv.parse(parsed.data, function (err, rows) {
			if (err) {
				res.status(400).send({ 
					error: `Cannot import data: ${err.message}` });
			} else {
				return P
					.each(rows, (row) => {
						return models.companies.create({
							name: row[0],
							industry: row[2],
							headquarter: row[3],
							description: row[4]
						});
					})
					.then(() => {
						res.send({ success: 'Data successfuly imported!' });
					});
			}
		});
  });

function uploadLegalDoc(companyId, doc, field) {
	let id = uuid();

	return new S3Helper().upload(doc, `livedemo/legal/${id}`)
		.then(() => {
			return models.companies.findById(companyId);
		})
		.then((company) => {
			company[field] = id;
			return company.save();
		})
    .then((company) => {
      return models.documents.create({
        file_id: company[field],
        is_verified: true
      });
    });
}

router.post('/actions/upload-legal-docs', liana.ensureAuthenticated,
  (req, res) => {
		// Get the current company id
		let companyId = req.body.data.attributes.ids[0];

		// Get the values of the input fields entered by the admin user.
		let attrs = req.body.data.attributes.values;
		let certificate_of_incorporation = attrs['Certificate of Incorporation'];
		let proof_of_address = attrs['Proof of address'];
		let company_bank_statement = attrs['Company bank statement'];
		let passport_id = attrs['Valid proof of ID'];

		// The business logic of the Smart Action. We use the function
		// UploadLegalDoc to upload them to our S3 repository.
		return P.all([
			uploadLegalDoc(companyId, certificate_of_incorporation, 'certificate_of_incorporation_id'),
			uploadLegalDoc(companyId, proof_of_address, 'proof_of_address_id'),
			uploadLegalDoc(companyId, company_bank_statement,'bank_statement_id'),
			uploadLegalDoc(companyId, passport_id, 'passport_id'),
		])
		.then(() => {
			// Once the upload is finished, send a success message to the admin user in the UI.
			res.send({ success: 'Legal documents are successfully uploaded.' });
		});
  });

router.post('/actions/mark-as-live', liana.ensureAuthenticated,
  (req, res) => {
		let companyId = req.body.data.attributes.ids[0];

		return models.companies
			.update({ status: 'live' }, { where: { id: companyId }})
			.then(() => {
				res.send({ success: 'Company is now live!' });
			});
  });

module.exports = router;
