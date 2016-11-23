'use stric'

const mongoose = require('mongoose');
const utils = require('../utils/utils');
const roles = require('../utils/roles').roles;

const albumSchema = mongoose.Schema({
  name: {type: String, index: { unique: true }},
  path: {type: String, require: true, default: ''},
  created: {type: Date, default: Date.now},
  lastUpdate: {type: Date, default: Date.now},
  comments: {type: Number, default: 0},
  ownerId: {type: mongoose.Schema.ObjectId, required: true},
  description: {type: String, default: ''},
  images: [{
    id: { type: mongoose.Schema.ObjectId, required: true },
  }],
  accessRole: {type: Number, default: roles.user}
});

albumSchema.pre('save', function(next, done) {
  this.lastUpdate = Date.now();
  next();
});

// albumSchema.methods.pushImage = function(imageId, cb) {
//
// }

albumSchema.statics.save = function(param, cb) {
  const albumObj = new this();
  albumObj.name = param.name;
  albumObj.path = utils.stringToUrl(param.name;
  albumObj.ownerId = param.userId;
  albumObj.description = param.description || '';
  albumObj.accessRole = param.accessRole;
  albumObj.save((err, album) => {
    cb(err, album);
  });
}

module.exports = mongoose.model('albums', albumSchema);
