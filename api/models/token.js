'use strict'

const mongoose = require('mongoose');
const config = require('../config/config');
const utils = require('../utils/utils');
const Schema = mongoose.Schema;

const tokenSchema = mongoose.Schema({
  token: {type: String, required: true},
  token_timeout: {type: Date},
  user_id: { type: Schema.Types.ObjectId, ref:'user' },
  create_date: {type: Date, default: Date.now, required: true},
	modified_date: {type: Date, default: Date.now, required: true},
});

tokenSchema.pre('save', function(next, done) {
    this.modified_date = Date.now();
    next();
});

// TODO: generate token by token.id
tokenSchema.methods.generateToken = function() {
  return utils.uid(256);
}

tokenSchema.statics.save = function(userId, cb) {
  const tokenObj = new this();
  const token_timeout = (new Date());
  token_timeout.setHours(token_timeout.getHours() + 2);
  tokenObj.token = tokenObj.generateToken();
  tokenObj.user_id = userId;
  tokenObj.token_time = token_timeout;
  tokenObj.save((err, token) => {
    cb(err, token);
  })
}

tokenSchema.statics.findToken = function(accessToken, cb) {
  const query = this.findOne();
  query.where('token').euqals(accessToken);
  query.exec((err, token) => {
    cb(err, token);
  })
}

module.exports = mongoose.model('tokens', tokenSchema);
