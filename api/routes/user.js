'use strict';

const express = require('express');
const passport = require('passport');
const User = require('../models/user');
let router = express.Router();

function userInformation(user) {
  return {
    email: user.email,
    token: user.token,
  }
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
      // console.log(arguments[1]);
      // console.log(req.user);
      User.findOne(req.user.id, (err, user) => {
        // console.log(user.generateHash)
        console.log(user);
        res.status(200).json(user);
      });
      // res.status(200).json({});

      // if (err) {
      //   // console.log(err);
      //   return res.status(500).json({error: 'o_O oh nooooooooo'});
      // }
      // if (!user) {
      //   return res.status(401).json({ success: false, error: 'authentication failed' });
      // }
      // // console.log(user);
      // User.findOne({token: user.token}, (err, user) => {
      //   // console.log(user.generateHash)
      //   res.status(200).json(user);
      // });
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
  // console.log(req.header('Authorization'));
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
          res.status(500).json({});
        } else {
          res.status(200).json({
            message: 'ok',
          });
        }
      });
    } else {
      res.status(200).json({
        message: 'ok',
      });
    }
  })(req, res, next);
});

router.post('/signup', (req, res, next) => {
  passport.authenticate('local-signup', { session: false }, (err, user, info) => {
    if (err) {
      return next(err); // will generate a 500 error
    }
    if (info) {
      // TODO: better understanding of passport is needed
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
