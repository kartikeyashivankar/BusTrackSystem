import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  MapPin,
  RotateCcw,
  Repeat,
  LogOut,
  CheckCircle,
  AlertTriangle,
  Radio,
  Wifi,
  WifiOff
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useWebSocket } from '../hooks/useWebSocket';
import api from '../utils/api';
import StatusDot from '../components/StatusDot';

const ConductorPanel = () => {
  const { busNumber: routeParamBus } = useParams();
  const { user, logout } = useAuth();
  const { lastMessage, isConnected: isWsConnected } = useWebSocket();
  const navigate = useNavigate();

  // Use assigned bus if conductor, or route param
  const busNumber = routeParamBus || user?.assignedBus || 'MH-40-AA-1111';

  const [bus, setBus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [showLoopModal, setShowLoopModal] = useState(false);
  const [showResetModal, setShowResetModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Fetch initial bus data
  useEffect(() => {
    let isMounted = true;
    const fetchBus = async () => {
      try {
        setLoading(true);
        const res = await api.get(`/buses/${busNumber}`);
        if (isMounted) setBus(res.data);
      } catch (err) {
        console.error('Error fetching bus for conductor panel:', err);
        if (isMounted) setErrorMessage(err.response?.data?.message || 'Failed to load bus data');
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchBus();

    return () => {
      isMounted = false;
    };
  }, [busNumber]);

  // Real-time synchronization from WebSocket
  useEffect(() => {
    if (!lastMessage) return;

    if (
      (lastMessage.type === 'BUS_UPDATE' || lastMessage.type === 'HARDWARE_EVENT') &&
      lastMessage.data &&
      lastMessage.data.busNumber === busNumber
    ) {
      setBus((prev) => ({
        ...prev,
        ...lastMessage.data
      }));
    }
  }, [lastMessage, busNumber]);

  // Tap stop handler
  const handleStopSelect = async (stopIndex) => {
    if (updating || !bus) return;

    try {
      setUpdating(true);
      const stopName = bus.stops?.[stopIndex] || '';
      const res = await api.put(`/buses/${busNumber}/stop`, {
        stopIndex,
        stopName
      });

      if (res.data) {
        setBus(res.data);
      }

      // If conductor tapped the terminal/last stop, trigger loop confirmation modal
      if (stopIndex === (bus.stops?.length || 0) - 1) {
        setShowLoopModal(true);
      }
    } catch (err) {
      console.error('Error updating stop:', err);
      alert(err.response?.data?.message || 'Error advancing to next stop');
    } finally {
      setUpdating(false);
    }
  };

  // Loop confirmation handler: resets count, increments loop, saves trip to DB
  const handleConfirmLoop = async () => {
    try {
      setUpdating(true);
      const res = await api.put(`/buses/${busNumber}/loop`);
      if (res.data?.bus) {
        setBus(res.data.bus);
      }
      setShowLoopModal(false);
    } catch (err) {
      console.error('Error completing loop:', err);
      alert(err.response?.data?.message || 'Failed to complete loop');
    } finally {
      setUpdating(false);
    }
  };

  // Manual reset handler
  const handleResetCount = async () => {
    try {
      setUpdating(true);
      const res = await api.put(`/buses/${busNumber}/reset`);
      if (res.data?.bus) {
        setBus(res.data.bus);
      }
      setShowResetModal(false);
    } catch (err) {
      console.error('Error resetting passenger count:', err);
      alert(err.response?.data?.message || 'Failed to reset count');
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-darkBg text-white flex items-center justify-center p-4">
        <div className="text-center space-y-3">
          <div className="w-8 h-8 border-2 border-safe border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="font-mono text-xs text-textSecondary uppercase tracking-wider">
            Loading Conductor Terminal...
          </p>
        </div>
      </div>
    );
  }

  if (errorMessage || !bus) {
    return (
      <div className="min-h-screen bg-darkBg text-white flex items-center justify-center p-4">
        <div className="max-w-sm w-full bg-cardBg border border-danger/30 rounded-card p-6 text-center space-y-4">
          <AlertTriangle size={36} className="text-danger mx-auto" strokeWidth={1.5} />
          <h2 className="text-base font-bold">{errorMessage || 'Access Denied'}</h2>
          <p className="text-xs text-textSecondary">
            You can only access the bus assigned to your account.
          </p>
          <button
            onClick={logout}
            className="w-full bg-gray-800 hover:bg-gray-700 text-white font-mono text-xs py-2.5 rounded-btn transition"
          >
            Logout to Login Page
          </button>
        </div>
      </div>
    );
  }

  const {
    capacity = 45,
    currentCount = 0,
    stops = [],
    currentStopIndex = 0,
    loopCount = 0,
    isHardwareConnected = false
  } = bus;

  const occupancyPercent = capacity > 0 ? Math.min(100, Math.round((currentCount / capacity) * 100)) : 0;
  const isDanger = occupancyPercent >= 90;
  const isWarning = occupancyPercent >= 70 && !isDanger;

  let dotStatus = 'offline';
  if (isHardwareConnected) {
    if (isDanger) dotStatus = 'danger';
    else if (isWarning) dotStatus = 'warning';
    else dotStatus = 'online';
  }

  return (
    <div className="min-h-screen bg-darkBg text-white flex flex-col justify-between max-w-md mx-auto p-4 select-none">
      {/* Top Header */}
      <div>
        <div className="flex items-center justify-between pb-3 border-b border-borderMuted">
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-mono text-xl font-bold tracking-wide">{bus.busNumber}</span>
              <StatusDot status={dotStatus} />
            </div>
            <p className="text-[10px] text-textSecondary uppercase font-mono mt-0.5">
              Conductor: {user?.name || 'Assigned Staff'}
            </p>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => setShowResetModal(true)}
              title="Reset Count"
              className="p-2 text-textSecondary hover:text-white rounded-btn bg-gray-900 border border-borderMuted transition"
            >
              <RotateCcw size={18} strokeWidth={1.5} />
            </button>
            <button
              onClick={logout}
              title="Logout"
              className="p-2 text-textSecondary hover:text-danger rounded-btn bg-gray-900 border border-borderMuted transition"
            >
              <LogOut size={18} strokeWidth={1.5} />
            </button>
          </div>
        </div>

        {/* Real-time Hardware Telemetry Bar */}
        <div className={`my-3.5 p-4 bg-cardBg border rounded-card flex items-center justify-between shadow-lg transition-all ${
          isDanger ? 'border-danger/40 shadow-glowDanger' : isWarning ? 'border-warning/30' : 'border-borderMuted'
        }`}>
          <div>
            <div className="flex items-center space-x-1.5 text-xs text-textSecondary font-mono uppercase mb-1">
              <Radio size={14} className={isHardwareConnected ? 'text-safe animate-pulse' : 'text-textTertiary'} />
              <span>Hardware Occupancy</span>
            </div>
            <div className="flex items-baseline space-x-1.5">
              <span className="font-mono text-3xl font-bold text-white">{currentCount}</span>
              <span className="font-mono text-xs text-textTertiary">/ {capacity} passengers</span>
            </div>
          </div>

          <div className="text-right">
            <div className={`font-mono text-sm font-bold px-3 py-1 rounded ${
              isDanger
                ? 'bg-danger text-darkBg'
                : isWarning
                ? 'bg-warning text-darkBg'
                : 'bg-safe/20 text-safe border border-safe/30'
            }`}>
              {isDanger ? 'FULL' : isWarning ? 'BUSY' : 'NORMAL'}
            </div>
            <span className="font-mono text-[10px] text-textSecondary mt-1 block">
              {occupancyPercent}% capacity
            </span>
          </div>
        </div>

        {/* Current Active Stop Banner */}
        <div className="mb-4">
          <p className="text-[11px] font-mono uppercase text-textSecondary mb-1.5 flex items-center space-x-1">
            <MapPin size={14} className="text-safe" />
            <span>Currently Boarding Station</span>
          </p>
          <div className="p-4 bg-safe/10 border border-safe/40 rounded-card flex items-center justify-between shadow-glowSafe">
            <div>
              <p className="text-xl font-bold text-safe tracking-wide">
                {stops[currentStopIndex] || bus.currentStop || 'Station A'}
              </p>
              <p className="text-[11px] text-textSecondary font-mono mt-0.5">
                Station #{currentStopIndex + 1} of {stops.length}
              </p>
            </div>
            <span className="font-mono text-xs px-2.5 py-1 rounded bg-safe text-darkBg font-bold">
              ACTIVE
            </span>
          </div>
        </div>

        {/* Large Tap Targets for All Stops (Min 52px height for one-handed mobile use) */}
        <div>
          <p className="text-[11px] font-mono uppercase text-textSecondary mb-2">
            Tap Arrived Station (One-Touch Update)
          </p>
          <div className="space-y-2 max-h-[42vh] overflow-y-auto pr-1">
            {stops.map((stop, idx) => {
              const isCurrent = idx === currentStopIndex;
              const isPast = idx < currentStopIndex;

              return (
                <button
                  key={idx}
                  type="button"
                  disabled={updating}
                  onClick={() => handleStopSelect(idx)}
                  className={`w-full min-h-[52px] px-4 py-3 rounded-btn text-left font-medium text-sm transition flex items-center justify-between border ${
                    isCurrent
                      ? 'bg-safe text-darkBg font-bold border-safe shadow-glowSafe'
                      : isPast
                      ? 'bg-cardBg/60 text-textSecondary border-borderMuted hover:border-gray-600'
                      : 'bg-cardBg text-white border-borderMuted hover:border-safe/60'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <span className="font-mono text-xs opacity-75 w-6">#{idx + 1}</span>
                    <span className="truncate">{stop}</span>
                  </div>

                  <div className="flex items-center space-x-2">
                    {isCurrent && <CheckCircle size={20} strokeWidth={2.5} />}
                    {idx === stops.length - 1 && !isCurrent && (
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-gray-800 text-warning">
                        Terminus
                      </span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Footer Info & Loop Status */}
      <div className="pt-3 border-t border-borderMuted mt-3 flex items-center justify-between text-xs text-textSecondary font-mono">
        <div className="flex items-center space-x-2">
          <Repeat size={14} className="text-safe" />
          <span>Loop {loopCount} of today</span>
        </div>
        <div className="flex items-center space-x-1 text-[11px]">
          {isWsConnected ? (
            <>
              <Wifi size={13} className="text-safe" />
              <span className="text-safe">Synced</span>
            </>
          ) : (
            <>
              <WifiOff size={13} className="text-danger" />
              <span className="text-danger">Offline</span>
            </>
          )}
        </div>
      </div>

      {/* Loop Confirmation Modal (Document 03 & 06) */}
      {showLoopModal && (
        <div className="fixed inset-0 bg-black/85 flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="bg-cardBg border border-borderMuted p-6 rounded-card max-w-sm w-full space-y-4 text-center shadow-2xl">
            <div className="w-12 h-12 rounded-full bg-safe/20 text-safe flex items-center justify-center mx-auto">
              <Repeat size={28} strokeWidth={2} />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">Last Stop Reached!</h3>
              <p className="text-xs text-textSecondary mt-1 leading-relaxed">
                Bus reached the terminal stop. Complete this loop and start a new loop?
              </p>
              <div className="mt-3 p-3 bg-gray-900 rounded-btn text-left text-xs font-mono space-y-1.5">
                <p className="text-safe flex items-center space-x-1.5">
                  <CheckCircle size={14} className="text-safe shrink-0" />
                  <span>Trip history will be saved to database</span>
                </p>
                <p className="text-safe flex items-center space-x-1.5">
                  <CheckCircle size={14} className="text-safe shrink-0" />
                  <span>Passenger count will reset for new loop</span>
                </p>
                <p className="text-safe flex items-center space-x-1.5">
                  <CheckCircle size={14} className="text-safe shrink-0" />
                  <span>Loop counter will increment to {loopCount + 1}</span>
                </p>
              </div>
            </div>

            <div className="flex space-x-3 pt-2">
              <button
                type="button"
                onClick={() => setShowLoopModal(false)}
                className="flex-1 min-h-[48px] bg-gray-800 hover:bg-gray-700 text-white rounded-btn text-xs font-mono font-medium transition"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={updating}
                onClick={handleConfirmLoop}
                className="flex-1 min-h-[48px] bg-safe text-darkBg font-bold rounded-btn text-xs font-mono hover:bg-safe/90 transition shadow-glowSafe"
              >
                {updating ? 'Saving...' : 'Yes, Start Loop'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Manual Count Reset Confirmation Modal */}
      {showResetModal && (
        <div className="fixed inset-0 bg-black/85 flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="bg-cardBg border border-borderMuted p-6 rounded-card max-w-sm w-full space-y-4 text-center shadow-2xl">
            <div className="w-12 h-12 rounded-full bg-warning/20 text-warning flex items-center justify-center mx-auto">
              <RotateCcw size={28} strokeWidth={2} />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">Reset Passenger Count?</h3>
              <p className="text-xs text-textSecondary mt-1">
                This will reset the active hardware passenger count back to 0. Use this if sensor calibration is needed.
              </p>
            </div>

            <div className="flex space-x-3 pt-2">
              <button
                type="button"
                onClick={() => setShowResetModal(false)}
                className="flex-1 min-h-[48px] bg-gray-800 hover:bg-gray-700 text-white rounded-btn text-xs font-mono font-medium transition"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={updating}
                onClick={handleResetCount}
                className="flex-1 min-h-[48px] bg-warning text-darkBg font-bold rounded-btn text-xs font-mono hover:bg-warning/90 transition"
              >
                {updating ? 'Resetting...' : 'Confirm Reset'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ConductorPanel;
