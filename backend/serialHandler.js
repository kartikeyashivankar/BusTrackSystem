const { SerialPort } = require('serialport');
const { ReadlineParser } = require('@serialport/parser-readline');
const Bus = require('./models/Bus');
const { broadcast } = require('./websocket');

let port = null;
let parser = null;
let isConnected = false;
let reconnectTimer = null;

let currentTargetBus = process.env.HARDWARE_BUS || 'MH-40-AA-1111';

// Updates the hardware connection status in database and broadcasts live state
// Only the currently monitored targetBus gets isHardwareConnected: true (when connected), all other buses remain offline
const setHardwareStatus = async (connected) => {
  isConnected = connected;
  try {
    // Keep all non-monitored buses offline
    await Bus.updateMany(
      { busNumber: { $ne: currentTargetBus } },
      { $set: { isHardwareConnected: false } }
    );

    const updatedBus = await Bus.findOneAndUpdate(
      { busNumber: currentTargetBus },
      { $set: { isHardwareConnected: connected } },
      { new: true }
    );

    broadcast({
      type: 'HARDWARE_STATUS',
      connected,
      port: process.env.SERIAL_PORT || 'COM3',
      busNumber: currentTargetBus,
      targetBus: currentTargetBus,
      data: updatedBus
    });

    const allBuses = await Bus.find({});
    broadcast({
      type: 'FLEET_UPDATE',
      data: allBuses
    });

    if (updatedBus) {
      broadcast({ type: 'BUS_UPDATE', data: updatedBus });
    }
  } catch (err) {
    console.error('Error updating hardware status in DB:', err.message);
  }
};

// Dynamically change which bus is being actively monitored by the hardware
const setTargetBus = async (busNumber) => {
  try {
    const bus = await Bus.findOne({ busNumber });
    if (!bus) return null;

    currentTargetBus = busNumber;
    console.log(`[Hardware Router]: Switched active telemetry target to bus ${currentTargetBus}`);

    // Update DB: only the target bus gets isHardwareConnected = isConnected
    await Bus.updateMany(
      { busNumber: { $ne: currentTargetBus } },
      { $set: { isHardwareConnected: false } }
    );

    const updatedBus = await Bus.findOneAndUpdate(
      { busNumber: currentTargetBus },
      { $set: { isHardwareConnected: isConnected } },
      { new: true }
    );

    broadcast({
      type: 'HARDWARE_STATUS',
      connected: isConnected,
      port: process.env.SERIAL_PORT || 'COM3',
      busNumber: currentTargetBus,
      targetBus: currentTargetBus,
      data: updatedBus
    });

    const allBuses = await Bus.find({});
    broadcast({
      type: 'FLEET_UPDATE',
      data: allBuses
    });

    if (updatedBus) {
      broadcast({ type: 'BUS_UPDATE', data: updatedBus });
    }

    return updatedBus;
  } catch (err) {
    console.error('Error switching target bus:', err.message);
    return null;
  }
};

// Send RESET command to physical hardware via Serial if connected
const sendHardwareReset = (busNumber) => {
  if (port && port.isOpen && (!busNumber || busNumber === currentTargetBus)) {
    try {
      port.write('RESET\n');
      console.log(`[SerialPort]: Dispatched RESET command to hardware for bus ${busNumber || currentTargetBus}`);
    } catch (e) {
      console.warn('Failed to write RESET to serial port:', e.message);
    }
  }
};

// Process sensor events (IR1 -> IR2 = ENTRY, IR2 -> IR1 = EXIT, RESET = count reset)
const processHardwareMessage = async (rawMessage) => {
  if (!rawMessage) return null;
  const line = rawMessage.trim();
  console.log(`[ESP32 Hardware Telemetry]: "${line}"`);

  let eventType = null;
  let busNumber = currentTargetBus;

  // 1. JSON format: {"event":"ENTRY","bus":"MH-40-AA-1111"}
  if (line.startsWith('{') && line.endsWith('}')) {
    try {
      const parsed = JSON.parse(line);
      eventType = (parsed.event || parsed.type || '').toUpperCase();
      if (parsed.bus || parsed.busNumber) busNumber = parsed.bus || parsed.busNumber;
    } catch (e) {
      // Not JSON
    }
  }

  // 2. Colon formatted: ENTRY:MH-40-AA-1111
  if (!eventType && line.includes(':')) {
    const parts = line.split(':');
    eventType = parts[0].trim().toUpperCase();
    if (parts[1]) busNumber = parts[1].trim();
  }

  // 3. Plain token: ENTRY, EXIT, RESET
  if (!eventType) {
    const upper = line.toUpperCase();
    if (upper.includes('ENTRY')) eventType = 'ENTRY';
    else if (upper.includes('EXIT')) eventType = 'EXIT';
    else if (upper.includes('RESET')) eventType = 'RESET';
  }

  if (!eventType) {
    console.log(`[Hardware Parser]: Ignored unrecognized message: "${line}"`);
    return null;
  }

  try {
    const bus = await Bus.findOne({ busNumber });
    if (!bus) {
      console.warn(`[Hardware Parser]: Bus ${busNumber} not found in database.`);
      return null;
    }

    if (eventType === 'ENTRY') {
      // IR1 to IR2: Passenger boards bus
      if (bus.currentCount < bus.capacity) {
        bus.currentCount += 1;
      }
      bus.totalIn += 1;
    } else if (eventType === 'EXIT') {
      // IR2 to IR1: Passenger alights bus
      if (bus.currentCount > 0) {
        bus.currentCount -= 1;
      }
      bus.totalOut += 1;
    } else if (eventType === 'RESET') {
      // Count reset
      bus.currentCount = 0;
      bus.totalIn = 0;
      bus.totalOut = 0;
    }

    bus.isHardwareConnected = true;
    bus.status = 'ON_THE_WAY';
    await bus.save();

    console.log(`[Telemetry Updated]: Bus ${bus.busNumber} | Event: ${eventType} | Count: ${bus.currentCount}/${bus.capacity}`);

    // Broadcast live update to all WebSocket clients (Dashboards, Detail Views, Conductor Panels)
    broadcast({
      type: 'BUS_UPDATE',
      data: bus
    });

    broadcast({
      type: 'HARDWARE_EVENT',
      event: eventType,
      timestamp: new Date().toISOString(),
      data: bus
    });

    return { bus, eventType };
  } catch (err) {
    console.error('Error processing hardware telemetry event:', err.message);
    return null;
  }
};

const connectSerialPort = () => {
  const serialPortName = process.env.SERIAL_PORT || 'COM3';
  const baudRate = parseInt(process.env.BAUD_RATE || '115200', 10);

  if (port && port.isOpen) {
    return;
  }

  try {
    port = new SerialPort({
      path: serialPortName,
      baudRate,
      autoOpen: false
    });

    parser = port.pipe(new ReadlineParser({ delimiter: '\n' }));

    port.open((err) => {
      if (err) {
        console.log(`[SerialPort]: Cannot open ${serialPortName}: ${err.message}. Hardware offline.`);
        setHardwareStatus(false);
        scheduleReconnect();
        return;
      }

      console.log(`[SerialPort]: Successfully connected to ESP32 on ${serialPortName} at ${baudRate} baud.`);
      setHardwareStatus(true);
    });

    parser.on('data', (data) => {
      processHardwareMessage(data);
    });

    port.on('close', () => {
      console.log(`[SerialPort]: Port ${serialPortName} closed. Auto-reconnecting in 5s...`);
      setHardwareStatus(false);
      scheduleReconnect();
    });

    port.on('error', (err) => {
      console.warn(`[SerialPort Error]: ${err.message}`);
      setHardwareStatus(false);
      scheduleReconnect();
    });
  } catch (error) {
    console.warn(`[SerialPort Init]: ${error.message}.`);
    setHardwareStatus(false);
    scheduleReconnect();
  }
};

const scheduleReconnect = () => {
  if (reconnectTimer) return;
  reconnectTimer = setTimeout(() => {
    reconnectTimer = null;
    connectSerialPort();
  }, 5000);
};

const initSerial = async () => {
  try {
    // Initial cleanup: ensure only target bus is connected if port connects, others offline
    await Bus.updateMany(
      { busNumber: { $ne: currentTargetBus } },
      { $set: { isHardwareConnected: false } }
    );
  } catch (e) {
    console.warn('Initial fleet sync warning:', e.message);
  }
  connectSerialPort();
};

const getHardwareStatus = () => {
  return {
    isConnected,
    port: process.env.SERIAL_PORT || 'COM3',
    baudRate: parseInt(process.env.BAUD_RATE || '115200', 10),
    targetBus: currentTargetBus,
    busNumber: currentTargetBus
  };
};

module.exports = {
  initSerial,
  processHardwareMessage,
  getHardwareStatus,
  setHardwareStatus,
  setTargetBus,
  sendHardwareReset
};
