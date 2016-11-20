'use strict';

const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const BearerStrategy = require('passport-http-bearer').Strategy;
const User = require('../models/user');
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
    User.findOne({ token: token }, function (err, user) {
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

      // const userToken = createToken(newUser._id);
      newUser.email = email;
      newUser.password = newUser.generateHash(password);
      newUser.authorized = false;
      newUser.token = newUser.generateToken();
      const save = newUser.save((error) => {
        if (error) {
          throw error;
        } else {
          return done(null, newUser);
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
    user.token = user.generateToken();
    user.save((error) => {
      if (error) {
        throw error;
      } else {
        return done(null, user);
      }
    });
  });
}));
