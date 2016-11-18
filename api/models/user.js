'use strict';

const mongoose = require('mongoose');
const bcrypt = require('bcrypt-nodejs');

let userSchema = mongoose.Schema({
  email: {type: String, unique: true },
  password: String,
  authorized: {type: Boolean, default: false},
  registred: {type: Date, default: Date.now},
  lastLogin: {type: Date, default: Date.now},
});

// methods ======================
// generating a hash
userSchema.methods.generateHash = function(password) {
  return bcrypt.hashSync(password, bcrypt.genSaltSync(8), null);
};

// checking if password is valid
userSchema.methods.validPassword = function(password) {
  const isCompare = bcrypt.compareSync(password, this.password);
  return isCompare;
};

userSchema.method.lastLogin = function(callback) {
  let user = this();
  user.lastLogin = Date.now;
  user.save(() => {
    callback();
  });
};

module.exports = mongoose.model('user', userSchema);
