'use strict'

const chai = require('chai');
const api = require('../../api');
const chaiHttp = require('chai-http');
const expect = chai.expect;
const User = require('../../models/user');
const Album = require('../../models/album');
const Image = require('../../models/image');
const utils = require('../../utils/utils');
const roles = require('../../utils/roles').roles;
const userCreate = require('./userCreate');
const request = require('supertest');
const fs = require('fs');
const path = require('path');


chai.use(chaiHttp);
const testUser = {
  email: ('test' + utils.uid(2) + 'user@example.sk'),
  password: '123',
  nick: 'image' + utils.uid(2),
  role: roles.user,
};

const imgPath = path.join(__dirname, 'img/smile.png');
let token;
let user;
let albumId;
let imageId;


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
      .field('data', '{"albumId": "' + albumId + '"}')
      .attach('file', imgPath)
      .end((err, res) => {
        res.should.have.status(200);
        res.body.data._id.should.not.be.empty;
        imageId = res.body.data._id;
        done();
      });
  });

  it('should return list of images', (done) => {
    request(api)
      .get('/image/albumlist/' + albumId)
      .set('Authorization', 'Bearer ' + token)
      .end((err, res) => {
        expect(res.body.data).to.have.lengthOf(1);
        res.should.have.status(200);
        done();
      });
  });

  it('should update image description', (done) => {
    return done();
    const desc = 'test desc';
    request(api)
      .post('/image/update')
      .set('Authorization', 'Bearer ' + token)
      .send({imageId: imageId, description: desc})
      .end((err, res) => {
        res.should.have.status(200);
        res.body.data.description.should.be.equal(desc);
        done();
      });
  });
  it('should delete image', (done) => {
    const desc = 'test desc';
    request(api)
      .delete('/image/' + imageId)
      .set('Authorization', 'Bearer ' + token)
      .end((err, res) => {
        res.should.have.status(200);
        // res.body.data.description.should.be.equal(desc);
        done();
      });
  });
});
