import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Plus,
  Trash2,
  Save,
  Repeat,
  Users,
  MapPin,
  ArrowUp,
  ArrowDown,
  ArrowLeft,
  CheckCircle,
  AlertTriangle
} from 'lucide-react';
import api from '../utils/api';

const RouteEditor = () => {
  const { busNumber: paramBus } = useParams();
  const navigate = useNavigate();
  const busNumber = paramBus || 'MH-40-AA-1111';

  const [bus, setBus] = useState(null);
  const [stops, setStops] = useState([]);
  const [newStop, setNewStop] = useState('');
  const [capacity, setCapacity] = useState(45);
  const [routeType, setRouteType] = useState('loop');
  const [startingStopIndex, setStartingStopIndex] = useState(0);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(null);
  const [error, setError] = useState('');
  const [stopToDelete, setStopToDelete] = useState(null);

  // Load bus route data
  useEffect(() => {
    let isMounted = true;
    const fetchBus = async () => {
      try {
        setLoading(true);
        const res = await api.get(`/buses/${busNumber}`);
        if (isMounted && res.data) {
          setBus(res.data);
          setStops(res.data.stops || []);
          setCapacity(res.data.capacity || 45);
          setRouteType(res.data.routeType || 'loop');
          setStartingStopIndex(res.data.startingStopIndex || 0);
        }
      } catch (err) {
        console.error('Error fetching bus route config:', err);
        if (isMounted) setError(err.response?.data?.message || 'Failed to load bus route');
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchBus();

    return () => {
      isMounted = false;
    };
  }, [busNumber]);

  // Reordering helpers
  const moveStopUp = (index) => {
    if (index <= 0) return;
    const updated = [...stops];
    const temp = updated[index];
    updated[index] = updated[index - 1];
    updated[index - 1] = temp;
    setStops(updated);
  };

  const moveStopDown = (index) => {
    if (index >= stops.length - 1) return;
    const updated = [...stops];
    const temp = updated[index];
    updated[index] = updated[index + 1];
    updated[index + 1] = temp;
    setStops(updated);
  };

  // Add stop
  const handleAddStop = (e) => {
    e.preventDefault();
    const trimmed = newStop.trim();
    if (!trimmed) return;
    if (stops.includes(trimmed)) {
      alert('This station is already present on the route.');
      return;
    }
    setStops([...stops, trimmed]);
    setNewStop('');
  };

  // Confirm remove stop
  const handleConfirmRemove = () => {
    if (stopToDelete === null) return;
    if (stops.length <= 2) {
      alert('A route must have at least 2 stops.');
      setStopToDelete(null);
      return;
    }
    const updated = stops.filter((_, idx) => idx !== stopToDelete);
    setStops(updated);
    if (startingStopIndex >= updated.length) {
      setStartingStopIndex(0);
    }
    setStopToDelete(null);
  };

  // Save changes to API
  const handleSaveRoute = async () => {
    if (stops.length < 2) {
      alert('Please configure at least 2 stops before saving.');
      return;
    }

    try {
      setSaving(true);
      setError('');
      setSaveSuccess(null);

      const payload = {
        stops,
        routeType,
        capacity: Number(capacity),
        startingStopIndex: Number(startingStopIndex)
      };

      const res = await api.put(`/buses/${busNumber}/route`, payload);

      if (res.data) {
        setBus(res.data.bus);
        setSaveSuccess({
          message: 'Route configuration saved and published to fleet telemetry!',
          auditType: res.data.auditLog?.changeType || 'updated'
        });
      }
    } catch (err) {
      console.error('Error saving route configuration:', err);
      setError(err.response?.data?.message || 'Failed to save route configuration.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[400px] flex items-center justify-center">
        <div className="text-center space-y-3">
          <div className="w-8 h-8 border-2 border-safe border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="font-mono text-xs text-textSecondary uppercase tracking-wider">
            Loading Route Architect...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl space-y-6">
      {/* Top Header & Breadcrumb */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-2 border-b border-borderMuted">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => navigate(`/bus/${busNumber}`)}
            className="flex items-center space-x-2 text-textSecondary hover:text-white transition p-2 rounded-btn hover:bg-gray-800/60 font-mono text-xs"
          >
            <ArrowLeft size={18} strokeWidth={1.5} />
            <span>Telemetry View</span>
          </button>

          <div className="h-6 w-px bg-borderMuted" />

          <div>
            <h2 className="font-mono text-2xl font-bold text-white tracking-wide">{busNumber}</h2>
            <p className="text-xs text-textSecondary font-mono mt-0.5">
              Route Management & Capacity Editor
            </p>
          </div>
        </div>
      </div>

      {/* Success Notification */}
      {saveSuccess && (
        <div className="p-4 bg-safe/10 border border-safe/40 rounded-card flex items-center justify-between shadow-glowSafe animate-fadeIn">
          <div className="flex items-center space-x-3">
            <CheckCircle size={20} className="text-safe" strokeWidth={2} />
            <div>
              <p className="text-xs font-semibold text-white">{saveSuccess.message}</p>
              <p className="text-[11px] text-textSecondary font-mono mt-0.5">
                Audit Record Logged: <span className="text-safe uppercase font-bold">{saveSuccess.auditType}</span>
              </p>
            </div>
          </div>
          <button
            onClick={() => setSaveSuccess(null)}
            className="text-textSecondary hover:text-white text-xs font-mono"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Error Banner */}
      {error && (
        <div className="p-4 bg-danger/10 border border-danger/40 rounded-card flex items-center space-x-3 text-danger text-xs font-mono">
          <AlertTriangle size={18} strokeWidth={2} />
          <span>{error}</span>
        </div>
      )}

      {/* Main Form Container */}
      <div className="bg-cardBg border border-borderMuted rounded-card p-6 space-y-6 shadow-xl">
        {/* Row 1: Capacity & Route Type */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          <div>
            <label className="block text-xs font-mono uppercase text-textSecondary mb-2 flex items-center space-x-2">
              <Users size={14} className="text-safe" />
              <span>Passenger Capacity</span>
            </label>
            <input
              type="number"
              min="1"
              max="120"
              value={capacity}
              onChange={(e) => setCapacity(e.target.value)}
              className="w-full bg-gray-900 border border-borderMuted rounded-btn px-3 py-2.5 text-sm text-white font-mono focus:outline-none focus:border-safe"
            />
          </div>

          <div>
            <label className="block text-xs font-mono uppercase text-textSecondary mb-2 flex items-center space-x-2">
              <Repeat size={14} className="text-safe" />
              <span>Route Operation Mode</span>
            </label>
            <select
              value={routeType}
              onChange={(e) => setRouteType(e.target.value)}
              className="w-full bg-gray-900 border border-borderMuted rounded-btn px-3 py-2.5 text-sm text-white font-mono focus:outline-none focus:border-safe"
            >
              <option value="loop">Continuous Loop (Auto-Return)</option>
              <option value="oneway">One-Way Line (Terminus Stop)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-mono uppercase text-textSecondary mb-2 flex items-center space-x-2">
              <MapPin size={14} className="text-safe" />
              <span>Starting Depot Stop</span>
            </label>
            <select
              value={startingStopIndex}
              onChange={(e) => setStartingStopIndex(Number(e.target.value))}
              className="w-full bg-gray-900 border border-borderMuted rounded-btn px-3 py-2.5 text-sm text-white font-mono focus:outline-none focus:border-safe"
            >
              {stops.map((s, idx) => (
                <option key={idx} value={idx}>
                  #{idx + 1} - {s}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Row 2: Add Stop Field */}
        <div className="pt-4 border-t border-borderMuted">
          <label className="block text-xs font-mono uppercase text-textSecondary mb-2">
            Append New Station to Route
          </label>
          <form onSubmit={handleAddStop} className="flex gap-2">
            <input
              type="text"
              value={newStop}
              onChange={(e) => setNewStop(e.target.value)}
              placeholder="e.g. Chatrapati Square, Wardha Road"
              className="flex-1 bg-gray-900 border border-borderMuted rounded-btn px-3 py-2.5 text-sm text-white placeholder-textTertiary focus:outline-none focus:border-safe"
            />
            <button
              type="submit"
              className="bg-safe/20 text-safe border border-safe/40 px-5 py-2.5 rounded-btn text-xs font-mono flex items-center space-x-1.5 hover:bg-safe/30 transition shadow-glowSafe"
            >
              <Plus size={16} strokeWidth={2} />
              <span>Add Stop</span>
            </button>
          </form>
        </div>

        {/* Row 3: Reorderable Stops Sequence */}
        <div className="pt-4 border-t border-borderMuted">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-xs font-mono uppercase tracking-wider text-textSecondary">
              Active Station Sequence ({stops.length} Stations)
            </h3>
            <span className="text-[11px] font-mono text-textTertiary">
              Use arrows to reorder station progression
            </span>
          </div>

          <div className="space-y-2">
            {stops.map((stop, idx) => {
              const isFirst = idx === 0;
              const isLast = idx === stops.length - 1;
              const isStartDepot = idx === startingStopIndex;

              return (
                <div
                  key={idx}
                  className="flex items-center justify-between p-3.5 bg-gray-900 border border-borderMuted rounded-btn hover:border-gray-700 transition"
                >
                  <div className="flex items-center space-x-3">
                    <span className="font-mono text-xs text-textTertiary w-7">#{idx + 1}</span>
                    <span className="text-sm font-medium text-white">{stop}</span>
                    {isStartDepot && (
                      <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-safe/10 text-safe border border-safe/20">
                        Start Depot
                      </span>
                    )}
                    {isLast && routeType === 'loop' && (
                      <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-gray-800 text-warning">
                        Loop Return
                      </span>
                    )}
                  </div>

                  <div className="flex items-center space-x-1.5">
                    {/* Reorder Up */}
                    <button
                      type="button"
                      disabled={isFirst}
                      onClick={() => moveStopUp(idx)}
                      title="Move Up"
                      className="p-1.5 rounded text-textSecondary hover:text-white hover:bg-gray-800 disabled:opacity-30 disabled:hover:bg-transparent transition"
                    >
                      <ArrowUp size={16} strokeWidth={2} />
                    </button>

                    {/* Reorder Down */}
                    <button
                      type="button"
                      disabled={isLast}
                      onClick={() => moveStopDown(idx)}
                      title="Move Down"
                      className="p-1.5 rounded text-textSecondary hover:text-white hover:bg-gray-800 disabled:opacity-30 disabled:hover:bg-transparent transition"
                    >
                      <ArrowDown size={16} strokeWidth={2} />
                    </button>

                    <div className="h-4 w-px bg-borderMuted mx-1" />

                    {/* Remove Stop */}
                    <button
                      type="button"
                      onClick={() => setStopToDelete(idx)}
                      title="Delete Stop"
                      className="p-1.5 rounded text-textSecondary hover:text-danger hover:bg-danger/10 transition"
                    >
                      <Trash2 size={16} strokeWidth={1.5} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Save Route Action */}
        <div className="pt-6 border-t border-borderMuted flex items-center justify-between">
          <p className="text-xs text-textTertiary font-mono">
            Modifications will be logged in the audit trail and broadcast live to conductor terminals.
          </p>
          <button
            type="button"
            disabled={saving}
            onClick={handleSaveRoute}
            className="bg-safe text-darkBg font-bold px-6 py-2.5 rounded-btn text-xs font-mono flex items-center space-x-2 hover:bg-safe/90 transition shadow-glowSafe disabled:opacity-50"
          >
            <Save size={16} strokeWidth={2} />
            <span>{saving ? 'Publishing Changes...' : 'Save & Publish Route'}</span>
          </button>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {stopToDelete !== null && (
        <div className="fixed inset-0 bg-black/85 flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="bg-cardBg border border-borderMuted p-6 rounded-card max-w-sm w-full space-y-4 text-center shadow-2xl">
            <div className="w-12 h-12 rounded-full bg-danger/20 text-danger flex items-center justify-center mx-auto">
              <Trash2 size={24} strokeWidth={2} />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Remove Station?</h3>
              <p className="text-xs text-textSecondary mt-1">
                Are you sure you want to remove <span className="text-white font-semibold">{stops[stopToDelete]}</span> from this bus route?
              </p>
            </div>
            <div className="flex space-x-3 pt-2">
              <button
                type="button"
                onClick={() => setStopToDelete(null)}
                className="flex-1 min-h-[44px] bg-gray-800 hover:bg-gray-700 text-white rounded-btn text-xs font-mono transition"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmRemove}
                className="flex-1 min-h-[44px] bg-danger text-white font-bold rounded-btn text-xs font-mono hover:bg-danger/90 transition"
              >
                Confirm Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RouteEditor;
