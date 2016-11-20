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
  before((done) => {
    testModel = new User();
    testModel.email = testUser.email;
    testModel.password = testModel.generateHash(testUser.password);
    done();
  });

  it('pass should be valid', (done) => {
    expect(testModel.validPassword(testUser.password)).to.be.true;
    done();
  });

  it('should change pass', (done) => {
    // testModel.cha
    done();
  });
});
