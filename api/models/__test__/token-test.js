'use strict'

const chai = require('chai');
const expect = chai.expect;
const Token = require('../token');

const testToken = {
  id: '58314f025ccb32366b7d99f8',
};
let testModel;

describe('Token model: ', () => {
  beforeEach((done) => {
    testModel = new Token();
    done();
  });

  afterEach((done) => {
    testModel.remove(() => {
      done();
    });
  });

  it('should create new token', (done) => {
    Token.save(testToken.id, (err, token) => {
      expect(err).to.be.null;
      expect(token.token).to.be.a('string');
      testModel = token;
      done();
    });
  });

  // it('should change pass', (done) => {
  //   // testModel.cha
  //   done();
  // });
});
