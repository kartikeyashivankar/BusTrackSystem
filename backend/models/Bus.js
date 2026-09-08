const mongoose = require('mongoose');

const busSchema = new mongoose.Schema({
  busNumber: {
    type: String,
    required: true,
    unique: true
  },
  capacity: {
    type: Number,
    required: true
  },
  routeType: {
    type: String,
    enum: ['loop', 'oneway'],
    default: 'loop'
  },
  stops: [{
    type: String
  }],
  currentStopIndex: {
    type: Number,
    default: 0
  },
  currentStop: {
    type: String,
    default: ''
  },
  startingStopIndex: {
    type: Number,
    default: 0
  },
  currentCount: {
    type: Number,
    default: 0
  },
  totalIn: {
    type: Number,
    default: 0
  },
  totalOut: {
    type: Number,
    default: 0
  },
  loopCount: {
    type: Number,
    default: 0
  },
  status: {
    type: String,
    enum: ['ON_THE_WAY', 'END_OF_ROUTE', 'OFFLINE'],
    default: 'OFFLINE'
  },
  isHardwareConnected: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Bus', busSchema);
