require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const Bus = require('./models/Bus');
const User = require('./models/User');

const conductorData = [
  { busNumber: 'MH-40-AA-1111', name: 'Conductor Rajesh', email: 'conductor@bustrack.com' },
  { busNumber: 'MH-40-AA-2222', name: 'Conductor Suresh', email: 'conductor2@bustrack.com' },
  { busNumber: 'MH-40-AA-3333', name: 'Conductor Amit', email: 'conductor3@bustrack.com' },
  { busNumber: 'MH-40-AA-4444', name: 'Conductor Ramesh', email: 'conductor4@bustrack.com' },
  { busNumber: 'MH-40-AA-5555', name: 'Conductor Dinesh', email: 'conductor5@bustrack.com' },
  { busNumber: 'MH-40-AA-6666', name: 'Conductor Manoj', email: 'conductor6@bustrack.com' },
  { busNumber: 'MH-40-AA-7777', name: 'Conductor Ganesh', email: 'conductor7@bustrack.com' },
  { busNumber: 'MH-40-AA-8888', name: 'Conductor Vijay', email: 'conductor8@bustrack.com' },
  { busNumber: 'MH-40-AA-9999', name: 'Conductor Sunil', email: 'conductor9@bustrack.com' },
  { busNumber: 'MH-40-AA-1010', name: 'Conductor Anand', email: 'conductor10@bustrack.com' }
];

async function run() {
  const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/bustrack';
  await mongoose.connect(mongoUri);
  console.log('Connected to MongoDB.');

  const salt = await bcrypt.genSalt(10);
  const passwordHash = await bcrypt.hash('conductor123', salt);

  for (const item of conductorData) {
    // 1. Update Bus document
    await Bus.updateOne(
      { busNumber: item.busNumber },
      { $set: { conductorName: item.name } }
    );

    // 2. Upsert Conductor User
    const existing = await User.findOne({ email: item.email });
    if (!existing) {
      await User.create({
        name: item.name,
        email: item.email,
        password: passwordHash,
        role: 'conductor',
        assignedBus: item.busNumber
      });
      console.log(`Created conductor user: ${item.name} (${item.email})`);
    } else {
      await User.updateOne(
        { email: item.email },
        { $set: { name: item.name, assignedBus: item.busNumber } }
      );
      console.log(`Updated conductor user: ${item.name} (${item.email})`);
    }
  }

  const allBuses = await Bus.find({}, 'busNumber conductorName');
  console.log('All buses in DB with conductor names:');
  console.log(allBuses);

  await mongoose.disconnect();
}

run().catch(console.error);
