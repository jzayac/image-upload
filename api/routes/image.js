'use strict'

const express = require('express');
const router = express.Router();
const multer = require('multer');
const passport = require('passport');
const roles = require('../utils/roles');

//const validate = require('../../utils/validation');

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
  storage: storage
}).single('file');

router.get('/test', (req, res) => {

  res.status(200).json({
    success: 'fuck',
  })
});

router.post('/upload', (req, res, next) => {
  console.log(req.file);
  passport.authenticate('bearer', { session: false }, (err, user, info) => {
    if (!roles.isUser(user.role)) {
      return res.status(401).send();
    }
    if (err) {
      return next(err);
    }
    if (!info.tokenId) {
      return res.status(info.status).json({error: info.error});
    }
    if (! user) {
      return res.status(401).json({ success: false, error: 'authentication failed' });
    }
    console.log('file upload');
    // console.log(req);
    if (req.file) {
      upload(req,res,function(err){
        if(err){
          res.json({error_code:1,err_desc:err});
          return;
        }
        res.json({error_code:0,err_desc:null});
      });
    } else {
      res.status(400).json({
        success: false,
        message: 'no file',
      });
    }
  })(req, res, next);
});

module.exports = router;
