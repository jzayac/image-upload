'use strict';

const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const utils = require('../utils/utils');
const roles = require('../utils/roles').roles;

const USER_ROLE =  roles.user;
const ADMIN_ROLE = roles.admin;

const userSchema = mongoose.Schema({
  // email: {type: String, unique: true },
  email: {type: String, index: { unique: true }},
  password: {type: String, required: true},
  authorized: {type: Boolean, default: false},
  registred: {type: Date, default: Date.now},
  lastLogin: {type: Date, default: Date.now},
  lastUpdate: {type: Date, default: Date.now},
  nickName: {type: String, required: true, unique: true},
  tokens: [{
      id: {type: String, required: true, default: ''},
      time: {type: Date, defailt: Date.now},
  }],
  role: {type: Number, default: USER_ROLE},
});

userSchema.pre('save', function(next, done) {
  this.lastUpdate = Date.now();
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

userSchema.methods.removeTokenByIdx = function(idx, cb) {
  this.tokens.splice(idx, 1);
  this.save((error, user) => {
    return cb(error, user);
  });
}

userSchema.methods.removeToken = function(accessToken, cb) {
  this.getUsedToken(accessToken, (err, token, idx) => {
    if (err) {
       return cb (err, null);
    }
    if (token) {
      this.removeTokenByIdx(idx, (error, user) => {
        return cb(error, user);
      });
    }
  });
}

// check if password match then save new password
userSchema.methods.changePass = function(oldPass, newPass, cb) {
  if (!this.validPassword(oldPass)) {
    return cb(null, false, 'invalid password');
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
  if (usedToken && usedToken.id) {
    const dateToken = (new Date(usedToken.time)).getTime();
    const dateNow = Date.now();
    if ( dateNow < dateToken) {
      return cb(null, usedToken.id, idxToken);
    // TODO: is less then one hour ubate token with new time
    // } else if (Date)
    } else {
      this.removeTokenByIdx(idxToken, (error, user) => {
        const message = 'session expired please login again';
        return cb(error || message , null, message);
      });
    }
  } else {
    return cb(null, false, 'token not found');
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
      return cb(err, null);
    }
    if (!user.authorized) {
      return cb(null, null, 'not authorized');
    }
    if (!user) {
      return cb(null, false, 'accessToken not found' );
    }
    user.getUsedToken(accessToken, (error, token, info) => {
      return cb(error, user, info);
    });
  });
}

module.exports = mongoose.model('users', userSchema);
