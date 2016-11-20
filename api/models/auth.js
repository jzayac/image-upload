'use strict'

const User = require('./user');
const Token = require('./token');

exports.createUserWithToken = function(userObj, cb) {
  const newUser = new User();
  // const err = null;
  for (key in userObj) {
    newUser[key] = userObj[key];
  }
  const save = newUser.save((error) => {
    // er = error;
    if (error) {
      cb(error, null);
    } else {
      Token.save(newUser._id, (err, token) => {
        cb(err, token);
      })
    }
  });
  // save.then()

}
