'use strict'

const chai = require('chai');
const api = require('../../api');
const chaiHttp = require('chai-http');
const should = chai.should();
const User = require('../../models/user');


chai.use(chaiHttp);
const testUser = {
  email: 'user@example.com',
  password: '123',
};
let Cookie;

describe('User router', function() {
  after(done => {
    User.find({email: testUser.email}).remove(() => {done()});
  });

  it('test', function(done) {
    chai.request(api)
      .get('/user/login')
      .end((err, res) => {
        res.should.have.status(200);
        res.body.router.should.equal('login');
        res.body.should.be.a('object');
        done();
      });
  });

  it('test url', function(done) {
    chai.request(api)
      .post('/test')
      .set('Accept','application/json')
      .send({"email": "user_test@example.com", "password": "123"})
      .end((err, res) => {
        res.should.have.status(200);
        done();
      });
  });

  it('invalid user email', (done) => {
    chai.request(api)
      .post('/user/signup')
      .set('Accept','application/json')
      .send({"email": "userexample.com", "password": "123"})
      .end((err, res) => {
        // console.log(res.body);
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
        res.should.have.status(200);
        res.body.should.be.a('object');
        res.body.data.email.should.equal(testUser.email);
        Cookie = res.headers['set-cookie'].pop().split(';')[0];
        done();
      });
  });

  it('should get user information', (done) => {
    const req = chai.request(api).get('/user/loadauth');
    req.cookies = Cookie;
    req.end((err, res) => {
      res.should.have.status(200);
      res.body.data.email.should.equal(testUser.email);
      done();
    });
  });

});
