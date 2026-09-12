import { createContext, useContext, useState } from 'react';

const AlertContext = createContext();

const STORAGE_KEY = 'disasterAlerts';

// ✅ SIMULATE API DELAY - Makes it look like real cloud calls
const simulateDelay = (ms = 800) => new Promise(resolve => setTimeout(resolve, ms));

const loadInitialAlerts = () => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      return JSON.parse(saved);
    }
  } catch (e) {
    console.error('Failed to load alerts:', e);
  }
  return [];
};

export const AlertProvider = ({ children }) => {
  const [alerts, setAlerts] = useState(loadInitialAlerts);
  const [loading, setLoading] = useState(false);

  // Save to localStorage whenever alerts change
  const saveToLocalStorage = (data) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    window.dispatchEvent(new Event('disasterDataUpdated'));
  };

  // ✅ BROADCAST NEW ALERT - WITH API DELAY
  const broadcastAlert = async (alertData) => {
    setLoading(true);
    try {
      // ✅ SIMULATE API DELAY (1.2 seconds)
      await simulateDelay(1200);

      const newAlert = {
        id: `alert-${Date.now()}`,
        type: alertData.type || 'Emergency Alert',
        severity: alertData.severity || 'Critical',
        title: alertData.title || 'Emergency Alert',
        message: alertData.message || 'Please stay safe and follow local guidance.',
        locations: alertData.locations?.length > 0 ? alertData.locations : ['All Areas'],
        timestamp: new Date().toISOString(),
        status: 'Active',
        createdBy: alertData.createdBy || 'Admin',
        recipients: alertData.recipients || 2840,
      };

      const updated = [newAlert, ...alerts];
      setAlerts(updated);
      saveToLocalStorage(updated);

      console.log(`✅ Alert broadcasted! ID: ${newAlert.id}, Severity: ${newAlert.severity}`);

      setLoading(false);
      return newAlert;
    } catch (error) {
      console.error(error);
      setLoading(false);
      return null;
    }
  };

  // ✅ CANCEL ALERT - WITH DELAY
  const cancelAlert = async (id) => {
    setLoading(true);
    await simulateDelay(600);

    const updated = alerts.map(a =>
      a.id === id ? { ...a, status: 'Cancelled', cancelledAt: new Date().toISOString() } : a
    );
    setAlerts(updated);
    saveToLocalStorage(updated);

    console.log(`✅ Alert ${id} cancelled`);
    setLoading(false);
  };

  // ✅ UPDATE ALERT - WITH DELAY
  const updateAlert = async (id, patch) => {
    setLoading(true);
    await simulateDelay(800);

    const updated = alerts.map(a =>
      a.id === id ? { ...a, ...patch, updatedAt: new Date().toISOString() } : a
    );
    setAlerts(updated);
    saveToLocalStorage(updated);

    console.log(`✅ Alert ${id} updated`);
    setLoading(false);
  };

  // ✅ DELETE ALERT - WITH DELAY
  const deleteAlert = async (id) => {
    setLoading(true);
    await simulateDelay(600);

    const updated = alerts.filter(a => a.id !== id);
    setAlerts(updated);
    saveToLocalStorage(updated);

    console.log(`✅ Alert ${id} deleted`);
    setLoading(false);
  };

  // ✅ DERIVED: Active alerts only
  const activeAlerts = alerts.filter(a => a.status === 'Active');

  // ✅ DERIVED: Latest active alert
  const latestAlert = activeAlerts[0] || null;

  return (
    <AlertContext.Provider
      value={{
        alerts,
        activeAlerts,
        latestAlert,
        loading,
        broadcastAlert,
        cancelAlert,
        updateAlert,
        deleteAlert,
      }}
    >
      {children}
    </AlertContext.Provider>
  );
};

export const useAlerts = () => {
  const context = useContext(AlertContext);
  if (!context) {
    throw new Error('useAlerts must be used within an AlertProvider');
  }
  return context;
};