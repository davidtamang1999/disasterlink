import { useState, useMemo, useCallback } from "react";
import AdminLayout from "../../layouts/AdminLayout";
import DisasterMap from "../../components/DisasterMap";
import { useDisaster } from "../../context/DisasterContext";
import { useShelters } from "../../context/ShelterContext";

export default function AdminLiveDisasterMap() {
  // ✅ Use context instead of reading localStorage
  const { incidents } = useDisaster();
  const { shelters } = useShelters();

  const [showIncidents, setShowIncidents] = useState(true);
  const [showShelters, setShowShelters] = useState(true);
  const [selectedIncident, setSelectedIncident] = useState(null);
  const [showDetails, setShowDetails] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  const refreshData = useCallback(() => {
    setRefreshKey(prev => prev + 1);
  }, []);

  const mapComponent = useMemo(
    () => (
      <DisasterMap
        key={refreshKey}
        incidents={showIncidents ? incidents : []}
        shelters={showShelters ? shelters : []}
        center={[27.7172, 85.3240]}
        zoom={12}
        height="100%"
      />
    ),
    [incidents, showIncidents, showShelters, shelters, refreshKey]
  );

  const totalIncidents = incidents.length;
  const criticalIncidents = incidents.filter(i =>
    i.severity === "Critical" || i.severity === "CRITICAL"
  ).length;
  const totalAffected = incidents.reduce((sum, i) => sum + (parseInt(i.peopleAffected) || 0), 0);
  const activeIncidents = incidents.filter(i => i.status !== "Resolved").length;
  const inProgressIncidents = incidents.filter(i =>
    i.status === "In Progress" || i.status === "Responding"
  ).length;
  const totalVolunteers = inProgressIncidents * 3 + 12;
  const openShelters = shelters.filter(s => s.status === "Open").length;
  const resourceShortages = Math.floor(Math.random() * 3) + 2;

  const handleMarkerClick = (incident) => {
    setSelectedIncident(incident);
    setShowDetails(true);
  };

  const headerControls = (
    <div className="flex items-center gap-3">
      <button
        onClick={refreshData}
        className="flex items-center gap-1 rounded-xl bg-[#4b41e1] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#3a33b8]"
      >
        <span className="material-symbols-outlined text-[18px]">refresh</span>
        Refresh
      </button>

      <label className="flex items-center gap-1 text-sm">
        <input
          type="checkbox"
          checked={showIncidents}
          onChange={() => setShowIncidents(!showIncidents)}
          className="accent-[#4b41e1]"
        />
        Incidents ({totalIncidents})
      </label>

      <label className="flex items-center gap-1 text-sm">
        <input
          type="checkbox"
          checked={showShelters}
          onChange={() => setShowShelters(!showShelters)}
          className="accent-[#4b41e1]"
        />
        Shelters ({shelters.length})
      </label>
    </div>
  );

  return (
    <AdminLayout title="Live Disaster Map" headerRight={headerControls}>
      <div className="relative -mx-4 -mt-6 -mb-10 md:-mx-8">
        <div className="relative h-[calc(100vh-72px)]">
          <div className="absolute inset-0">
            {mapComponent}
          </div>

          {/* Top Stats */}
          <div className="absolute left-1/2 top-4 z-20 flex -translate-x-1/2 items-center gap-6 rounded-xl border border-gray-200 bg-white/95 px-6 py-3 shadow-lg backdrop-blur">
            <StatBlock icon="emergency" color="text-[#ba1a1a]" label="Active Incidents" value={activeIncidents} />
            <Divider />
            <StatBlock icon="people" color="text-[#ba1a1a]" label="People Affected" value={totalAffected.toLocaleString()} />
            <Divider />
            <StatBlock icon="volunteer_activism" color="text-[#4b41e1]" label="Volunteers Deployed" value={totalVolunteers} />
            <Divider />
            <StatBlock icon="home_work" color="text-[#2e7d32]" label="Open Shelters" value={openShelters} />
            <Divider />
            <StatBlock icon="warning" color="text-[#FF9800]" label="Resource Shortages" value={resourceShortages} />
          </div>

          {/* Left Panel: Critical incidents */}
          <div className="absolute left-4 top-20 z-20 max-h-[calc(100vh-200px)] w-72 overflow-y-auto rounded-xl border border-gray-200 bg-white/95 p-4 shadow-lg backdrop-blur">
            <div className="mb-3 flex items-center justify-between">
              <h3 className="flex items-center gap-1 text-sm font-bold text-[#0e1a39]">
                <span className="material-symbols-outlined text-[18px]">list</span>
                Critical Incidents
              </h3>
              <span className="text-xs font-bold text-red-600">{criticalIncidents} active</span>
            </div>

            {incidents
              .filter(i => i.severity === "Critical" || i.severity === "CRITICAL")
              .slice(0, 5)
              .map((incident) => (
                <div
                  key={incident.id}
                  onClick={() => handleMarkerClick(incident)}
                  className="mb-3 cursor-pointer rounded-xl border border-red-200 bg-red-50 p-3 transition hover:shadow-md"
                >
                  <div className="flex items-start justify-between">
                    <h4 className="text-sm font-bold text-[#0e1a39]">{incident.title || "Critical Incident"}</h4>
                    <span className="rounded-full bg-red-600 px-2 py-0.5 text-[10px] text-white">Critical</span>
                  </div>
                  <p className="mt-1 text-xs text-gray-500">{incident.location || "Unknown location"}</p>
                  <p className="mt-1 line-clamp-2 text-xs text-gray-600">
                    {incident.description || "Water level exceeded danger mark. Evacuation required."}
                  </p>
                  <div className="mt-2 flex gap-2">
                    <button className="text-xs font-semibold text-[#4b41e1] hover:underline">View</button>
                    <button className="text-xs font-semibold text-[#4b41e1] hover:underline">Navigate</button>
                  </div>
                </div>
              ))}

            {criticalIncidents === 0 && (
              <div className="py-6 text-center text-gray-500">
                <span className="material-symbols-outlined mb-2 block text-4xl">check_circle</span>
                <p className="text-sm">No critical incidents</p>
              </div>
            )}
          </div>

          {/* Right Panel: River monitoring */}
          <div className="absolute right-4 top-20 z-20 max-h-[calc(100vh-200px)] w-64 overflow-y-auto rounded-xl border border-gray-200 bg-white/95 p-4 shadow-lg backdrop-blur">
            <h3 className="mb-3 flex items-center gap-1 text-sm font-bold text-[#0e1a39]">
              <span className="material-symbols-outlined text-[18px]">water</span>
              River Monitoring
            </h3>

            <div className="space-y-2">
              <RiverBar label="Bagmati - Teku" value="6.4m" width="85%" color="bg-red-600" />
              <RiverBar label="Bagmati - Khokana" value="4.8m" width="65%" color="bg-orange-500" />
            </div>

            <div className="mt-4 border-t border-gray-200 pt-4">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500">Overall Risk</span>
                <span className={`font-bold ${criticalIncidents > 0 ? "text-red-600" : "text-orange-500"}`}>
                  {criticalIncidents > 0 ? "HIGH" : "MODERATE"}
                </span>
              </div>
              <div className="mt-1 flex items-center justify-between text-sm">
                <span className="text-gray-500">Active Incidents</span>
                <span className="font-bold">{activeIncidents}</span>
              </div>
              <div className="mt-1 flex items-center justify-between text-sm">
                <span className="text-gray-500">Volunteers</span>
                <span className="font-bold">{totalVolunteers}</span>
              </div>
            </div>

            <button
              onClick={refreshData}
              className="mt-4 w-full text-center text-xs font-semibold text-[#4b41e1] hover:underline"
            >
              Refresh Data ↻
            </button>
          </div>

          {/* Incident Details Card */}
          {showDetails && selectedIncident && (
            <div className="absolute bottom-24 right-4 z-20 max-h-[calc(100vh-250px)] w-80 overflow-y-auto rounded-xl border border-gray-200 bg-white/95 shadow-lg backdrop-blur">
              <div className="p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="mb-1 flex items-center gap-2">
                      <span className="text-xs font-bold text-gray-500">{selectedIncident.id || "INC-0000"}</span>
                      <span className="rounded-full bg-red-600 px-2 py-0.5 text-[10px] text-white">
                        {selectedIncident.severity || "Critical"}
                      </span>
                    </div>
                    <h3 className="text-lg font-bold text-[#0e1a39]">
                      {selectedIncident.title || "Critical Incident"}
                    </h3>
                  </div>
                  <button onClick={() => setShowDetails(false)} className="text-gray-400 hover:text-gray-600">
                    <span className="material-symbols-outlined">close</span>
                  </button>
                </div>

                <div className="mt-3 grid grid-cols-2 gap-3">
                  <MiniStat label="AFFECTED" value={selectedIncident.peopleAffected || 120} />
                  <MiniStat label="WATER LVL" value={`${selectedIncident.waterLevel || "6.4"}m`} color="text-red-600" />
                  <MiniStat label="STATUS" value={selectedIncident.status || "In Progress"} small />
                  <MiniStat label="VOLUNTEERS" value="12/15" color="text-[#4b41e1]" />
                </div>

                <div className="mt-3 flex gap-2">
                  <button className="flex-1 rounded-lg bg-[#4b41e1] py-2 text-sm font-semibold text-white hover:opacity-90">
                    View Incident
                  </button>
                  <button className="flex-1 rounded-lg border border-gray-300 py-2 text-sm font-semibold hover:bg-gray-50">
                    Assign
                  </button>
                  <button className="flex-1 rounded-lg border border-gray-300 py-2 text-sm font-semibold hover:bg-gray-50">
                    Alert
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Legend */}
          <div className="absolute bottom-4 left-1/2 z-20 flex -translate-x-1/2 items-center gap-4 rounded-full border border-gray-200 bg-white/90 px-5 py-2.5 text-xs shadow-lg backdrop-blur">
            <LegendDot color="bg-[#ba1a1a]" label="Critical" />
            <LegendDot color="bg-[#F59E0B]" label="High" />
            <LegendDot color="bg-[#FBBF24]" label="Moderate" />
            <LegendDot color="bg-[#10B981]" label="Resolved" />
            <div className="h-5 w-px bg-gray-300" />
            <div className="flex items-center gap-1.5">
              <span className="text-base text-[#8B5CF6]">🏠</span>
              <span className="font-medium text-gray-700">Shelter</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-base text-[#4b41e1]">👥</span>
              <span className="font-medium text-gray-700">Volunteer Team</span>
            </div>
          </div>

          {/* Zoom Controls */}
          <div className="absolute bottom-20 right-4 z-20 flex flex-col gap-1">
            <button
              onClick={() => document.querySelector(".leaflet-control-zoom a.leaflet-control-zoom-in")?.click()}
              className="flex h-10 w-10 items-center justify-center rounded-lg border border-gray-200 bg-white shadow-lg transition hover:bg-gray-100"
            >
              <span className="material-symbols-outlined text-xl text-gray-700">add</span>
            </button>
            <button
              onClick={() => document.querySelector(".leaflet-control-zoom a.leaflet-control-zoom-out")?.click()}
              className="flex h-10 w-10 items-center justify-center rounded-lg border border-gray-200 bg-white shadow-lg transition hover:bg-gray-100"
            >
              <span className="material-symbols-outlined text-xl text-gray-700">remove</span>
            </button>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}

/* ---------- Small inline helpers ---------- */
const StatBlock = ({ icon, color, label, value }) => (
  <div className="flex items-center gap-2">
    <span className={`material-symbols-outlined ${color}`}>{icon}</span>
    <div>
      <p className="text-xs text-gray-500">{label}</p>
      <p className="text-lg font-bold text-[#0e1a39]">{value}</p>
    </div>
  </div>
);

const Divider = () => <div className="h-10 w-px bg-gray-200" />;

const RiverBar = ({ label, value, width, color }) => (
  <div className="rounded-lg border border-blue-200 bg-blue-50 p-3">
    <div className="flex justify-between">
      <span className="text-xs font-semibold">{label}</span>
      <span className="text-xs font-bold text-red-600">{value}</span>
    </div>
    <div className="mt-1 h-1.5 w-full rounded-full bg-gray-200">
      <div className={`h-full ${color} rounded-full`} style={{ width }} />
    </div>
  </div>
);

const MiniStat = ({ label, value, color = "text-[#0e1a39]", small = false }) => (
  <div className="rounded-lg bg-gray-50 p-2 text-center">
    <p className="text-[10px] text-gray-500">{label}</p>
    <p className={`${small ? "text-sm" : "text-lg"} font-bold ${color}`}>{value}</p>
  </div>
);

const LegendDot = ({ color, label }) => (
  <div className="flex items-center gap-1.5">
    <span className={`h-3 w-3 rounded-full ${color}`} />
    <span className="font-medium text-gray-700">{label}</span>
  </div>
);