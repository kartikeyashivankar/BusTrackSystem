const mongoose = require('mongoose');

const routeChangeSchema = new mongoose.Schema({
  busNumber: {
    type: String,
    required: true
  },
  changedBy: {
    type: String,
    required: true
  },
  changedAt: {
    type: Date,
    default: Date.now
  },
  oldStops: [{
    type: String
  }],
  newStops: [{
    type: String
  }],
  changeType: {
    type: String,
    enum: ['add', 'remove', 'reorder', 'capacity', 'routetype'],
    required: true
  }
});

module.exports = mongoose.model('RouteChange', routeChangeSchema);
