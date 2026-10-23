import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';
import { useToast } from './ToastContext';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      const savedUser = localStorage.getItem('ticking_user');
      return savedUser ? JSON.parse(savedUser) : null;
    } catch {
      return null;
    }
  });
  const [token, setToken] = useState(() => localStorage.getItem('ticking_token') || null);
  const [loading, setLoading] = useState(false);
  const [initializing, setInitializing] = useState(true);
  const { showToast } = useToast();

  // Validate stored token and synchronize with MongoDB on mount
  useEffect(() => {
    const verifySession = async () => {
      const storedToken = localStorage.getItem('ticking_token');
      if (!storedToken) {
        setInitializing(false);
        return;
      }

      // Check client-side expiration if token payload is readable
      try {
        const payloadBase64 = storedToken.split('.')[1];
        if (payloadBase64) {
          const payloadJson = JSON.parse(atob(payloadBase64));
          if (payloadJson.exp && Date.now() >= payloadJson.exp * 1000) {
            console.warn('[AuthContext] Stored token has expired. Clearing session.');
            localStorage.removeItem('ticking_token');
            localStorage.removeItem('ticking_user');
            setUser(null);
            setToken(null);
            setInitializing(false);
            return;
          }
        }
      } catch {
        // Fall back to server verification below
      }

      try {
        const profile = await api.get('/auth/profile');
        if (profile && profile._id) {
          setUser(profile);
          localStorage.setItem('ticking_user', JSON.stringify(profile));
        }
      } catch (err) {
        if (err.status === 401) {
          localStorage.removeItem('ticking_token');
          localStorage.removeItem('ticking_user');
          setUser(null);
          setToken(null);
        }
      } finally {
        setInitializing(false);
      }
    };

    verifySession();
  }, []);

  // Listen for global 401 unauthorized events from api.js
  useEffect(() => {
    const handleUnauthorized = (event) => {
      setUser(null);
      setToken(null);
      localStorage.removeItem('ticking_token');
      localStorage.removeItem('ticking_user');
      const msg = event?.detail?.message || 'Your session has expired. Please sign in again.';
      showToast(msg, 'error');
    };

    if (typeof window !== 'undefined') {
      window.addEventListener('auth:unauthorized', handleUnauthorized);
      return () => window.removeEventListener('auth:unauthorized', handleUnauthorized);
    }
  }, [showToast]);

  const login = async (email, password) => {
    setLoading(true);
    try {
      const data = await api.post('/auth/login', { email, password });
      setUser(data);
      setToken(data.token);
      localStorage.setItem('ticking_token', data.token);
      localStorage.setItem('ticking_user', JSON.stringify(data));
      showToast(`Welcome back, ${data.name}!`, 'success');
      return data;
    } catch (err) {
      showToast(err.message || 'Login failed. Please check credentials.', 'error');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const adminLogin = async (email, password) => {
    setLoading(true);
    try {
      const data = await api.post('/auth/admin/login', { email, password });
      setUser(data);
      setToken(data.token);
      localStorage.setItem('ticking_token', data.token);
      localStorage.setItem('ticking_user', JSON.stringify(data));
      showToast(`Admin authenticated: Welcome ${data.name}`, 'success');
      return data;
    } catch (err) {
      showToast(err.message || 'Admin authentication failed.', 'error');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const register = async (userData) => {
    setLoading(true);
    try {
      const data = await api.post('/auth/register', userData);
      setUser(data);
      setToken(data.token);
      localStorage.setItem('ticking_token', data.token);
      localStorage.setItem('ticking_user', JSON.stringify(data));
      showToast(`Account created successfully! Welcome to TICKING.`, 'success');
      return data;
    } catch (err) {
      showToast(err.message || 'Registration failed.', 'error');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('ticking_token');
    localStorage.removeItem('ticking_user');
    localStorage.removeItem('ticking_cart_guest');
    localStorage.removeItem('ticking_local_cart');
    localStorage.removeItem('ticking_wishlist_guest');
    localStorage.removeItem('ticking_local_wishlist');
    showToast('You have been logged out.', 'info');
  };

  const updateProfile = async (profileData) => {
    setLoading(true);
    try {
      const data = await api.put('/auth/profile', profileData);
      setUser(data);
      localStorage.setItem('ticking_user', JSON.stringify(data));
      showToast('Profile updated successfully!', 'success');
      return data;
    } catch (err) {
      showToast(err.message || 'Failed to update profile.', 'error');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const changePassword = async ({ currentPassword, newPassword, confirmPassword }) => {
    setLoading(true);
    try {
      const data = await api.put('/auth/change-password', {
        currentPassword,
        newPassword,
        confirmPassword
      });
      return data;
    } catch (err) {
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateUser = (updatedUserData) => {
    setUser((prev) => {
      const merged = { ...prev, ...updatedUserData };
      localStorage.setItem('ticking_user', JSON.stringify(merged));
      return merged;
    });
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        initializing,
        isAuthenticated: !!token && !!user,
        isAdmin: !!user && user.role === 'admin',
        login,
        adminLogin,
        register,
        logout,
        updateProfile,
        updateUser,
        changePassword
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
