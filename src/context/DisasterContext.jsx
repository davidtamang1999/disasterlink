import React, { createContext, useContext, useState } from 'react';

const DisasterContext = createContext();

// ✅ SIMULATE API DELAY - Makes it look like real cloud calls
const simulateDelay = (ms = 800) => new Promise(resolve => setTimeout(resolve, ms));

export const DisasterProvider = ({ children }) => {
  // Load from localStorage or use default
  const loadInitialData = () => {
    const saved = localStorage.getItem('disasterData');
    if (saved) {
      try {
        const data = JSON.parse(saved);
        return data.map(inc => {
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
        description: "River banks breaching structural barriers. Multiple residents isolated on upper floors.",
        status: "Pending",
        priorityScore: 95,
        priorityLevel: "Critical",
        createdAt: new Date().toISOString(),
        reportedBy: { id: "resident-1", name: "Resident" },
        lat: 27.7005,
        lng: 85.3180,
        incidentType: "Urban Flooding"
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
        lat: 27.7100,
        lng: 85.3200,
        incidentType: "Urban Flooding"
      }
    ];
  };

  const [incidents, setIncidents] = useState(loadInitialData);
  const [loading, setLoading] = useState(false);

  // Save to localStorage whenever incidents change
  const saveToLocalStorage = (data) => {
    localStorage.setItem('disasterData', JSON.stringify(data));
    window.dispatchEvent(new Event('disasterDataUpdated'));
  };

  // Get highest priority incident
  const getHighestPriorityIncident = () => {
    if (!incidents || incidents.length === 0) return null;
    return incidents.reduce((a, b) => (a.priorityScore || 0) > (b.priorityScore || 0) ? a : b);
  };

  // Get priority summary
  const getPrioritySummary = () => {
    const total = incidents.length;
    const criticalCount = incidents.filter(i => i.severity === 'Critical' || i.severity === 'CRITICAL').length;
    const highCount = incidents.filter(i => i.severity === 'High').length;
    const moderateCount = incidents.filter(i => i.severity === 'Moderate').length;
    const lowCount = incidents.filter(i => i.severity === 'Low').length;
    const pendingCount = incidents.filter(i => i.status === 'Pending' || i.status === 'Under Review').length;
    
    return {
      total,
      critical: criticalCount,
      high: highCount,
      moderate: moderateCount,
      low: lowCount,
      pending: pendingCount,
      averageScore: Math.round(incidents.reduce((acc, curr) => acc + (curr.priorityScore || 0), 0) / (total || 1))
    };
  };

  // Get disaster situation score
  const getDisasterSituationScore = () => {
    const activeIncidents = incidents.filter(inc => inc.status !== 'Resolved').length;
    const criticalIncidents = incidents.filter(inc => inc.severity === 'Critical' || inc.severity === 'CRITICAL').length;
    const totalAffected = incidents.reduce((sum, inc) => sum + (parseInt(inc.peopleAffected) || 0), 0);
    const highestWaterLevel = Math.max(0, ...incidents.map(inc => parseFloat(inc.waterLevel) || 0));
    
    let score = 0;
    const incidentScore = Math.min(30, (activeIncidents / Math.max(1, incidents.length)) * 30);
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
    
    let riskLevel = 'Low';
    let riskColor = 'text-[#4CAF50]';
    let riskBg = 'bg-[#4CAF50]/10';
    let riskBorder = 'border-[#4CAF50]';
    
    if (finalScore >= 80) {
      riskLevel = 'Critical';
      riskColor = 'text-[#FF5252]';
      riskBg = 'bg-[#FF5252]/10';
      riskBorder = 'border-[#FF5252]';
    } else if (finalScore >= 60) {
      riskLevel = 'High';
      riskColor = 'text-[#FF9800]';
      riskBg = 'bg-[#FF9800]/10';
      riskBorder = 'border-[#FF9800]';
    } else if (finalScore >= 40) {
      riskLevel = 'Moderate';
      riskColor = 'text-[#FFC107]';
      riskBg = 'bg-[#FFC107]/10';
      riskBorder = 'border-[#FFC107]';
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
        resourceShortages: { score: 0, max: 10, value: 0 }
      },
      summary: {
        activeIncidents: activeIncidents,
        criticalIncidents: criticalIncidents,
        totalAffected: totalAffected,
        highestWaterLevel: highestWaterLevel,
        resourceShortages: 0,
        totalIncidents: incidents.length,
        resolvedIncidents: incidents.filter(inc => inc.status === 'Resolved').length,
      }
    };
  };

  // ✅ ADD INCIDENT - WITH API DELAY
  const addIncident = async (incidentData) => {
    setLoading(true);
    try {
      // ✅ SIMULATE API DELAY (1.2 seconds)
      await simulateDelay(1200);
      
      const incidentId = `inc-${Date.now()}`;
      
      let score = 10;
      if (incidentData.severity === 'Critical') score += 40;
      if (incidentData.severity === 'High') score += 25;
      if (parseFloat(incidentData.waterLevel || 0) > 3) score += 35;
      if (parseInt(incidentData.peopleAffected || 0) > 50) score += 10;

      let priorityLevel = "Low";
      if (score >= 80) priorityLevel = "Critical";
      else if (score >= 60) priorityLevel = "High";
      else if (score >= 40) priorityLevel = "Moderate";

      const newRecord = {
        id: incidentId,
        title: incidentData.title || 'Untitled Report',
        location: incidentData.location || 'Unknown location',
        severity: incidentData.severity || 'Moderate',
        peopleAffected: incidentData.peopleAffected || 0,
        waterLevel: incidentData.waterLevel || 0,
        description: incidentData.description || '',
        imageUrl: incidentData.imageUrl || null,
        status: "Pending",
        priorityScore: score,
        priorityLevel: priorityLevel,
        createdAt: new Date().toISOString(),
        reportedBy: incidentData.reportedBy || { id: 'resident-1', name: 'Resident' },
        lat: incidentData.lat || 27.7172,
        lng: incidentData.lng || 85.3240,
        incidentType: incidentData.incidentType || 'Urban Flooding',
        events: incidentData.events || []
      };

      const updated = [newRecord, ...incidents];
      setIncidents(updated);
      saveToLocalStorage(updated);
      
      console.log(`✅ Incident created! ID: ${incidentId}, Score: ${score}/100, Level: ${priorityLevel}`);
      
      setLoading(false);
      return newRecord;
    } catch (error) {
      console.error(error);
      setLoading(false);
      return null;
    }
  };

  // ✅ DELETE SINGLE INCIDENT - WITH DELAY
  const deleteIncident = async (id) => {
    setLoading(true);
    // ✅ SIMULATE API DELAY (600ms)
    await simulateDelay(600);
    
    const updated = incidents.filter(inc => inc.id !== id);
    setIncidents(updated);
    saveToLocalStorage(updated);
    console.log(`✅ Incident ${id} deleted`);
    setLoading(false);
  };

  // ✅ DELETE MULTIPLE INCIDENTS - WITH DELAY
  const deleteMultipleIncidents = async (ids) => {
    if (!ids || ids.length === 0) return;
    setLoading(true);
    // ✅ SIMULATE API DELAY (800ms)
    await simulateDelay(800);
    
    const updated = incidents.filter(inc => !ids.includes(inc.id));
    setIncidents(updated);
    saveToLocalStorage(updated);
    console.log(`✅ ${ids.length} incidents deleted`);
    setLoading(false);
  };

  // ✅ UPDATE INCIDENT STATUS - WITH DELAY
  const updateIncidentStatus = async (id, newStatus) => {
    setLoading(true);
    // ✅ SIMULATE API DELAY (800ms)
    await simulateDelay(800);
    
    const updated = incidents.map(inc => 
      inc.id === id ? { ...inc, status: newStatus } : inc
    );
    setIncidents(updated);
    saveToLocalStorage(updated);
    console.log(`✅ Incident ${id} status updated to: ${newStatus}`);
    setLoading(false);
  };

  // ✅ UPDATE INCIDENT - WITH DELAY
  const updateIncident = async (id, updatedData) => {
    setLoading(true);
    // ✅ SIMULATE API DELAY (800ms)
    await simulateDelay(800);
    
    const updated = incidents.map(inc => 
      inc.id === id ? { ...inc, ...updatedData } : inc
    );
    setIncidents(updated);
    saveToLocalStorage(updated);
    console.log(`✅ Incident ${id} updated`);
    setLoading(false);
  };

  const uploadIncidentImage = async (file) => {
    if (!file) return null;
    // ✅ SIMULATE UPLOAD DELAY (1500ms)
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

  return (
    <DisasterContext.Provider value={{ 
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
      getDisasterSituationScore
    }}>
      {children}
    </DisasterContext.Provider>
  );
};

export const useDisaster = () => {
  const context = useContext(DisasterContext);
  if (!context) {
    throw new Error('useDisaster must be used within a DisasterProvider');
  }
  return context;
};