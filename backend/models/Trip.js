const mongoose = require('mongoose');

const tripSchema = new mongoose.Schema({
  busNumber: {
    type: String,
    required: true
  },
  date: {
    type: Date,
    required: true,
    default: Date.now
  },
  startTime: {
    type: Date,
    default: Date.now
  },
  endTime: {
    type: Date
  },
  totalBoarded: {
    type: Number,
    default: 0
  },
  totalAlighted: {
    type: Number,
    default: 0
  },
  peakCount: {
    type: Number,
    default: 0
  },
  loopsCompleted: {
    type: Number,
    default: 0
  },
  stops: [{
    stopName: {
      type: String,
      required: true
    },
    arrivedAt: {
      type: Date,
      default: Date.now
    },
    countAtStop: {
      type: Number,
      default: 0
    }
  }],
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Trip', tripSchema);
