'use strict'

const chai = require('chai');
const expect = chai.expect;
const User = require('../user');

const testUser = {
  email: 'test@model.com',
  password: '567',
};
let testModel;

describe('User model: ', () => {
  beforeEach((done) => {
    testModel = new User();
    testModel.email = testUser.email;
    testModel.password = testModel.generateHash(testUser.password);
    done();
  });
  afterEach((done) => {
    User.find({email: testUser.email}).remove(() => {done()});
  });


  it('pass should be valid', (done) => {
    expect(testModel.validPassword(testUser.password)).to.be.true;
    done();
  });

  it('should create and delete user tokens', (done) => {
    const tokenFirst = testModel.generateToken();
    const tokenSecond = testModel.generateToken();
    testModel.tokens.push(tokenFirst);
    testModel.tokens.push(tokenSecond);
    testModel.save((err, user) => {
      expect(err).to.be.a('null');
      expect(user).to.be.a('object');
      expect(user.tokens).to.have.lengthOf(2);
      user.removeToken(tokenFirst.id, (error, newUser) => {
        expect(error).to.be.a('null');
        expect(newUser).to.be.a('object');
        // console.log(user.tokens);
        expect(newUser.tokens).to.have.lengthOf(1);
        expect(newUser.tokens[0].id).to.be.equal(tokenSecond.id);
        done();
      });
    });
  });

  it('should check expired token', (done) => {
    const oldToken = testModel.generateToken();
    oldToken.time.setHours(oldToken.time.getHours() - 3);
    testModel.tokens.push(oldToken);
    testModel.save((err, user) => {
      expect(err).to.be.a('null');
      expect(user).to.be.a('object');
      expect(user.tokens[0].id).to.be.equal(oldToken.id);
      User.authorized(oldToken.id, (error, newUser, info) => {
        expect(error).to.be.not.a('null');
        expect(info).to.be.a('string');
        done();
      });
    });
  });
});
