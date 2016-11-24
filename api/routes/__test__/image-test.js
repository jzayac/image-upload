'use strict'

const chai = require('chai');
const api = require('../../api');
const chaiHttp = require('chai-http');
const should = chai.should();
const User = require('../../models/user');
const utils = require('../../utils/utils');
const roles = require('../../utils/roles').roles;
const userCreate = require('./userCreate');


chai.use(chaiHttp);
const testUser = {
  email: ('test' + utils.uid(2) + 'user@example.sk'),
  password: '123',
  nick: 'image' + utils.uid(2),
  role: roles.user,
};

let token;
let user;


describe('Image router:', function() {
  before((done) => {
    userCreate(testUser, (userObj) => {
      user = userObj;
      token = userObj.tokens[0].id;
      done();
    });
  });
  after(done => {
    User.find({email: testUser.email}).remove(() => {done()});
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
});
