import { useState } from "react";
import { useNavigate } from "react-router-dom";
import ResidentLayout from "../../layouts/ResidentLayout";
import DisasterMap from "../../components/DisasterMap";
import { useDisaster } from "../../context/DisasterContext";
import { useShelters } from "../../context/ShelterContext";

export default function ResidentLiveDisasterMap() {
  const navigate = useNavigate();
  const { incidents } = useDisaster();
  const { shelters } = useShelters();

  const [showIncidents, setShowIncidents] = useState(true);
  const [showShelters, setShowShelters] = useState(true);
  const [showFloodRisk, setShowFloodRisk] = useState(true);

  // ---------- Stats ----------
  const totalIncidents = incidents.length;
  const totalAffected = incidents.reduce(
    (sum, i) => sum + (parseInt(i.peopleAffected) || 0),
    0
  );
  const criticalIncidents = incidents.filter(
    (i) => i.severity === "Critical" || i.severity === "CRITICAL"
  ).length;
  const highRiskIncidents = incidents.filter((i) => i.severity === "High").length;
  const uniqueLocations = [
    ...new Set(incidents.map((i) => i.location).filter(Boolean)),
  ];

  const topCritical = incidents.find(
    (i) => i.severity === "Critical" || i.severity === "CRITICAL"
  );

  // ---------- Header extras ----------
  const headerExtras = (
    <div className="hidden text-right md:block">
      <p className="text-sm font-semibold text-black">
        {totalIncidents} active incidents
      </p>
      <p className="text-xs text-gray-500">
        {criticalIncidents} critical • {totalAffected} people affected
      </p>
    </div>
  );

  return (
    <ResidentLayout title="Live Disaster Map" headerRight={headerExtras}>
      <div className="relative -mx-4 -mt-6 -mb-10 md:-mx-8">
        <div className="relative h-[calc(100vh-72px)]">
          <div className="absolute inset-0">
            <DisasterMap
              incidents={showIncidents ? incidents : []}
              shelters={showShelters ? shelters : []}
              center={[27.7172, 85.324]}
              zoom={12}
              height="100%"
            />
          </div>

          {/* ================= LEFT PANEL — MAP LAYERS ================= */}
          <div className="absolute left-4 top-4 z-20 w-56 rounded-xl border border-gray-200 bg-white/95 p-4 shadow-lg backdrop-blur">
            <h3 className="mb-3 flex items-center gap-1 text-sm font-bold text-[#1b1b1e]">
              <span className="material-symbols-outlined text-[18px]">layers</span>
              Map Layers
            </h3>

            <div className="space-y-2.5">
              <LayerToggle
                color="bg-[#ba1a1a]"
                label="Incidents"
                count={totalIncidents}
                checked={showIncidents}
                onChange={() => setShowIncidents(!showIncidents)}
              />
              <LayerToggle
                emoji="🌊"
                emojiColor="text-[#4b41e1]"
                label="Flood Risk"
                checked={showFloodRisk}
                onChange={() => setShowFloodRisk(!showFloodRisk)}
              />
              <LayerToggle
                emoji="🏠"
                emojiColor="text-[#2e7d32]"
                label="Shelters"
                count={shelters.length}
                checked={showShelters}
                onChange={() => setShowShelters(!showShelters)}
              />
              <LayerToggle
                emoji="🚧"
                emojiColor="text-[#76767f]"
                label="Blocked Roads"
                checked={false}
                disabled
              />
              <LayerToggle
                emoji="🚨"
                emojiColor="text-[#76767f]"
                label="Evacuation Zones"
                checked={false}
                disabled
              />
            </div>

            <div className="mt-3 border-t border-gray-200 pt-3">
              <MiniStat label="Critical" value={criticalIncidents} valueClass="text-[#ba1a1a]" />
              <MiniStat label="High Risk" value={highRiskIncidents} valueClass="text-[#623f24]" />
              <MiniStat label="Total" value={totalIncidents} />
            </div>
          </div>

          {/* ================= RIGHT PANEL — AREA STATUS ================= */}
          <div className="absolute right-4 top-4 z-20 max-h-[calc(100vh-200px)] w-64 overflow-y-auto rounded-xl border border-gray-200 bg-white/95 p-4 shadow-lg backdrop-blur">
            <h3 className="text-sm font-bold text-[#1b1b1e]">Current Area Status</h3>
            <p className="text-xs text-gray-500">Kathmandu Valley</p>

            <div
              className={`mt-3 rounded-xl p-3 text-center ${
                criticalIncidents > 0
                  ? "border border-red-200 bg-red-50"
                  : highRiskIncidents > 0
                  ? "border border-orange-200 bg-orange-50"
                  : "border border-green-200 bg-green-50"
              }`}
            >
              <p className="text-xs font-bold uppercase tracking-widest text-gray-500">
                Overall Risk Level
              </p>
              <p
                className={`text-2xl font-bold ${
                  criticalIncidents > 0
                    ? "text-[#ba1a1a]"
                    : highRiskIncidents > 0
                    ? "text-[#623f24]"
                    : "text-[#2e7d32]"
                }`}
              >
                {criticalIncidents > 0
                  ? "CRITICAL"
                  : highRiskIncidents > 0
                  ? "HIGH"
                  : "MODERATE"}
              </p>
            </div>

            <div className="mt-3 grid grid-cols-2 gap-2">
              <AreaStat value={totalIncidents} label="Active" />
              <AreaStat value={criticalIncidents} label="Critical" valueClass="text-[#ba1a1a]" />
              <AreaStat value={totalAffected} label="Affected" />
              <AreaStat value={uniqueLocations.length} label="Locations" />
            </div>

            <div className="mt-3 border-t border-gray-200 pt-3">
              <p className="mb-2 text-xs font-bold uppercase text-gray-500">
                Emergency Assistance
              </p>
              {uniqueLocations.slice(0, 3).map((location, i) => {
                const locationIncidents = incidents.filter(
                  (inc) => inc.location === location
                );
                const distance = (Math.random() * 3 + 0.5).toFixed(1);
                return (
                  <div
                    key={i}
                    className="-mx-2 flex items-center gap-2 rounded-lg px-2 py-1.5 text-sm transition hover:bg-gray-50"
                  >
                    <span className="text-[#2e7d32]">🏠</span>
                    <span className="flex-1 truncate text-gray-700">{location}</span>
                    <span className="text-xs text-gray-400">
                      {locationIncidents.length} nearby
                    </span>
                    <span className="text-xs font-medium text-blue-600">
                      {distance}km
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* ================= CRITICAL WARNING CARD ================= */}
          {topCritical && (
            <div className="absolute bottom-24 left-4 z-20 max-w-sm overflow-hidden rounded-xl border border-red-200 bg-white/95 shadow-lg backdrop-blur">
              <div className="flex items-center gap-2 bg-red-600 px-4 py-2 text-white">
                <span className="material-symbols-outlined text-[18px]">warning</span>
                <span className="text-sm font-bold">Critical Flood Warning</span>
                <span className="ml-auto rounded-full bg-red-500/50 px-2 py-0.5 text-[10px]">
                  Active
                </span>
              </div>

              <div className="p-4">
                <h4 className="font-bold text-[#1b1b1e]">
                  {topCritical.title || "Teku Confluence"}
                </h4>
                <p className="text-xs text-gray-500">
                  {topCritical.location || "Kathmandu"} • Reported just now
                </p>
                <p className="mt-2 text-sm text-gray-600">
                  {topCritical.description ||
                    "Bagmati river has breached warning levels. Evacuation of low-lying areas recommended."}
                </p>

                <div className="mt-3 grid grid-cols-2 gap-3">
                  <div className="rounded-lg bg-gray-50 p-2 text-center">
                    <p className="text-xs text-gray-500">WATER LEVEL</p>
                    <p className="text-lg font-bold text-red-600">
                      {topCritical.waterLevel || "6.4"}m
                    </p>
                  </div>
                  <div className="rounded-lg bg-gray-50 p-2 text-center">
                    <p className="text-xs text-gray-500">RAINFALL (24H)</p>
                    <p className="text-lg font-bold text-blue-600">120mm</p>
                  </div>
                </div>

                <div className="mt-3 flex items-center justify-between border-t border-gray-200 pt-3">
                  <div>
                    <p className="text-xs text-gray-500">PEOPLE AFFECTED</p>
                    <p className="text-sm font-bold">
                      ~{topCritical.peopleAffected || 450} Residents
                    </p>
                  </div>
                  <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-bold text-green-700">
                    Active Response
                  </span>
                </div>

                <button className="mt-3 w-full text-center text-sm font-semibold text-[#4b41e1] hover:underline">
                  View Full Report →
                </button>
              </div>
            </div>
          )}

          {/* ================= BOTTOM LEGEND ================= */}
          <div className="absolute bottom-4 left-1/2 z-20 flex -translate-x-1/2 items-center gap-5 rounded-full border border-gray-200 bg-white/90 px-5 py-2.5 text-xs shadow-lg backdrop-blur">
            <LegendDot color="bg-[#ba1a1a]" label="Critical" />
            <LegendDot color="bg-[#623f24]" label="High" />
            <LegendDot color="bg-[#f0bc98]" label="Moderate" />
            <LegendDot color="bg-[#2e7d32]" label="Low" />
            <div className="h-5 w-px bg-gray-300" />
            <div className="flex items-center gap-1.5">
              <span className="text-base text-[#4b41e1]">🏠</span>
              <span className="font-medium text-gray-700">Shelter</span>
            </div>
            <div className="h-5 w-px bg-gray-300" />
            <div className="flex items-center gap-1.5">
              <span className="text-base text-[#76767f]">🚧</span>
              <span className="font-medium text-gray-700">Blocked Road</span>
            </div>
          </div>

          {/* ================= ZOOM CONTROLS ================= */}
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
        </div>
      </div>
    </ResidentLayout>
  );
}

/* ---------- Small helpers ---------- */

const LayerToggle = ({
  color,
  emoji,
  emojiColor = "text-gray-600",
  label,
  count,
  checked,
  onChange,
  disabled = false,
}) => (
  <label
    className={`flex cursor-pointer items-center justify-between text-sm ${
      disabled ? "pointer-events-none opacity-50" : ""
    }`}
  >
    <span className="flex items-center gap-2">
      {color ? (
        <span className={`h-2.5 w-2.5 rounded-full ${color}`} />
      ) : (
        <span className={`text-base ${emojiColor}`}>{emoji}</span>
      )}
      <span className="font-medium">
        {label}
        {count !== undefined && ` (${count})`}
      </span>
    </span>
    <input
      type="checkbox"
      checked={checked}
      onChange={onChange}
      disabled={disabled}
      className="h-4 w-4 rounded accent-[#4b41e1]"
    />
  </label>
);

const MiniStat = ({ label, value, valueClass = "" }) => (
  <div className="mt-1 flex justify-between text-xs">
    <span className="text-gray-500">{label}</span>
    <span className={`font-bold ${valueClass}`}>{value}</span>
  </div>
);

const AreaStat = ({ value, label, valueClass = "" }) => (
  <div className="rounded-xl bg-gray-50 p-3 text-center">
    <p className={`text-xl font-bold ${valueClass}`}>{value}</p>
    <p className="text-[10px] font-bold uppercase text-gray-500">{label}</p>
  </div>
);

const LegendDot = ({ color, label }) => (
  <div className="flex items-center gap-1.5">
    <span className={`h-3 w-3 rounded-full ${color}`} />
    <span className="font-medium text-gray-700">{label}</span>
  </div>
);