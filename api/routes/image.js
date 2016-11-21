'use strict'

const express = require('express');
const router = express.Router();
const multer = require('multer');

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

router.post('/upload', function(req, res) {
  console.log('file upload');
  console.log(req.file);
  upload(req,res,function(err){
    if(err){
      res.json({error_code:1,err_desc:err});
      return;
    }
    res.json({error_code:0,err_desc:null});
  });
});

module.exports = router;
