'use strict'

const config = require('../../config/config');
const url = config.isProduction ? 'production': 'mongodb://172.17.0.2/gallery';

module.exports = Object.assign({
    mongoDbUrl: url,
    mongoose: true,
    uploadDir: './uploads/',
}, config);
