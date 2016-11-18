'use strict';

const express = require('express');
const passport = require('passport');
let router = express.Router();

router.get('/login', (req, res) => {
  res.json({
    router: 'login',
  });
});

router.get('/loadauth', (req, res) => {
  console.log(req.user);
  res.json({
    data: req.user || null,
  });
});

router.post('/login', (req, res, next) => {
  passport.authenticate('local-login', (err, user, info) => {
    if (err) {
      return next(err); // will generate a 500 error
    }
    if (info) {
      return res.status(info.status).json({error: info.error});
    }
    if (! user) {
      return res.status(401).json({ success: false, error: 'authentication failed' });
    }
    req.login(user, loginErr => {
      if (loginErr) {
        return next(loginErr);
      }
      res.json({
        success: true,
        data: {
          email: user.email,
        }
      });
    });
  })(req, res, next);
});

router.get('/logout', (req, res) => {
  req.logout();
  res.status(200).json({
    message: 'ok',
  });
});

router.post('/signup', (req, res, next) => {
  // console.log(req.body);
  passport.authenticate('local-signup', { session: false }, (err, user, info) => {
    if (err) {
      return next(err); // will generate a 500 error
    }
    if (info) {
      // TODO: better understanding of passport is needed
      return res.status(info.status || '401').json({error: info.error || info.message});
    }
    if (!user) {
      return res.status(401).json({ success: false, error: 'registration failed' });
    }
    // console.log(user);
    req.login(user, loginErr => {
      if (loginErr) {
        return next(loginErr);
      }
      res.json({
        success: true,
        data: {
          email: user.email,
        }
      });
    });
  })(req, res, next);
});

router.get('/user', isAuthenticated, (req, res) => {
  res.status(200).json({
    data: 'send from server',
  });
});


function isAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
      return next();
    }
    res.json({ error: 'Unauthorized'});
}


module.exports = router;
