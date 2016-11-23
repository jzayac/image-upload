'use stric'

const mongoose = require('mongoose');

const imageSchema = mongoose.Schema({
  path: {type: String, require: true, default ''},
  created: {type: Date, default Date.now},
  comments: {type: Number, default: 0},
  ownerId: {type: mongoose.Schema.ObjectId, required: true},
  description: {type: String, default: ''},
  gallery: [{
    id: { type: mongoose.Schema.ObjectId, required: true },
  }],
});

module.exports = mongoose.model('images', imageSchema);
