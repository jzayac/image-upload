'use strict';

const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const BearerStrategy = require('passport-http-bearer').Strategy;
const User = require('../models/user');
const roles = require('../utils/roles');
const validate = require('../../utils/validation');

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser((id, done) => {
  User.findById(id, (err, user) => {
    done(err, user);
  });
});

function bearerStrategyHelper(token, done) {
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

passport.use(new BearerStrategy(
  function(token, done) {
    bearerStrategyHelper(token, (err, user, message) => {
      done(err, user, message);
    });
  }
));

passport.use('bearer-user', new BearerStrategy(
  function(token, done) {
    bearerStrategyHelper(token, (err, user, message) => {
      if (err || !user) {
        return done(err, user, message);
      }
      if (!roles.isUser(user.role)) {
        return done(null, false);
      }
      return done(err, user, message);
    });
  }
));

passport.use('bearer-admin', new BearerStrategy(
  function(token, done) {
    bearerStrategyHelper(token, (err, user, message) => {
      if (err || !user) {
        return done(err, user, message);
      }
      if (!roles.isAdmin(user.role)) {
        return done(null, false);
      }
      return done(err, user, message);
    });
  }
));

passport.use('local-signup', new LocalStrategy({
  usernameField: 'email',
  passwordField: 'password',
  passReqToCallback: true,
},
(req, email, password, done) => {

  const invalidEmail = validate(email, 'email').isRequired().isEmail().max(23).exec();
  let nick = req.body.nick || '';
  nick = nick.trim();
  const invalidNick = validate(req.body.nick, 'nick').isRequired().isString().max(15).exec();
  if (invalidEmail || invalidNick) {
    return done(null, false, {
      status: 400,
      error: [].concat(invalidEmail || [], invalidNick || [] ),
    });
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
      newUser.nickName = nick;
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
