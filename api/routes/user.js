'use strict';

const express = require('express');
const passport = require('passport');
const User = require('../models/user');
const validate = require('../../utils/validation');
let router = express.Router();

function userInformation(user, token) {
  const idx = user.tokens.length;
  return {
    email: user.email,
    token: token || user.tokens[idx -1].id,
  };
}

router.get('/login', (req, res) => {
  res.json({
    router: 'login',
  });
});

// router.get('/token', passport.authenticate('bearer', { session: false }),
//   function(req, res) {
//     console.log('token auth');
//     res.json({
//       success: true,
//       data: req.user
//     });
//   });

router.post('/changepass', passport.authenticate('bearer', { session: false }),
    function(req, res) {
      const body = req.body;
      const erPass = validate(body.password, 'password').isRequired().isString().noSpace().exec();
      const erPassNew = validate(body.newPassword, 'new password').isRequired().isString().noSpace().exec();
      if (erPass || erPassNew) {
        const error = erPass ? erPass.concat(erPassNew || []) : erPassNew.concat(erPass);
        return res.status(400).json({
          sucess: false,
          error: error,
        });
      }
      req.user.changePass(body.password, body.newPassword, (err, user) => {
        if (err) {
          // console.log('error');
          // console.log(err);
          return res.status(400).json({
            success: false,
            error: err,
          });
        }
        if (user) {
          return res.status(200).json({
            success: true,
            data: {
              token: user.token,
            }
          });
        }
        return res.status(400).json({
          success: false,
          error: 'unknown error',
        });
      });
    }
);

router.get('/token', (req, res, next) => {
  passport.authenticate('bearer', { session: false }, (err, user, info) => {
    if (err) {
      return next(err); // will generate a 500 error
    }
    if (info && !user) {
      return res.status(401).json({error: info});
    }
    if (!user) {
      return res.status(401).json({ success: false, error: 'authentication failed' });
    }
    res.status(200).json({
      success: true,
      data: user,
    })
  })(req, res, next);
});

router.get('/loadauth', (req, res) => {
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
        data: userInformation(user),
      });
    });
  })(req, res, next);
});

router.get('/logout', (req, res, next) => {
  passport.authenticate('bearer', { session: false }, (err, user, info) => {
    if (user) {
      User.update({ _id: user.id }, { $set: { token: '' }}, (err) => {
        if (err) {
          return res.status(500).json({});
        }
        if (user) {
          return res.status(200).json({
            message: 'ok',
          });
        }
        return res.status(500).json({});
      });
    } else {
      return res.status(401).send();
    }
  })(req, res, next);
});

router.post('/signup', (req, res, next) => {
  passport.authenticate('local-signup', { session: false }, (err, user, info) => {
    if (err) {
      return next(err); // will generate a 500 error
    }
    if (info) {
      return res.status(info.status || '401').json({error: info.error || info.message});
    }
    if (!user) {
      return res.status(401).json({ success: false,  error: 'registration failed' });
    }
    req.login(user, loginErr => {
      if (loginErr) {
        return next(loginErr);
      }
      res.json({
        success: true,
        data: userInformation(user),
      });
    });
  })(req, res, next);
});


module.exports = router;
