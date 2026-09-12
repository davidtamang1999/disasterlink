import { createContext, useContext, useState, useEffect } from "react";

const AuditContext = createContext();

const STORAGE_KEY = "auditLogs";
const MAX_LOGS = 500;

const simulateDelay = (ms = 400) => new Promise((resolve) => setTimeout(resolve, ms));

// ---------- Helpers ----------
const getUserInitials = (name) => {
  if (!name) return "SA";
  const parts = name.trim().split(" ");
  if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
  return name.substring(0, 2).toUpperCase();
};

const getActionIcon = (action) => {
  const icons = {
    Created: "add",
    Updated: "edit",
    Reviewed: "visibility",
    Assigned: "assignment",
    Resolved: "check_circle",
    Approved: "check_circle",
    Submitted: "upload",
    Deleted: "delete",
    Verified: "verified",
    Rejected: "cancel",
    Failed: "error",
  };
  return icons[action] || "edit";
};

const loadInitialLogs = () => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : [];
  } catch (e) {
    console.error("Failed to load audit logs:", e);
    return [];
  }
};

export function AuditProvider({ children }) {
  const [logs, setLogs] = useState(loadInitialLogs);
  const [loading, setLoading] = useState(false);

  // Persist to localStorage whenever logs change
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(logs.slice(0, MAX_LOGS)));
    } catch (e) {
      console.error("Failed to save audit logs:", e);
    }
  }, [logs]);

  // ---------- Core: log an action ----------
  const logAction = (action, details, options = {}) => {
    const entry = {
      id: `log-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      timestamp: new Date().toISOString(),
      time: new Date().toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      }),
      user: options.user || "System Admin",
      userInitials: options.userInitials || getUserInitials(options.user || "System Admin"),
      role: options.role || "Administrator",
      action: action,
      actionIcon: options.actionIcon || getActionIcon(action),
      module: options.module || "Admin Action",
      recordId: options.recordId || `ADMIN-${Date.now()}`,
      status: options.status || "Success",
      details: details || action,
      severity: options.severity,
      location: options.location,
      isSystem: options.isSystem || false,
    };

    setLogs((prev) => [entry, ...prev].slice(0, MAX_LOGS));
    return entry;
  };

  // ---------- Add a raw log entry ----------
  const addLog = (logData) => {
    const entry = {
      id: logData.id || `log-${Date.now()}`,
      timestamp: logData.timestamp || new Date().toISOString(),
      time:
        logData.time ||
        new Date().toLocaleTimeString("en-US", {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
        }),
      user: logData.user || "System",
      userInitials: logData.userInitials || getUserInitials(logData.user || "System"),
      role: logData.role || "System",
      action: logData.action || "Action",
      actionIcon: logData.actionIcon || getActionIcon(logData.action),
      module: logData.module || "System",
      recordId: logData.recordId || `SYS-${Date.now()}`,
      status: logData.status || "Success",
      details: logData.details || "",
      severity: logData.severity,
      location: logData.location,
      isSystem: logData.isSystem ?? false,
    };

    setLogs((prev) => [entry, ...prev].slice(0, MAX_LOGS));
    return entry;
  };

  // ---------- Add multiple logs at once (for seeding) ----------
  const bulkAddLogs = (logArray) => {
    if (!Array.isArray(logArray) || logArray.length === 0) return;
    setLogs((prev) => [...logArray, ...prev].slice(0, MAX_LOGS));
  };

  // ---------- Delete single log ----------
  const deleteLog = async (id) => {
    setLoading(true);
    await simulateDelay(300);
    setLogs((prev) => prev.filter((l) => l.id !== id));
    setLoading(false);
  };

  // ---------- Clear all logs ----------
  const clearLogs = async () => {
    setLoading(true);
    await simulateDelay(500);
    setLogs([]);
    setLoading(false);
  };

  // ---------- Derived: stats ----------
  const getStats = () => {
    const today = new Date().toDateString();
    const todayLogs = logs.filter((log) => new Date(log.timestamp).toDateString() === today);

    return {
      total: logs.length,
      today: todayLogs.length,
      adminActions: logs.filter(
        (log) => log.role === "Administrator" || log.role === "admin"
      ).length,
      securityEvents: logs.filter(
        (log) => log.action === "Failed" || log.status === "Failed"
      ).length,
      failedActions: logs.filter((log) => log.status === "Failed").length,
    };
  };

  // ---------- Derived: module activity ----------
  const getModuleActivity = () => {
    const moduleMap = {};
    logs.forEach((log) => {
      const m = log.module || "Other";
      moduleMap[m] = (moduleMap[m] || 0) + 1;
    });

    const total = logs.length || 1;
    return Object.entries(moduleMap)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([name, count]) => ({
        name,
        percentage: `${Math.round((count / total) * 100)}%`,
        opacity: count / total > 0.3 ? "" : "opacity-60",
      }));
  };

  // ---------- Derived: filters ----------
  const getUniqueModules = () => [...new Set(logs.map((l) => l.module))];
  const getUniqueActions = () => [...new Set(logs.map((l) => l.action))];
  const getUniqueStatuses = () => [...new Set(logs.map((l) => l.status))];
  const getUniqueUsers = () => [...new Set(logs.map((l) => l.user))];

  return (
    <AuditContext.Provider
      value={{
        logs,
        loading,
        logAction,
        addLog,
        bulkAddLogs,
        deleteLog,
        clearLogs,
        getStats,
        getModuleActivity,
        getUniqueModules,
        getUniqueActions,
        getUniqueStatuses,
        getUniqueUsers,
      }}
    >
      {children}
    </AuditContext.Provider>
  );
}

export function useAudit() {
  const context = useContext(AuditContext);
  if (!context) {
    throw new Error("useAudit must be used within an AuditProvider");
  }
  return context;
}