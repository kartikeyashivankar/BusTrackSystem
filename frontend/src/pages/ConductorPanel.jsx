import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { MapPin, RotateCcw, Repeat, LogOut, CheckCircle } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

const ConductorPanel = () => {
  const { busNumber = 'MH-40-AA-1111' } = useParams();
  const { logout } = useAuth();
  const [stops] = useState(['Manewada', 'TPoint', 'Ganeshpeth', 'Burdi', 'Besa']);
  const [currentStopIndex, setCurrentStopIndex] = useState(1);
  const [currentCount] = useState(24);
  const [capacity] = useState(45);
  const [showLoopModal, setShowLoopModal] = useState(false);

  const handleStopSelect = (index) => {
    setCurrentStopIndex(index);
    if (index === stops.length - 1) {
      setShowLoopModal(true);
    }
  };

  return (
    <div className="min-h-screen bg-darkBg text-white p-4 flex flex-col justify-between max-w-md mx-auto select-none">
      {/* Top Header */}
      <div>
        <div className="flex items-center justify-between pb-4 border-b border-borderMuted">
          <div>
            <h1 className="font-mono text-xl font-bold">{busNumber}</h1>
            <p className="text-[11px] text-textSecondary uppercase font-mono">Conductor Terminal</p>
          </div>
          <button
            onClick={logout}
            className="p-2 text-textSecondary hover:text-danger rounded-btn bg-gray-900 border border-borderMuted"
            title="Logout"
          >
            <LogOut size={18} strokeWidth={1.5} />
          </button>
        </div>

        {/* Real-time Occupancy Display */}
        <div className="my-4 p-4 bg-cardBg border border-borderMuted rounded-card flex items-center justify-between">
          <div>
            <p className="text-xs uppercase font-mono text-textSecondary">Hardware Count</p>
            <div className="flex items-baseline space-x-1">
              <span className="font-mono text-3xl font-bold text-safe">{currentCount}</span>
              <span className="font-mono text-sm text-textTertiary">/ {capacity}</span>
            </div>
          </div>
          <div className="text-right">
            <span className="text-xs font-mono px-2.5 py-1 rounded bg-safe/10 text-safe border border-safe/20">
              NORMAL
            </span>
          </div>
        </div>

        {/* Current Stop Indicator */}
        <div className="mb-4">
          <p className="text-xs font-mono uppercase text-textSecondary mb-2 flex items-center space-x-1">
            <MapPin size={14} className="text-safe" />
            <span>Active Stop</span>
          </p>
          <div className="p-4 bg-safe/10 border border-safe/40 rounded-card">
            <p className="text-xl font-bold text-safe">{stops[currentStopIndex]}</p>
            <p className="text-[11px] text-textSecondary mt-1 font-mono">Stop #{currentStopIndex + 1} of {stops.length}</p>
          </div>
        </div>

        {/* Next Stop Tap Buttons (Min 48px height) */}
        <div>
          <p className="text-xs font-mono uppercase text-textSecondary mb-2">Tap Arrived Stop</p>
          <div className="space-y-2">
            {stops.map((stop, idx) => {
              const isCurrent = idx === currentStopIndex;
              return (
                <button
                  key={idx}
                  onClick={() => handleStopSelect(idx)}
                  className={`w-full min-h-[48px] px-4 py-3 rounded-btn text-left font-medium text-sm transition flex items-center justify-between ${
                    isCurrent
                      ? 'bg-safe text-darkBg font-bold shadow-glowSafe'
                      : 'bg-cardBg border border-borderMuted text-textSecondary hover:text-white hover:border-gray-600'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <span className="font-mono text-xs opacity-70">#{idx + 1}</span>
                    <span>{stop}</span>
                  </div>
                  {isCurrent && <CheckCircle size={18} strokeWidth={2} />}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Loop Confirmation Modal */}
      {showLoopModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50">
          <div className="bg-cardBg border border-borderMuted p-6 rounded-card max-w-sm w-full space-y-4 text-center">
            <Repeat size={32} className="mx-auto text-safe" strokeWidth={1.5} />
            <h3 className="text-lg font-bold text-white">Last Stop Reached</h3>
            <p className="text-xs text-textSecondary">
              Bus reached {stops[stops.length - 1]}. Start a new loop? Count will reset and trip will save to database.
            </p>
            <div className="flex space-x-3 pt-2">
              <button
                onClick={() => setShowLoopModal(false)}
                className="flex-1 py-3 bg-gray-800 text-white rounded-btn text-xs font-mono"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  setCurrentStopIndex(0);
                  setShowLoopModal(false);
                }}
                className="flex-1 py-3 bg-safe text-darkBg font-bold rounded-btn text-xs font-mono"
              >
                Yes, Start Loop
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Footer controls */}
      <div className="pt-4 border-t border-borderMuted mt-4 flex items-center justify-between text-xs text-textTertiary font-mono">
        <span>BusTrack Mobile Terminal</span>
        <span>Loop 1</span>
      </div>
    </div>
  );
};

export default ConductorPanel;
