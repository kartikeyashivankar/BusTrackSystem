import React from 'react';
import { Bus, Navigation, Repeat } from 'lucide-react';
import StatusDot from './StatusDot';
import RouteProgress from './RouteProgress';

const BusCard = ({ bus, onClick }) => {
  if (!bus) return null;

  const {
    busNumber,
    capacity = 40,
    currentCount = 0,
    stops = [],
    currentStopIndex = 0,
    loopCount = 0,
    status = 'OFFLINE',
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

  const firstStop = stops[0] || 'Start';
  const lastStop = stops[stops.length - 1] || 'End';

  return (
    <div
      onClick={onClick}
      className={`bg-cardBg border border-borderMuted rounded-card p-5 cursor-pointer transition-all duration-200 hover:border-gray-600 ${
        isDanger ? 'shadow-glowDanger border-danger/30' : isWarning ? 'shadow-glowWarning border-warning/30' : 'shadow-glowSafe border-safe/20'
      }`}
    >
      {/* Card Header */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center space-x-2">
          <Bus size={20} className={isDanger ? 'text-danger' : isWarning ? 'text-warning' : 'text-safe'} strokeWidth={1.5} />
          <span className="font-mono text-lg font-bold text-white tracking-wide">{busNumber}</span>
        </div>
        <div className="flex items-center space-x-2">
          <StatusDot status={dotStatus} />
          <span className="text-xs font-mono uppercase tracking-wider text-textSecondary">
            {isDanger ? 'FULL' : isWarning ? 'CROWDED' : isHardwareConnected ? 'NORMAL' : 'OFFLINE'}
          </span>
        </div>
      </div>

      {/* Route Overview */}
      <div className="flex items-center space-x-2 text-textSecondary text-xs mb-4">
        <span>{firstStop}</span>
        <Navigation size={14} className="text-safe" strokeWidth={1.5} />
        <span>{lastStop}</span>
      </div>

      {/* Progress Dots */}
      <div className="my-3">
        <RouteProgress stops={stops} currentStopIndex={currentStopIndex} />
      </div>

      {/* Passenger Occupancy Stats */}
      <div className="mt-4 pt-3 border-t border-borderMuted">
        <div className="flex justify-between items-center text-xs mb-1.5">
          <span className="text-textSecondary">
            <span className="font-mono text-white text-base font-semibold">{currentCount}</span> / {capacity} passengers
          </span>
          <span className="font-mono text-sm font-semibold text-white">{occupancyPercent}%</span>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-gray-800 rounded-full h-2 overflow-hidden mb-3">
          <div
            className={`h-full rounded-full transition-all duration-300 ${
              isDanger ? 'bg-danger' : isWarning ? 'bg-warning' : 'bg-safe'
            }`}
            style={{ width: `${occupancyPercent}%` }}
          />
        </div>

        {/* Loop info */}
        <div className="flex items-center justify-between text-[11px] text-textSecondary">
          <div className="flex items-center space-x-1.5">
            <Repeat size={14} className="text-textTertiary" strokeWidth={1.5} />
            <span>Loop {loopCount} of today</span>
          </div>
          <span className="text-[10px] font-mono text-textTertiary">{status}</span>
        </div>
      </div>
    </div>
  );
};

export default BusCard;
