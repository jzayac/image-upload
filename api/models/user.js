'use strict';

const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const config = require('../config/config');
const utils = require('../utils/utils');

const userSchema = mongoose.Schema({
  email: {type: String, unique: true },
  password: String,
  authorized: {type: Boolean, default: false},
  registred: {type: Date, default: Date.now},
  lastLogin: {type: Date, default: Date.now},
  tokens: [{
      id: {type: String, required: true, default: ''},
      time: {type: Date, defailt: Date.now},
  }],
});

userSchema.pre('save', function(next, done) {
  this.lastLogin = Date.now();
  next();
});

// generating a hash
userSchema.methods.generateHash = function(password) {
  return bcrypt.hashSync(password, bcrypt.genSaltSync(8), null);
};

// checking if password is valid
userSchema.methods.validPassword = function(password) {
  const isCompare = bcrypt.compareSync(password, this.password);
  return isCompare;
}
// generate a token
userSchema.methods.generateToken = function() {
  const timeout = new Date();
  timeout.setHours(timeout.getHours() + 2);
  return {
    id: utils.uid(256),
    time: timeout,
  }
};

userSchema.methods.findAndUpdateToken = function() {
  // TODO: obsolete or
}

userSchema.methods.removeToken = function(accessToken, cb) {
  this.getUsedToken(accessToken, (err, token, idx) => {
    if (err) { return cb (err, null); }
    if (token) {
      this.tokens.splice(idx, 1);
      this.save((error, user) => {
        return cb(error, user);
      });
    }
  });


  // this.update({_id: ObjectId("58331f6298f03230507b714e")}, {$pull:{tokens: {_id: ObjectId("58331f9131929f30607d7540")}}}, false, true)
}
// check if password match then save new password
userSchema.methods.changePass = function(oldPass, newPass, cb) {
  if (!this.validPassword(oldPass)) {
    return cb('invalid password', false);
  }
  this.password = this.generateHash(newPass);
  this.token = this.generateToken();
  this.save((error) => {
    return cb(error, this);
  });
}

// find token object and check if is not expired
userSchema.methods.getUsedToken = function(accessToken, cb) {
  let usedToken = {};
  let idxToken = null;
  this.tokens.some((token, idx) => {
    if (token.id === accessToken) {
      usedToken = token;
      idxToken = idx;
      return token;
    }
  });
  if (usedToken) {
    if (usedToken.id) {
      if ( Date.now() < (new Date(usedToken.time)).getTime()) {
        return cb(null, usedToken.id, idxToken);
      } else {
        // expired token need to remove
        return cb('session expired please login again');
      }
    }
    return cb('token not found', false);
  }
}

userSchema.statics.authenticate = function(email, password, cb) {
  const query = this.findOne();
  query.where('email').equals(email);
  query.exec((err, user) => {
    if (err) {
      return cb(err, null);
    }
    if (user == null) {
      return cb(null, false);
    }
    if (user.validPassword(password)) {
      return cb(null, user);
    } else {
      return cb(null, false);
    }
  });
}

userSchema.statics.removeToken = function() {

}

userSchema.statics.getUserByToken = function(accessToken, cb) {
  this.findOne({"tokens.id": accessToken}, (err, user) => {
    if (err) {
      return cb(err, null);
    }
    if (!user) {
      return cb(null, false);
    }
    return cb(null, user);
  });
}

userSchema.statics.authorized = function(accessToken, cb) {
  this.getUserByToken(accessToken, (err, user) => {
    if (err) {
      // TODO: logger
      console.error(err);
      return cb('somethings go wrong', null);
    }
    if (!user) {
      return cb('accessToken not found', false);
    }
    user.getUsedToken(accessToken, (error, token) => {
      return cb(error, user);
    });
  });
}

module.exports = mongoose.model('users', userSchema);
