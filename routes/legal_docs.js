const P = require('bluebird');
const express = require('express');
const router = express.Router();
const Liana = require('forest-express-sequelize');
const models = require('../models');
const S3Helper = require('../services/s3-helper');
const Serializer = require('../serializers/legal_docs');

function reconcileData(file) {
  return models.documents
    .findOne({ where: { file_id: file.id }})
    .then((doc) => {
      file.is_verified = doc ? doc.is_verified : false;
      return file;
    });
}

router.get('/legal_docs', Liana.ensureAuthenticated, (req, res, next) => {
  return new S3Helper().files('livedemo/legal')
    .then((files) => P.mapSeries(files, (file) => reconcileData(file)))
    .then((files) => Serializer.serialize(files))
    .then((files) => res.send(files))
    .catch((err) => next(err));
});

router.get('/legal_docs/:doc_id', Liana.ensureAuthenticated, (req, res, next) => {
  return new S3Helper()
    .file(`livedemo/legal/${req.params.doc_id}`)
    .then((file) => reconcileData(file))
    .then((file) => Serializer.serialize(file))
    .then((file) => res.send(file))
    .catch((err) => next(err));
});

router.put('/legal_docs/:doc_id', Liana.ensureAuthenticated, (req, res, next) => {
  return models.documents
    .findOne({ where: { file_id: req.params.doc_id }})
    .then((doc) => {
      doc.is_verified = req.body.data.attributes.is_verified;
      return doc.save();
    })
    .then(() => new S3Helper().file(`livedemo/legal/${req.params.doc_id}`))
    .then((file) => reconcileData(file))
    .then((file) => Serializer.serialize(file))
    .then((file) => res.send(file))
    .catch((err) => next(err));
});

router.delete('/legal_docs/:doc_id', Liana.ensureAuthenticated, (req, res, next) => {
  return new S3Helper()
    .deleteFile(`livedemo/legal/${req.params.doc_id}`)
    .then(() => res.status(204).send())
    .catch((err) => next(err));
});

router.post('/legal_docs', Liana.ensureAuthenticated, (req, res, next) => {
  res.status(400).send('You cannot create legal documents from here. Please, upload them directly in the details view of a Company');
});

module.exports = router;
