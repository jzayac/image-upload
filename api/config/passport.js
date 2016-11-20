'use strict';

const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const BearerStrategy = require('passport-http-bearer').Strategy;
const User = require('../models/user');
const jwt = require('jsonwebtoken');
const config = require('./config');
const validate = require('../../utils/validation');


function createToken(userId) {
  return jwt.sign({
      id: userId,
      hash: Math.ceil((Math.random() *10000)),
    }, config.tokenSecret, {
      expiresIn: 120
    });
}

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser((id, done) => {
  User.findById(id, (err, user) => {
    done(err, user);
  });
});

passport.use(new BearerStrategy(
  function(token, done) {
    if (token.length < 1) {
      return done(null, false);
    }
    User.findOne({ token: token }, function (err, user) {
      // console.log('ERROR');
      // console.log(user);
      if (err) { return done(err); }
      if (!user) { return done(null, false); }
      // TODO: check info
      return done(null, user, {
        scope: user._id,
        token_id: user.token,
      });
    });
  }
));

// passport.use('local-changePass', new BearerStrategy(
//   function(token, done) {
//     if (token.length < 1) {
//       return done(null, false);
//     }
//     User.findOne({ token: token }, function (err, user) {
//       if (err) { return done(err); }
//       if (!user) { return done(null, false); }
//       // TODO: check info
//       return done(null, user, {
//         scope: user._id,
//         token_id: user.token,
//       });
//     });
//   }
// ));

passport.use('local-signup', new LocalStrategy({
  usernameField: 'email',
  passwordField: 'password',
  passReqToCallback: true,
},
(req, email, password, done) => {
  const invalidEmail = validate(email, 'email').isRequired().isEmail().exec();
  if (invalidEmail) {
    return done(null, false, { status: 400, error: invalidEmail });
  }
  User.findOne({ email:  email }, (err, user) => {
    if (err) {
      return done(err);
    }

    if (user) {
      return done(null, false, { status: 401, error: 'That email is already taken.' });
    } else {
      const newUser = new User();

      const userToken = createToken(newUser._id);
      newUser.email = email;
      newUser.password = newUser.generateHash(password);
      newUser.authorized = false;
      newUser.token = userToken;
      newUser.save((error) => {
        if (error) {
          throw error;
        } else {
          return done(null, newUser);
        }
      });
    }
  });
}));

passport.use('local-login', new LocalStrategy({
  usernameField: 'email',
  passwordField: 'password',
  passReqToCallback: true, // allows us to pass back the entire request to the callback
},
(req, email, password, done) => { // callback with email and password from our form
  const invalidEmail = validate(email, 'email').isRequired().isEmail().exec();
  if (invalidEmail) {
    return done(null, false, { status: 400, error: invalidEmail });
  }
  User.findOne({ email:  email }, (err, user) => {
    if (err) {
      return done(err);
    }

    if (!user) {
      return done(null, false, { status: 401, error: 'No user found.' });
    }

    if (!user.validPassword(password)) {
      return done(null, false, { status: 401, error: 'Oops! Wrong password.' });
    }

    user.token = createToken(user._id);
    user.save((error) => {
      if (error) {
        throw error;
      } else {
        return done(null, user);
      }
    })
  });
}));
