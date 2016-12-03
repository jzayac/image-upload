'use strict';

const express = require('express');
const passport = require('passport');
const User = require('../models/user');
const validate = require('../../utils/validation');
const respHelper = require('../utils/utils').responseHelper;
const router = express.Router();

const authorizedUser = passport.authenticate('bearer-user', { session: false});
const authorizedAdmin = passport.authenticate('bearer-admin', { session: false});

function userInformation(user, token) {
  const idx = user.tokens.length;
  return {
    email: user.email,
    token: token || user.tokens[idx -1].id,
  };
}

router.post('/changepass', passport.authenticate('bearer', { session: false }),
    function(req, res) {
      const body = req.body;
      const erPass = validate(body.password, 'password').isRequired().isString().noSpace().exec();
      const erPassNew = validate(body.newPassword, 'new password').isRequired().isString().noSpace().exec();
      if (erPass || erPassNew) {
        return res.status(400).json({
          sucess: false,
          error: [].concat(erPass || [], erPassNew || []),
        });
      }
      req.user.changePass(body.password, body.newPassword, (err, user) => {
        if (err) {
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

router.get('/token', passport.authenticate('bearer', { session: false }), (req, res) => {
  res.status(200).json({
    success: true,
    data: req.user,
  });
});

// router.get('/loadauth', (req, res) => {
//   res.json({
//     data: req.user || null,
//   });
// });

router.post('/login', (req, res, next) => {
  passport.authenticate('local-login', (err, user, info) => {
    if (err) {
      return next(err); // will generate a 500 error
    }
    if (!info.tokenId) {
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
        data: userInformation(user, info.tokenId),
      });
    });
  })(req, res, next);
});

router.get('/logout', (req, res, next) => {
  passport.authenticate('bearer', { session: false }, (err, user, info) => {
    if (user) {
      user.removeToken(info.tokenId, (error, userUpdate) => {
        if (err) {
          return res.status(500).json({});
        }
        if (userUpdate) {
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
    if (!info.tokenId) {
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

router.get('/friends', authorizedUser, (req, res, next) => {
  const user = req.user;
  const resp = [];
  user.friends.forEach((friend) => {
    const query = User.findOne({_id: friend.userId});
    query.select('nickName photo');
    query.exec((err, friend) => {
      // TODO: if err - remove person
      if (friend) {
        resp.push(friend);
      }
    })
  });
  res.status(200).json({data: resp});
});

router.get('/list', authorizedUser, (req, res, next) => {
  const query = User.find({authorized: true});
  query.where('_id').ne(req.user._id);
  query.select('nickName photo');
  query.exec((err, users) => {
    if(respHelper(res, err, users)) {
      return res.status(200).json({
        data: users,
      });
    }
  });
});

router.post('/addfriend', authorizedUser, (req, res, next) => {
  const friendId = req.body.friendId;
  const user = req.user;
  User.findOne({_id: friendId}, (err, friendObj) => {
    if (!respHelper(res, err, friendObj)) {
      return;
    }

    user.friends.push({userId: friendId});
    user.save((err, userObj) => {
      if (!respHelper(res, err, userObj)) {
        return;
      }
      return res.status(200).send();
    });
  });
});

module.exports = router;
