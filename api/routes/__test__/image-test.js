'use strict'

const chai = require('chai');
const api = require('../../api');
const chaiHttp = require('chai-http');
const should = chai.should();
const User = require('../../models/user');
const utils = require('../../utils/utils');
const passport = require('passport');
const roles = require('../../utils/roles').roles;


chai.use(chaiHttp);
const testUser = {
  email: ('test' + utils.uid(2) + 'user@example.sk'),
  password: '123',
};

let token;
let user;


describe('Image router:', function() {
  before((done) => {
    const newUser = new User();
    newUser.email = testUser.email;
    newUser.password = newUser.generateHash(testUser.password);
    newUser.role = roles.user;
    newUser.tokens.push(newUser.generateToken());
    newUser.save((err, userObj) => {
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
        console.log(res.body);
        res.should.have.status(400);
        done();
      });
  });
});
