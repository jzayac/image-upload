'use strict'

const chai = require('chai');
const api = require('../../api');
const chaiHttp = require('chai-http');
const should = chai.should();
const User = require('../../models/user');
const utils = require('../../utils/utils');


chai.use(chaiHttp);
const testUser = {
  email: ('test' + utils.uid(2) + 'user@example.sk'),
  password: '123',
  nick: 'ferko' + utils.uid(2),
};
let token;
let tokenOld;

describe('User router:', function() {
  before((done) => {
    done();
  });
  after(done => {
    User.find({email: testUser.email}).remove(() => {done()});
    // done();
  });

  it('invalid user email', (done) => {
    chai.request(api)
      .post('/user/signup')
      .set('Accept','application/json')
      .send({"email": "userexample.com", "password": "123"})
      .end((err, res) => {
        res.should.have.status(400);
        done();
      });
  });

  it('crete user', (done) => {
    chai.request(api)
      .post('/user/signup')
      .set('Accept','application/json')
      .send(testUser)
      .end((err, res) => {
        User.update({email: testUser.email}, {$set: {authorized: true}}, (err, user) => {
          res.should.have.status(200);
          res.body.should.be.a('object');
          res.body.data.email.should.equal(testUser.email);
          res.body.data.should.have.property('token');
          res.body.data.token.should.not.be.empty;
          token = res.body.data.token;
        done();
        });
      });
  });

  // it('should get user information', (done) => {
  //   chai.request(api)
  //     .get('/user/token')
  //     .set('Accept','application/json')
  //     .set('Authorization', 'Bearer ' + token)
  //     .end((err, res) => {
  //       res.should.have.status(200);
  //       res.body.should.be.a('object');
  //       res.body.data.should.be.a('object');
  //       done();
  //     });
  // });

  it('user logout', (done) => {
    chai.request(api)
      .get('/user/logout')
      .set('Accept','application/json')
      .set('Authorization', 'Bearer ' + token)
      .end((err, res) => {
        res.should.have.status(200);
        res.body.should.be.a('object');
        res.body.message.should.equal('ok');
        User.findOne({token: token}, (err, user) => {
          if (!err && !user) {
            done();
          }
        })
      });
  });

  it('user login', (done) => {
    tokenOld = token;
    chai.request(api)
      .post('/user/login')
      .set('Accept','application/json')
      .send(testUser)
      .end((err,res) => {
        res.should.have.status(200);
        res.body.should.be.a('object');
        res.body.data.email.should.equal(testUser.email);
        res.body.data.should.have.property('token');
        res.body.data.token.should.not.be.empty;
        res.body.data.token.should.not.equal(tokenOld);
        token = res.body.data.token;
        done();
      });
  });

  it('should get user information', (done) => {
    chai.request(api)
      .get('/user/token')
      .set('Accept','application/json')
      .set('Authorization', 'Bearer ' + token)
      .end((err, res) => {
        res.should.have.status(200);
        res.body.should.be.a('object');
        res.body.data.should.be.a('object');
        done();
      });
  });

  it('try to change password with invalid pass', (done) => {
    chai.request(api)
      .post('/user/changepass')
      .set('Accept','application/json')
      .set('Authorization', 'Bearer ' + token)
      .send({password: '144431', newPassword: 'abc'})
      .end((err, res) => {
        res.should.have.status(400);
        res.body.error.should.not.be.empty;
        // console.log(res.body);
        done();
      });
  });

  it('should change password', (done) => {
    chai.request(api)
      .post('/user/changepass')
      .set('Accept','application/json')
      .set('Authorization', 'Bearer ' + token)
      .send({password: testUser.password, newPassword: 'abc'})
      .end((err, res) => {
        res.should.have.status(200);
        res.body.data.token.should.not.be.empty;
        res.body.data.token.should.not.equal(tokenOld);
        // res.body.should.be.a('object');
        // res.body.data.should.be.a('object');
        done();
      });
  });

  it('should get list of users', (done) => {
    chai.request(api)
      .get('/user/list')
      .set('Authorization', 'Bearer ' + token)
      .end((err, res) => {
        res.should.have.status(200);
        res.body.data.should.not.be.empty;
        res.body.data.should.to.be.instanceof(Array);
        done();
      });
  });
});
