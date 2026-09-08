import React, { useState } from 'react';
import { Bus, Search, Navigation, AlertTriangle, Users } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const PassengerTrack = () => {
  const [searchQuery, setSearchQuery] = useState('MH-40-AA-1111');
  const [busData, setBusData] = useState({
    busNumber: 'MH-40-AA-1111',
    currentStop: 'Ganeshpeth',
    nextStop: 'Burdi',
    currentCount: 28,
    capacity: 45,
    status: 'ON_THE_WAY',
  });
  const navigate = useNavigate();

  const handleSearch = (e) => {
    e.preventDefault();
    // Search logic wired to /api/track/:busNumber in Phase 10
  };

  const occupancy = Math.round((busData.currentCount / busData.capacity) * 100);
  const isFull = occupancy >= 90;

  return (
    <div className="min-h-screen bg-darkBg text-white p-4 flex flex-col items-center justify-center">
      <div className="w-full max-w-md space-y-6">
        {/* Header */}
        <div className="text-center">
          <div className="inline-flex p-3 rounded-btn bg-safe/10 text-safe mb-2">
            <Bus size={28} strokeWidth={1.5} />
          </div>
          <h1 className="text-2xl font-bold tracking-wide">Live Passenger Tracker</h1>
          <p className="text-xs text-textSecondary font-mono mt-1">Check Bus Crowding Before Boarding</p>
        </div>

        {/* Bus Search Form */}
        <form onSubmit={handleSearch} className="flex gap-2">
          <div className="relative flex-1">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-textTertiary">
              <Search size={16} strokeWidth={1.5} />
            </span>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Enter Bus Number (e.g. MH-40-AA-1111)"
              className="w-full bg-cardBg border border-borderMuted rounded-btn pl-10 pr-3 py-2.5 text-sm text-white font-mono placeholder-textTertiary focus:outline-none focus:border-safe"
            />
          </div>
          <button
            type="submit"
            className="bg-safe text-darkBg font-bold px-4 py-2.5 rounded-btn text-xs font-mono hover:bg-safe/90 transition"
          >
            Track
          </button>
        </form>

        {/* Live Status Card */}
        {busData && (
          <div className={`bg-cardBg border rounded-card p-6 space-y-4 shadow-xl ${
            isFull ? 'border-danger/40 shadow-glowDanger' : 'border-safe/30 shadow-glowSafe'
          }`}>
            <div className="flex justify-between items-start">
              <div>
                <span className="font-mono text-xl font-bold">{busData.busNumber}</span>
                <p className="text-xs text-textSecondary mt-0.5 font-mono">Live Broadcast</p>
              </div>

              <div className={`px-3 py-1 rounded text-xs font-mono font-bold ${
                isFull ? 'bg-danger/20 text-danger border border-danger/40' : 'bg-safe/20 text-safe border border-safe/40'
              }`}>
                {isFull ? 'BUS FULL' : 'SEATS AVAILABLE'}
              </div>
            </div>

            {/* Location */}
            <div className="p-3 bg-gray-900 rounded-btn space-y-2 text-xs">
              <div className="flex items-center space-x-2 text-safe font-mono">
                <Navigation size={14} />
                <span className="text-textSecondary">At Station:</span>
                <span className="text-white font-semibold">{busData.currentStop}</span>
              </div>
              <div className="flex items-center space-x-2 text-textSecondary font-mono pl-5">
                <span>Next Station:</span>
                <span className="text-white">{busData.nextStop}</span>
              </div>
            </div>

            {/* Passenger Count Details */}
            <div className="pt-2">
              <div className="flex justify-between items-center text-xs mb-1 font-mono">
                <span className="text-textSecondary">Occupancy ({occupancy}%)</span>
                <span className="text-white font-semibold">{busData.currentCount} / {busData.capacity} passengers</span>
              </div>
              <div className="w-full bg-gray-800 rounded-full h-3 overflow-hidden">
                <div
                  className={`h-full transition-all duration-300 ${isFull ? 'bg-danger' : 'bg-safe'}`}
                  style={{ width: `${occupancy}%` }}
                />
              </div>
            </div>
          </div>
        )}

        <div className="text-center pt-4">
          <button
            onClick={() => navigate('/')}
            className="text-xs text-textSecondary hover:text-white transition font-mono"
          >
            Staff Login Portal →
          </button>
        </div>
      </div>
    </div>
  );
};

export default PassengerTrack;
