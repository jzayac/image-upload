'use strict';

const LocalStrategy = require('passport-local').Strategy;
// const Strategy = require('passport-local');
const User = require('../models/user');
const validate = require('../../utils/validation');


module.exports = (passport) => {

  passport.serializeUser((user, done) => {
    done(null, user.id);
  });

  passport.deserializeUser((id, done) => {
    User.findById(id, (err, user) => {
      done(err, user);
    });
  });

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

        newUser.email = email;
        newUser.password = newUser.generateHash(password);
        newUser.authorized = false;

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

      return done(null, user);;
    });
  }));
};
