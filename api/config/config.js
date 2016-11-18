'use strict'

const config = require('../../config/config');
const url = config.isProduction ? 'production': 'mongodb://172.17.0.2/galery';

module.exports = Object.assign({
    mongoDbUrl: url,
    mongoose: true,
    sessionSecret: 'super seacret',
}, config);
