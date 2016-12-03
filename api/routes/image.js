'use strict'

const express = require('express');
const router = express.Router();
const multer = require('multer');
const passport = require('passport');
const Image = require('../models/image');
const Album = require('../models/album');
const imagesDir = require('../config/config').uploadDir;
const path = require('path');
const respHelper = require('../utils/utils').responseHelper;
const validate = require('../../utils/validation');
const gm = require('gm');

const authorizedUser = passport.authenticate('bearer-user', { session: false});

const resizeImage = function(req, res, next) {
  if (!req.file) {
    return next();
  }
  const imagePath = req.file.path;
  new Promise((resolve, reject) => {
    gm(imagePath).size((err, size) => {
      if (err) {
        return reject(err);
      }
      resolve(size);
    });
  }).then((size) => {
    const medium = gm(imagePath);
    if (size.widht > 1600) {
      const scaleSize = Math.floor(1600 / (size.width/size.height));
      medium.resize(1600, scaleSize)
    }
    medium.quality(70).noProfile().write(imagesDir + 'm-' + req.file.filename, (err) => {
      if (!err) {
        req.file.medium = imagesDir + 'm-' + req.file.filename;
      } else {
        throw err;
      }
    });
    return size;
  }).then((size) => {
    const small = gm(imagePath);
    const scaleSize = Math.floor(200 / (size.width/size.height));
    small.resize(200, scaleSize);
    small.quality(70).noProfile().write(imagesDir + 's-' + req.file.filename, (err) => {
      if (!err) {
        req.file.small = imagesDir + 's-' + req.file.filename;
        next();
      } else {
        throw err;
      }
    });
  }).catch((err) => {
    next(err);
  });
}

const storage = multer.diskStorage({ //multers disk storage settings
  destination: function (req, file, cb) {
    cb(null, imagesDir);
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


router.post('/upload', authorizedUser, upload.single('file'), resizeImage, function(req, res) {
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
  img.medium = file.medium;
  img.small = file.small;
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
    query.select('medium small description comments');
    query.exec((error, images) => {
      if (respHelper(res, err, images)) {
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
