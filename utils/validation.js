'use strict'

const _ = require('lodash');

function validate(value, name) {
  const that = {};
  const error = [];
  let required = false;

  function isEmpty(val) {
    return val === undefined || val === null || val === '';
  }

  function continueValid() {
    if (!required && isEmpty(value)) {
      return ;
    }
  }

  function errOut(message) {
    return name + ' ' + message;
  }

  that.isRequired = function() {
    if (isEmpty(value)) {
      value = '';
      error.push(errOut('is required'));
      required = true;
    }
    return this;
  }

  that.isEmail = function() {
    if (continueValid()) {
      return this;
    }
    if ( !/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i.test(value)) {
      error.push(errOut('invalid'));
    }
    return this;
  }

  that.isString = function() {
    if (continueValid()) {
      return this;
    }
    if (!(/^([a-zA-Z0-9 _-]+)$/).test(value)) {
      error.push(errOut('not valid. only letters, numbers, _- is allowed'));
    }
    return this;
  }
  that.noSpace = function() {
    if (continueValid()) {
      return this;
    }
    if (value.indexOf(' ') >= 0) {
      error.push(errOut('not valid. empty spaces not allowed'));
    }
    return this;
  }

  that.max = function(val) {
    if (continueValid()) {
      return this;
    }
    if (value.length > val) {
      error.push(errOut('max length ' + val));
    }
    return this;
  }

  that.unique = function(objKeys, fieldName) {
    if (continueValid()) {
      return this;
    }
    const keys = Array.isArray(objKeys) ? objKeys : [];
    const idx = _.findIndex(keys, (o) => {
      return o[fieldName].toLowerCase() == value.toLowerCase();
    });
    if (idx !== -1) {
      error.push(errOut('must be unique'));
    }
    return this;
  }

  that.valid = function() {
    return error.length === 0;
  }

  that.exec = function() {
    return error.length !== 0 ? error : undefined;
  }

  return that;
}

module.exports = validate;
