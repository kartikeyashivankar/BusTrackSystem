require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const User = require('./models/User');
const Bus = require('./models/Bus');
const Trip = require('./models/Trip');
const RouteChange = require('./models/RouteChange');

const seedData = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/bustrack';
    await mongoose.connect(mongoUri);
    console.log(`Connected to database at ${mongoUri}`);

    // Clear existing data
    await User.deleteMany({});
    await Bus.deleteMany({});
    await Trip.deleteMany({});
    await RouteChange.deleteMany({});
    console.log('Cleared existing database records.');

    // 1. Seed Users
    const salt = await bcrypt.genSalt(10);
    const adminPassword = await bcrypt.hash('admin123', salt);
    const conductorPassword = await bcrypt.hash('conductor123', salt);

    const users = [
      {
        name: 'Admin User',
        email: 'admin@bustrack.com',
        password: adminPassword,
        role: 'admin',
        assignedBus: null
      },
      {
        name: 'Conductor Rajesh',
        email: 'conductor@bustrack.com',
        password: conductorPassword,
        role: 'conductor',
        assignedBus: 'MH-40-AA-1111'
      }
    ];

    const createdUsers = await User.insertMany(users);
    console.log(`Seeded ${createdUsers.length} users.`);

    // 2. Seed 10 Buses
    const buses = [
      {
        busNumber: 'MH-40-AA-1111',
        capacity: 45,
        routeType: 'loop',
        stops: ['Manewada', 'TPoint', 'Ganeshpeth', 'Burdi', 'Besa'],
        currentStopIndex: 2,
        currentStop: 'Ganeshpeth',
        startingStopIndex: 0,
        currentCount: 32,
        totalIn: 48,
        totalOut: 16,
        loopCount: 2,
        status: 'ON_THE_WAY',
        isHardwareConnected: true
      },
      {
        busNumber: 'MH-40-AA-2222',
        capacity: 40,
        routeType: 'loop',
        stops: ['Sitabuldi', 'Dharampeth', 'Shankar Nagar', 'Laxmi Nagar', 'Hingna'],
        currentStopIndex: 1,
        currentStop: 'Dharampeth',
        startingStopIndex: 0,
        currentCount: 18,
        totalIn: 25,
        totalOut: 7,
        loopCount: 1,
        status: 'ON_THE_WAY',
        isHardwareConnected: true
      },
      {
        busNumber: 'MH-40-AA-3333',
        capacity: 50,
        routeType: 'loop',
        stops: ['Railway Station', 'Cotton Market', 'Medical Square', 'Tukdoji Putla', 'Manewada'],
        currentStopIndex: 3,
        currentStop: 'Tukdoji Putla',
        startingStopIndex: 0,
        currentCount: 47,
        totalIn: 62,
        totalOut: 15,
        loopCount: 3,
        status: 'ON_THE_WAY',
        isHardwareConnected: true
      },
      {
        busNumber: 'MH-40-AA-4444',
        capacity: 35,
        routeType: 'oneway',
        stops: ['Pardi', 'Itwari', 'Gandhiputla', 'Sitabuldi'],
        currentStopIndex: 3,
        currentStop: 'Sitabuldi',
        startingStopIndex: 0,
        currentCount: 0,
        totalIn: 34,
        totalOut: 34,
        loopCount: 1,
        status: 'END_OF_ROUTE',
        isHardwareConnected: true
      },
      {
        busNumber: 'MH-40-AA-5555',
        capacity: 45,
        routeType: 'loop',
        stops: ['Koradi', 'Mankapur', 'Kadbi Chowk', 'RBI', 'Sitabuldi'],
        currentStopIndex: 0,
        currentStop: 'Koradi',
        startingStopIndex: 0,
        currentCount: 8,
        totalIn: 8,
        totalOut: 0,
        loopCount: 1,
        status: 'ON_THE_WAY',
        isHardwareConnected: true
      },
      {
        busNumber: 'MH-40-AA-6666',
        capacity: 50,
        routeType: 'loop',
        stops: ['Trimurti Nagar', 'Pratap Nagar', 'Deo Nagar', 'Chhatrapati Square', 'Sitabuldi'],
        currentStopIndex: 2,
        currentStop: 'Deo Nagar',
        startingStopIndex: 0,
        currentCount: 22,
        totalIn: 30,
        totalOut: 8,
        loopCount: 2,
        status: 'ON_THE_WAY',
        isHardwareConnected: true
      },
      {
        busNumber: 'MH-40-AA-7777',
        capacity: 40,
        routeType: 'loop',
        stops: ['Wadi', 'Dharampeth', 'Law College', 'Variety Square', 'Sitabuldi'],
        currentStopIndex: 4,
        currentStop: 'Sitabuldi',
        startingStopIndex: 0,
        currentCount: 38,
        totalIn: 55,
        totalOut: 17,
        loopCount: 2,
        status: 'ON_THE_WAY',
        isHardwareConnected: true
      },
      {
        busNumber: 'MH-40-AA-8888',
        capacity: 45,
        routeType: 'loop',
        stops: ['Kamptee', 'Automotive', 'Indora', 'Kadbi Chowk', 'Railway Station'],
        currentStopIndex: 0,
        currentStop: 'Kamptee',
        startingStopIndex: 0,
        currentCount: 0,
        totalIn: 0,
        totalOut: 0,
        loopCount: 0,
        status: 'OFFLINE',
        isHardwareConnected: false
      },
      {
        busNumber: 'MH-40-AA-9999',
        capacity: 35,
        routeType: 'loop',
        stops: ['Hudkeshwar', 'Sakkardara', 'Ayodhya Nagar', 'Medical Square', 'Sitabuldi'],
        currentStopIndex: 1,
        currentStop: 'Sakkardara',
        startingStopIndex: 0,
        currentCount: 14,
        totalIn: 20,
        totalOut: 6,
        loopCount: 1,
        status: 'ON_THE_WAY',
        isHardwareConnected: true
      },
      {
        busNumber: 'MH-40-AA-1010',
        capacity: 50,
        routeType: 'loop',
        stops: ['Airport', 'Sonegaon', 'Chhatrapati Square', 'Rahate Colony', 'Sitabuldi'],
        currentStopIndex: 2,
        currentStop: 'Chhatrapati Square',
        startingStopIndex: 0,
        currentCount: 46,
        totalIn: 70,
        totalOut: 24,
        loopCount: 3,
        status: 'ON_THE_WAY',
        isHardwareConnected: true
      }
    ];

    const createdBuses = await Bus.insertMany(buses);
    console.log(`Seeded ${createdBuses.length} buses.`);

    // 3. Seed Sample Trips
    const sampleTrips = [
      {
        busNumber: 'MH-40-AA-1111',
        date: new Date(),
        startTime: new Date(Date.now() - 3600000),
        endTime: new Date(),
        totalBoarded: 48,
        totalAlighted: 48,
        peakCount: 35,
        loopsCompleted: 1,
        stops: [
          { stopName: 'Manewada', arrivedAt: new Date(Date.now() - 3600000), countAtStop: 12 },
          { stopName: 'TPoint', arrivedAt: new Date(Date.now() - 2700000), countAtStop: 25 },
          { stopName: 'Ganeshpeth', arrivedAt: new Date(Date.now() - 1800000), countAtStop: 35 },
          { stopName: 'Burdi', arrivedAt: new Date(Date.now() - 900000), countAtStop: 20 },
          { stopName: 'Besa', arrivedAt: new Date(), countAtStop: 0 }
        ]
      }
    ];

    await Trip.insertMany(sampleTrips);
    console.log('Seeded sample trip history.');

    // 4. Seed Sample RouteChange
    await RouteChange.create({
      busNumber: 'MH-40-AA-1111',
      changedBy: 'admin@bustrack.com',
      changedAt: new Date(),
      oldStops: ['Manewada', 'TPoint', 'Ganeshpeth', 'Besa'],
      newStops: ['Manewada', 'TPoint', 'Ganeshpeth', 'Burdi', 'Besa'],
      changeType: 'add'
    });
    console.log('Seeded sample route audit change.');

    console.log('Database seeding completed successfully!');
    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error.message);
    process.exit(1);
  }
};

seedData();
