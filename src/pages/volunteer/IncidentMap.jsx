import { useState } from "react";
import { useNavigate } from "react-router-dom";
import VolunteerLayout from "../../layouts/VolunteerLayout";
import DisasterMap from "../../components/DisasterMap";
import { useDisaster } from "../../context/DisasterContext";
import { useAuth } from "../../context/AuthContext";

const IncidentMap = () => {
  const navigate = useNavigate();
  const { incidents } = useDisaster();
  const { user } = useAuth();

  const [filters, setFilters] = useState({
    flooding: true,
    landslide: true,
    medical: false,
    fire: false,
    volunteers: true,
    resources: false,
  });

  const [selectedIncident, setSelectedIncident] = useState(null);
  const [showDetails, setShowDetails] = useState(false);

  const toggleFilter = (filter) => {
    setFilters((prev) => ({ ...prev, [filter]: !prev[filter] }));
  };

  // ---------- Stats ----------
  const totalIncidents = incidents.length;
  const criticalIncidents = incidents.filter(
    (i) => i.severity === "Critical" || i.severity === "CRITICAL"
  ).length;
  const totalAffected = incidents.reduce(
    (sum, i) => sum + (parseInt(i.peopleAffected) || 0),
    0
  );
  const activeIncidents = incidents.filter((i) => i.status !== "Resolved").length;
  const inProgressIncidents = incidents.filter(
    (i) => i.status === "In Progress" || i.status === "Responding"
  ).length;

  const getSeverityColor = (severity) => {
    const colors = {
      Critical: "#ba1a1a",
      CRITICAL: "#ba1a1a",
      High: "#F59E0B",
      Moderate: "#FBBF24",
      Low: "#10B981",
    };
    return colors[severity] || "#76767f";
  };

  const getSeverityLabel = (severity) => {
    const labels = {
      Critical: "Critical",
      CRITICAL: "Critical",
      High: "High",
      Moderate: "Moderate",
      Low: "Low",
    };
    return labels[severity] || "Moderate";
  };

  const getDistance = () => {
    const distances = ["0.8", "1.2", "2.4", "3.1", "4.5", "5.2"];
    return distances[Math.floor(Math.random() * distances.length)];
  };

  // ---------- Header extras ----------
  const headerExtras = (
    <>
      <button className="hidden items-center gap-2 rounded-lg border border-[#4b41e1]/20 px-4 py-2 text-sm font-semibold text-[#4b41e1] hover:bg-[#4b41e1]/5 lg:flex">
        <span className="material-symbols-outlined">my_location</span>
        My Location
      </button>

      <button
        onClick={() => navigate("/volunteer/tasks")}
        className="rounded-lg bg-[#4b41e1] px-4 py-2 text-sm font-semibold text-white hover:opacity-90"
      >
        View My Tasks
      </button>
    </>
  );

  return (
    <VolunteerLayout title="Incident Map" headerRight={headerExtras}>
      <div className="relative -mx-4 -mt-6 -mb-10 md:-mx-8">
        <div className="relative h-[calc(100vh-72px)]">
          <div className="absolute inset-0">
            <DisasterMap
              incidents={incidents}
              shelters={[]}
              center={[27.7172, 85.324]}
              zoom={12}
              height="100%"
            />
          </div>

          {/* ============ LEFT PANEL ============ */}
          <div className="absolute left-4 top-4 z-20 hidden max-h-[calc(100vh-180px)] w-80 flex-col gap-3 overflow-y-auto lg:flex">
            {/* Search */}
            <div className="flex items-center gap-2 rounded-xl border border-gray-200 bg-white/95 px-4 py-3 shadow-lg backdrop-blur">
              <span className="material-symbols-outlined text-gray-400">search</span>
              <input
                type="text"
                placeholder="Search incident or location..."
                className="w-full border-none bg-transparent text-sm outline-none placeholder:text-gray-400"
              />
            </div>

            {/* Filters */}
            <div className="rounded-xl border border-gray-200 bg-white/95 p-4 shadow-lg backdrop-blur">
              <h3 className="mb-4 text-sm font-bold text-[#0e1a39]">Filters</h3>

              <div className="grid grid-cols-2 gap-3 text-sm">
                <FilterCheck label="Flooding" checked={filters.flooding} onToggle={() => toggleFilter("flooding")} />
                <FilterCheck label="Landslide" checked={filters.landslide} onToggle={() => toggleFilter("landslide")} />
                <FilterCheck label="Medical" checked={filters.medical} onToggle={() => toggleFilter("medical")} />
                <FilterCheck label="Fire" checked={filters.fire} onToggle={() => toggleFilter("fire")} />
              </div>

              <div className="my-4 border-t border-gray-200" />

              <ToggleRow
                label="Needs Volunteers"
                checked={filters.volunteers}
                onToggle={() => toggleFilter("volunteers")}
              />
              <ToggleRow
                label="Needs Resources"
                checked={filters.resources}
                onToggle={() => toggleFilter("resources")}
                last
              />

              <div className="flex gap-2">
                <select className="w-1/2 rounded-md border border-gray-300 bg-white px-2 py-2 text-xs outline-none">
                  <option>All Severities</option>
                  <option>Critical</option>
                  <option>High</option>
                  <option>Moderate</option>
                </select>
                <select className="w-1/2 rounded-md border border-gray-300 bg-white px-2 py-2 text-xs outline-none">
                  <option>Within 5km</option>
                  <option>Within 10km</option>
                  <option>Any Distance</option>
                </select>
              </div>
            </div>

            {/* Response Overview */}
            <div className="rounded-xl border border-gray-200 bg-white/95 p-4 shadow-lg backdrop-blur">
              <h3 className="mb-3 text-sm font-bold text-[#0e1a39]">
                Response Overview
              </h3>
              <div className="grid grid-cols-2 gap-3">
                <OverviewTile label="Active Nearby" value={activeIncidents} />
                <OverviewTile
                  label="Critical"
                  value={criticalIncidents}
                  highlight={criticalIncidents > 0}
                />
                <OverviewTile
                  label="Need Volunteers"
                  value={inProgressIncidents}
                  variant="primary"
                />
                <OverviewTile label="Avg Distance" value="3.2 km" sub="km" />
              </div>
            </div>
          </div>

          {/* ============ RIGHT PANEL — Critical Card ============ */}
          {criticalIncidents > 0 && (
            <div className="absolute right-4 top-4 z-20 hidden w-80 xl:block">
              {incidents
                .filter((i) => i.severity === "Critical" || i.severity === "CRITICAL")
                .slice(0, 1)
                .map((incident) => {
                  const distance = getDistance();
                  const priority = incident.severity === "Critical" ? "9.2" : "7.5";
                  const isCritical = incident.severity === "Critical";

                  return (
                    <div
                      key={incident.id}
                      className="overflow-hidden rounded-xl border border-red-200 bg-white/95 shadow-lg backdrop-blur"
                    >
                      <div className="flex items-center justify-between bg-red-600 px-4 py-2 text-white">
                        <span className="text-sm font-bold">⚠️ Critical Flooding</span>
                        <span className="rounded-full bg-red-500/50 px-2 py-0.5 text-[10px]">
                          Priority {priority}
                        </span>
                      </div>

                      <div className="p-4">
                        <p className="text-sm text-gray-500">
                          Distance: {distance} km | Est. Time: {Math.floor(distance * 5)} min
                        </p>

                        <button className="mt-2 w-full rounded-lg bg-[#4b41e1] py-2 text-sm font-semibold text-white hover:opacity-90">
                          Start Navigation
                        </button>

                        <div className="mt-3 grid grid-cols-2 gap-2 text-sm">
                          <div>
                            <p className="text-xs text-gray-500">Response Status</p>
                            <p className="font-bold text-[#0e1a39]">
                              {incident.status || "Reported"}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500">Reported</p>
                            <p className="font-bold text-[#0e1a39]">
                              {incident.timestamp
                                ? new Date(incident.timestamp).toLocaleTimeString()
                                : "Just now"}
                            </p>
                          </div>
                        </div>

                        <div className="mt-3 grid grid-cols-2 gap-2">
                          <MiniTile label="People Affected" value={`~${incident.peopleAffected || 150}`} />
                          <MiniTile label="Resource Needs" value="Water, First Aid" small />
                        </div>

                        <VolunteerNeeds
                          assigned={isCritical ? "3/6" : "1/4"}
                          progress={isCritical ? "w-1/2" : "w-1/4"}
                          note={isCritical ? "3 additional required" : "1 additional required"}
                        />

                        <div className="mt-3 flex items-center gap-2">
                          <span className="flex items-center gap-1 text-xs font-bold text-green-600">
                            <span className="material-symbols-outlined text-sm">check_circle</span>
                            Available
                          </span>
                          <span className="text-xs text-gray-400">Ready for deployment</span>
                        </div>

                        <div className="mt-3 flex gap-2">
                          <button className="flex-1 rounded-lg bg-[#4b41e1] py-2 text-sm font-semibold text-white hover:opacity-90">
                            View Incident
                          </button>
                          <button className="flex-1 rounded-lg border border-gray-300 py-2 text-sm font-semibold hover:bg-gray-50">
                            Navigate
                          </button>
                        </div>

                        <button className="mt-2 flex w-full items-center justify-center gap-1 text-sm font-semibold text-[#4b41e1] hover:underline">
                          <span className="material-symbols-outlined text-sm">inventory_2</span>
                          View Nearby Resources
                        </button>
                      </div>
                    </div>
                  );
                })}
            </div>
          )}

          {/* ============ BOTTOM LEGEND ============ */}
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
            <LegendDot color="bg-[#4b41e1]" label="Volunteer Team" />
          </div>

          {/* ============ ZOOM CONTROLS ============ */}
          <div className="absolute bottom-20 right-4 z-20 flex flex-col gap-1">
            <button
              onClick={() =>
                document
                  .querySelector(".leaflet-control-zoom a.leaflet-control-zoom-in")
                  ?.click()
              }
              className="flex h-10 w-10 items-center justify-center rounded-lg border border-gray-200 bg-white shadow-lg transition hover:bg-gray-100"
            >
              <span className="material-symbols-outlined text-xl text-gray-700">add</span>
            </button>
            <button
              onClick={() =>
                document
                  .querySelector(".leaflet-control-zoom a.leaflet-control-zoom-out")
                  ?.click()
              }
              className="flex h-10 w-10 items-center justify-center rounded-lg border border-gray-200 bg-white shadow-lg transition hover:bg-gray-100"
            >
              <span className="material-symbols-outlined text-xl text-gray-700">remove</span>
            </button>
          </div>

          {/* ============ DETAIL CARD ============ */}
          {showDetails && selectedIncident && (
            <div className="absolute bottom-24 right-4 z-20 max-h-[calc(100vh-250px)] w-80 overflow-y-auto rounded-xl border border-gray-200 bg-white/95 shadow-lg backdrop-blur">
              <div className="p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="mb-2 flex flex-wrap gap-2">
                      <span
                        className="flex items-center gap-1 rounded-full px-2 py-1 text-xs font-bold"
                        style={{
                          backgroundColor: getSeverityColor(selectedIncident.severity) + "20",
                          color: getSeverityColor(selectedIncident.severity),
                        }}
                      >
                        <span
                          className="h-2 w-2 rounded-full"
                          style={{ backgroundColor: getSeverityColor(selectedIncident.severity) }}
                        />
                        {getSeverityLabel(selectedIncident.severity)}
                      </span>

                      {selectedIncident.status === "Pending" && (
                        <span className="flex items-center gap-1 rounded-full bg-[#10B981]/10 px-2 py-1 text-xs font-bold text-[#10B981]">
                          <span className="material-symbols-outlined text-xs">star</span>
                          Recommended
                        </span>
                      )}
                    </div>

                    <h3 className="text-lg font-bold text-[#0e1a39]">
                      {selectedIncident.title || "Incident Report"}
                    </h3>

                    <p className="mt-1 flex items-center gap-1 text-sm text-gray-500">
                      <span className="material-symbols-outlined text-base">location_on</span>
                      {selectedIncident.location || "Unknown location"}
                      {selectedIncident.timestamp &&
                        ` (${Math.floor(
                          (Date.now() - new Date(selectedIncident.timestamp).getTime()) / 60000
                        )} min ago)`}
                    </p>
                  </div>

                  <button
                    onClick={() => setShowDetails(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <span className="material-symbols-outlined">close</span>
                  </button>
                </div>

                <div className="mt-3 grid grid-cols-2 gap-4 border-y border-gray-200 py-4 text-sm">
                  <DetailPair label="Response Status" value={selectedIncident.status || "Pending"} />
                  <DetailPair
                    label="Reported"
                    value={
                      selectedIncident.timestamp
                        ? new Date(selectedIncident.timestamp).toLocaleTimeString()
                        : "Just now"
                    }
                  />
                  <DetailPair label="People Affected" value={selectedIncident.peopleAffected || 0} />
                  <DetailPair label="Type" value={selectedIncident.incidentType || "Unknown"} />
                </div>

                <div className="mt-3">
                  <VolunteerNeeds
                    assigned={selectedIncident.severity === "Critical" ? "3/6" : "1/4"}
                    progress={selectedIncident.severity === "Critical" ? "w-1/2" : "w-1/4"}
                    note={
                      selectedIncident.severity === "Critical"
                        ? "3 additional required"
                        : "1 additional required"
                    }
                  />
                </div>

                <div className="mt-3 flex flex-col gap-2">
                  <button className="w-full rounded-lg bg-[#4b41e1] py-2 text-sm font-semibold text-white hover:opacity-90">
                    Accept Task
                  </button>
                  <div className="grid grid-cols-2 gap-2">
                    <button className="rounded-lg border border-gray-300 py-2 text-sm font-semibold hover:bg-gray-50">
                      View Incident
                    </button>
                    <button className="flex items-center justify-center gap-1 rounded-lg border border-gray-300 py-2 text-sm font-semibold hover:bg-gray-50">
                      <span className="material-symbols-outlined text-lg">directions</span>
                      Navigate
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </VolunteerLayout>
  );
};

/* ---------- Small helpers ---------- */

const FilterCheck = ({ label, checked, onToggle }) => (
  <label className="flex cursor-pointer items-center gap-2">
    <input
      type="checkbox"
      checked={checked}
      onChange={onToggle}
      className="h-4 w-4 accent-[#4b41e1]"
    />
    {label}
  </label>
);

const ToggleRow = ({ label, checked, onToggle, last = false }) => (
  <div className={`flex items-center justify-between text-sm ${last ? "mb-4" : "mb-3"}`}>
    <span>{label}</span>
    <button
      onClick={onToggle}
      className={`relative h-5 w-10 rounded-full transition ${
        checked ? "bg-[#4b41e1]" : "bg-gray-300"
      }`}
    >
      <span
        className={`absolute top-0.5 h-4 w-4 rounded-full bg-white transition ${
          checked ? "right-0.5" : "left-0.5"
        }`}
      />
    </button>
  </div>
);

const OverviewTile = ({ label, value, highlight = false, variant = "default", sub }) => {
  const cls =
    variant === "primary"
      ? "border border-[#4b41e1]/20 bg-[#4b41e1]/10"
      : highlight
      ? "border border-red-200 bg-red-50"
      : "bg-gray-100";

  const labelCls =
    variant === "primary"
      ? "text-[#4b41e1]"
      : highlight
      ? "text-red-600"
      : "text-gray-500";

  const valueCls =
    variant === "primary"
      ? "text-[#4b41e1]"
      : highlight
      ? "text-red-600"
      : "text-[#0e1a39]";

  return (
    <div className={`rounded-lg p-3 ${cls}`}>
      <span className={`text-xs ${labelCls}`}>{label}</span>
      <strong className={`mt-1 block text-xl ${valueCls}`}>
        {value}
        {sub && <small className="text-xs font-normal"> {sub}</small>}
      </strong>
    </div>
  );
};

const MiniTile = ({ label, value, small = false }) => (
  <div className="rounded-lg bg-gray-50 p-2 text-center">
    <p className="text-xs text-gray-500">{label}</p>
    <p className={`${small ? "text-sm" : "text-lg"} font-bold text-[#0e1a39]`}>{value}</p>
  </div>
);

const VolunteerNeeds = ({ assigned, progress, note }) => (
  <>
    <div className="flex justify-between text-sm">
      <span className="text-gray-500">Volunteer Needs</span>
      <strong className="text-[#0e1a39]">{assigned} Assigned</strong>
    </div>
    <div className="mt-1 h-2 w-full overflow-hidden rounded-full bg-gray-200">
      <div className={`h-full rounded-full bg-[#4b41e1] ${progress}`} />
    </div>
    <p className="mt-1 text-xs text-gray-500">{note}</p>
  </>
);

const DetailPair = ({ label, value }) => (
  <div>
    <span className="block text-xs text-gray-500">{label}</span>
    <strong className="mt-1 block text-[#0e1a39]">{value}</strong>
  </div>
);

const LegendDot = ({ color, label }) => (
  <div className="flex items-center gap-1.5">
    <span className={`h-3 w-3 rounded-full ${color}`} />
    <span className="font-medium text-gray-700">{label}</span>
  </div>
);

export default IncidentMap;