'use strict'

const express = require('express');
const router = express.Router();
const passport = require('passport');
const Albums = require('../models/album');
const respHelper = require('../utils/utils').responseHelper;
const validate = require('../../utils/validation');

const authorizedUser = passport.authenticate('bearer-user', { session: false});

function validInput(name, description) {
  const errName = validate(name, 'album name').isRequired().isString().exec();
  const errDesc = validate(description, 'description').isString().exec();
  if (errName || errDesc) {
    return [].concat(errName || [], errDesc || []);
  }
  return false;
}

router.get('/list', authorizedUser, (req, res, next) => {
  const query = Albums.find({});
  query.select('_id name path comments description');
  query.exec((err, albums) => {
    if (respHelper(req, err, albums)) {
      res.status(200).json({
        success: true,
        data: albums,
      });
    }
  });
});

router.get('/:id', authorizedUser, (req, res) => {
  return res.status(400).send('not implemented');
  const query = Albums.findOne({_id: req.params.id});
  query.exec((err, album) => {
    if (respHelper(req, err, album)) {
      res.status(200).json({
        success: true,
        data: album,
      });
    }
  });
});

router.post('/create', authorizedUser, (req, res) => {
  const name = req.body.name && req.body.name.trim();
  const description = req.body.description && req.body.description.trim();
  const valid = validInput(name, description);
  if (valid) {
    return res.status(400).json({
      error: valid,
    });
  }

  const params = {
    name: name,
    description: description,
    userId: req.user._id,
    accessRole: req.user.role,
  }
  Albums.save(params, (err, album) => {
    if (respHelper(res, err, album)) {
      res.status(200).json({
        success: true,
        data: album,
      })
    }
  });
});

router.put('/:id', authorizedUser, (req, res) => {

  res.send('not implemented');
});

router.delete('/:id', authorizedUser, (req, res) => {
  Albums.findAndRemoveAll(req.params.id, req.user,(err) => {
    if (respHelper(res, err, {})) {
      res.status(200).send({
        success: true,
      });
    }
  });
});

module.exports = router;
