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
  mongoose.connect(config.mongoDbUrl);
}

const app = express();

app.use(bodyParser.json());
app.use( bodyParser.urlencoded({ extended: true }) );

app.use(passport.initialize());

for (const route in routes) {
  app.use('/' + route, routes[route]);
}

app.post('/test', (req, res) => {
  // console.log(req.body);
  res.status(200).json(Object.assign(req.body, {server: true}));
});

app.get('/', (req, res) => {
  console.log('get root');
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
