import React, { createContext, useContext, useState, useCallback } from 'react';
import { login as apiLogin, register as apiRegister, getMe, updateProfile as apiUpdateProfile } from '../services/api';
import toast from 'react-hot-toast';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try { const u = localStorage.getItem('user'); return u ? JSON.parse(u) : null; }
    catch { return null; }
  });
  const [loading, setLoading] = useState(false);

  const saveUser = (userData, token) => {
    localStorage.setItem('user', JSON.stringify(userData));
    if (token) localStorage.setItem('token', token);
    setUser(userData);
  };

  const login = async (credentials) => {
    setLoading(true);
    try {
      const { data } = await apiLogin(credentials);
      saveUser(data.user, data.token);
      toast.success(`Welcome back, ${data.user.name}!`);
      return data.user;
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed');
      throw err;
    } finally { setLoading(false); }
  };

  const register = async (userData) => {
    setLoading(true);
    try {
      const { data } = await apiRegister(userData);
      saveUser(data.user, data.token);
      toast.success('Account created successfully!');
      return data.user;
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed');
      throw err;
    } finally { setLoading(false); }
  };

  const logout = useCallback(() => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    setUser(null);
    toast.success('Signed out');
  }, []);

  const refreshUser = useCallback(async () => {
    try {
      const { data } = await getMe();
      saveUser(data.user, null);
    } catch { logout(); }
  }, [logout]);

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, refreshUser, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be inside AuthProvider');
  return ctx;
};
