'use strict';

const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const config = require('../config/config');

const userSchema = mongoose.Schema({
  email: {type: String, unique: true },
  password: String,
  authorized: {type: Boolean, default: false},
  registred: {type: Date, default: Date.now},
  lastLogin: {type: Date, default: Date.now},
  token: {
    type: String,
    default: '',
  },
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

userSchema.methods.generateToken = function() {
  return jwt.sign({
      id: this._id,
      hash: Math.ceil((Math.random() *10000)),
    }, config.tokenSecret, {
      expiresIn: 120
    });
};

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

// userSchema.methods.changePass = function(newPass, callback) {
//   this.password = this.generateHash(newPass);
//   this.save(callback());
// }

// userSchema.statics.createUser = function(callback) {
//   var user = new this();
//   user.email = "test@test.com";
//   user.save(callback);
// };
userSchema.statics.authenticate = function(email, password, cb) {
  const query = this.findOne();
  query.where('email').equals(email);
  // query.select('password');
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

module.exports = mongoose.model('users', userSchema);
