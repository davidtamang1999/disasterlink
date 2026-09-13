import React, { createContext, useContext, useState, useEffect } from "react";
import { incidentService } from "../services/incidentService";

const DisasterContext = createContext();

const UPDATES_KEY = "responseUpdates";

const simulateDelay = (ms = 800) => new Promise((resolve) => setTimeout(resolve, ms));

export const DisasterProvider = ({ children }) => {
  const useAWS = import.meta.env.VITE_USE_AWS === "true";

  // ---------- Loaders ----------
  const loadInitialData = () => {
    const saved = localStorage.getItem("disasterData");
    if (saved) {
      try {
        const data = JSON.parse(saved);
        return data.map((inc) => {
          if (!inc.priorityLevel) {
            const score = inc.priorityScore || 0;
            let priorityLevel = "Low";
            if (score >= 80) priorityLevel = "Critical";
            else if (score >= 60) priorityLevel = "High";
            else if (score >= 40) priorityLevel = "Moderate";
            return { ...inc, priorityLevel };
          }
          return inc;
        });
      } catch (e) {
        return [];
      }
    }
    return [
      {
        id: "inc-101",
        title: "Severe Flash Flooding near Balaju Corridor",
        location: "Balaju Corridor",
        severity: "Critical",
        peopleAffected: "120",
        waterLevel: "4.5",
        description:
          "River banks breaching structural barriers. Multiple residents isolated on upper floors.",
        status: "Pending",
        priorityScore: 95,
        priorityLevel: "Critical",
        createdAt: new Date().toISOString(),
        reportedBy: { id: "resident-1", name: "Resident" },
        lat: 27.7005,
        lng: 85.318,
        incidentType: "Urban Flooding",
      },
      {
        id: "inc-102",
        title: "Minor Water Accumulation near Gongabu",
        location: "Gongabu Sector 3",
        severity: "Moderate",
        peopleAffected: "15",
        waterLevel: "1.2",
        description: "Street drainage backflow causing minor roadway blockage.",
        status: "In Progress",
        priorityScore: 45,
        priorityLevel: "Moderate",
        createdAt: new Date(Date.now() - 3600000).toISOString(),
        reportedBy: { id: "resident-1", name: "Resident" },
        lat: 27.71,
        lng: 85.32,
        incidentType: "Urban Flooding",
      },
    ];
  };

  const loadInitialResponseUpdates = () => {
    try {
      const saved = localStorage.getItem(UPDATES_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  };

  // ---------- State ----------
  const [incidents, setIncidents] = useState(useAWS ? [] : loadInitialData);
  const [responseUpdates, setResponseUpdates] = useState(
    useAWS ? [] : loadInitialResponseUpdates
  );
  const [loading, setLoading] = useState(false);

  // ---------- Fetch from AWS on mount (if enabled) ----------
  useEffect(() => {
    if (!useAWS) return;

    setLoading(true);
    Promise.all([
      incidentService.fetchIncidents(),
      incidentService.fetchResponseUpdates(),
    ])
      .then(([incData, updateData]) => {
        setIncidents(incData);
        setResponseUpdates(updateData);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [useAWS]);

  // ---------- Storage helpers ----------
  const saveToLocalStorage = (data) => {
    localStorage.setItem("disasterData", JSON.stringify(data));
    window.dispatchEvent(new Event("disasterDataUpdated"));
  };

  const saveUpdatesToStorage = (data) => {
    localStorage.setItem(UPDATES_KEY, JSON.stringify(data));
    window.dispatchEvent(new Event("disasterDataUpdated"));
  };

  // ---------- Derived: highest priority ----------
  const getHighestPriorityIncident = () => {
    if (!incidents || incidents.length === 0) return null;
    return incidents.reduce((a, b) =>
      (a.priorityScore || 0) > (b.priorityScore || 0) ? a : b
    );
  };

  // ---------- Derived: priority summary ----------
  const getPrioritySummary = () => {
    const total = incidents.length;
    const criticalCount = incidents.filter(
      (i) => i.severity === "Critical" || i.severity === "CRITICAL"
    ).length;
    const highCount = incidents.filter((i) => i.severity === "High").length;
    const moderateCount = incidents.filter((i) => i.severity === "Moderate").length;
    const lowCount = incidents.filter((i) => i.severity === "Low").length;
    const pendingCount = incidents.filter(
      (i) => i.status === "Pending" || i.status === "Under Review"
    ).length;

    return {
      total,
      critical: criticalCount,
      high: highCount,
      moderate: moderateCount,
      low: lowCount,
      pending: pendingCount,
      averageScore: Math.round(
        incidents.reduce((acc, curr) => acc + (curr.priorityScore || 0), 0) /
          (total || 1)
      ),
    };
  };

  // ---------- Derived: disaster situation score ----------
  const getDisasterSituationScore = () => {
    const activeIncidents = incidents.filter((inc) => inc.status !== "Resolved").length;
    const criticalIncidents = incidents.filter(
      (inc) => inc.severity === "Critical" || inc.severity === "CRITICAL"
    ).length;
    const totalAffected = incidents.reduce(
      (sum, inc) => sum + (parseInt(inc.peopleAffected) || 0),
      0
    );
    const highestWaterLevel = Math.max(
      0,
      ...incidents.map((inc) => parseFloat(inc.waterLevel) || 0)
    );

    let score = 0;
    const incidentScore = Math.min(
      30,
      (activeIncidents / Math.max(1, incidents.length)) * 30
    );
    score += incidentScore;
    const criticalScore = Math.min(25, criticalIncidents * 5);
    score += criticalScore;

    let peopleScore = 0;
    if (totalAffected > 1000) peopleScore = 20;
    else if (totalAffected > 500) peopleScore = 15;
    else if (totalAffected > 100) peopleScore = 10;
    else if (totalAffected > 20) peopleScore = 5;
    score += peopleScore;

    let waterScore = 0;
    if (highestWaterLevel > 5) waterScore = 15;
    else if (highestWaterLevel > 4) waterScore = 12;
    else if (highestWaterLevel > 3) waterScore = 8;
    else if (highestWaterLevel > 2) waterScore = 4;
    score += waterScore;

    const finalScore = Math.min(Math.round(score), 100);

    let riskLevel = "Low";
    let riskColor = "text-[#4CAF50]";
    let riskBg = "bg-[#4CAF50]/10";
    let riskBorder = "border-[#4CAF50]";

    if (finalScore >= 80) {
      riskLevel = "Critical";
      riskColor = "text-[#FF5252]";
      riskBg = "bg-[#FF5252]/10";
      riskBorder = "border-[#FF5252]";
    } else if (finalScore >= 60) {
      riskLevel = "High";
      riskColor = "text-[#FF9800]";
      riskBg = "bg-[#FF9800]/10";
      riskBorder = "border-[#FF9800]";
    } else if (finalScore >= 40) {
      riskLevel = "Moderate";
      riskColor = "text-[#FFC107]";
      riskBg = "bg-[#FFC107]/10";
      riskBorder = "border-[#FFC107]";
    }

    return {
      score: finalScore,
      level: riskLevel,
      color: riskColor,
      bg: riskBg,
      border: riskBorder,
      details: {
        activeIncidents: { score: Math.round(incidentScore), max: 30, value: activeIncidents },
        criticalIncidents: { score: Math.min(25, criticalScore), max: 25, value: criticalIncidents },
        peopleAffected: { score: peopleScore, max: 20, value: totalAffected },
        waterLevel: { score: waterScore, max: 15, value: highestWaterLevel },
        resourceShortages: { score: 0, max: 10, value: 0 },
      },
      summary: {
        activeIncidents,
        criticalIncidents,
        totalAffected,
        highestWaterLevel,
        resourceShortages: 0,
        totalIncidents: incidents.length,
        resolvedIncidents: incidents.filter((inc) => inc.status === "Resolved").length,
      },
    };
  };

  // ============================================================
  //  INCIDENT MUTATIONS
  // ============================================================

  const addIncident = async (incidentData) => {
    setLoading(true);
    try {
      if (useAWS) {
        const newRecord = await incidentService.createIncident(incidentData);
        setIncidents((prev) => [newRecord, ...prev]);
        setLoading(false);
        return newRecord;
      }

      // Local mode
      await simulateDelay(1200);

      const incidentId = `inc-${Date.now()}`;

      let score = 10;
      if (incidentData.severity === "Critical") score += 40;
      if (incidentData.severity === "High") score += 25;
      if (parseFloat(incidentData.waterLevel || 0) > 3) score += 35;
      if (parseInt(incidentData.peopleAffected || 0) > 50) score += 10;

      let priorityLevel = "Low";
      if (score >= 80) priorityLevel = "Critical";
      else if (score >= 60) priorityLevel = "High";
      else if (score >= 40) priorityLevel = "Moderate";

      const newRecord = {
        id: incidentId,
        title: incidentData.title || "Untitled Report",
        location: incidentData.location || "Unknown location",
        severity: incidentData.severity || "Moderate",
        peopleAffected: incidentData.peopleAffected || 0,
        waterLevel: incidentData.waterLevel || 0,
        description: incidentData.description || "",
        imageUrl: incidentData.imageUrl || null,
        status: "Pending",
        priorityScore: score,
        priorityLevel,
        createdAt: new Date().toISOString(),
        reportedBy: incidentData.reportedBy || { id: "resident-1", name: "Resident" },
        lat: incidentData.lat || 27.7172,
        lng: incidentData.lng || 85.324,
        incidentType: incidentData.incidentType || "Urban Flooding",
        events: incidentData.events || [],
      };

      const updated = [newRecord, ...incidents];
      setIncidents(updated);
      saveToLocalStorage(updated);
      setLoading(false);
      return newRecord;
    } catch (error) {
      console.error("addIncident failed:", error);
      setLoading(false);
      return null;
    }
  };

  const deleteIncident = async (id) => {
    setLoading(true);
    try {
      if (useAWS) {
        await incidentService.deleteIncident(id);
        setIncidents((prev) => prev.filter((inc) => inc.id !== id));
      } else {
        await simulateDelay(600);
        const updated = incidents.filter((inc) => inc.id !== id);
        setIncidents(updated);
        saveToLocalStorage(updated);
      }
    } catch (error) {
      console.error("deleteIncident failed:", error);
    } finally {
      setLoading(false);
    }
  };

  const deleteMultipleIncidents = async (ids) => {
    if (!ids || ids.length === 0) return;
    setLoading(true);
    try {
      if (useAWS) {
        await Promise.all(ids.map((id) => incidentService.deleteIncident(id)));
        setIncidents((prev) => prev.filter((inc) => !ids.includes(inc.id)));
      } else {
        await simulateDelay(800);
        const updated = incidents.filter((inc) => !ids.includes(inc.id));
        setIncidents(updated);
        saveToLocalStorage(updated);
      }
    } catch (error) {
      console.error("deleteMultipleIncidents failed:", error);
    } finally {
      setLoading(false);
    }
  };

  const updateIncidentStatus = async (id, newStatus) => {
    setLoading(true);
    try {
      if (useAWS) {
        const updatedRecord = await incidentService.updateIncident(id, {
          status: newStatus,
        });
        setIncidents((prev) =>
          prev.map((inc) => (inc.id === id ? updatedRecord : inc))
        );
      } else {
        await simulateDelay(800);
        const updated = incidents.map((inc) =>
          inc.id === id ? { ...inc, status: newStatus } : inc
        );
        setIncidents(updated);
        saveToLocalStorage(updated);
      }
    } catch (error) {
      console.error("updateIncidentStatus failed:", error);
    } finally {
      setLoading(false);
    }
  };

  const updateIncident = async (id, updatedData) => {
    setLoading(true);
    try {
      if (useAWS) {
        const updatedRecord = await incidentService.updateIncident(id, updatedData);
        setIncidents((prev) =>
          prev.map((inc) => (inc.id === id ? updatedRecord : inc))
        );
      } else {
        await simulateDelay(800);
        const updated = incidents.map((inc) =>
          inc.id === id ? { ...inc, ...updatedData } : inc
        );
        setIncidents(updated);
        saveToLocalStorage(updated);
      }
    } catch (error) {
      console.error("updateIncident failed:", error);
    } finally {
      setLoading(false);
    }
  };

  const uploadIncidentImage = async (file) => {
    if (!file) return null;
    if (useAWS) {
      return incidentService.uploadImage(file);
    }
    await simulateDelay(1500);
    return "https://unsplash.com";
  };

  const addIncidentWithImage = async (incidentData, imageFile) => {
    let imageUrl = null;
    if (imageFile) {
      imageUrl = await uploadIncidentImage(imageFile);
    }
    return await addIncident({ ...incidentData, imageUrl });
  };

  // ============================================================
  //  RESPONSE UPDATE MUTATIONS
  // ============================================================

  const addResponseUpdate = async (data) => {
    setLoading(true);
    try {
      if (useAWS) {
        const newUpdate = await incidentService.createResponseUpdate(data);
        setResponseUpdates((prev) => [newUpdate, ...prev]);
        return newUpdate;
      }

      await simulateDelay(800);

      const newUpdate = {
        id: `update-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        type: data.type || "Field Report",
        title: data.title || "Field Update",
        description: data.description || "",
        location: data.location || "Unknown location",
        team: data.team || "Unassigned",
        severity: data.severity || "Moderate",
        status: data.status || "Active",
        incidentId: data.incidentId || null,
        userId: data.userId || null,
        userName: data.userName || "Anonymous",
        timestamp: new Date().toISOString(),
        isCritical: data.type === "Critical",
      };

      const updated = [newUpdate, ...responseUpdates];
      setResponseUpdates(updated);
      saveUpdatesToStorage(updated);
      return newUpdate;
    } catch (error) {
      console.error("addResponseUpdate failed:", error);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const updateResponseUpdate = async (id, patch) => {
    setLoading(true);
    try {
      if (useAWS) {
        const updated = await incidentService.updateResponseUpdate(id, patch);
        setResponseUpdates((prev) =>
          prev.map((u) => (u.id === id ? updated : u))
        );
        return updated;
      }

      await simulateDelay(600);

      const updated = responseUpdates.map((u) =>
        u.id === id ? { ...u, ...patch, updatedAt: new Date().toISOString() } : u
      );
      setResponseUpdates(updated);
      saveUpdatesToStorage(updated);
      return updated.find((u) => u.id === id);
    } catch (error) {
      console.error("updateResponseUpdate failed:", error);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const deleteResponseUpdate = async (id) => {
    setLoading(true);
    try {
      if (useAWS) {
        await incidentService.deleteResponseUpdate(id);
        setResponseUpdates((prev) => prev.filter((u) => u.id !== id));
      } else {
        await simulateDelay(500);
        const updated = responseUpdates.filter((u) => u.id !== id);
        setResponseUpdates(updated);
        saveUpdatesToStorage(updated);
      }
    } catch (error) {
      console.error("deleteResponseUpdate failed:", error);
    } finally {
      setLoading(false);
    }
  };

  const getUpdatesByIncident = (incidentId) =>
    responseUpdates.filter((u) => u.incidentId === incidentId);

  const getUpdatesByUser = (userId) =>
    responseUpdates.filter((u) => u.userId === userId);

  const getLatestCriticalUpdate = () =>
    responseUpdates.find((u) => u.type === "Critical") ||
    responseUpdates[0] ||
    null;

  // ============================================================
  //  PROVIDER
  // ============================================================

  return (
    <DisasterContext.Provider
      value={{
        // Incidents API
        incidents,
        loading,
        addIncident,
        addIncidentWithImage,
        uploadIncidentImage,
        updateIncidentStatus,
        updateIncident,
        deleteIncident,
        deleteMultipleIncidents,
        getHighestPriorityIncident,
        getPrioritySummary,
        getDisasterSituationScore,

        // Response Updates API
        responseUpdates,
        addResponseUpdate,
        updateResponseUpdate,
        deleteResponseUpdate,
        getUpdatesByIncident,
        getUpdatesByUser,
        getLatestCriticalUpdate,
      }}
    >
      {children}
    </DisasterContext.Provider>
  );
};

export const useDisaster = () => {
  const context = useContext(DisasterContext);
  if (!context) throw new Error("useDisaster must be used within a DisasterProvider");
  return context;
};