'use stric'

const mongoose = require('mongoose');
const utils = require('../utils/utils');
const roles = require('../utils/roles').roles;
const isAdmin = require('../utils/roles').isAdmin;
const Images = require('./image');

// const

const albumSchema = mongoose.Schema({
  name: {type: String, index: { unique: true }},
  path: {type: String, require: true, default: ''},
  created: {type: Date, default: Date.now},
  lastUpdate: {type: Date, default: Date.now},
  comments: {type: Number, default: 0},
  ownerId: {type: mongoose.Schema.ObjectId, required: true},
  description: {type: String, default: ''},
  visitors: [{
    userId: { type: mongoose.Schema.ObjectId, required: true },
    canUpload: {type: Boolean, default: false },
  }],
});

albumSchema.pre('save', function(next, done) {
  this.lastUpdate = Date.now();
  next();
});

// albumSchema.methods.pushImage = function(imageId, cb) {
//
// }

albumSchema.statics.findAndRemoveAll = function(albumId, user, cb) {
  const query = this.findOne({_id: albumId});
  if (!isAdmin(user.role)) {
    query.where('ownerId').equals(user._id);
  }

  query.exec((err, album) => {
    if (err) {
      return cb(err);
    }
    // Images.remove({album: albumId})
    // if (album.images.length === 0 ) {
    album.remove((err) => {
      return cb(null);
    });
    // } else {
    //   Images.remove({album: albumId}, (err) => {
    //     return cb(err);
    //   });
    // }
  });
}

albumSchema.statics.save = function(param, cb) {
  const albumObj = new this();
  albumObj.name = param.name;
  albumObj.path = utils.stringToUrl(param.name);
  albumObj.ownerId = param.userId;
  albumObj.description = param.description || '';
  albumObj.accessRole = param.accessRole || roles.user;
  albumObj.visitors.push({userId: param.userId});
  albumObj.save((err, album) => {
    cb(err, album);
  });
}

module.exports = mongoose.model('albums', albumSchema);
