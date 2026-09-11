import React, { useState } from 'react';
import { Bus, Lock, Mail } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import api from '../utils/api';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { user, login } = useAuth();

  // If already authenticated, redirect based on role
  React.useEffect(() => {
    if (user) {
      if (user.role === 'admin') {
        navigate('/dashboard', { replace: true });
      } else if (user.role === 'conductor') {
        navigate(`/conductor/${user.assignedBus || 'MH-40-AA-1111'}`, { replace: true });
      }
    }
  }, [user, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await api.post('/auth/login', { email, password });
      const { user, token } = response.data;
      login(user, token);

      if (user.role === 'admin') {
        navigate('/dashboard');
      } else if (user.role === 'conductor') {
        navigate(`/conductor/${user.assignedBus || 'MH-40-AA-1111'}`);
      } else {
        navigate('/dashboard');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-darkBg flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-cardBg border border-borderMuted rounded-card p-8 shadow-2xl">
        <div className="flex flex-col items-center mb-8">
          <img src="/logo.svg" alt="BusTrack System" className="h-16 w-16 rounded-2xl mb-3 shadow-glowSafe/30 object-contain" />
          <h1 className="text-2xl font-bold text-white tracking-wide">BusTrack<span className="text-safe">System</span></h1>
          <p className="text-xs text-textSecondary uppercase tracking-widest font-mono mt-1">
            Real-Time Transit Control
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-danger/10 border border-danger/30 text-danger rounded-btn text-xs">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-mono uppercase text-textSecondary mb-1.5">
              Email Address
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-textTertiary">
                <Mail size={16} strokeWidth={1.5} />
              </span>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@bustrack.com"
                className="w-full bg-gray-900 border border-borderMuted rounded-btn pl-10 pr-3 py-2.5 text-sm text-white placeholder-textTertiary focus:outline-none focus:border-safe transition"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-mono uppercase text-textSecondary mb-1.5">
              Password
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-textTertiary">
                <Lock size={16} strokeWidth={1.5} />
              </span>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-gray-900 border border-borderMuted rounded-btn pl-10 pr-3 py-2.5 text-sm text-white placeholder-textTertiary focus:outline-none focus:border-safe transition"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-safe text-darkBg font-semibold py-2.5 px-4 rounded-btn hover:bg-safe/90 transition duration-200 mt-2 text-sm disabled:opacity-50"
          >
            {loading ? 'Authenticating...' : 'Sign In'}
          </button>
        </form>

        <div className="mt-6 pt-6 border-t border-borderMuted text-center">
          <button
            onClick={() => navigate('/track')}
            className="text-xs text-textSecondary hover:text-safe transition font-mono"
          >
            Public Passenger Tracker →
          </button>
        </div>
      </div>
    </div>
  );
};

export default Login;
