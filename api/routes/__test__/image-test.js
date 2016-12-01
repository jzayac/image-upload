'use strict'

const chai = require('chai');
const api = require('../../api');
const chaiHttp = require('chai-http');
const User = require('../../models/user');
const Album = require('../../models/album');
const Image = require('../../models/image');
const utils = require('../../utils/utils');
const roles = require('../../utils/roles').roles;
const userCreate = require('./userCreate');
const request = require('supertest');
const fs = require('fs');


chai.use(chaiHttp);
const testUser = {
  email: ('test' + utils.uid(2) + 'user@example.sk'),
  password: '123',
  nick: 'image' + utils.uid(2),
  role: roles.user,
};

let token;
let user;
let albumId;


describe('Image router:', function() {
  before((done) => {
    new Promise((resolve, reject) => {
      userCreate(testUser, (userObj) => {
        if (!userObj) {
          reject();
        }
        user = userObj;
        token = userObj.tokens[0].id;
        resolve(userObj);
      });
    }).then((userObj) => {
      const param = {
        userId: userObj._id,
        name: 'test' + utils.uid(2),
      }
      Album.save(param,(err, album) => {
        albumId = album._id;
        return;
      });
    }).then(() => {
      done();
    }).catch(() => {
      throw new Error('something go wrong');
    });
  });
  after(done => {
    User.find({email: testUser.email}).remove(() => {
      Album.remove({ownerId: user._id}, (err) => {
        if (err)
          return null;
        done()
      });
    });
  });

  it('should access with user role', (done) => {
    chai.request(api)
      .post('/image/upload')
      .set('Accept','application/json')
      .set('Authorization', 'Bearer ' + token)
      .end((err, res) => {
        // console.log(res.body);
        res.should.have.status(400);
        done();
      });
  });

  it('should upload file', (done) => {
    request(api)
      .post('/image/upload')
      .set('Authorization', 'Bearer ' + token)
      // .field('album', albumId)
      .field('data', '{"albumId": "' + albumId + '"}')
      .attach('file', 'uploads/smile.png')
      .end((err, res) => {
        res.should.have.status(200);
        done();
      })
  });
});
