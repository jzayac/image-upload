'use strict'

const User = require('../../models/user');

module.exports = function(user, cb) {
  const newUser = new User();
  newUser.email = user.email;
  newUser.password = newUser.generateHash(user.password);
  newUser.role = user.role;
  newUser.nickName = user.nick;
  newUser.authorized = true;
  newUser.tokens.push(newUser.generateToken());
  newUser.save((err, userObj) => {
    return cb(userObj);
  });
}
