import React, { createContext, useState, useEffect } from 'react';
import api from '../utils/api';

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => sessionStorage.getItem('token') || null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initializeAuth = async () => {
      // Purge any legacy persistent localStorage auth to prevent unexpected direct-login
      localStorage.removeItem('token');
      localStorage.removeItem('user');

      const savedToken = sessionStorage.getItem('token');
      const savedUser = sessionStorage.getItem('user');

      if (savedToken && savedUser) {
        try {
          // Validate token strictly with backend before trusting session
          const res = await api.get('/auth/me', {
            headers: { Authorization: `Bearer ${savedToken}` }
          });
          if (res.data) {
            setUser(res.data);
            setToken(savedToken);
            sessionStorage.setItem('user', JSON.stringify(res.data));
          } else {
            throw new Error('Invalid user payload');
          }
        } catch (err) {
          console.warn('Session expired or invalid, logging out', err.message);
          sessionStorage.removeItem('token');
          sessionStorage.removeItem('user');
          setToken(null);
          setUser(null);
        }
      } else {
        sessionStorage.removeItem('token');
        sessionStorage.removeItem('user');
        setToken(null);
        setUser(null);
      }
      setLoading(false);
    };

    initializeAuth();
  }, []);

  const login = (userData, authToken) => {
    sessionStorage.setItem('token', authToken);
    sessionStorage.setItem('user', JSON.stringify(userData));
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setToken(authToken);
    setUser(userData);
  };

  const logout = () => {
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('user');
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
