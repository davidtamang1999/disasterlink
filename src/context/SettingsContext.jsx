import { createContext, useContext, useState, useEffect } from "react";

const SettingsContext = createContext();

const STORAGE_KEY = "systemSettings";

// ✅ SIMULATE API DELAY
const simulateDelay = (ms = 600) => new Promise((resolve) => setTimeout(resolve, ms));

// Default settings — single source of truth
const DEFAULT_SETTINGS = {
  systemName: "DisasterLink Admin",
  defaultLocation: "Kathmandu Valley (Primary)",
  systemDescription:
    "Primary command and control system for coordinating emergency response units across the Kathmandu Valley municipal sectors.",
  timeZone: "Asia/Kathmandu (NPT +05:45)",
  dateFormat: "YYYY-MM-DD (ISO)",
  autoEscalation: true,
  floodWarnings: true,
  shelterOverride: false,
  criticalThreshold: "15",
  autoAssignVolunteers: true,
  requireVerification: true,
  smsEnabled: true,
  pushEnabled: true,
  emailEnabled: false,
  alertRetention: "30",
  mapProvider: "Google Maps",
  defaultZoom: "12",
  showHeatmap: true,
  resourceThreshold: "20",
  autoReorder: false,
  shelterUpdateInterval: "5",
  sessionTimeout: "60",
  twoFactorAuth: false,
  auditRetention: "365",
};

const loadInitialSettings = () => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      return { ...DEFAULT_SETTINGS, ...parsed };
    }
  } catch (e) {
    console.error("Failed to load settings:", e);
  }
  return DEFAULT_SETTINGS;
};

export const SettingsProvider = ({ children }) => {
  const [settings, setSettings] = useState(loadInitialSettings);
  const [loading, setLoading] = useState(false);

  // Persist on first mount so storage is always seeded
  useEffect(() => {
    try {
      if (!localStorage.getItem(STORAGE_KEY)) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
      }
    } catch (e) {
      console.error("Failed to seed settings:", e);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ---------- Persist helper ----------
  const saveToLocalStorage = (data) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    window.dispatchEvent(new Event("disasterDataUpdated"));
  };

  // ---------- Update one field ----------
  const updateSetting = (key, value) => {
    setSettings((prev) => {
      const next = { ...prev, [key]: value };
      saveToLocalStorage(next);
      return next;
    });
  };

  // ---------- Update multiple fields ----------
  const updateSettings = (patch) => {
    setSettings((prev) => {
      const next = { ...prev, ...patch };
      saveToLocalStorage(next);
      return next;
    });
  };

  // ---------- Save (async, simulates API) ----------
  const saveSettings = async () => {
    setLoading(true);
    await simulateDelay(800);
    saveToLocalStorage(settings);
    setLoading(false);
    return settings;
  };

  // ---------- Reset to defaults ----------
  const resetSettings = async () => {
    setLoading(true);
    await simulateDelay(800);
    setSettings(DEFAULT_SETTINGS);
    saveToLocalStorage(DEFAULT_SETTINGS);
    setLoading(false);
    return DEFAULT_SETTINGS;
  };

  // ---------- Danger: disable all notifications ----------
  const disableAllNotifications = async () => {
    setLoading(true);
    await simulateDelay(600);
    const next = { ...settings, smsEnabled: false, pushEnabled: false, emailEnabled: false };
    setSettings(next);
    saveToLocalStorage(next);
    setLoading(false);
    return next;
  };

  return (
    <SettingsContext.Provider
      value={{
        settings,
        loading,
        updateSetting,
        updateSettings,
        saveSettings,
        resetSettings,
        disableAllNotifications,
        DEFAULT_SETTINGS,
      }}
    >
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = () => {
  const ctx = useContext(SettingsContext);
  if (!ctx) throw new Error("useSettings must be used within a SettingsProvider");
  return ctx;
};