import React, { createContext, useContext, useState, useCallback } from 'react';
import { api } from './AuthContext';

const SettingsContext = createContext();

export const SettingsProvider = ({ children }) => {
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchSettings = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get('/admin/settings');
      setSettings(res.data);
    } catch (err) {
      if (err.response && err.response.status === 403) {
        setSettings(null);
        // Optionally show a toast or log: 'You do not have permission to access admin settings.'
      } else {
        setSettings(null);
      }
    }
    setLoading(false);
  }, []);

  React.useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  return (
    <SettingsContext.Provider value={{ settings, loading, refreshSettings: fetchSettings }}>
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = () => useContext(SettingsContext); 