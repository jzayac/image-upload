'use strict'

const express = require('express');
const bodyParser = require('body-parser');
const passport = require('passport');
const morgan = require('morgan');
const mongoose = require('mongoose');
const config = require('./config/config');

require('./config/passport');
const routes = require('./routes');

if (config.mongoose) {
  // https://github.com/Automattic/mongoose/issues/4291
  mongoose.Promise = global.Promise;
  mongoose.connect(config.mongoDbUrl);
}

const app = express();

// bb.extend(app);
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(passport.initialize());

for (const route in routes) {
  app.use('/' + route, routes[route]);
}

app.get('/', (req, res) => {
  res.json({'stauts': 'ok'});
});

app.use((req, res) => {
  res.status(404).json({ status: 'not found'});
});

if (config.apiPort) {
  const runnable = app.listen(config.apiPort, (err) => {
    if (err) {
      console.error(err);
    }
    console.info('----\n==> 🌎  API is running on port %s', config.apiPort);
    console.info('==> 💻  Send requests to http://%s:%s', config.apiHost, config.apiPort);
  });

  // for testing
  module.exports = app;

} else {
  console.error('==>     ERROR: No PORT environment variable has been specified');
}
