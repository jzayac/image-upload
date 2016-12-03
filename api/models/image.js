'use strict'

const mongoose = require('mongoose');
const fs = require('fs');

const imageSchema = mongoose.Schema({
  created: {type: Date, default: Date.now},
  comments: {type: Number, default: 0},
  ownerId: {type: mongoose.Schema.ObjectId, required: true},
  path: {type: String, require: true, default: ''},
  small: {type: String, default: ''},
  medium: {type: String, default: ''},
  description: {type: String, default: ''},
  albumId: { type: mongoose.Schema.ObjectId, required: true },
});

imageSchema.statics.isOwner = function(imageId, userId, cb) {
  const query = this.findOne({_id: imageId}, {ownerId: userId});
  query.exec((err, img) => {
    if (err) {
      return cb(err, false);
    }
    if (!img) {
      return cb(null, false, {status: 401});
    }
    return cb(null, img);
  });
}

imageSchema.statics.removeByAlbumId = function(albumId, cb) {
  const query = this.find({alubm: albumId}, (err, images) => {
    images.forEach((img) => {
      // this.removeWithFile()
    });
    console.log(images);
  });
};

imageSchema.statics.removeWithFile = function(img, cb) {
  console.log('PATH');
  console.log(img);
  // fs.unlinkSync(img.path);
  // TODO: remove path
  this.findOne({_id: img._id}).remove((err) => {
    cb(err);
  });
}

module.exports = mongoose.model('images', imageSchema);
