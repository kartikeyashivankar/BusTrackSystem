require('dotenv').config();
const mongoose = require('mongoose');
const Bus = require('./models/Bus');

async function run() {
  const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/bustrack';
  await mongoose.connect(mongoUri);
  console.log('Connected to MongoDB.');

  const res = await Bus.findOneAndUpdate(
    { busNumber: 'MH-40-AA-1111' },
    { $set: { capacity: 10 } },
    { new: true }
  );

  console.log('Updated MH-40-AA-1111 in DB:');
  console.log({
    busNumber: res.busNumber,
    capacity: res.capacity,
    currentCount: res.currentCount,
    stops: res.stops
  });

  await mongoose.disconnect();
}

run().catch(console.error);
