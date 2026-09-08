import React from 'react';
import { Routes, Route, Navigate, Outlet } from 'react-router-dom';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import BusDetail from './pages/BusDetail';
import RouteEditor from './pages/RouteEditor';
import TripHistory from './pages/TripHistory';
import Analytics from './pages/Analytics';
import Settings from './pages/Settings';
import ConductorPanel from './pages/ConductorPanel';
import PassengerTrack from './pages/PassengerTrack';
import { useAuth } from './hooks/useAuth';

// Protected layout for admin routes with Navbar & Sidebar
const AdminLayout = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return <div className="min-h-screen bg-darkBg flex items-center justify-center font-mono text-xs text-textSecondary">Loading...</div>;
  }

  // If no user is logged in, redirect to login page
  if (!user) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="min-h-screen bg-darkBg text-textPrimary flex flex-col">
      <Navbar />
      <div className="flex flex-1">
        <Sidebar />
        <main className="flex-1 p-6 pb-20 md:pb-6 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

// Protected wrapper for conductor panel (full screen, no sidebar)
const ConductorLayout = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return <div className="min-h-screen bg-darkBg flex items-center justify-center font-mono text-xs text-textSecondary">Loading...</div>;
  }

  if (!user) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
};

function App() {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<Login />} />
      <Route path="/track" element={<PassengerTrack />} />

      {/* Admin Protected Routes */}
      <Route element={<AdminLayout />}>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/bus/:busNumber" element={<BusDetail />} />
        <Route path="/routes/:busNumber" element={<RouteEditor />} />
        <Route path="/history" element={<TripHistory />} />
        <Route path="/analytics" element={<Analytics />} />
        <Route path="/settings" element={<Settings />} />
      </Route>

      {/* Conductor Protected Route */}
      <Route element={<ConductorLayout />}>
        <Route path="/conductor/:busNumber" element={<ConductorPanel />} />
      </Route>

      {/* Catch-all fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
