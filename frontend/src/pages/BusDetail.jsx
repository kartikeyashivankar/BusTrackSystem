import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Repeat, Play, Square, Navigation } from 'lucide-react';
import PassengerGauge from '../components/PassengerGauge';
import EventFeed from '../components/EventFeed';
import RouteProgress from '../components/RouteProgress';
import StatusDot from '../components/StatusDot';
import api from '../utils/api';

const BusDetail = () => {
  const { busNumber } = useParams();
  const navigate = useNavigate();
  const [bus, setBus] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBus = async () => {
      try {
        const res = await api.get(`/buses/${busNumber}`);
        setBus(res.data);
      } catch (err) {
        console.error('Error fetching bus detail', err);
      } finally {
        setLoading(false);
      }
    };
    fetchBus();
  }, [busNumber]);

  if (loading) {
    return <div className="p-8 text-center text-textSecondary font-mono">Loading bus telemetry...</div>;
  }

  const currentBus = bus || {
    busNumber: busNumber || 'MH-40-AA-1111',
    capacity: 45,
    currentCount: 0,
    totalIn: 0,
    totalOut: 0,
    loopCount: 1,
    status: 'OFFLINE',
    stops: ['Stop A', 'Stop B', 'Stop C'],
    currentStopIndex: 0
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate('/dashboard')}
          className="flex items-center space-x-2 text-textSecondary hover:text-white transition text-xs font-mono"
        >
          <ArrowLeft size={16} strokeWidth={1.5} />
          <span>Back to Fleet</span>
        </button>

        <div className="flex items-center space-x-3">
          <StatusDot status={currentBus.isHardwareConnected ? 'online' : 'offline'} />
          <span className="font-mono text-sm uppercase text-textSecondary">{currentBus.status}</span>
        </div>
      </div>

      <div className="flex items-baseline space-x-4">
        <h2 className="font-mono text-2xl font-bold text-white">{currentBus.busNumber}</h2>
        <span className="text-xs text-textSecondary font-mono">Route Overview</span>
      </div>

      {/* Main Grid: Gauge + Event Feed */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Passenger Gauge & Stats */}
        <div className="bg-cardBg border border-borderMuted rounded-card p-6 flex flex-col items-center justify-center">
          <h3 className="text-xs font-mono uppercase tracking-wider text-textSecondary mb-2">Live Occupancy</h3>
          <PassengerGauge currentCount={currentBus.currentCount} capacity={currentBus.capacity} />
          
          <div className="grid grid-cols-2 gap-4 w-full mt-4 pt-4 border-t border-borderMuted text-center">
            <div>
              <p className="text-[10px] uppercase font-mono text-textSecondary">Total Boarded</p>
              <p className="font-mono text-lg font-bold text-safe">+{currentBus.totalIn}</p>
            </div>
            <div>
              <p className="text-[10px] uppercase font-mono text-textSecondary">Total Alighted</p>
              <p className="font-mono text-lg font-bold text-danger">-{currentBus.totalOut}</p>
            </div>
          </div>
        </div>

        {/* Middle: Route Progress & Current Location */}
        <div className="bg-cardBg border border-borderMuted rounded-card p-6 flex flex-col justify-between">
          <div>
            <h3 className="text-xs font-mono uppercase tracking-wider text-textSecondary mb-4">Current Stop Progress</h3>
            <RouteProgress stops={currentBus.stops} currentStopIndex={currentBus.currentStopIndex} />
          </div>

          <div className="mt-6 p-4 rounded-btn bg-gray-900 border border-borderMuted">
            <div className="flex items-center space-x-2 text-xs text-safe mb-1">
              <Navigation size={14} strokeWidth={1.5} />
              <span className="font-mono uppercase">Current Station</span>
            </div>
            <p className="text-base font-semibold text-white">
              {currentBus.stops?.[currentBus.currentStopIndex] || 'Departing'}
            </p>
          </div>

          <div className="mt-4 flex items-center justify-between text-xs text-textSecondary">
            <div className="flex items-center space-x-2">
              <Repeat size={14} strokeWidth={1.5} />
              <span>Current Loop: {currentBus.loopCount}</span>
            </div>
          </div>
        </div>

        {/* Right: Live Sensor Event Feed */}
        <div className="bg-cardBg border border-borderMuted rounded-card p-6 flex flex-col">
          <h3 className="text-xs font-mono uppercase tracking-wider text-textSecondary mb-4">Sensor Activity Log</h3>
          <EventFeed events={[]} />
        </div>
      </div>
    </div>
  );
};

export default BusDetail;
