'use strict';

const mongoose = require('mongoose');
const bcrypt = require('bcrypt-nodejs');
const jwt = require('jsonwebtoken');
const config = require('../config/config');

let userSchema = mongoose.Schema({
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

userSchema.pre('save', function(next) {
  let user = this;
  user.lastLogin = Date.now();
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
};
userSchema.methods.generateToken = function() {
  return jwt.sign({
      id: this._id,
      hash: Math.ceil((Math.random() *10000)),
    }, config.tokenSecret, {
      expiresIn: 120
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
userSchema.statics.changePass = function(id, oldPass, newPass, cb) {
  this.findById(id, (err, user) => {
    if (err) {
      return cb(err, null);
    }
    if (user == null) {
      return cb(null, false);
    }
    if (!user.validPassword(oldPass)) {
      return cb(null, false, 'invalid password');
    }
    user.password = user.generateHash(newPass);
    user.token = user.generateToken();
    user.save((error) => {
      if (error) {
        return cb(error, false);
      }
      return cb(null, user);
    });
  });
}

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
// userSchema.statics.createUser = function() {
//
// }
// userSchema.static.lastLogin = function(callback) {
//   let user = this;
//   user.lastLogin = Date.now();
//   user.save(() => {
//     callback();
//   });
// };

module.exports = mongoose.model('user', userSchema);
