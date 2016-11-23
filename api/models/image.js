'use stric'

const mongoose = require('mongoose');

const imageSchema = mongoose.Schema({
  path: {type: String, require: true, default: ''},
  created: {type: Date, default: Date.now},
  comments: {type: Number, default: 0},
  ownerId: {type: mongoose.Schema.ObjectId, required: true},
  description: {type: String, default: ''},
  album: { type: mongoose.Schema.ObjectId, required: true },
  // gallery: [{
  //   id: { type: mongoose.Schema.ObjectId, required: true },
  // }],
});

// imageSchema.statics.removeImages = function(id, (cb) => {
//   this.find({album: id}, (err, albums) => {
//     if (err) {
//       return cb(err);
//     }
//
//   });
// });

module.exports = mongoose.model('images', imageSchema);
