import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LayoutDashboard, AlertTriangle, Users, Bus as BusIcon } from 'lucide-react';
import BusCard from '../components/BusCard';
import api from '../utils/api';
import { useWebSocket } from '../hooks/useWebSocket';

const Dashboard = () => {
  const navigate = useNavigate();
  const { lastMessage } = useWebSocket();
  const [buses, setBuses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBuses = async () => {
      try {
        const response = await api.get('/buses');
        setBuses(response.data || []);
      } catch (err) {
        console.error('Error fetching buses', err);
      } finally {
        setLoading(false);
      }
    };
    fetchBuses();
  }, []);

  // Handle WebSocket updates
  useEffect(() => {
    if (lastMessage && lastMessage.type === 'BUS_UPDATE') {
      setBuses((prev) =>
        prev.map((bus) =>
          bus.busNumber === lastMessage.data.busNumber ? { ...bus, ...lastMessage.data } : bus
        )
      );
    }
  }, [lastMessage]);

  const totalPassengers = buses.reduce((acc, b) => acc + (b.currentCount || 0), 0);
  const activeBuses = buses.filter((b) => b.isHardwareConnected).length;
  const fullBuses = buses.filter((b) => b.capacity > 0 && b.currentCount / b.capacity >= 0.9).length;

  return (
    <div className="space-y-6">
      {/* Top Header & Stats */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-bold text-white tracking-wide">Fleet Operations Dashboard</h2>
          <p className="text-xs text-textSecondary font-mono">Live Monitoring (10 Buses)</p>
        </div>

        <div className="grid grid-cols-3 gap-3 w-full sm:w-auto">
          <div className="bg-cardBg border border-borderMuted rounded-card p-3 flex items-center space-x-3">
            <BusIcon size={18} className="text-safe" strokeWidth={1.5} />
            <div>
              <p className="text-[10px] text-textSecondary uppercase font-mono">Active</p>
              <p className="font-mono text-base font-bold text-white">{activeBuses} / {buses.length || 10}</p>
            </div>
          </div>

          <div className="bg-cardBg border border-borderMuted rounded-card p-3 flex items-center space-x-3">
            <Users size={18} className="text-safe" strokeWidth={1.5} />
            <div>
              <p className="text-[10px] text-textSecondary uppercase font-mono">Onboard</p>
              <p className="font-mono text-base font-bold text-white">{totalPassengers}</p>
            </div>
          </div>

          <div className="bg-cardBg border border-borderMuted rounded-card p-3 flex items-center space-x-3">
            <AlertTriangle size={18} className={fullBuses > 0 ? 'text-danger' : 'text-textTertiary'} strokeWidth={1.5} />
            <div>
              <p className="text-[10px] text-textSecondary uppercase font-mono">Full</p>
              <p className="font-mono text-base font-bold text-white">{fullBuses}</p>
            </div>
          </div>
        </div>
      </div>

      {/* 10 Bus Cards Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-60 bg-cardBg/50 border border-borderMuted rounded-card animate-pulse" />
          ))}
        </div>
      ) : buses.length === 0 ? (
        <div className="bg-cardBg border border-borderMuted rounded-card p-12 text-center">
          <BusIcon size={40} className="mx-auto text-textTertiary mb-3" strokeWidth={1.5} />
          <h3 className="text-base font-medium text-white mb-1">No Buses Registered</h3>
          <p className="text-xs text-textSecondary">Initialize buses in MongoDB or run seed script.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {buses.map((bus) => (
            <BusCard
              key={bus.busNumber}
              bus={bus}
              onClick={() => navigate(`/bus/${bus.busNumber}`)}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default Dashboard;
