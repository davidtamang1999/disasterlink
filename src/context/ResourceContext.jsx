import { createContext, useContext, useState, useEffect } from "react";

const ResourceContext = createContext();

const ALLOCATIONS_KEY = "resourceAllocations";
const RESOURCES_KEY = "resources";

// ✅ SIMULATE API DELAY
const simulateDelay = (ms = 900) => new Promise((resolve) => setTimeout(resolve, ms));

// ---------- Default resources ----------
const defaultResources = [
  {
    id: "res-001",
    name: "Drinking Water",
    category: "Water",
    currentStock: 120,
    minThreshold: 500,
    unit: "btls",
    location: "Central Warehouse",
    status: "Critical",
    lastUpdated: new Date().toISOString(),
  },
  {
    id: "res-002",
    name: "Food Packages",
    category: "Food",
    currentStock: 180,
    minThreshold: 300,
    unit: "packages",
    location: "Baneshwor Depot",
    status: "Low",
    lastUpdated: new Date().toISOString(),
  },
  {
    id: "res-003",
    name: "First Aid Kits",
    category: "Medical",
    currentStock: 45,
    minThreshold: 100,
    unit: "kits",
    location: "Patan Medical Center",
    status: "Critical",
    lastUpdated: new Date().toISOString(),
  },
  {
    id: "res-004",
    name: "Rescue Boats",
    category: "Equipment",
    currentStock: 12,
    minThreshold: 15,
    unit: "boats",
    location: "Teku Rescue Base",
    status: "Low",
    lastUpdated: new Date().toISOString(),
  },
  {
    id: "res-005",
    name: "Blankets",
    category: "Supplies",
    currentStock: 200,
    minThreshold: 400,
    unit: "blankets",
    location: "Community Hall",
    status: "Low",
    lastUpdated: new Date().toISOString(),
  },
  {
    id: "res-006",
    name: "Medical Supplies",
    category: "Medical",
    currentStock: 30,
    minThreshold: 80,
    unit: "supplies",
    location: "Patan Medical Center",
    status: "Critical",
    lastUpdated: new Date().toISOString(),
  },
];

// ---------- Loaders ----------
const loadInitialResources = () => {
  const saved = localStorage.getItem(RESOURCES_KEY);
  if (saved) {
    try {
      return JSON.parse(saved);
    } catch (e) {
      return defaultResources;
    }
  }
  return defaultResources;
};

const loadInitialAllocations = () => {
  try {
    const saved = localStorage.getItem(ALLOCATIONS_KEY);
    return saved ? JSON.parse(saved) : [];
  } catch (e) {
    console.error("Failed to load allocations:", e);
    return [];
  }
};

export function ResourceProvider({ children }) {
  const [resources, setResources] = useState(loadInitialResources);
  const [allocations, setAllocations] = useState(loadInitialAllocations);
  const [loading, setLoading] = useState(false);

  // Persist resources
  useEffect(() => {
    localStorage.setItem(RESOURCES_KEY, JSON.stringify(resources));
  }, [resources]);

  // Seed allocations on first mount
  useEffect(() => {
    try {
      if (!localStorage.getItem(ALLOCATIONS_KEY)) {
        localStorage.setItem(ALLOCATIONS_KEY, JSON.stringify(allocations));
      }
    } catch (e) {
      console.error("Failed to seed allocations:", e);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ---------- Persist helpers ----------
  const saveAllocationsToStorage = (data) => {
    localStorage.setItem(ALLOCATIONS_KEY, JSON.stringify(data));
    window.dispatchEvent(new Event("disasterDataUpdated"));
  };

  // ---------- Calculate status ----------
  const calculateStatus = (current, threshold) => {
    if (current === 0) return "Critical";
    if (current < threshold * 0.3) return "Critical";
    if (current < threshold * 0.5) return "Low";
    if (current < threshold * 0.8) return "Moderate";
    return "Good";
  };

  // ---------- Update resource stock ----------
  const updateResourceStock = (id, newStock) => {
    setResources((prev) =>
      prev.map((res) => {
        if (res.id === id) {
          return {
            ...res,
            currentStock: newStock,
            lastUpdated: new Date().toISOString(),
            status: calculateStatus(newStock, res.minThreshold),
          };
        }
        return res;
      })
    );
  };

  // ---------- Shortage alerts ----------
  const getShortageAlerts = () => {
    const alerts = [];
    resources.forEach((res) => {
      const shortage = res.minThreshold - res.currentStock;
      if (shortage > 0) {
        alerts.push({
          ...res,
          shortage,
          shortagePercentage: Math.round((shortage / res.minThreshold) * 100),
          severity: res.status === "Critical" ? "Critical" : "Warning",
        });
      }
    });

    return alerts.sort((a, b) => {
      if (a.status === "Critical" && b.status !== "Critical") return -1;
      if (a.status !== "Critical" && b.status === "Critical") return 1;
      return b.shortage - a.shortage;
    });
  };

  // ---------- Resources by status ----------
  const getResourcesByStatus = (status) =>
    resources.filter((res) => res.status === status);

  // ---------- Summary ----------
  const getResourceSummary = () => {
    const total = resources.length;
    const critical = getResourcesByStatus("Critical").length;
    const low = getResourcesByStatus("Low").length;
    const moderate = getResourcesByStatus("Moderate").length;
    const good = getResourcesByStatus("Good").length;
    const shortages = getShortageAlerts();

    return {
      total,
      critical,
      low,
      moderate,
      good,
      shortages,
      criticalShortages: shortages.filter((s) => s.severity === "Critical").length,
      totalShortageItems: shortages.length,
    };
  };

  // ============================================================
  //  ALLOCATIONS API (new)
  // ============================================================
  const allocateResource = async (allocationData) => {
    setLoading(true);
    await simulateDelay(1200);

    const newAllocation = {
      id: `alloc-${Date.now()}`,
      resource: allocationData.resource,
      category: allocationData.category,
      quantity: allocationData.quantity,
      volunteer: allocationData.volunteer,
      destination: allocationData.destination,
      notes: allocationData.notes || "",
      status: "Assigned",
      allocatedAt: new Date().toISOString(),
    };

    const updated = [newAllocation, ...allocations];
    setAllocations(updated);
    saveAllocationsToStorage(updated);

    // Optionally decrement the matching resource stock
    const matching = resources.find(
      (r) => r.name === allocationData.resource
    );
    if (matching) {
      const newStock = Math.max(0, matching.currentStock - allocationData.quantity);
      updateResourceStock(matching.id, newStock);
    }

    setLoading(false);
    return newAllocation;
  };

  const updateAllocation = async (id, patch) => {
    setLoading(true);
    await simulateDelay(600);

    const updated = allocations.map((a) =>
      a.id === id ? { ...a, ...patch } : a
    );
    setAllocations(updated);
    saveAllocationsToStorage(updated);

    setLoading(false);
  };

  const deleteAllocation = async (id) => {
    setLoading(true);
    await simulateDelay(500);

    const updated = allocations.filter((a) => a.id !== id);
    setAllocations(updated);
    saveAllocationsToStorage(updated);

    setLoading(false);
  };

  const getAllocationsByResource = (resourceName) =>
    allocations.filter((a) => a.resource === resourceName);

  const getTotalAllocated = (resourceName) =>
    allocations
      .filter((a) => a.resource === resourceName)
      .reduce((sum, a) => sum + (a.quantity || 0), 0);

  return (
    <ResourceContext.Provider
      value={{
        // Existing resources API
        resources,
        updateResourceStock,
        getShortageAlerts,
        getResourcesByStatus,
        getResourceSummary,
        calculateStatus,

        // New allocations API
        allocations,
        loading,
        allocateResource,
        updateAllocation,
        deleteAllocation,
        getAllocationsByResource,
        getTotalAllocated,
      }}
    >
      {children}
    </ResourceContext.Provider>
  );
}

export function useResources() {
  const context = useContext(ResourceContext);
  if (!context) {
    throw new Error("useResources must be used within a ResourceProvider");
  }
  return context;
}