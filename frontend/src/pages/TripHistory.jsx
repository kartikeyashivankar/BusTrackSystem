import React, { useState, useEffect } from 'react';
import {
  History,
  Calendar,
  Bus as BusIcon,
  Clock,
  Users,
  ChevronLeft,
  ChevronRight,
  RotateCcw,
  MapPin,
  X,
  TrendingUp
} from 'lucide-react';
import api from '../utils/api';

const TripHistory = () => {
  const [trips, setTrips] = useState([]);
  const [buses, setBuses] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filter States
  const [selectedBus, setSelectedBus] = useState('ALL');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // Pagination States
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);

  // Detail Modal State
  const [selectedTrip, setSelectedTrip] = useState(null);

  // Fetch available buses for filter dropdown
  useEffect(() => {
    const fetchBuses = async () => {
      try {
        const res = await api.get('/buses');
        setBuses(res.data || []);
      } catch (err) {
        console.error('Error fetching buses for filter:', err);
      }
    };
    fetchBuses();
  }, []);

  // Fetch trips with filters & pagination
  const fetchTrips = async (page = 1) => {
    try {
      setLoading(true);
      const params = {
        page,
        limit: 10
      };

      if (selectedBus && selectedBus !== 'ALL') {
        params.busNumber = selectedBus;
      }
      if (startDate) {
        params.startDate = startDate;
      }
      if (endDate) {
        params.endDate = endDate;
      }

      const res = await api.get('/trips', { params });

      if (res.data) {
        if (Array.isArray(res.data)) {
          setTrips(res.data);
          setTotalRecords(res.data.length);
          setTotalPages(1);
        } else {
          setTrips(res.data.trips || []);
          setTotalRecords(res.data.pagination?.total || 0);
          setTotalPages(res.data.pagination?.totalPages || 1);
          setCurrentPage(res.data.pagination?.page || 1);
        }
      }
    } catch (err) {
      console.error('Error fetching trip history:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTrips(currentPage);
  }, [currentPage]);

  const handleApplyFilters = (e) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchTrips(1);
  };

  const handleResetFilters = () => {
    setSelectedBus('ALL');
    setStartDate('');
    setEndDate('');
    setCurrentPage(1);
    // Fetch with empty filters
    api.get('/trips', { params: { page: 1, limit: 10 } }).then((res) => {
      setTrips(res.data.trips || res.data || []);
      setTotalRecords(res.data.pagination?.total || (Array.isArray(res.data) ? res.data.length : 0));
      setTotalPages(res.data.pagination?.totalPages || 1);
      setCurrentPage(1);
    });
  };

  const formatDuration = (startTime, endTime) => {
    if (!startTime || !endTime) return '45 mins';
    const start = new Date(startTime);
    const end = new Date(endTime);
    const diffMins = Math.round((end - start) / (1000 * 60));
    return diffMins > 0 ? `${diffMins} mins` : '40 mins';
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-2 border-b border-borderMuted">
        <div>
          <h2 className="text-xl font-bold text-white tracking-wide">Fleet Trip History</h2>
          <p className="text-xs text-textSecondary font-mono">
            Automated Loop Records, Peak Crowd Audits & Station Telemetry
          </p>
        </div>

        <div className="bg-cardBg border border-borderMuted rounded-card px-3.5 py-2 flex items-center space-x-2">
          <History size={16} className="text-safe" strokeWidth={1.5} />
          <span className="font-mono text-xs text-white">
            Total Trips Logged: <strong className="text-safe">{totalRecords}</strong>
          </span>
        </div>
      </div>

      {/* Filter Control Bar */}
      <form
        onSubmit={handleApplyFilters}
        className="bg-cardBg border border-borderMuted rounded-card p-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 items-end"
      >
        {/* Bus Filter */}
        <div>
          <label className="block text-[11px] font-mono uppercase text-textSecondary mb-1.5 flex items-center space-x-1.5">
            <BusIcon size={14} className="text-safe" />
            <span>Select Vehicle</span>
          </label>
          <select
            value={selectedBus}
            onChange={(e) => setSelectedBus(e.target.value)}
            className="w-full bg-gray-900 border border-borderMuted rounded-btn px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-safe"
          >
            <option value="ALL">All Fleet Buses</option>
            {buses.map((b) => (
              <option key={b.busNumber} value={b.busNumber}>
                {b.busNumber}
              </option>
            ))}
          </select>
        </div>

        {/* Start Date */}
        <div>
          <label className="block text-[11px] font-mono uppercase text-textSecondary mb-1.5 flex items-center space-x-1.5">
            <Calendar size={14} className="text-safe" />
            <span>From Date</span>
          </label>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="w-full bg-gray-900 border border-borderMuted rounded-btn px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-safe"
          />
        </div>

        {/* End Date */}
        <div>
          <label className="block text-[11px] font-mono uppercase text-textSecondary mb-1.5 flex items-center space-x-1.5">
            <Calendar size={14} className="text-safe" />
            <span>To Date</span>
          </label>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="w-full bg-gray-900 border border-borderMuted rounded-btn px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-safe"
          />
        </div>

        {/* Action Buttons */}
        <div className="flex space-x-2">
          <button
            type="submit"
            className="flex-1 bg-safe text-darkBg font-bold py-2 px-3 rounded-btn text-xs font-mono hover:bg-safe/90 transition shadow-glowSafe"
          >
            Filter Records
          </button>
          <button
            type="button"
            onClick={handleResetFilters}
            title="Reset Filters"
            className="bg-gray-900 border border-borderMuted text-textSecondary hover:text-white p-2 rounded-btn transition"
          >
            <RotateCcw size={16} strokeWidth={1.5} />
          </button>
        </div>
      </form>

      {/* Trips Table */}
      {loading ? (
        <div className="bg-cardBg border border-borderMuted rounded-card p-8 text-center">
          <div className="w-8 h-8 border-2 border-safe border-t-transparent rounded-full animate-spin mx-auto mb-2" />
          <p className="text-xs font-mono text-textSecondary">Loading trip ledger...</p>
        </div>
      ) : trips.length === 0 ? (
        <div className="bg-cardBg border border-borderMuted rounded-card p-12 text-center space-y-3">
          <History size={40} className="mx-auto text-textTertiary" strokeWidth={1.5} />
          <h3 className="text-base font-medium text-white">No trips recorded yet</h3>
          <p className="text-xs text-textSecondary max-w-sm mx-auto">
            Completed route loops initiated from the conductor mobile terminal will be saved here automatically.
          </p>
        </div>
      ) : (
        <div className="bg-cardBg border border-borderMuted rounded-card overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-gray-900/90 border-b border-borderMuted text-textSecondary font-mono uppercase tracking-wider">
                <tr>
                  <th className="p-3.5 pl-5">Date & Time</th>
                  <th className="p-3.5">Bus Identifier</th>
                  <th className="p-3.5">Loop #</th>
                  <th className="p-3.5">Boarded</th>
                  <th className="p-3.5">Alighted</th>
                  <th className="p-3.5">Peak Crowd</th>
                  <th className="p-3.5">Est. Duration</th>
                  <th className="p-3.5 pr-5 text-right">Station Telemetry</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-borderMuted">
                {trips.map((trip) => {
                  const tripDate = new Date(trip.date || trip.createdAt);
                  return (
                    <tr
                      key={trip._id}
                      onClick={() => setSelectedTrip(trip)}
                      className="hover:bg-gray-800/40 cursor-pointer transition"
                    >
                      <td className="p-3.5 pl-5 text-white font-mono">
                        <div>{tripDate.toLocaleDateString()}</div>
                        <div className="text-[10px] text-textTertiary">
                          {tripDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </td>

                      <td className="p-3.5 font-mono font-bold text-white">
                        <div className="flex items-center space-x-2">
                          <BusIcon size={14} className="text-safe" />
                          <span>{trip.busNumber}</span>
                        </div>
                      </td>

                      <td className="p-3.5 font-mono text-white">
                        <span className="px-2 py-0.5 rounded bg-gray-900 border border-borderMuted">
                          Loop {trip.loopsCompleted || 1}
                        </span>
                      </td>

                      <td className="p-3.5 font-mono text-safe font-semibold">
                        +{trip.totalBoarded || 0}
                      </td>

                      <td className="p-3.5 font-mono text-danger font-semibold">
                        -{trip.totalAlighted || 0}
                      </td>

                      <td className="p-3.5 font-mono text-warning font-semibold">
                        {trip.peakCount || 0} pax
                      </td>

                      <td className="p-3.5 font-mono text-textSecondary">
                        {formatDuration(trip.startTime, trip.endTime)}
                      </td>

                      <td className="p-3.5 pr-5 text-right">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedTrip(trip);
                          }}
                          className="px-3 py-1 rounded bg-safe/10 text-safe border border-safe/20 hover:bg-safe/20 transition font-mono text-[11px]"
                        >
                          View Stops ({trip.stops?.length || 0})
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Pagination Footer */}
          <div className="p-4 bg-gray-900/60 border-t border-borderMuted flex items-center justify-between text-xs font-mono">
            <span className="text-textSecondary">
              Page {currentPage} of {totalPages} ({totalRecords} records)
            </span>

            <div className="flex items-center space-x-2">
              <button
                type="button"
                disabled={currentPage <= 1}
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                className="p-1.5 rounded bg-gray-800 text-textSecondary hover:text-white disabled:opacity-30 transition"
                title="Previous Page"
              >
                <ChevronLeft size={16} strokeWidth={1.5} />
              </button>
              <button
                type="button"
                disabled={currentPage >= totalPages}
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                className="p-1.5 rounded bg-gray-800 text-textSecondary hover:text-white disabled:opacity-30 transition"
                title="Next Page"
              >
                <ChevronRight size={16} strokeWidth={1.5} />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Stop-by-Stop Detail Modal (Document 06 Phase 9) */}
      {selectedTrip && (
        <div className="fixed inset-0 bg-black/85 flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="bg-cardBg border border-borderMuted p-6 rounded-card max-w-lg w-full space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-borderMuted">
              <div>
                <div className="flex items-center space-x-2">
                  <h3 className="font-mono text-lg font-bold text-white">{selectedTrip.busNumber}</h3>
                  <span className="font-mono text-xs px-2 py-0.5 rounded bg-safe/10 text-safe border border-safe/20">
                    Loop {selectedTrip.loopsCompleted || 1}
                  </span>
                </div>
                <p className="text-[11px] text-textSecondary font-mono mt-0.5">
                  Trip Date: {new Date(selectedTrip.date).toLocaleString()}
                </p>
              </div>

              <button
                type="button"
                onClick={() => setSelectedTrip(null)}
                className="p-1.5 text-textSecondary hover:text-white rounded hover:bg-gray-800 transition"
              >
                <X size={18} strokeWidth={1.5} />
              </button>
            </div>

            {/* Trip Snapshot Metrics */}
            <div className="grid grid-cols-3 gap-3 text-center">
              <div className="p-3 bg-gray-900 border border-borderMuted rounded-btn">
                <p className="text-[10px] font-mono uppercase text-textSecondary">Total Boarded</p>
                <p className="font-mono text-base font-bold text-safe">+{selectedTrip.totalBoarded}</p>
              </div>
              <div className="p-3 bg-gray-900 border border-borderMuted rounded-btn">
                <p className="text-[10px] font-mono uppercase text-textSecondary">Total Alighted</p>
                <p className="font-mono text-base font-bold text-danger">-{selectedTrip.totalAlighted}</p>
              </div>
              <div className="p-3 bg-gray-900 border border-borderMuted rounded-btn">
                <p className="text-[10px] font-mono uppercase text-textSecondary">Peak Count</p>
                <p className="font-mono text-base font-bold text-warning">{selectedTrip.peakCount}</p>
              </div>
            </div>

            {/* Stop Sequence Breakdown */}
            <div>
              <h4 className="text-xs font-mono uppercase tracking-wider text-textSecondary mb-2 flex items-center space-x-1.5">
                <MapPin size={14} className="text-safe" />
                <span>Station Occupancy Progression</span>
              </h4>

              <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                {selectedTrip.stops && selectedTrip.stops.length > 0 ? (
                  selectedTrip.stops.map((stop, idx) => (
                    <div
                      key={idx}
                      className="p-3 bg-gray-900 border border-borderMuted rounded-btn flex items-center justify-between text-xs"
                    >
                      <div className="flex items-center space-x-2.5">
                        <span className="font-mono text-[11px] text-textTertiary w-6">#{idx + 1}</span>
                        <span className="font-medium text-white">{stop.stopName}</span>
                      </div>
                      <div className="flex items-center space-x-4 font-mono text-[11px]">
                        <span className="text-textSecondary">
                          {stop.arrivedAt ? new Date(stop.arrivedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '--:--'}
                        </span>
                        <span className="px-2 py-0.5 rounded bg-gray-800 text-safe font-bold">
                          {stop.countAtStop || 0} pax
                        </span>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-textTertiary text-center py-4">No detailed stop logs recorded.</p>
                )}
              </div>
            </div>

            <div className="pt-2 text-right">
              <button
                type="button"
                onClick={() => setSelectedTrip(null)}
                className="bg-gray-800 hover:bg-gray-700 text-white font-mono text-xs px-5 py-2 rounded-btn transition"
              >
                Close Snapshot
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TripHistory;
