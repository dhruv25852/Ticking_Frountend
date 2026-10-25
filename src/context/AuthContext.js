import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';
import { useToast } from './ToastContext';

const AuthContext = createContext();

const getInitialAuth = () => {
  if (typeof window === 'undefined') {
    return { token: null, user: null };
  }

  try {
    // 1. Check active session storage first
    const sessionToken = sessionStorage.getItem('ticking_token');
    const sessionUser = sessionStorage.getItem('ticking_user');
    if (sessionToken && sessionUser) {
      return {
        token: sessionToken,
        user: JSON.parse(sessionUser)
      };
    }

    // 2. Only restore from localStorage if Remember Me was explicitly chosen
    const isRemembered = localStorage.getItem('ticking_remember_me') === 'true';
    if (isRemembered) {
      const localToken = localStorage.getItem('ticking_token');
      const localUser = localStorage.getItem('ticking_user');
      if (localToken && localUser) {
        sessionStorage.setItem('ticking_token', localToken);
        sessionStorage.setItem('ticking_user', localUser);
        return {
          token: localToken,
          user: JSON.parse(localUser)
        };
      }
    } else {
      // Purge any stale or leftover tokens in localStorage
      localStorage.removeItem('ticking_token');
      localStorage.removeItem('ticking_user');
    }
  } catch (err) {
    console.error('[AuthContext] Error parsing initial auth state:', err);
  }

  return { token: null, user: null };
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => getInitialAuth().user);
  const [token, setToken] = useState(() => getInitialAuth().token);
  const [loading, setLoading] = useState(false);
  const [initializing, setInitializing] = useState(true);
  const { showToast } = useToast();

  // Validate stored token and synchronize with MongoDB on mount
  useEffect(() => {
    const verifySession = async () => {
      const isRemembered = localStorage.getItem('ticking_remember_me') === 'true';
      const storedToken =
        sessionStorage.getItem('ticking_token') ||
        (isRemembered ? localStorage.getItem('ticking_token') : null);

      if (!storedToken) {
        if (!isRemembered) {
          localStorage.removeItem('ticking_token');
          localStorage.removeItem('ticking_user');
        }
        setUser(null);
        setToken(null);
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
            sessionStorage.removeItem('ticking_token');
            sessionStorage.removeItem('ticking_user');
            localStorage.removeItem('ticking_token');
            localStorage.removeItem('ticking_user');
            localStorage.removeItem('ticking_remember_me');
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
          sessionStorage.setItem('ticking_user', JSON.stringify(profile));
          if (localStorage.getItem('ticking_remember_me') === 'true') {
            localStorage.setItem('ticking_user', JSON.stringify(profile));
          }
        }
      } catch (err) {
        if (err.status === 401) {
          sessionStorage.removeItem('ticking_token');
          sessionStorage.removeItem('ticking_user');
          localStorage.removeItem('ticking_token');
          localStorage.removeItem('ticking_user');
          localStorage.removeItem('ticking_remember_me');
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
      if (typeof sessionStorage !== 'undefined') {
        sessionStorage.removeItem('ticking_token');
        sessionStorage.removeItem('ticking_user');
      }
      if (typeof localStorage !== 'undefined') {
        localStorage.removeItem('ticking_token');
        localStorage.removeItem('ticking_user');
        localStorage.removeItem('ticking_remember_me');
      }
      const msg = event?.detail?.message || 'Your session has expired. Please sign in again.';
      showToast(msg, 'error');
    };

    if (typeof window !== 'undefined') {
      window.addEventListener('auth:unauthorized', handleUnauthorized);
      return () => window.removeEventListener('auth:unauthorized', handleUnauthorized);
    }
  }, [showToast]);

  const login = async (email, password, remember = false) => {
    setLoading(true);
    try {
      const data = await api.post('/auth/login', { email, password });
      setUser(data);
      setToken(data.token);

      if (remember) {
        localStorage.setItem('ticking_remember_me', 'true');
        localStorage.setItem('ticking_token', data.token);
        localStorage.setItem('ticking_user', JSON.stringify(data));
        sessionStorage.setItem('ticking_token', data.token);
        sessionStorage.setItem('ticking_user', JSON.stringify(data));
      } else {
        localStorage.removeItem('ticking_remember_me');
        localStorage.removeItem('ticking_token');
        localStorage.removeItem('ticking_user');
        sessionStorage.setItem('ticking_token', data.token);
        sessionStorage.setItem('ticking_user', JSON.stringify(data));
      }

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

      // Admin portal is session-only; not persisted into localStorage
      sessionStorage.setItem('ticking_token', data.token);
      sessionStorage.setItem('ticking_user', JSON.stringify(data));
      localStorage.removeItem('ticking_remember_me');
      localStorage.removeItem('ticking_token');
      localStorage.removeItem('ticking_user');

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

      sessionStorage.setItem('ticking_token', data.token);
      sessionStorage.setItem('ticking_user', JSON.stringify(data));
      localStorage.removeItem('ticking_remember_me');
      localStorage.removeItem('ticking_token');
      localStorage.removeItem('ticking_user');

      showToast(`Account created successfully! Welcome to TICKING.`, 'success');
      return data;
    } catch (err) {
      showToast(err.message || 'Registration failed.', 'error');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      await api.post('/auth/logout');
    } catch {
      // Ignore network errors during logout
    }

    setUser(null);
    setToken(null);

    if (typeof sessionStorage !== 'undefined') {
      sessionStorage.removeItem('ticking_token');
      sessionStorage.removeItem('ticking_user');
      sessionStorage.clear();
    }

    if (typeof localStorage !== 'undefined') {
      localStorage.removeItem('ticking_token');
      localStorage.removeItem('ticking_user');
      localStorage.removeItem('ticking_remember_me');
      localStorage.removeItem('ticking_cart_guest');
      localStorage.removeItem('ticking_local_cart');
      localStorage.removeItem('ticking_wishlist_guest');
      localStorage.removeItem('ticking_local_wishlist');
    }

    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('auth:logout'));
    }

    showToast('You have been logged out.', 'info');
  };

  const updateProfile = async (profileData) => {
    setLoading(true);
    try {
      const data = await api.put('/auth/profile', profileData);
      setUser(data);
      sessionStorage.setItem('ticking_user', JSON.stringify(data));
      if (localStorage.getItem('ticking_remember_me') === 'true') {
        localStorage.setItem('ticking_user', JSON.stringify(data));
      }
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

  const deleteAccount = async (password) => {
    setLoading(true);
    try {
      const data = await api.post('/auth/delete-account', { password });

      // Clean up auth state immediately
      setUser(null);
      setToken(null);

      if (typeof sessionStorage !== 'undefined') {
        sessionStorage.removeItem('ticking_token');
        sessionStorage.removeItem('ticking_user');
        sessionStorage.clear();
      }

      if (typeof localStorage !== 'undefined') {
        localStorage.removeItem('ticking_token');
        localStorage.removeItem('ticking_user');
        localStorage.removeItem('ticking_remember_me');
        localStorage.removeItem('ticking_cart_guest');
        localStorage.removeItem('ticking_local_cart');
        localStorage.removeItem('ticking_wishlist_guest');
        localStorage.removeItem('ticking_local_wishlist');
      }

      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('auth:logout'));
      }

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
      sessionStorage.setItem('ticking_user', JSON.stringify(merged));
      if (localStorage.getItem('ticking_remember_me') === 'true') {
        localStorage.setItem('ticking_user', JSON.stringify(merged));
      }
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
        changePassword,
        deleteAccount
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
