import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../services/api';

const DEFAULT_SETTINGS = {
  storeName: 'TICKING LUXARY WATCH',
  currency: 'INR (₹)',
  taxRate: 5,
  shippingPolicy: 'Free Worldwide Insured Shipping',
  supportEmail: 'ticking@gmail.com',
  phone: '9909225852'
};

const SettingsContext = createContext({
  settings: DEFAULT_SETTINGS,
  loading: false,
  updateSettings: async () => {},
  refreshSettings: async () => {}
});

export const SettingsProvider = ({ children }) => {
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);
  const [loading, setLoading] = useState(true);

  const applyDocumentBranding = useCallback((brandName) => {
    if (typeof document !== 'undefined') {
      const baseTitle = brandName || 'TICKING LUXARY WATCH';
      // If current title doesn't contain the brand, or is default, set brand
      if (!document.title || document.title.includes('TICKING')) {
        document.title = `${baseTitle} — Timeless Luxury & Haute Horlogerie`;
      }
    }
  }, []);

  const fetchSettings = useCallback(async () => {
    try {
      const data = await api.get('/settings');
      if (data && data.storeName) {
        setSettings({
          storeName: data.storeName || DEFAULT_SETTINGS.storeName,
          currency:
            data.currency && !data.currency.includes('?') ? data.currency : DEFAULT_SETTINGS.currency,
          taxRate: typeof data.taxRate === 'number' ? data.taxRate : DEFAULT_SETTINGS.taxRate,
          shippingPolicy: data.shippingPolicy || DEFAULT_SETTINGS.shippingPolicy,
          supportEmail: data.supportEmail || DEFAULT_SETTINGS.supportEmail,
          phone: data.phone || DEFAULT_SETTINGS.phone
        });
        applyDocumentBranding(data.storeName);
      }
    } catch (err) {
      console.warn('[SettingsContext] Failed to load settings from server, using defaults:', err.message);
      applyDocumentBranding(DEFAULT_SETTINGS.storeName);
    } finally {
      setLoading(false);
    }
  }, [applyDocumentBranding]);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  const updateSettings = async (newSettings) => {
    const response = await api.put('/settings', newSettings);
    const updated = response?.settings || response;
    if (updated) {
      setSettings((prev) => ({
        ...prev,
        ...updated,
        currency:
          updated.currency && !updated.currency.includes('?')
            ? updated.currency
            : DEFAULT_SETTINGS.currency
      }));
      if (updated.storeName) {
        applyDocumentBranding(updated.storeName);
      }
    }
    return response;
  };

  return (
    <SettingsContext.Provider
      value={{
        settings,
        loading,
        updateSettings,
        refreshSettings: fetchSettings
      }}
    >
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
};

export default SettingsContext;
