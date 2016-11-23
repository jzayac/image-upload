'use strict'

const express = require('express');
const router = express.Router();
const multer = require('multer');
const passport = require('passport');
const roles = require('../utils/roles');
const path = require('path');

const storage = multer.diskStorage({ //multers disk storage settings
  destination: function (req, file, cb) {
    cb(null, './uploads/')
  },
  filename: function (req, file, cb) {
    const datetimestamp = Date.now();
    cb(null, file.fieldname + '-' + datetimestamp + '.' + file.originalname.split('.')[file.originalname.split('.').length -1])
  },
});

const upload = multer({ //multer settings
  storage: storage,
  // limits: { fileSize: 20000000 },
  fileFilter: function (req, file, cb) {
    const ext = path.extname(file.originalname);
    const isAllowed = ['.jpg', '.jpeg', '.png'].find((val) => {
      return ext === val;
    });
    if (!isAllowed) {
      return cb('not supported file', false)
    }
    cb(null, true);
  },
});

router.post('/upload', passport.authenticate('bearer-user', { session: false }), upload.single('file'), function(req, res) {
  // console.log(req.files);
  // console.log(req.file);
  // console.log(req.body);
  if (!req.file) {
    return res.status(400).send();
  }
  res.status(200).json({
    success: true,
    // data: {
    //   message: req.file.originalname,
    // }
  })

});

module.exports = router;
