import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LayoutDashboard, AlertTriangle, Users, Bus as BusIcon, ChevronDown, Radio } from 'lucide-react';
import BusCard from '../components/BusCard';
import api from '../utils/api';
import { useWebSocket } from '../hooks/useWebSocket';

const Dashboard = () => {
  const navigate = useNavigate();
  const { lastMessage } = useWebSocket();
  const [buses, setBuses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [switchingTarget, setSwitchingTarget] = useState(false);
  const [hardwareInfo, setHardwareInfo] = useState({
    connected: false,
    port: 'COM3',
    targetBus: 'MH-40-AA-1111'
  });

  const handleTargetBusChange = async (e) => {
    const newBusNumber = e.target.value;
    if (!newBusNumber || newBusNumber === hardwareInfo.targetBus) return;

    try {
      setSwitchingTarget(true);
      const res = await api.post('/hardware/target', { busNumber: newBusNumber });
      if (res.data) {
        setHardwareInfo((prev) => ({
          ...prev,
          targetBus: newBusNumber
        }));
        // Update buses so selected bus is online (if hardware connected) and others offline
        setBuses((prev) =>
          prev.map((bus) => ({
            ...bus,
            isHardwareConnected: bus.busNumber === newBusNumber ? hardwareInfo.connected : false
          }))
        );
      }
    } catch (err) {
      console.error('Error switching target bus:', err);
      alert(err.response?.data?.message || 'Failed to switch monitored bus');
    } finally {
      setSwitchingTarget(false);
    }
  };

  const fetchBusesAndHardware = async () => {
    try {
      const [busesRes, hwRes] = await Promise.allSettled([
        api.get('/buses'),
        api.get('/hardware/status')
      ]);

      if (busesRes.status === 'fulfilled') {
        setBuses(busesRes.value.data || []);
      }
      if (hwRes.status === 'fulfilled' && hwRes.value.data) {
        setHardwareInfo({
          connected: !!hwRes.value.data.isConnected,
          port: hwRes.value.data.port || 'COM3',
          targetBus: hwRes.value.data.targetBus || 'MH-40-AA-1111'
        });
      }
    } catch (err) {
      console.error('Error fetching dashboard data', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBusesAndHardware();
  }, []);

  // Handle WebSocket updates
  useEffect(() => {
    if (!lastMessage) return;

    if (lastMessage.type === 'BUS_UPDATE' && lastMessage.data) {
      setBuses((prev) =>
        prev.map((bus) =>
          bus.busNumber === lastMessage.data.busNumber ? { ...bus, ...lastMessage.data } : bus
        )
      );
    } else if (lastMessage.type === 'FLEET_UPDATE' && Array.isArray(lastMessage.data)) {
      setBuses(lastMessage.data);
    } else if (lastMessage.type === 'HARDWARE_STATUS') {
      setHardwareInfo({
        connected: !!lastMessage.connected,
        port: lastMessage.port || 'COM3',
        targetBus: lastMessage.busNumber || lastMessage.targetBus || 'MH-40-AA-1111'
      });
      if (lastMessage.data) {
        setBuses((prev) =>
          prev.map((bus) =>
            bus.busNumber === lastMessage.data.busNumber
              ? { ...bus, ...lastMessage.data }
              : { ...bus, isHardwareConnected: false }
          )
        );
      }
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
            <BusIcon size={18} className={hardwareInfo.connected ? 'text-safe' : 'text-textTertiary'} strokeWidth={1.5} />
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
            <AlertTriangle size={18} className={fullBuses > 0 ? 'text-danger animate-pulse' : 'text-textTertiary'} strokeWidth={1.5} />
            <div>
              <p className="text-[10px] text-textSecondary uppercase font-mono">Full</p>
              <p className="font-mono text-base font-bold text-white">{fullBuses}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Hardware Status Banner (Shows Online when USB is connected, Offline when disconnected) */}
      <div className={`p-4 border rounded-card flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs font-mono transition-all ${
        hardwareInfo.connected
          ? 'bg-safe/10 border-safe/30 shadow-glowSafe/20'
          : 'bg-cardBg border-borderMuted'
      }`}>
        <div className="flex items-center space-x-3">
          <div className="relative flex items-center justify-center">
            <span className={`h-3 w-3 rounded-full ${hardwareInfo.connected ? 'bg-safe animate-pulse' : 'bg-danger'}`} />
            {hardwareInfo.connected && (
              <span className="absolute h-4 w-4 rounded-full bg-safe/40 animate-ping" />
            )}
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className={`font-bold uppercase tracking-wider ${hardwareInfo.connected ? 'text-safe text-sm' : 'text-danger text-sm'}`}>
                {hardwareInfo.connected ? 'Hardware Online' : 'Hardware Offline'}
              </span>
              <span className="text-textTertiary text-[11px]">
                ({hardwareInfo.port || 'COM3'} @ 115200 baud)
              </span>
            </div>
            <p className="text-textSecondary text-[11px] mt-0.5">
              {hardwareInfo.connected
                ? `USB Serial connected. Monitoring active bus ${hardwareInfo.targetBus}.`
                : 'USB cable disconnected. Connect ESP32 via USB to enable physical sensor counting.'}
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2.5 w-full sm:w-auto justify-between sm:justify-end">
          <label htmlFor="target-bus-select" className="text-[11px] text-textSecondary uppercase font-mono tracking-wider cursor-pointer flex items-center space-x-1.5">
            <Radio size={13} className={hardwareInfo.connected ? 'text-safe animate-pulse' : 'text-textTertiary'} strokeWidth={2} />
            <span>Select Bus to Monitor:</span>
          </label>
          <div className="relative">
            <select
              id="target-bus-select"
              value={hardwareInfo.targetBus || ''}
              onChange={handleTargetBusChange}
              disabled={switchingTarget}
              title="Select which bus receives physical hardware sensor events"
              className={`font-mono font-bold text-xs rounded-btn py-1.5 pl-3 pr-8 appearance-none cursor-pointer focus:outline-none transition border shadow-md ${
                hardwareInfo.connected
                  ? 'bg-safe text-darkBg border-safe shadow-glowSafe/30 hover:bg-safe/90 font-bold'
                  : 'bg-gray-800 text-white border-borderMuted hover:border-gray-600'
              } disabled:opacity-50`}
            >
              {buses.map((b) => (
                <option key={b.busNumber} value={b.busNumber} className="bg-gray-900 text-white font-mono py-1">
                  {b.busNumber}
                </option>
              ))}
            </select>
            <ChevronDown
              size={14}
              className={`absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none transition ${
                hardwareInfo.connected ? 'text-darkBg stroke-[2.5]' : 'text-textSecondary'
              }`}
            />
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
              isMonitored={bus.busNumber === hardwareInfo.targetBus}
              onClick={() => navigate(`/bus/${bus.busNumber}`)}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default Dashboard;
