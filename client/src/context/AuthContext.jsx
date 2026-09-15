import React, { createContext, useContext, useState, useEffect } from 'react';
import { api, setToken, getToken } from '../services/api';
import { connectSocket, disconnectSocket } from '../services/socket';
import { useTheme } from './ThemeContext';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [pendingRequestsCount, setPendingRequestsCount] = useState(0);
  const [unreadNotificationsCount, setUnreadNotificationsCount] = useState(0);
  const { setTheme, setAccent } = useTheme();

  const loadCurrentUser = async () => {
    const token = getToken();
    if (!token) {
      setLoading(false);
      return;
    }

    try {
      const data = await api.get('/auth/me');
      setUser(data.user);
      setSettings(data.settings);
      setPendingRequestsCount(data.pendingRequestsCount || 0);
      setUnreadNotificationsCount(data.unreadNotificationsCount || 0);

      if (data.settings?.theme) setTheme(data.settings.theme);
      if (data.settings?.accent_color) setAccent(data.settings.accent_color);

      connectSocket();
    } catch (err) {
      console.error('Failed to load user session:', err);
      setToken(null);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCurrentUser();

    const handleExpired = () => {
      disconnectSocket();
      setUser(null);
    };

    window.addEventListener('auth:expired', handleExpired);
    return () => window.removeEventListener('auth:expired', handleExpired);
  }, []);

  const login = async (identifier, password) => {
    const data = await api.post('/auth/login', { identifier, password });
    setToken(data.token);
    setUser(data.user);
    connectSocket();
    await loadCurrentUser();
    return data;
  };

  const register = async (formData) => {
    const data = await api.post('/auth/register', formData);
    setToken(data.token);
    setUser(data.user);
    connectSocket();
    await loadCurrentUser();
    return data;
  };

  const logout = async () => {
    try {
      await api.post('/auth/logout', {});
    } catch (e) {
      // Ignore
    }
    disconnectSocket();
    setToken(null);
    setUser(null);
    setSettings(null);
  };

  const updateProfile = async (updates) => {
    const data = await api.put('/users/profile', updates);
    setUser(data.user);
    return data.user;
  };

  const updateSettings = async (updates) => {
    const data = await api.put('/settings', updates);
    setSettings(data.settings);
    if (updates.theme) setTheme(updates.theme);
    if (updates.accent_color) setAccent(updates.accent_color);
    return data.settings;
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        settings,
        loading,
        pendingRequestsCount,
        unreadNotificationsCount,
        setPendingRequestsCount,
        setUnreadNotificationsCount,
        login,
        register,
        logout,
        updateProfile,
        updateSettings,
        refreshMe: loadCurrentUser
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
}
