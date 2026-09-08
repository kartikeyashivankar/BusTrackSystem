import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Bus,
  Search,
  Navigation,
  AlertTriangle,
  Users,
  CheckCircle2,
  RefreshCw,
  ArrowRight,
  RotateCw,
  MapPin,
  Radio,
  Clock,
  ShieldCheck,
  AlertCircle
} from 'lucide-react';

import api from '../utils/api';

const FLEET_BUSES = [
  'MH-40-AA-1111',
  'MH-40-AA-2222',
  'MH-40-AA-3333',
  'MH-40-AA-4444',
  'MH-40-AA-5555',
  'MH-40-AA-6666',
  'MH-40-AA-7777',
  'MH-40-AA-8888',
  'MH-40-AA-9999',
  'MH-40-AA-1010'
];

const PassengerTrack = () => {
  const { busNumber: routeBusNumber } = useParams();
  const navigate = useNavigate();

  const [searchQuery, setSearchQuery] = useState(routeBusNumber || 'MH-40-AA-1111');
  const [activeBus, setActiveBus] = useState(routeBusNumber || 'MH-40-AA-1111');
  const [busData, setBusData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastSync, setLastSync] = useState(null);
  const [countdown, setCountdown] = useState(5);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const countdownRef = useRef(null);

  // Fetch tracking data for a specific bus
  const fetchTrackData = useCallback(async (busNum, isManual = false) => {
    if (!busNum) return;
    if (isManual) setIsRefreshing(true);
    
    try {
      const res = await api.get(`/track/${encodeURIComponent(busNum.trim())}`);
      setBusData(res.data);
      setError(null);
      setLastSync(new Date());
    } catch (err) {
      if (err.response && err.response.status === 404) {
        setError(`Bus "${busNum}" not found in active fleet.`);
        setBusData(null);
      } else {
        console.error('Fetch track error:', err);
        setError('Connection to tracking network lost.');
      }
    } finally {
      setLoading(false);
      if (isManual) {
        setTimeout(() => setIsRefreshing(false), 400);
      }
    }
  }, []);

  // Update activeBus if URL param changes
  useEffect(() => {
    if (routeBusNumber && routeBusNumber !== activeBus) {
      setActiveBus(routeBusNumber);
      setSearchQuery(routeBusNumber);
    }
  }, [routeBusNumber]);

  // Initial fetch and 5-second polling interval
  useEffect(() => {
    setLoading(true);
    fetchTrackData(activeBus);
    setCountdown(5);

    // Countdown interval (every 1 second)
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          fetchTrackData(activeBus);
          return 5;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [activeBus, fetchTrackData]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    const formatted = searchQuery.trim().toUpperCase();
    setActiveBus(formatted);
    navigate(`/track/${formatted}`, { replace: true });
  };

  const selectBusChip = (bus) => {
    setSearchQuery(bus);
    setActiveBus(bus);
    navigate(`/track/${bus}`, { replace: true });
  };

  const occupancy = busData?.occupancyPercentage ?? 0;
  const isFull = busData?.isFull ?? occupancy >= 90;
  const seatsAvailable = busData?.seatsAvailable ?? 0;

  // Determine progress bar color
  const getOccupancyColor = () => {
    if (occupancy >= 90) return 'bg-danger';
    if (occupancy >= 70) return 'bg-warning';
    return 'bg-safe';
  };

  return (
    <div className="min-h-screen bg-darkBg text-textPrimary py-8 px-4 sm:px-6 flex flex-col items-center">
      <div className="w-full max-w-xl space-y-6">
        
        {/* Header Branding */}
        <header className="text-center space-y-2">
          <div className="inline-flex items-center justify-center p-3 rounded-2xl bg-safe/10 text-safe border border-safe/20 shadow-glowSafe">
            <Bus size={32} strokeWidth={1.5} />
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
            BusTrack <span className="text-safe">Public View</span>
          </h1>
          <p className="text-xs sm:text-sm text-textSecondary font-mono">
            Real-Time Crowding & Seat Availability Telemetry
          </p>
        </header>

        {/* Bus Search Form */}
        <div className="bg-cardBg border border-borderMuted rounded-card p-4 shadow-lg">
          <form onSubmit={handleSearch} className="flex gap-2">
            <div className="relative flex-1">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-textTertiary">
                <Search size={18} strokeWidth={1.5} />
              </span>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Enter Bus No. (e.g. MH-40-AA-1111)"
                className="w-full bg-gray-900 border border-borderMuted rounded-btn pl-10 pr-3 py-2.5 text-sm text-white font-mono placeholder-textTertiary focus:outline-none focus:border-safe transition"
              />
            </div>
            <button
              type="submit"
              className="bg-safe text-darkBg font-bold px-5 py-2.5 rounded-btn text-xs font-mono uppercase tracking-wider hover:bg-safe/90 transition active:scale-95 shadow-glowSafe flex items-center space-x-1.5"
            >
              <span>Track</span>
              <ArrowRight size={14} strokeWidth={2} />
            </button>
          </form>

          {/* Quick Select Chips */}
          <div className="mt-3 pt-3 border-t border-borderMuted/60">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-mono uppercase tracking-wider text-textTertiary">
                Fleet Quick Select:
              </span>
              <span className="text-[11px] font-mono text-textSecondary">
                10 Active Units
              </span>
            </div>
            <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto pr-1">
              {FLEET_BUSES.map((b) => (
                <button
                  key={b}
                  type="button"
                  onClick={() => selectBusChip(b)}
                  className={`px-2.5 py-1 rounded text-[11px] font-mono font-medium transition ${
                    activeBus === b
                      ? 'bg-safe text-darkBg font-bold shadow-glowSafe'
                      : 'bg-gray-900 text-textSecondary hover:text-white hover:bg-gray-800 border border-borderMuted/40'
                  }`}
                >
                  {b}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Polling & Live Heartbeat Header */}
        <div className="flex items-center justify-between px-1 text-xs font-mono text-textSecondary">
          <div className="flex items-center space-x-2">
            <span className="dot dot-online animate-pulse" />
            <span className="text-white font-medium">Live Telemetry</span>
            <span className="text-textTertiary hidden sm:inline">•</span>
            <span className="text-textTertiary hidden sm:inline">Auto-refresh in {countdown}s</span>
          </div>

          <button
            onClick={() => fetchTrackData(activeBus, true)}
            disabled={isRefreshing}
            className="flex items-center space-x-1 hover:text-white transition disabled:opacity-50 text-textSecondary"
            title="Refresh immediately"
          >
            <RefreshCw size={13} className={isRefreshing ? 'animate-spin text-safe' : ''} />
            <span>{isRefreshing ? 'Syncing...' : 'Refresh'}</span>
          </button>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="bg-cardBg border border-borderMuted rounded-card p-8 text-center space-y-3">
            <div className="inline-block animate-spin text-safe">
              <RotateCw size={28} />
            </div>
            <p className="text-xs font-mono text-textSecondary">Querying transit gateway for {activeBus}...</p>
          </div>
        )}

        {/* Error State: Bus Not Found */}
        {!loading && error && (
          <div className="bg-cardBg border border-danger/40 rounded-card p-6 shadow-glowDanger space-y-4 text-center">
            <div className="inline-flex p-3 rounded-full bg-danger/10 text-danger mb-1">
              <AlertCircle size={32} strokeWidth={1.5} />
            </div>
            <h2 className="text-lg font-bold text-white">Vehicle Not Found</h2>
            <p className="text-xs text-textSecondary font-mono max-w-sm mx-auto">
              {error} Please check the vehicle registration number or select a bus from the fleet chips above.
            </p>
            <div className="pt-2">
              <button
                type="button"
                onClick={() => selectBusChip(FLEET_BUSES[0])}
                className="bg-gray-800 hover:bg-gray-700 text-safe font-mono text-xs px-4 py-2 rounded-btn border border-borderMuted transition"
              >
                Track Default Bus ({FLEET_BUSES[0]})
              </button>
            </div>
          </div>
        )}

        {/* Live Tracking Card */}
        {!loading && !error && busData && (
          <div
            className={`bg-cardBg border rounded-card p-5 sm:p-6 space-y-5 transition-all shadow-xl ${
              isFull
                ? 'border-danger/60 shadow-glowDanger ring-1 ring-danger/20'
                : 'border-safe/40 shadow-glowSafe'
            }`}
          >
            {/* Card Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-borderMuted">
              <div>
                <div className="flex items-center space-x-2.5">
                  <span className="font-mono text-2xl font-bold text-white tracking-wide">
                    {busData.busNumber}
                  </span>
                  <span
                    className={`text-[10px] font-mono uppercase px-2 py-0.5 rounded font-bold ${
                      busData.status === 'ON_THE_WAY'
                        ? 'bg-safe/20 text-safe border border-safe/30'
                        : 'bg-warning/20 text-warning border border-warning/30'
                    }`}
                  >
                    {busData.status?.replace(/_/g, ' ') || 'ACTIVE'}
                  </span>
                </div>
                <div className="flex items-center space-x-2 text-xs font-mono text-textSecondary mt-1">
                  <Radio size={12} className="text-safe" />
                  <span>Route: {busData.routeType === 'loop' ? 'Loop Transit' : 'Linear Point-to-Point'}</span>
                  {busData.isHardwareConnected && (
                    <>
                      <span>•</span>
                      <span className="text-safe">ESP32 IoT Online</span>
                    </>
                  )}
                </div>
              </div>

              {/* High-visibility Seats Available / Bus Full Banner */}
              <div
                className={`px-4 py-2.5 rounded-card flex items-center space-x-2 font-mono font-bold text-xs uppercase tracking-wider self-start sm:self-center ${
                  isFull
                    ? 'bg-danger text-white shadow-glowDanger animate-pulse'
                    : 'bg-safe text-darkBg shadow-glowSafe'
                }`}
              >
                {isFull ? (
                  <>
                    <AlertTriangle size={18} strokeWidth={2.5} />
                    <span>BUS FULL</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 size={18} strokeWidth={2.5} />
                    <span>SEATS AVAILABLE</span>
                  </>
                )}
              </div>
            </div>

            {/* Quick Status Highlight Banner */}
            <div
              className={`p-3.5 rounded-btn flex items-center justify-between font-mono text-xs ${
                isFull
                  ? 'bg-danger/10 border border-danger/30 text-danger'
                  : 'bg-safe/10 border border-safe/30 text-safe'
              }`}
            >
              <div className="flex items-center space-x-2">
                {isFull ? <AlertTriangle size={16} /> : <ShieldCheck size={16} />}
                <span>
                  {isFull
                    ? 'Maximum crowd capacity reached. Standing room only.'
                    : `${seatsAvailable} seat${seatsAvailable === 1 ? '' : 's'} currently open for boarding.`}
                </span>
              </div>
              <span className="font-bold text-white text-sm">
                {isFull ? '0 Seats' : `${seatsAvailable} Free`}
              </span>
            </div>

            {/* Current Station & Next Station */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="p-3.5 bg-gray-900 border border-borderMuted rounded-btn space-y-1">
                <div className="flex items-center space-x-1.5 text-[11px] font-mono text-textTertiary uppercase tracking-wider">
                  <MapPin size={13} className="text-safe" />
                  <span>Current Station</span>
                </div>
                <div className="text-sm font-semibold text-white font-mono truncate">
                  {busData.currentStop || 'Departing Depot'}
                </div>
              </div>

              <div className="p-3.5 bg-gray-900 border border-borderMuted rounded-btn space-y-1">
                <div className="flex items-center space-x-1.5 text-[11px] font-mono text-textTertiary uppercase tracking-wider">
                  <ArrowRight size={13} className="text-warning" />
                  <span>Next Station</span>
                </div>
                <div className="text-sm font-semibold text-white font-mono truncate">
                  {busData.nextStop || 'Route Terminus'}
                </div>
              </div>
            </div>

            {/* Occupancy Level & Progress Bar */}
            <div className="space-y-2 pt-1">
              <div className="flex justify-between items-center text-xs font-mono">
                <span className="text-textSecondary flex items-center space-x-1.5">
                  <Users size={14} className="text-textTertiary" />
                  <span>Passenger Density</span>
                </span>
                <span className="font-semibold text-white">
                  {busData.currentCount} / {busData.capacity} ({occupancy}%)
                </span>
              </div>

              <div className="w-full bg-gray-900 border border-borderMuted/80 rounded-full h-3.5 overflow-hidden p-0.5">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${getOccupancyColor()}`}
                  style={{ width: `${Math.min(100, Math.max(4, occupancy))}%` }}
                />
              </div>

              <div className="flex justify-between text-[10px] font-mono text-textTertiary">
                <span>0 Empty</span>
                <span>50% Moderate</span>
                <span>90%+ Bus Full</span>
              </div>
            </div>

            {/* Stop Progression Timeline */}
            {busData.stops && busData.stops.length > 0 && (
              <div className="pt-2 border-t border-borderMuted">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-mono uppercase tracking-wider text-textSecondary flex items-center space-x-1.5">
                    <Navigation size={13} className="text-safe" />
                    <span>Station Sequence ({busData.stops.length} Stops)</span>
                  </span>
                  <span className="text-[10px] font-mono text-textTertiary">
                    Stop #{busData.currentStopIndex + 1} of {busData.stops.length}
                  </span>
                </div>

                <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                  {busData.stops.map((stopName, idx) => {
                    const isCurrent = idx === busData.currentStopIndex;
                    const isPast = idx < busData.currentStopIndex;
                    const isNext = idx === busData.currentStopIndex + 1;

                    return (
                      <div
                        key={`${stopName}-${idx}`}
                        className={`flex items-center justify-between px-3 py-2 rounded text-xs font-mono transition ${
                          isCurrent
                            ? 'bg-safe/15 border border-safe/40 text-white font-bold'
                            : isPast
                            ? 'bg-gray-900/40 text-textTertiary'
                            : isNext
                            ? 'bg-gray-900 border border-warning/30 text-textPrimary'
                            : 'bg-gray-900/60 text-textSecondary'
                        }`}
                      >
                        <div className="flex items-center space-x-3 truncate">
                          <span
                            className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                              isCurrent
                                ? 'bg-safe text-darkBg'
                                : isPast
                                ? 'bg-gray-800 text-textTertiary'
                                : 'bg-gray-800 text-textSecondary'
                            }`}
                          >
                            {idx + 1}
                          </span>
                          <span className="truncate">{stopName}</span>
                        </div>

                        <div>
                          {isCurrent && (
                            <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-safe text-darkBg">
                              HERE NOW
                            </span>
                          )}
                          {isNext && (
                            <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-warning/20 text-warning border border-warning/30">
                              NEXT
                            </span>
                          )}
                          {isPast && (
                            <span className="text-[10px] text-textTertiary">Passed</span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Footer Telemetry Stamp */}
            <div className="pt-3 border-t border-borderMuted flex flex-col sm:flex-row items-center justify-between text-[11px] font-mono text-textTertiary gap-1">
              <div className="flex items-center space-x-1.5">
                <Clock size={12} />
                <span>
                  Telemetry synced: {lastSync ? lastSync.toLocaleTimeString() : 'Connecting...'}
                </span>
              </div>
              <span className="text-safe">Public Live Stream</span>
            </div>
          </div>
        )}

        {/* Staff / Driver Login Portal Link */}
        <div className="text-center pt-2">
          <button
            onClick={() => navigate('/')}
            className="text-xs text-textSecondary hover:text-safe transition font-mono border-b border-transparent hover:border-safe pb-0.5"
          >
            Staff & Conductor Login Portal →
          </button>
        </div>

      </div>
    </div>
  );
};

export default PassengerTrack;
