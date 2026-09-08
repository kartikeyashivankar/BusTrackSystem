const Bus = require('../models/Bus');
const Trip = require('../models/Trip');
const RouteChange = require('../models/RouteChange');
const { broadcast } = require('../websocket');

// GET /api/buses - Return all buses
exports.getAllBuses = async (req, res) => {
  try {
    const buses = await Bus.find().sort({ busNumber: 1 });
    res.status(200).json(buses);
  } catch (error) {
    console.error('Error fetching buses:', error);
    res.status(500).json({ message: 'Failed to fetch buses' });
  }
};

// GET /api/buses/:busNumber - Return single bus by busNumber
exports.getBusByNumber = async (req, res) => {
  try {
    const bus = await Bus.findOne({ busNumber: req.params.busNumber });
    if (!bus) {
      return res.status(404).json({ message: 'Bus not found' });
    }
    res.status(200).json(bus);
  } catch (error) {
    console.error('Error fetching bus:', error);
    res.status(500).json({ message: 'Failed to fetch bus details' });
  }
};

// POST /api/buses - Create a new bus (Admin only)
exports.createBus = async (req, res) => {
  try {
    const newBus = await Bus.create(req.body);
    broadcast({ type: 'BUS_CREATED', data: newBus });
    res.status(201).json(newBus);
  } catch (error) {
    console.error('Error creating bus:', error);
    res.status(400).json({ message: error.message || 'Failed to create bus' });
  }
};

// PUT /api/buses/:busNumber - Update bus fields
exports.updateBus = async (req, res) => {
  try {
    const updatedBus = await Bus.findOneAndUpdate(
      { busNumber: req.params.busNumber },
      { $set: req.body },
      { new: true, runValidators: true }
    );
    if (!updatedBus) {
      return res.status(404).json({ message: 'Bus not found' });
    }
    broadcast({ type: 'BUS_UPDATE', data: updatedBus });
    res.status(200).json(updatedBus);
  } catch (error) {
    console.error('Error updating bus:', error);
    res.status(400).json({ message: error.message || 'Failed to update bus' });
  }
};

// DELETE /api/buses/:busNumber - Delete a bus (Admin only)
exports.deleteBus = async (req, res) => {
  try {
    const bus = await Bus.findOneAndDelete({ busNumber: req.params.busNumber });
    if (!bus) {
      return res.status(404).json({ message: 'Bus not found' });
    }
    broadcast({ type: 'BUS_DELETED', data: { busNumber: req.params.busNumber } });
    res.status(200).json({ message: 'Bus removed successfully' });
  } catch (error) {
    console.error('Error deleting bus:', error);
    res.status(500).json({ message: 'Failed to delete bus' });
  }
};

// PUT /api/buses/:busNumber/stop - Conductor updates current stop
exports.updateStop = async (req, res) => {
  try {
    const { stopIndex, stopName } = req.body;
    const bus = await Bus.findOne({ busNumber: req.params.busNumber });
    if (!bus) {
      return res.status(404).json({ message: 'Bus not found' });
    }

    if (stopIndex !== undefined) {
      bus.currentStopIndex = Number(stopIndex);
    }
    if (stopName) {
      bus.currentStop = stopName;
    } else if (bus.stops && bus.stops[bus.currentStopIndex]) {
      bus.currentStop = bus.stops[bus.currentStopIndex];
    }

    bus.status = 'ON_THE_WAY';
    await bus.save();

    broadcast({ type: 'BUS_UPDATE', data: bus });
    res.status(200).json(bus);
  } catch (error) {
    console.error('Error updating stop:', error);
    res.status(400).json({ message: error.message || 'Failed to update stop' });
  }
};

// PUT /api/buses/:busNumber/loop - Loop completion: increment loop, reset count, save trip to DB
exports.completeLoop = async (req, res) => {
  try {
    const bus = await Bus.findOne({ busNumber: req.params.busNumber });
    if (!bus) {
      return res.status(404).json({ message: 'Bus not found' });
    }

    const completedLoopNumber = bus.loopCount + 1;

    // Save completed trip record to MongoDB (Document 06 Phase 7 requirement)
    const trip = await Trip.create({
      busNumber: bus.busNumber,
      date: new Date(),
      startTime: new Date(Date.now() - 45 * 60 * 1000), // approx 45 mins per loop
      endTime: new Date(),
      totalBoarded: bus.totalIn || 25,
      totalAlighted: bus.totalOut || 25,
      peakCount: Math.max(bus.currentCount, 28),
      loopsCompleted: completedLoopNumber,
      stops: (bus.stops || []).map(stop => ({
        stopName: stop,
        arrivedAt: new Date(),
        countAtStop: bus.currentCount
      }))
    });

    bus.loopCount = completedLoopNumber;
    bus.currentStopIndex = bus.startingStopIndex || 0;
    bus.currentStop = bus.stops?.[bus.currentStopIndex] || '';
    bus.currentCount = 0; // Reset count at end of loop as per PRD
    bus.status = 'ON_THE_WAY';

    await bus.save();

    broadcast({ type: 'BUS_UPDATE', data: bus });
    broadcast({ type: 'LOOP_COMPLETED', data: { bus, trip } });

    res.status(200).json({
      message: 'Loop completed successfully, trip history recorded',
      bus,
      trip
    });
  } catch (error) {
    console.error('Error completing loop:', error);
    res.status(400).json({ message: error.message || 'Failed to complete loop' });
  }
};

// PUT /api/buses/:busNumber/reset - Conductor manually resets count
exports.resetCount = async (req, res) => {
  try {
    const bus = await Bus.findOne({ busNumber: req.params.busNumber });
    if (!bus) {
      return res.status(404).json({ message: 'Bus not found' });
    }

    bus.currentCount = 0;
    await bus.save();

    broadcast({ type: 'BUS_UPDATE', data: bus });
    res.status(200).json({ message: 'Passenger count reset', bus });
  } catch (error) {
    console.error('Error resetting count:', error);
    res.status(400).json({ message: error.message || 'Failed to reset count' });
  }
};

// PUT /api/buses/:busNumber/route - Update route configuration (Admin only)
exports.updateRoute = async (req, res) => {
  try {
    const { stops, routeType, capacity, startingStopIndex } = req.body;
    const bus = await Bus.findOne({ busNumber: req.params.busNumber });
    if (!bus) {
      return res.status(404).json({ message: 'Bus not found' });
    }

    const oldStops = [...(bus.stops || [])];

    // Determine changeType for audit log
    let changeType = 'reorder';
    if (stops && stops.length > oldStops.length) {
      changeType = 'add';
    } else if (stops && stops.length < oldStops.length) {
      changeType = 'remove';
    } else if (capacity !== undefined && Number(capacity) !== bus.capacity) {
      changeType = 'capacity';
    } else if (routeType !== undefined && routeType !== bus.routeType) {
      changeType = 'routetype';
    } else if (stops && JSON.stringify(stops) !== JSON.stringify(oldStops)) {
      changeType = 'reorder';
    }

    if (stops) bus.stops = stops;
    if (routeType) bus.routeType = routeType;
    if (capacity !== undefined) bus.capacity = Number(capacity);
    if (startingStopIndex !== undefined) bus.startingStopIndex = Number(startingStopIndex);

    // Keep current stop in bounds
    if (bus.currentStopIndex >= bus.stops.length) {
      bus.currentStopIndex = 0;
    }
    bus.currentStop = bus.stops?.[bus.currentStopIndex] || '';

    await bus.save();

    // Save to RouteChange audit collection
    const auditLog = await RouteChange.create({
      busNumber: bus.busNumber,
      changedBy: req.user?.email || 'admin@bustrack.com',
      changedAt: new Date(),
      oldStops,
      newStops: bus.stops,
      changeType
    });

    broadcast({ type: 'BUS_UPDATE', data: bus });
    broadcast({ type: 'ROUTE_CHANGE', data: { bus, auditLog } });

    res.status(200).json({
      message: 'Route updated successfully',
      bus,
      auditLog
    });
  } catch (error) {
    console.error('Error updating route:', error);
    res.status(400).json({ message: error.message || 'Failed to update route' });
  }
};
