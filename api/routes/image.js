'use strict'

const express = require('express');
const router = express.Router();
const multer = require('multer');
const passport = require('passport');
const Image = require('../models/image');
const Album = require('../models/album');
const path = require('path');
const respHelper = require('../utils/utils').responseHelper;

const authorizedUser = passport.authenticate('bearer-user', { session: false});

const storage = multer.diskStorage({ //multers disk storage settings
  destination: function (req, file, cb) {
    cb(null, './uploads/')
  },
  filename: function (req, file, cb) {
    const datetimestamp = Date.now();
    const filename = file.originalname.split('.')[0];
    cb(null, filename + '-' + file.fieldname + '-' + datetimestamp + '.' + file.originalname.split('.')[file.originalname.split('.').length -1])
  },
});

const upload = multer({ //multer settings
  storage: storage,
  // limits: { fileSize: 20 },
  fileFilter: function (req, file, cb) {
    // TODO: find better solution to avoid upload file without album
    if (!req.body.data) {
      cb(null, false);
    }
    const data = JSON.parse(req.body.data);
    Album.canUserUpload(data.albumId, req.user._id, (err, canUpload) => {
      if (canUpload === false) {
        return cb(null, false);
      }
      const ext = path.extname(file.originalname);
      const isAllowed = ['.jpg', '.jpeg', '.png'].find((val) => {
        return ext === val;
      });
      if (!isAllowed) {
        return cb('not supported file', false)
      }
      cb(null, true);
    });
  },
});


router.post('/upload', authorizedUser, upload.single('file'), function(req, res) {
  if (!req.file) {
    return res.status(400).send();
  }
  const data = JSON.parse(req.body.data);
  const file = req.file;

  const img = new Image();
  img.path = file.path;
  img.ownerId = req.user._id;
  img.albumId = data.albumId,
  img.description = data.description,
  img.save((err, img) => {
    if (respHelper(res, err, img)) {
      res.status(200).json({
        success: true,
        data: img,
      });
    }
  });
});

module.exports = router;
