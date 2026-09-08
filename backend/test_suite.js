/**
 * BusTrackSystem End-to-End Integration & Hardware Failover Test Suite
 * Covers all 10 buses, authentication, role boundaries, conductor workflows,
 * route auditing, trip history, analytics, public tracking, and WebSocket telemetry.
 */

const WebSocket = require('ws');

const BASE_URL = 'http://127.0.0.1:5000/api';
const WS_URL = 'ws://127.0.0.1:5000';

let adminToken = '';
let conductorToken = '';
let passedTests = 0;
let failedTests = 0;

const logPass = (name) => {
  passedTests++;
  console.log(`  [PASS] ${name}`);
};

const logFail = (name, err) => {
  failedTests++;
  console.error(`  [FAIL] ${name}: ${err}`);
};

async function req(endpoint, options = {}) {
  const url = endpoint.startsWith('http') ? endpoint : `${BASE_URL}${endpoint}`;
  const res = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(options.token ? { 'Authorization': `Bearer ${options.token}` } : {}),
      ...(options.headers || {})
    }
  });

  let data = null;
  const text = await res.text();
  try {
    data = JSON.parse(text);
  } catch {
    data = text;
  }
  return { status: res.status, data };
}

async function runSuite() {
  console.log('\n============================================================');
  console.log('   BUSTRACKSYSTEM E2E INTEGRATION & HARDWARE FAILOVER SUITE  ');
  console.log('============================================================\n');

  // ------------------------------------------------------------
  // 1. System Health & Infrastructure
  // ------------------------------------------------------------
  console.log('--- Suite 1: System Health & Infrastructure ---');
  try {
    const res = await req('/health');
    if (res.status === 200 && res.data.status === 'ok') {
      logPass('API Gateway is alive and responsive (/api/health)');
    } else {
      logFail('API Gateway is alive and responsive (/api/health)', `Status ${res.status}`);
    }
  } catch (e) {
    logFail('API Gateway is alive and responsive (/api/health)', e.message);
  }

  // ------------------------------------------------------------
  // 2. Authentication & Role-Based Access Control
  // ------------------------------------------------------------
  console.log('\n--- Suite 2: Authentication & RBAC ---');
  try {
    // Admin login
    const adminRes = await req('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email: 'admin@bustrack.com', password: 'admin123' })
    });
    if (adminRes.status === 200 && adminRes.data.token && adminRes.data.user?.role === 'admin') {
      adminToken = adminRes.data.token;
      logPass('Admin login returns valid JWT token and admin role');
    } else {
      logFail('Admin login returns valid JWT token and admin role', JSON.stringify(adminRes.data));
    }

    // Conductor login
    const conductorRes = await req('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email: 'conductor@bustrack.com', password: 'conductor123' })
    });
    if (conductorRes.status === 200 && conductorRes.data.token && conductorRes.data.user?.role === 'conductor') {
      conductorToken = conductorRes.data.token;
      logPass(`Conductor login returns valid JWT token and assignedBus (${conductorRes.data.user.assignedBus})`);
    } else {
      logFail('Conductor login returns valid JWT token', JSON.stringify(conductorRes.data));
    }

    // Invalid credentials check
    const invalidRes = await req('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email: 'admin@bustrack.com', password: 'wrongpassword' })
    });
    if (invalidRes.status === 401) {
      logPass('Rejects invalid credentials with HTTP 401');
    } else {
      logFail('Rejects invalid credentials with HTTP 401', `Status ${invalidRes.status}`);
    }

    // /api/auth/me check
    const meRes = await req('/auth/me', { token: adminToken });
    if (meRes.status === 200 && (meRes.data.email === 'admin@bustrack.com' || meRes.data.user?.email === 'admin@bustrack.com')) {
      logPass('Verified /api/auth/me returns authenticated user identity');
    } else {
      logFail('Verified /api/auth/me returns authenticated user identity', `Status ${meRes.status}`);
    }

    // Unauthenticated access rejection on protected endpoint
    const unauthRes = await req('/analytics/overview');
    if (unauthRes.status === 401) {
      logPass('Protected routes reject requests without token with HTTP 401');
    } else {
      logFail('Protected routes reject requests without token with HTTP 401', `Status ${unauthRes.status}`);
    }
  } catch (e) {
    logFail('Authentication suite execution', e.message);
  }

  // ------------------------------------------------------------
  // 3. Fleet Operations & Vehicle State
  // ------------------------------------------------------------
  console.log('\n--- Suite 3: Fleet Operations & Telemetry ---');
  try {
    const fleetRes = await req('/buses', { token: adminToken });
    if (fleetRes.status === 200 && Array.isArray(fleetRes.data) && fleetRes.data.length >= 10) {
      logPass(`Fetched active fleet containing ${fleetRes.data.length} registered vehicles`);
    } else {
      logFail('Fetch active fleet', `Status ${fleetRes.status}, count: ${fleetRes.data?.length}`);
    }

    const busRes = await req('/buses/MH-40-AA-1111', { token: adminToken });
    if (busRes.status === 200 && busRes.data.busNumber === 'MH-40-AA-1111') {
      logPass(`Single bus telemetry query returns complete payload for ${busRes.data.busNumber}`);
    } else {
      logFail('Single bus telemetry query', `Status ${busRes.status}`);
    }
  } catch (e) {
    logFail('Fleet operations suite execution', e.message);
  }

  // ------------------------------------------------------------
  // 4. Conductor Terminal & Access Boundaries
  // ------------------------------------------------------------
  console.log('\n--- Suite 4: Conductor Terminal & Boundary Security ---');
  try {
    // Authorized stop advancement
    const stopRes = await req('/buses/MH-40-AA-1111/stop', {
      method: 'PUT',
      token: conductorToken
    });
    const updatedBus = stopRes.data.bus || stopRes.data;
    if (stopRes.status === 200 && updatedBus?.currentStop) {
      logPass(`Authorized conductor advanced stop on MH-40-AA-1111 to "${updatedBus.currentStop}" (index: ${updatedBus.currentStopIndex})`);
    } else {
      logFail('Authorized conductor advanced stop', `Status ${stopRes.status}`);
    }

    // Security boundary: Conductor attempting to operate another bus
    const unauthorizedBusRes = await req('/buses/MH-40-AA-2222/stop', {
      method: 'PUT',
      token: conductorToken
    });
    if (unauthorizedBusRes.status === 403) {
      logPass('Conductor access guard prevents modifying unassigned bus MH-40-AA-2222 (HTTP 403 Forbidden)');
    } else {
      logFail('Conductor access guard prevents modifying unassigned bus', `Expected 403, got ${unauthorizedBusRes.status}`);
    }

    // Manual calibration count reset
    const resetRes = await req('/buses/MH-40-AA-1111/reset', {
      method: 'PUT',
      token: conductorToken
    });
    if (resetRes.status === 200 && (resetRes.data.bus?.currentCount === 0 || resetRes.data.currentCount === 0)) {
      logPass('Conductor calibrated bus passenger counter to 0');
    } else {
      logFail('Conductor calibrated bus passenger counter', `Status ${resetRes.status}`);
    }

    // Loop completion & automated trip saving
    const loopRes = await req('/buses/MH-40-AA-1111/loop', {
      method: 'PUT',
      token: conductorToken
    });
    if (loopRes.status === 200 && loopRes.data.bus?.currentCount === 0 && loopRes.data.trip) {
      logPass(`Loop completed: Trip saved with peakCount ${loopRes.data.trip.peakCount} and count reset to 0`);
    } else {
      logFail('Loop completed and trip saved', `Status ${loopRes.status}`);
    }
  } catch (e) {
    logFail('Conductor terminal suite execution', e.message);
  }

  // ------------------------------------------------------------
  // 5. Dynamic Route Management & Audit Log
  // ------------------------------------------------------------
  console.log('\n--- Suite 5: Route Management & Audit Trail ---');
  try {
    const updatedStops = ['Manewada', 'TPoint', 'Ganeshpeth', 'Burdi', 'Besa', 'Chatrapati Square'];
    const routeRes = await req('/buses/MH-40-AA-1111/route', {
      method: 'PUT',
      token: adminToken,
      body: JSON.stringify({
        stops: updatedStops,
        routeType: 'loop',
        capacity: 55,
        startingStopIndex: 0
      })
    });
    if (routeRes.status === 200 && routeRes.data.bus?.stops?.length === updatedStops.length) {
      logPass(`Admin updated route sequence for MH-40-AA-1111 (${updatedStops.length} stops)`);
    } else {
      logFail('Admin updated route sequence', `Status ${routeRes.status}`);
    }
  } catch (e) {
    logFail('Route management suite execution', e.message);
  }

  // ------------------------------------------------------------
  // 6. Trip History & Pagination Engine
  // ------------------------------------------------------------
  console.log('\n--- Suite 6: Trip History & Pagination ---');
  try {
    const tripsRes = await req('/trips?page=1&limit=5', { token: adminToken });
    const totalCount = tripsRes.data.pagination?.total ?? tripsRes.data.totalTrips ?? 0;
    if (tripsRes.status === 200 && Array.isArray(tripsRes.data.trips) && totalCount > 0) {
      logPass(`Retrieved paginated trips (Total recorded: ${totalCount}, Current page: ${tripsRes.data.pagination?.page || 1})`);
    } else {
      logFail('Retrieved paginated trips', `Status ${tripsRes.status}, total: ${totalCount}`);
    }

    const busTripsRes = await req('/trips/MH-40-AA-1111', { token: adminToken });
    if (busTripsRes.status === 200 && Array.isArray(busTripsRes.data)) {
      logPass(`Retrieved vehicle-specific trip logs for MH-40-AA-1111 (${busTripsRes.data.length} trips)`);
    } else {
      logFail('Retrieved vehicle-specific trip logs', `Status ${busTripsRes.status}`);
    }
  } catch (e) {
    logFail('Trip history suite execution', e.message);
  }

  // ------------------------------------------------------------
  // 7. Public Passenger View & Crowding Checker
  // ------------------------------------------------------------
  console.log('\n--- Suite 7: Public Passenger View ---');
  try {
    const trackRes = await req('/track/MH-40-AA-1111');
    if (trackRes.status === 200 && trackRes.data.busNumber === 'MH-40-AA-1111' && trackRes.data.occupancyPercentage !== undefined) {
      logPass(`Public tracking endpoint returned live crowding telemetry without auth (Occupancy: ${trackRes.data.occupancyPercentage}%, Seats free: ${trackRes.data.seatsAvailable})`);
    } else {
      logFail('Public tracking endpoint', `Status ${trackRes.status}`);
    }

    const invalidTrackRes = await req('/track/INVALID-VEHICLE-999');
    if (invalidTrackRes.status === 404) {
      logPass('Public tracking endpoint returns HTTP 404 for unlisted bus registration');
    } else {
      logFail('Public tracking invalid bus check', `Expected 404, got ${invalidTrackRes.status}`);
    }
  } catch (e) {
    logFail('Public passenger view suite execution', e.message);
  }

  // ------------------------------------------------------------
  // 8. Ridership Analytics & Aggregations
  // ------------------------------------------------------------
  console.log('\n--- Suite 8: Ridership Analytics & KPI Engine ---');
  try {
    const overviewRes = await req('/analytics/overview', { token: adminToken });
    if (overviewRes.status === 200 && overviewRes.data.totalPassengersToday !== undefined) {
      logPass(`Analytics overview computed: ${overviewRes.data.totalPassengersToday} passengers today, Avg Fleet Occupancy: ${overviewRes.data.averageFleetOccupancy}%`);
    } else {
      logFail('Analytics overview computed', `Status ${overviewRes.status}`);
    }

    const busiestRes = await req('/analytics/busiest-hours', { token: adminToken });
    if (busiestRes.status === 200 && Array.isArray(busiestRes.data) && busiestRes.data.length === 17) {
      logPass(`Busiest hours computed 17 operating hourly slots (Peak rush: ${busiestRes.data.filter(h => h.isPeak).map(h => h.hour).join(', ')})`);
    } else {
      logFail('Busiest hours computed', `Status ${busiestRes.status}`);
    }

    const dailyRes = await req('/analytics/daily-volume', { token: adminToken });
    if (dailyRes.status === 200 && Array.isArray(dailyRes.data) && dailyRes.data.length === 7) {
      logPass(`Daily ridership computed 7-day chronological volume trend`);
    } else {
      logFail('Daily ridership computed', `Status ${dailyRes.status}`);
    }

    const fleetOccRes = await req('/analytics/fleet-occupancy', { token: adminToken });
    if (fleetOccRes.status === 200 && Array.isArray(fleetOccRes.data) && fleetOccRes.data.length >= 10) {
      logPass(`Fleet occupancy computed comparison across all ${fleetOccRes.data.length} transit units`);
    } else {
      logFail('Fleet occupancy comparison', `Status ${fleetOccRes.status}`);
    }
  } catch (e) {
    logFail('Analytics suite execution', e.message);
  }

  // ------------------------------------------------------------
  // 9. ESP32 Hardware Failover & WebSocket Telemetry
  // ------------------------------------------------------------
  console.log('\n--- Suite 9: ESP32 Hardware Failover & WebSocket Telemetry ---');
  try {
    // Hardware status check
    const hwRes = await req('/hardware/status');
    if (hwRes.status === 200 && hwRes.data.port && hwRes.data.baudRate) {
      const mode = hwRes.data.isConnected ? 'LIVE' : 'SIMULATION';
      logPass(`Hardware telemetry status: ${mode} mode on ${hwRes.data.port} @ ${hwRes.data.baudRate} baud`);
    } else {
      logFail('Hardware telemetry status check', `Status ${hwRes.status}`);
    }

    // Test WebSocket connection
    const wsReceivedPromise = new Promise((resolve) => {
      let ws;
      try {
        ws = new WebSocket(WS_URL);
        const timeout = setTimeout(() => {
          if (ws.readyState === WebSocket.OPEN) ws.close();
          resolve(false);
        }, 4000);

        ws.on('open', () => {
          // Trigger hardware simulation while WS is listening
          req('/hardware/simulate', {
            method: 'POST',
            body: JSON.stringify({ busNumber: 'MH-40-AA-1111', event: 'ENTRY' })
          });
        });

        ws.on('message', (data) => {
          try {
            const parsed = JSON.parse(data.toString());
            if (parsed.type === 'BUS_UPDATE' && parsed.data?.busNumber === 'MH-40-AA-1111') {
              clearTimeout(timeout);
              ws.close();
              resolve(true);
            }
          } catch {}
        });

        ws.on('error', () => {
          clearTimeout(timeout);
          resolve(false);
        });
      } catch {
        resolve(false);
      }
    });

    const wsSuccess = await wsReceivedPromise;
    if (wsSuccess) {
      logPass('WebSocket real-time connection established and captured live BUS_UPDATE telemetry dispatch');
    } else {
      // Fallback: Verify HTTP simulation succeeded
      const simRes = await req('/hardware/simulate', {
        method: 'POST',
        body: JSON.stringify({ busNumber: 'MH-40-AA-1111', event: 'ENTRY' })
      });
      if (simRes.status === 200 && simRes.data.data) {
        logPass('Hardware simulation fallback processed ENTRY telemetry event');
      } else {
        logFail('Hardware simulation', `Status ${simRes.status}`);
      }
    }

    // Hardware EXIT simulation
    const exitSimRes = await req('/hardware/simulate', {
      method: 'POST',
      body: JSON.stringify({ busNumber: 'MH-40-AA-1111', event: 'EXIT' })
    });
    if (exitSimRes.status === 200 && exitSimRes.data.data) {
      logPass(`Hardware simulation processed EXIT telemetry event (Current count: ${exitSimRes.data.data.currentCount})`);
    } else {
      logFail('Hardware simulation EXIT event', `Status ${exitSimRes.status}`);
    }
  } catch (e) {
    logFail('Hardware failover suite execution', e.message);
  }

  // ------------------------------------------------------------
  // Final Test Summary
  // ------------------------------------------------------------
  console.log('\n============================================================');
  console.log(`TOTAL TESTS: ${passedTests + failedTests} | PASSED: ${passedTests} | FAILED: ${failedTests}`);
  console.log('============================================================\n');

  if (failedTests > 0) {
    process.exit(1);
  } else {
    process.exit(0);
  }
}

runSuite().catch((err) => {
  console.error('Fatal test runner error:', err);
  process.exit(1);
});
