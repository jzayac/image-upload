'use strict'

const express = require('express');
const router = express.Router();
const multer = require('multer');
const passport = require('passport');
const Image = require('../models/image');
const Album = require('../models/album');
const path = require('path');
const respHelper = require('../utils/utils').responseHelper;
const validate = require('../../utils/validation');

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
      if (!canUpload) {
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
  img.save((err, image) => {
    if (respHelper(res, err, image)) {
      res.status(200).json({
        success: true,
        data: image,
      });
    }
  });
});


router.get('/albumlist/:albumId', authorizedUser, (req, res) => {
  const albumId = req.params.albumId;
  Album.isVisitor(albumId, req.user._id, (err, album) => {
    if (!respHelper(res, err, album)) {
      return;
    }
    const query = Image.find({albumId: albumId});
    query.exec((error, images) => {
      if (respHelper(res, err, album)) {
        res.status(200).json({
          data: images,
        });
      }
    });
  });
});

router.post('/update', authorizedUser, (req, res) => {
  const imageId = req.body.imageId;
  const description = req.body.description && req.body.description.trim();
  const errDesc = validate(description, 'description').isString().exec();
  if (errDesc) {
    return res.status(400).json({
      error: errDesc,
    });
  }
  Image.isOwner(imageId, req.user._id, (err, img, info) => {
    if(!respHelper(res, err, img, info)) {
      return;
    };
    img.description = description;
    img.save((error, image) => {
      if(respHelper(res, error, image)) {
        res.status(200).json({
          data: image,
        });
      }
    });
  });
});

router.delete('/:imageId', authorizedUser, (req, res) => {
  const imageId = req.params.imageId;
  Image.isOwner(imageId, req.user._id, (err, img, info) => {
    if(!respHelper(res, err, img, info)) {
      return;
    };
    Image.removeWithFile(img, (error) => {
      if(respHelper(res, error, {})) {
        res.status(200).send();
      }
    })
  });
});

module.exports = router;
