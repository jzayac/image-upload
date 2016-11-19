'use strict'

const express = require('express');
// const session = require('express-session');
// const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const passport = require('passport');
const morgan = require('morgan');
// const passportConf = require('./config/passport');
const mongoose = require('mongoose');
const config = require('./config/config');

require('./config/passport');
const imageRouter = require('./routes/image');
const userRouter = require('./routes/user');


if (config.mongoose) {
  mongoose.connect(config.mongoDbUrl);
}
// passportConf(passport);


const app = express();

// app.use(cookieParser());
app.use(bodyParser.json());
app.use( bodyParser.urlencoded({ extended: true }) );
// app.use(session({
//   secret: config.sessionSecret,
//   resave: false,
//   saveUninitialized: false,
//   cookie: { maxAge: 60000 }
// }));

app.use(passport.initialize());
// app.use(passport.session());

app.use('/image', imageRouter);
app.use('/user', userRouter);

app.post('/test', (req, res) => {
  // console.log(req.body);
  res.status(200).json(Object.assign(req.body, {server: true}));
});

app.get('/', (req, res) => {
  console.log('get root');
  res.json({'stauts': 'ok'});
});

app.use((req, res) => {
//  console.log(req.originalUrl);
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
