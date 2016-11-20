const _ = require('lodash');

function validate(value, name) {
  const that = {};
  const error = [];

  function isEmpty(val) {
    return val === undefined || val === null || val === '';
  }

  that.isRequired = function() {
    if (isEmpty(value)) {
      value = '';
      error.push(name + ' is required');
    }
    return this;
  }

  that.isEmail = function() {
    if ( !/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i.test(value)) {
      error.push(name + ' invalid');
    }
    return this;
  }

  that.isString = function() {
    if (!(/^([a-zA-Z0-9 _-]+)$/).test(value)) {
      error.push(name + ' not valid. only letters, numbers, _- is allowed');
    }
    return this;
  }
  that.noSpace = function() {
    if (value.indexOf(' ') >= 0) {
      error.push(name + ' not valid. empty spaces not allowed');
    }
    return this;
  }

  that.unique = function(objKeys, fieldName) {
    const keys = Array.isArray(objKeys) ? objKeys : [];
    const idx = _.findIndex(keys, (o) => {
      return o[fieldName].toLowerCase() == value.toLowerCase();
    });
    if (idx !== -1) {
      error.push(name + ' must be unique');
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
