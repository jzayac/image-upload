'use strict'

const fs = require('fs');

fs.readdirSync(__dirname).forEach((file) => {
  if (file.search('test') !== -1 || file === 'index.js') {
    return
  }
  const moduleName = file.split('.')[0];
  exports[moduleName] = require('./' + moduleName);
});
