'use strict';

const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const BearerStrategy = require('passport-http-bearer').Strategy;
const User = require('../models/user');
// const Token = require('../models/token');
const validate = require('../../utils/validation');

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
    User.authorized(token, (err, user, message) => {
      if (err) { return done(err, null); }
      if (!user) { return done (null, false, {message: message})}
      return done(null, user, {
        scope: user._id,
        tokenId: token,
        message: message,
        role: user.role,
      });
    });
  }
));


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

      const token = newUser.generateToken()
      newUser.email = email;
      newUser.password = newUser.generateHash(password);
      newUser.authorized = false;
      newUser.tokens.push(token);
      const save = newUser.save((error, userObj) => {
        if (error) {
          throw error;
        } else {
          return done(null, userObj, {
            scope: userObj._id,
            tokenId: token.id,
          });
        }
      });
      // save.then(done(null, newUser));
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
  User.authenticate(email, password, (err, user) => {
    if (err) {
      return done(err);
    }
    if (!user) {
      return done(null, false, { status: 401, error: 'login or password are incorrect' });
    }
    const token = user.generateToken();
    user.lastLogin = Date.now();
    user.tokens.push(token);
    user.save((error, newUser) => {
      if (error) {
        throw error;
      } else {
        return done(null, newUser, {
          scope: newUser._id,
          tokenId: token.id,
        });
      }
    });
  });
}));
