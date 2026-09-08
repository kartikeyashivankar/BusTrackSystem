import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  TrendingUp,
  Clock,
  Users,
  Activity,
  AlertTriangle,
  RefreshCw,
  Bus,
  ArrowUpRight,
  ShieldCheck,
  Calendar,
  Layers
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Cell,
  ReferenceLine
} from 'recharts';
import api from '../utils/api';

const Analytics = () => {
  const navigate = useNavigate();

  // State
  const [overview, setOverview] = useState(null);
  const [busiestHours, setBusiestHours] = useState([]);
  const [dailyVolume, setDailyVolume] = useState([]);
  const [fleetOccupancy, setFleetOccupancy] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastSync, setLastSync] = useState(null);

  // Fetch all analytics data
  const fetchAllAnalytics = useCallback(async (manual = false) => {
    if (manual) setIsRefreshing(true);
    try {
      const [ovRes, bhRes, dvRes, foRes] = await Promise.all([
        api.get('/analytics/overview'),
        api.get('/analytics/busiest-hours'),
        api.get('/analytics/daily-volume'),
        api.get('/analytics/fleet-occupancy')
      ]);

      setOverview(ovRes.data);
      setBusiestHours(bhRes.data);
      setDailyVolume(dvRes.data);
      setFleetOccupancy(foRes.data);
      setError(null);
      setLastSync(new Date());
    } catch (err) {
      console.error('Failed to load analytics:', err);
      setError('Unable to synchronize analytics telemetry.');
    } finally {
      setLoading(false);
      if (manual) {
        setTimeout(() => setIsRefreshing(false), 400);
      }
    }
  }, []);

  useEffect(() => {
    fetchAllAnalytics();
    // Auto-refresh analytics every 30 seconds
    const interval = setInterval(() => {
      fetchAllAnalytics();
    }, 30000);
    return () => clearInterval(interval);
  }, [fetchAllAnalytics]);

  // Color helper for occupancy
  const getOccupancyColor = (pct) => {
    if (pct >= 90) return '#ff4d6d'; // danger red
    if (pct >= 70) return '#fbbf24'; // warning amber
    return '#00f5a0'; // safe green
  };

  return (
    <div className="space-y-6 pb-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white tracking-wide">Ridership & Fleet Analytics</h2>
          <p className="text-xs text-textSecondary font-mono mt-0.5">
            Fleet Capacity Utilization, Demand Forecasting & Real-Time Flow Telemetry
          </p>
        </div>

        <div className="flex items-center space-x-3 text-xs font-mono">
          <div className="flex items-center space-x-2 text-textSecondary bg-cardBg border border-borderMuted px-3 py-1.5 rounded-btn">
            <span className="dot dot-online" />
            <span className="hidden sm:inline">Synced:</span>
            <span className="text-white">{lastSync ? lastSync.toLocaleTimeString() : 'Syncing...'}</span>
          </div>

          <button
            onClick={() => fetchAllAnalytics(true)}
            disabled={isRefreshing}
            className="flex items-center space-x-1.5 bg-safe/10 text-safe hover:bg-safe/20 px-3 py-1.5 rounded-btn border border-safe/30 transition active:scale-95 disabled:opacity-50"
          >
            <RefreshCw size={14} className={isRefreshing ? 'animate-spin' : ''} />
            <span>{isRefreshing ? 'Refreshing...' : 'Refresh'}</span>
          </button>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="p-4 bg-danger/10 border border-danger/30 rounded-card text-danger text-xs font-mono flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <AlertTriangle size={16} />
            <span>{error}</span>
          </div>
          <button
            onClick={() => fetchAllAnalytics(true)}
            className="underline hover:text-white transition"
          >
            Retry
          </button>
        </div>
      )}

      {/* KPI Overview Tiles */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Daily Volume */}
        <div className="bg-cardBg border border-borderMuted rounded-card p-4 space-y-2 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase tracking-wider font-mono text-textTertiary">
              Total Boarded Today
            </span>
            <div className="p-2 rounded-lg bg-safe/10 text-safe">
              <TrendingUp size={18} strokeWidth={1.5} />
            </div>
          </div>
          <div className="font-mono text-2xl font-bold text-white">
            {overview?.totalPassengersToday?.toLocaleString() ?? '—'}
          </div>
          <div className="text-[11px] font-mono text-safe flex items-center space-x-1">
            <ShieldCheck size={12} />
            <span>Transit network active</span>
          </div>
        </div>

        {/* Peak Demand Period */}
        <div className="bg-cardBg border border-borderMuted rounded-card p-4 space-y-2 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase tracking-wider font-mono text-textTertiary">
              Peak Demand Window
            </span>
            <div className="p-2 rounded-lg bg-warning/10 text-warning">
              <Clock size={18} strokeWidth={1.5} />
            </div>
          </div>
          <div className="font-mono text-xl font-bold text-white">
            {overview?.peakPeriod ?? '17:00 - 19:00'}
          </div>
          <div className="text-[11px] font-mono text-warning flex items-center space-x-1">
            <Activity size={12} />
            <span>Evening transit rush</span>
          </div>
        </div>

        {/* Avg Fleet Occupancy */}
        <div className="bg-cardBg border border-borderMuted rounded-card p-4 space-y-2 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase tracking-wider font-mono text-textTertiary">
              Avg Fleet Load
            </span>
            <div className="p-2 rounded-lg bg-safe/10 text-safe">
              <Users size={18} strokeWidth={1.5} />
            </div>
          </div>
          <div className="font-mono text-2xl font-bold text-white">
            {overview?.averageFleetOccupancy !== undefined ? `${overview.averageFleetOccupancy}%` : '—'}
          </div>
          <div className="text-[11px] font-mono text-textSecondary flex items-center space-x-1">
            <span>{overview?.currentOnboardPassengers ?? 0} on board / {overview?.totalFleetCapacity ?? 0} cap</span>
          </div>
        </div>

        {/* Total Trips / Loops Today */}
        <div className="bg-cardBg border border-borderMuted rounded-card p-4 space-y-2 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase tracking-wider font-mono text-textTertiary">
              Completed Loops
            </span>
            <div className="p-2 rounded-lg bg-blue-500/10 text-blue-400">
              <Layers size={18} strokeWidth={1.5} />
            </div>
          </div>
          <div className="font-mono text-2xl font-bold text-white">
            {overview?.totalTripsToday ?? '—'}
          </div>
          <div className="text-[11px] font-mono text-textSecondary flex items-center space-x-1">
            <span>{overview?.activeBusesCount ?? 0} of {overview?.totalFleetCount ?? 10} units running</span>
          </div>
        </div>

        {/* Most Crowded Bus */}
        <div className="bg-cardBg border border-borderMuted rounded-card p-4 space-y-2 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase tracking-wider font-mono text-textTertiary">
              Peak Crowded Unit
            </span>
            <div className="p-2 rounded-lg bg-danger/10 text-danger">
              <AlertTriangle size={18} strokeWidth={1.5} />
            </div>
          </div>
          <div className="font-mono text-base font-bold text-white truncate">
            {overview?.mostCrowdedBus?.busNumber ?? 'None'}
          </div>
          <div className="text-[11px] font-mono text-danger flex items-center space-x-1">
            <span>
              {overview?.mostCrowdedBus
                ? `${overview.mostCrowdedBus.occupancyPercentage}% full (${overview.mostCrowdedBus.currentCount} pax)`
                : 'All buses optimal'}
            </span>
          </div>
        </div>
      </div>

      {/* Chart 1: Passenger Flow by Time of Day (Area Chart) */}
      <div className="bg-cardBg border border-borderMuted rounded-card p-5 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-borderMuted pb-3">
          <div>
            <h3 className="text-sm font-bold text-white font-mono flex items-center space-x-2">
              <Clock size={16} className="text-safe" />
              <span>Hourly Passenger Demand (06:00 - 22:00)</span>
            </h3>
            <p className="text-xs text-textSecondary font-mono mt-0.5">
              Ridership distribution across transit operating hours
            </p>
          </div>

          <div className="flex items-center space-x-4 text-xs font-mono">
            <div className="flex items-center space-x-1.5">
              <span className="w-3 h-3 rounded-full bg-safe inline-block" />
              <span className="text-textSecondary">Total Volume</span>
            </div>
            <div className="flex items-center space-x-1.5">
              <span className="w-3 h-0.5 bg-danger inline-block" />
              <span className="text-textSecondary">Peak Threshold</span>
            </div>
          </div>
        </div>

        <div className="h-72 w-full pt-2">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={busiestHours} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="passengerFlowGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#00f5a0" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#00f5a0" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.05)" />
              <XAxis dataKey="hour" stroke="#9ca3af" fontSize={11} tickLine={false} />
              <YAxis stroke="#9ca3af" fontSize={11} tickLine={false} />
              <Tooltip
                content={({ active, payload, label }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload;
                    return (
                      <div className="bg-cardBg border border-borderMuted p-3 rounded-card shadow-xl font-mono text-xs space-y-1">
                        <p className="text-safe font-bold">{label} Window</p>
                        <p className="text-white">Passengers: <span className="font-bold">{data.passengers}</span></p>
                        <p className="text-textSecondary">Avg Occupancy: <span className="text-white">{data.avgOccupancy}%</span></p>
                        {data.isPeak && (
                          <p className="text-danger font-bold text-[10px] uppercase">Peak Demand Period</p>
                        )}
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <ReferenceLine y={300} stroke="#ff4d6d" strokeDasharray="4 4" label={{ value: 'Peak Rush', fill: '#ff4d6d', fontSize: 10, position: 'insideTopRight' }} />
              <Area
                type="monotone"
                dataKey="passengers"
                stroke="#00f5a0"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#passengerFlowGrad)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Grid of 2 Column Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Chart 2: Daily Ridership Volume (7 Days Bar Chart) */}
        <div className="bg-cardBg border border-borderMuted rounded-card p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-borderMuted pb-3">
            <div>
              <h3 className="text-sm font-bold text-white font-mono flex items-center space-x-2">
                <Calendar size={16} className="text-safe" />
                <span>Daily Volume (Past 7 Days)</span>
              </h3>
              <p className="text-xs text-textSecondary font-mono mt-0.5">
                Total passenger boardings per day
              </p>
            </div>
            <span className="text-xs font-mono text-textTertiary">7-Day Aggregation</span>
          </div>

          <div className="h-64 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={dailyVolume} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.05)" />
                <XAxis dataKey="day" stroke="#9ca3af" fontSize={11} tickLine={false} />
                <YAxis stroke="#9ca3af" fontSize={11} tickLine={false} />
                <Tooltip
                  content={({ active, payload, label }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload;
                      return (
                        <div className="bg-cardBg border border-borderMuted p-3 rounded-card shadow-xl font-mono text-xs space-y-1">
                          <p className="text-white font-bold">{data.date} ({label})</p>
                          <p className="text-safe font-semibold">Total Boarded: {data.totalBoarded}</p>
                          <p className="text-textSecondary">Completed Loops: {data.tripsCount}</p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Bar dataKey="totalBoarded" fill="#00f5a0" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 3: Fleet Occupancy Comparison (Per-Bus Bar Chart) */}
        <div className="bg-cardBg border border-borderMuted rounded-card p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-borderMuted pb-3">
            <div>
              <h3 className="text-sm font-bold text-white font-mono flex items-center space-x-2">
                <Bus size={16} className="text-safe" />
                <span>Fleet Unit Occupancy (%)</span>
              </h3>
              <p className="text-xs text-textSecondary font-mono mt-0.5">
                Current passenger load vs certified capacity
              </p>
            </div>
            <div className="flex items-center space-x-2 text-[10px] font-mono">
              <span className="text-safe">Safe &lt;70%</span>
              <span className="text-warning">Warn 70-89%</span>
              <span className="text-danger">Full 90%+</span>
            </div>
          </div>

          <div className="h-64 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={fleetOccupancy} margin={{ top: 10, right: 10, left: -20, bottom: 25 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.05)" />
                <XAxis
                  dataKey="busNumber"
                  stroke="#9ca3af"
                  fontSize={10}
                  tickLine={false}
                  interval={0}
                  angle={-30}
                  textAnchor="end"
                  tickFormatter={(val) => val.replace('MH-40-AA-', 'B-')}
                />
                <YAxis stroke="#9ca3af" fontSize={11} domain={[0, 100]} tickLine={false} unit="%" />
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload;
                      return (
                        <div className="bg-cardBg border border-borderMuted p-3 rounded-card shadow-xl font-mono text-xs space-y-1">
                          <p className="text-white font-bold">{data.busNumber}</p>
                          <p className="text-safe">Occupancy: {data.occupancyPercentage}%</p>
                          <p className="text-textSecondary">Onboard: {data.currentCount} / {data.capacity}</p>
                          <p className="text-textSecondary">Today Total In: {data.totalIn}</p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Bar dataKey="occupancyPercentage" radius={[4, 4, 0, 0]}>
                  {fleetOccupancy.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={getOccupancyColor(entry.occupancyPercentage)} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

      {/* Fleet Utilization Detail Table */}
      <div className="bg-cardBg border border-borderMuted rounded-card overflow-hidden">
        <div className="p-4 border-b border-borderMuted flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-white font-mono flex items-center space-x-2">
              <Activity size={16} className="text-safe" />
              <span>Fleet Telemetry & Operational Metrics</span>
            </h3>
            <p className="text-xs text-textSecondary font-mono mt-0.5">
              Live status, ridership totals, and hardware connectivity across all 10 fleet units
            </p>
          </div>
          <span className="text-xs font-mono text-textSecondary">{fleetOccupancy.length} Units In Fleet</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead className="bg-gray-900 border-b border-borderMuted text-textSecondary uppercase tracking-wider text-[10px]">
              <tr>
                <th className="py-3 px-4">Bus Identifier</th>
                <th className="py-3 px-4">Transit Mode</th>
                <th className="py-3 px-4">Current Load</th>
                <th className="py-3 px-4">Occupancy</th>
                <th className="py-3 px-4">Today Boarded</th>
                <th className="py-3 px-4">Loops Completed</th>
                <th className="py-3 px-4">Hardware Telemetry</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-borderMuted/60">
              {fleetOccupancy.map((b) => (
                <tr key={b.busNumber} className="hover:bg-gray-800/40 transition">
                  <td className="py-3 px-4 font-bold text-white flex items-center space-x-2">
                    <span className={`dot ${b.status === 'ON_THE_WAY' ? 'dot-online' : 'dot-offline'}`} />
                    <span>{b.busNumber}</span>
                  </td>

                  <td className="py-3 px-4">
                    <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-gray-900 border border-borderMuted text-textSecondary">
                      {b.routeType === 'loop' ? 'Loop Transit' : 'Linear Route'}
                    </span>
                  </td>

                  <td className="py-3 px-4 text-textPrimary">
                    <span className="font-bold text-white">{b.currentCount}</span> / {b.capacity} pax
                  </td>

                  <td className="py-3 px-4">
                    <div className="flex items-center space-x-2">
                      <div className="w-16 bg-gray-800 rounded-full h-2 overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-300"
                          style={{
                            width: `${Math.min(100, b.occupancyPercentage)}%`,
                            backgroundColor: getOccupancyColor(b.occupancyPercentage)
                          }}
                        />
                      </div>
                      <span
                        className="font-bold text-[11px]"
                        style={{ color: getOccupancyColor(b.occupancyPercentage) }}
                      >
                        {b.occupancyPercentage}%
                      </span>
                    </div>
                  </td>

                  <td className="py-3 px-4 text-safe font-bold">
                    +{b.totalIn}
                  </td>

                  <td className="py-3 px-4 text-textPrimary">
                    {b.loopCount} loops
                  </td>

                  <td className="py-3 px-4">
                    {b.isHardwareConnected ? (
                      <span className="text-[10px] uppercase font-bold text-safe bg-safe/10 border border-safe/30 px-2 py-0.5 rounded">
                        ESP32 Live
                      </span>
                    ) : (
                      <span className="text-[10px] uppercase font-bold text-textTertiary bg-gray-900 border border-borderMuted px-2 py-0.5 rounded">
                        Simulated
                      </span>
                    )}
                  </td>

                  <td className="py-3 px-4 text-right">
                    <button
                      onClick={() => navigate(`/bus/${b.busNumber}`)}
                      className="text-textSecondary hover:text-safe transition inline-flex items-center space-x-1 p-1"
                      title="Inspect Bus"
                    >
                      <span className="hidden sm:inline">Inspect</span>
                      <ArrowUpRight size={14} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Analytics;
