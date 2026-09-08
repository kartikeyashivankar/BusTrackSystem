require('dotenv').config();
const http = require('http');
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const { initWebSocket } = require('./websocket');
const { initSerial } = require('./serialHandler');

const authRoutes = require('./routes/auth');
const busRoutes = require('./routes/buses');
const tripRoutes = require('./routes/trips');
const analyticsRoutes = require('./routes/analytics');
const trackRoutes = require('./routes/track');

const app = express();
const server = http.createServer(app);

// Connect Database (async)
connectDB();

// Middleware
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true
}));
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/buses', busRoutes);
app.use('/api/trips', tripRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/track', trackRoutes);
app.use('/api/hardware', require('./routes/hardware'));

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    service: 'BusTrackSystem Backend API'
  });
});

// Initialize WebSockets
initWebSocket(server);

// Initialize Serial Handler
initSerial();

const PORT = process.env.PORT || 5000;
server.listen(PORT, '0.0.0.0', () => {
  console.log(`BusTrack Backend Server running on port ${PORT}`);
});
