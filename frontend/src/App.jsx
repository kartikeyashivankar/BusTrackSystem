import React from 'react';
import { Routes, Route, Navigate, Outlet } from 'react-router-dom';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import BusDetail from './pages/BusDetail';
import RouteEditor from './pages/RouteEditor';
import TripHistory from './pages/TripHistory';
import Analytics from './pages/Analytics';
import Settings from './pages/Settings';
import ConductorPanel from './pages/ConductorPanel';
import PassengerTrack from './pages/PassengerTrack';

// Layout for admin pages (Includes top Navbar and left Sidebar)
const AdminLayout = () => {
  return (
    <ProtectedRoute allowedRoles={['admin']}>
      <div className="min-h-screen bg-darkBg text-textPrimary flex flex-col">
        <Navbar />
        <div className="flex flex-1">
          <Sidebar />
          <main className="flex-1 p-6 pb-20 md:pb-6 overflow-y-auto">
            <Outlet />
          </main>
        </div>
      </div>
    </ProtectedRoute>
  );
};

// Layout for conductor terminal (Full screen mobile optimized, no sidebar)
const ConductorLayout = () => {
  return (
    <ProtectedRoute allowedRoles={['conductor', 'admin']}>
      <Outlet />
    </ProtectedRoute>
  );
};

function App() {
  return (
    <Routes>
      {/* Public Pages */}
      <Route path="/" element={<Login />} />
      <Route path="/track" element={<PassengerTrack />} />
      <Route path="/track/:busNumber" element={<PassengerTrack />} />

      {/* Admin Protected Pages */}
      <Route element={<AdminLayout />}>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/bus/:busNumber" element={<BusDetail />} />
        <Route path="/routes/:busNumber" element={<RouteEditor />} />
        <Route path="/history" element={<TripHistory />} />
        <Route path="/analytics" element={<Analytics />} />
        <Route path="/settings" element={<Settings />} />
      </Route>

      {/* Conductor Protected Page */}
      <Route element={<ConductorLayout />}>
        <Route path="/conductor/:busNumber" element={<ConductorPanel />} />
      </Route>

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
