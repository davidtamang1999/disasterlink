import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import ResidentLayout from "../../layouts/ResidentLayout";
import { useDisaster } from "../../context/DisasterContext";
import { useAuth } from "../../context/AuthContext";
import { useResources } from "../../context/ResourceContext";
import { useToast } from "../../components/shared";

function EmergencyResources() {
  const navigate = useNavigate();
  const { incidents } = useDisaster();
  const { currentUser } = useAuth();
  const { getShortageAlerts, getResourceSummary } = useResources();
  const toast = useToast();

  const [resources, setResources] = useState([]);
  const [filteredResources, setFilteredResources] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [distanceFilter, setDistanceFilter] = useState("all");
  const [selectedResource, setSelectedResource] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [userLocation, setUserLocation] = useState(null);

  const shortages = getShortageAlerts();
  const resourceSummary = getResourceSummary();

  // ---------- Load resources + user location ----------
  useEffect(() => {
    loadResources();

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
        },
        () => setUserLocation({ lat: 27.7172, lng: 85.324 })
      );
    } else {
      setUserLocation({ lat: 27.7172, lng: 85.324 });
    }
  }, []);

  const loadResources = () => {
    const savedResources = JSON.parse(
      localStorage.getItem("emergencyResources") || "[]"
    );

    if (savedResources.length > 0) {
      setResources(savedResources);
      setFilteredResources(savedResources);
      return;
    }

    const defaultResources = [
      {
        id: "res-001",
        name: "Kathmandu Community Hall",
        type: "Shelter",
        typeIcon: "house",
        distance: "1.2",
        status: "Open",
        occupancy: 380,
        capacity: 500,
        facilities: ["Water", "Medical", "Accessible"],
        address: "Kathmandu, Nepal",
        lat: 27.7172,
        lng: 85.324,
        phone: "+977-1-4245678",
        description:
          "Community shelter with basic amenities. Currently accepting evacuees.",
        color: "#4b41e1",
        currentStock: 500,
        minThreshold: 300,
        unit: "spaces",
      },
      {
        id: "res-002",
        name: "Patan Hospital",
        type: "Medical Center",
        typeIcon: "local_hospital",
        distance: "2.5",
        status: "Urgent",
        occupancy: 45,
        capacity: 80,
        facilities: ["Emergency ER", "Blood Bank", "Surgery"],
        address: "Lalitpur, Nepal",
        lat: 27.6772,
        lng: 85.324,
        phone: "+977-1-5432100",
        description:
          "Emergency medical services available. High patient volume expected.",
        color: "#ba1a1a",
        currentStock: 45,
        minThreshold: 100,
        unit: "kits",
      },
      {
        id: "res-003",
        name: "Baneshwor Supply Point",
        type: "Food & Water",
        typeIcon: "inventory_2",
        distance: "0.8",
        status: "Open",
        occupancy: 0,
        capacity: 0,
        facilities: ["Dry Rations", "Clean Water", "Hygiene Kits"],
        address: "Baneshwor, Kathmandu",
        lat: 27.7,
        lng: 85.33,
        phone: "+977-1-4789012",
        description: "Distributing essential supplies. ID required for collection.",
        color: "#4b41e1",
        currentStock: 120,
        minThreshold: 500,
        unit: "btls",
      },
      {
        id: "res-004",
        name: "Swayambhu Rescue Center",
        type: "Rescue Team",
        typeIcon: "volunteer_activism",
        distance: "3.1",
        status: "Active",
        occupancy: 12,
        capacity: 20,
        facilities: ["Rescue Equipment", "First Aid", "Communication"],
        address: "Swayambhu, Kathmandu",
        lat: 27.7147,
        lng: 85.3067,
        phone: "+977-1-4356789",
        description:
          "Rescue team ready for deployment. Specialized in flood and landslide response.",
        color: "#FF9800",
        currentStock: 12,
        minThreshold: 15,
        unit: "boats",
      },
      {
        id: "res-005",
        name: "Teku Relief Camp",
        type: "Shelter",
        typeIcon: "house",
        distance: "0.5",
        status: "Full",
        occupancy: 150,
        capacity: 150,
        facilities: ["Water", "Food", "Sanitation"],
        address: "Teku, Kathmandu",
        lat: 27.7005,
        lng: 85.318,
        phone: "+977-1-4246789",
        description:
          "Relief camp at capacity. Directing new arrivals to Kathmandu Community Hall.",
        color: "#FF5252",
        currentStock: 150,
        minThreshold: 150,
        unit: "spaces",
      },
      {
        id: "res-006",
        name: "Bhaktapur Medical Clinic",
        type: "Medical Center",
        typeIcon: "local_hospital",
        distance: "8.5",
        status: "Open",
        occupancy: 20,
        capacity: 30,
        facilities: ["General Checkup", "Medication", "Minor Surgery"],
        address: "Bhaktapur, Nepal",
        lat: 27.6722,
        lng: 85.43,
        phone: "+977-1-6612345",
        description:
          "Medical clinic providing primary care and emergency treatment.",
        color: "#4CAF50",
        currentStock: 30,
        minThreshold: 80,
        unit: "supplies",
      },
    ];

    localStorage.setItem("emergencyResources", JSON.stringify(defaultResources));
    setResources(defaultResources);
    setFilteredResources(defaultResources);
  };

  // ---------- Filters ----------
  const applyFilters = (list, search, type, status, distance) => {
    let filtered = list;

    if (search) {
      const q = search.toLowerCase();
      filtered = filtered.filter(
        (r) =>
          r.name?.toLowerCase().includes(q) ||
          r.address?.toLowerCase().includes(q) ||
          r.type?.toLowerCase().includes(q) ||
          r.description?.toLowerCase().includes(q)
      );
    }

    if (type !== "all") filtered = filtered.filter((r) => r.type === type);
    if (status !== "all") filtered = filtered.filter((r) => r.status === status);

    if (distance !== "all" && userLocation) {
      filtered = filtered.filter((r) => {
        const dist = parseFloat(r.distance) || 0;
        switch (distance) {
          case "2":
            return dist < 2;
          case "5":
            return dist < 5;
          case "10":
            return dist < 10;
          default:
            return true;
        }
      });
    }

    setFilteredResources(filtered);
  };

  const handleSearch = (e) => {
    const v = e.target.value;
    setSearchTerm(v);
    applyFilters(resources, v, typeFilter, statusFilter, distanceFilter);
  };

  const handleTypeFilter = (e) => {
    const v = e.target.value;
    setTypeFilter(v);
    applyFilters(resources, searchTerm, v, statusFilter, distanceFilter);
  };

  const handleStatusFilter = (e) => {
    const v = e.target.value;
    setStatusFilter(v);
    applyFilters(resources, searchTerm, typeFilter, v, distanceFilter);
  };

  const handleDistanceFilter = (e) => {
    const v = e.target.value;
    setDistanceFilter(v);
    applyFilters(resources, searchTerm, typeFilter, statusFilter, v);
  };

  const clearFilters = () => {
    setSearchTerm("");
    setTypeFilter("all");
    setStatusFilter("all");
    setDistanceFilter("all");
    setFilteredResources(resources);
  };

  // ---------- Stats helpers ----------
  const getResourceCount = (type) => resources.filter((r) => r.type === type).length;
  const getStatusCount = (status) => resources.filter((r) => r.status === status).length;

  const totalShelters = getResourceCount("Shelter");
  const totalMedical = getResourceCount("Medical Center");
  const totalResources = resources.length;
  const totalVolunteerTeams = getResourceCount("Rescue Team");
  const urgentResources = getStatusCount("Urgent");

  // ---------- Styling helpers ----------
  const getStatusColor = (status) => {
    const colors = {
      Open: "bg-[#dcfce7] text-[#166534]",
      Urgent: "bg-[#ffdad6] text-[#93000a]",
      Full: "bg-[#ffdad6] text-[#93000a]",
      Active: "bg-[#dbe1ff] text-[#0e1a39]",
    };
    return colors[status] || "bg-[#e4e2e5] text-[#45464e]";
  };

  const getOccupancyPercentage = (occupancy, capacity) => {
    if (capacity === 0) return 0;
    return Math.round((occupancy / capacity) * 100);
  };

  const getOccupancyColor = (percentage) => {
    if (percentage > 90) return "bg-red-500";
    if (percentage > 70) return "bg-orange-500";
    return "bg-[#4b41e1]";
  };

  const hasShortage = (resource) =>
    resource.currentStock !== undefined &&
    resource.minThreshold !== undefined &&
    resource.currentStock < resource.minThreshold;

  const getShortageSeverity = (resource) => {
    if (!hasShortage(resource)) return null;
    const ratio = resource.currentStock / resource.minThreshold;
    if (ratio < 0.3) return "Critical";
    if (ratio < 0.5) return "Low";
    return "Moderate";
  };

  const emergencyContacts = [
    { name: "Police", number: "100", icon: "local_police" },
    { name: "Fire", number: "101", icon: "fire_extinguisher" },
    { name: "Ambulance", number: "102", icon: "medical_services" },
    { name: "Disaster Mgmt", number: "1144", icon: "warning" },
  ];

  const handleUseMyLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
          applyFilters(
            resources,
            searchTerm,
            typeFilter,
            statusFilter,
            distanceFilter
          );
          toast.success("Location updated successfully!");
        },
        () => {
          toast.error("Unable to get your location. Please enable location services.");
        }
      );
    } else {
      toast.error("Geolocation is not supported by your browser.");
    }
  };

  // ---------- Header extras ----------
  const headerExtras = (
    <div className="flex items-center gap-2 text-sm">
      <span className="material-symbols-outlined text-[#4b41e1]">location_on</span>
      <span className="font-semibold text-[#1b1b1e]">Kathmandu Valley</span>
    </div>
  );

  return (
    <ResidentLayout title="Emergency Resources" headerRight={headerExtras}>
      <div className="mx-auto flex w-full max-w-[1440px] flex-col gap-6">

        {/* ================= HEADER ================= */}
        <div className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
          <div>
            <h2 className="text-3xl font-semibold text-black">Emergency Resources</h2>
            <p className="mt-2 max-w-2xl text-base text-[#45464e]">
              Find nearby shelters, medical assistance, supplies, and community support during emergencies.
            </p>
          </div>

          <div className="flex w-full items-center gap-2 md:w-auto">
            <button
              onClick={() => navigate("/resident/map")}
              className="flex flex-1 items-center justify-center gap-2 rounded-lg border border-[#0e1a39]/20 px-4 py-3 font-semibold text-[#0e1a39] transition-colors hover:bg-[#e4e2e5] md:flex-none"
            >
              <span className="material-symbols-outlined">map</span>
              View Map
            </button>
            <button
              onClick={() => navigate("/report-disaster")}
              className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-[#4b41e1] px-4 py-3 font-semibold text-white shadow-sm transition-colors hover:bg-[#645efb] md:flex-none"
            >
              <span className="material-symbols-outlined">volunteer_activism</span>
              Offer Help
            </button>
          </div>
        </div>

        {/* ================= SHORTAGE BANNER ================= */}
        {resourceSummary.criticalShortages > 0 && (
          <div className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4">
            <span className="material-symbols-outlined mt-0.5 text-red-600">warning</span>
            <div>
              <h4 className="font-semibold text-red-600">Resource Shortage Alert</h4>
              <p className="text-sm text-red-600/80">
                {resourceSummary.criticalShortages} critical resource
                {resourceSummary.criticalShortages > 1 ? "s" : ""} shortage
                {resourceSummary.criticalShortages > 1 ? "s" : ""} detected.
                {shortages.slice(0, 3).map((s, i) => (
                  <span key={s.id}>
                    {i === 0 ? " " : ", "}
                    <span className="font-bold">{s.name}</span> (-{s.shortage} {s.unit})
                  </span>
                ))}
                {shortages.length > 3 && ` and ${shortages.length - 3} more.`}
              </p>
            </div>
          </div>
        )}

        {/* ================= STATS ================= */}
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          <StatTile
            icon="house"
            iconColor="text-[#4b41e1]"
            badge="Active"
            badgeClass="bg-[#e0f2fe] text-[#0369a1]"
            value={totalShelters}
            label="Open Shelters"
          />
          <StatTile
            icon="local_hospital"
            iconColor="text-[#ba1a1a]"
            badge={urgentResources > 0 ? "Urgent" : "Active"}
            badgeClass="bg-[#ffdad6] text-[#93000a]"
            value={totalMedical}
            label="Medical Centers"
          />
          <StatTile
            icon="inventory_2"
            iconColor="text-[#4b41e1]"
            badge={
              resourceSummary.totalShortageItems > 0
                ? `${resourceSummary.totalShortageItems} Shortages`
                : null
            }
            badgeClass="bg-red-100 text-red-600"
            value={totalResources}
            label="Available Resources"
          />
          <StatTile
            icon="group"
            iconColor="text-[#4b41e1]"
            value={totalVolunteerTeams}
            label="Active Volunteer Teams"
          />
        </div>

        {/* ================= SEARCH + FILTERS ================= */}
        <div className="flex flex-col items-center gap-4 rounded-[20px] border border-[#e4e2e5] bg-white p-4 shadow-sm md:flex-row">
          <div className="relative w-full flex-1">
            <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-[#45464e]">
              search
            </span>
            <input
              className="w-full rounded-lg border-none bg-[#EDF0F5] py-3 pl-12 pr-4 outline-none focus:ring-2 focus:ring-[#4b41e1]"
              placeholder="Search resources or locations..."
              type="text"
              value={searchTerm}
              onChange={handleSearch}
            />
          </div>

          <div className="flex w-full items-center gap-2 overflow-x-auto md:w-auto">
            <FilterSelect value={typeFilter} onChange={handleTypeFilter} defaultLabel="Resource Type">
              <option value="all">Resource Type</option>
              <option value="Shelter">Shelters</option>
              <option value="Medical Center">Medical</option>
              <option value="Food & Water">Food & Water</option>
              <option value="Rescue Team">Rescue Teams</option>
            </FilterSelect>

            <FilterSelect value={statusFilter} onChange={handleStatusFilter} defaultLabel="Status">
              <option value="all">Status</option>
              <option value="Open">Open</option>
              <option value="Full">Full</option>
              <option value="Urgent">Urgent</option>
              <option value="Active">Active</option>
            </FilterSelect>

            <FilterSelect value={distanceFilter} onChange={handleDistanceFilter} defaultLabel="Distance">
              <option value="all">Distance</option>
              <option value="2">&lt; 2km</option>
              <option value="5">&lt; 5km</option>
              <option value="10">&lt; 10km</option>
            </FilterSelect>

            {(searchTerm || typeFilter !== "all" || statusFilter !== "all" || distanceFilter !== "all") && (
              <button
                onClick={clearFilters}
                className="whitespace-nowrap px-4 py-3 font-semibold text-[#4b41e1] hover:underline"
              >
                Clear Filters
              </button>
            )}

            <button
              onClick={handleUseMyLocation}
              className="flex items-center gap-1 whitespace-nowrap rounded-lg bg-[#EDF0F5] px-4 py-3 font-semibold text-black transition-colors hover:bg-[#e4e2e5]"
            >
              <span className="material-symbols-outlined text-[18px]">my_location</span>
              Use My Location
            </button>
          </div>
        </div>

        {/* ================= MAIN GRID ================= */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Left column — resource list */}
          <div className="flex flex-col gap-4 lg:col-span-2">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-semibold">Nearby Resources</h3>
              <span className="text-sm text-[#45464e]">
                {filteredResources.length} resources found
              </span>
            </div>

            {filteredResources.length > 0 ? (
              filteredResources.map((resource) => (
                <ResourceCard
                  key={resource.id}
                  resource={resource}
                  onViewDetails={() => {
                    setSelectedResource(resource);
                    setShowDetailModal(true);
                  }}
                  onDirections={() => {
                    const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${
                      resource.lat || 27.7172
                    },${resource.lng || 85.324}`;
                    window.open(mapsUrl, "_blank");
                  }}
                  getStatusColor={getStatusColor}
                  getOccupancyPercentage={getOccupancyPercentage}
                  getOccupancyColor={getOccupancyColor}
                  getShortageSeverity={getShortageSeverity}
                  hasShortage={hasShortage}
                />
              ))
            ) : (
              <div className="rounded-[20px] border border-[#e4e2e5] bg-white p-12 text-center shadow-sm">
                <span className="material-symbols-outlined mb-4 block text-6xl text-gray-300">
                  search_off
                </span>
                <h4 className="text-xl font-semibold">No Resources Found</h4>
                <p className="mt-2 text-[#45464e]">
                  Try adjusting your filters or search terms
                </p>
                <button
                  onClick={clearFilters}
                  className="mt-4 rounded-lg bg-[#4b41e1] px-6 py-2 text-white transition-colors hover:bg-[#645efb]"
                >
                  Clear All Filters
                </button>
              </div>
            )}
          </div>

          {/* Right column */}
          <div className="flex flex-col gap-6">
            <ResourceMapPreview
              resources={filteredResources}
              onOpenMap={() => navigate("/resident/map")}
            />

            <EmergencyContactsCard contacts={emergencyContacts} />

            <SafetyTipsCard />
          </div>
        </div>
      </div>

      {/* ================= DETAIL MODAL ================= */}
      {showDetailModal && selectedResource && (
        <ResourceDetailModal
          resource={selectedResource}
          onClose={() => setShowDetailModal(false)}
          getStatusColor={getStatusColor}
          hasShortage={hasShortage}
          getShortageSeverity={getShortageSeverity}
        />
      )}
    </ResidentLayout>
  );
}

/* ---------- Helper components ---------- */

const StatTile = ({ icon, iconColor, badge, badgeClass, value, label }) => (
  <div className="flex flex-col rounded-[20px] border border-[#e4e2e5] bg-white p-6 shadow-sm">
    <div className="mb-2 flex items-center justify-between">
      <span className={`material-symbols-outlined ${iconColor}`}>{icon}</span>
      {badge && (
        <span className={`rounded-full px-2 py-1 text-xs font-bold ${badgeClass}`}>
          {badge}
        </span>
      )}
    </div>
    <span className="text-3xl font-bold">{value}</span>
    <span className="mt-1 text-xs font-bold text-[#45464e]">{label}</span>
  </div>
);

const FilterSelect = ({ value, onChange, children }) => (
  <select
    value={value}
    onChange={onChange}
    className="rounded-lg border-none bg-[#EDF0F5] px-3 py-3 text-sm outline-none focus:ring-2 focus:ring-[#4b41e1]"
  >
    {children}
  </select>
);

const ResourceCard = ({
  resource,
  onViewDetails,
  onDirections,
  getStatusColor,
  getOccupancyPercentage,
  getOccupancyColor,
  getShortageSeverity,
  hasShortage,
}) => {
  const occupancyPercentage = getOccupancyPercentage(resource.occupancy, resource.capacity);
  const shortageSeverity = getShortageSeverity(resource);
  const shortageAmount =
    resource.minThreshold && resource.currentStock !== undefined
      ? resource.minThreshold - resource.currentStock
      : 0;

  return (
    <div className="flex flex-col gap-4 rounded-[20px] border border-[#e4e2e5] bg-white p-6 shadow-sm transition-shadow hover:shadow-md">
      <div className="flex flex-col gap-4 sm:flex-row">
        <div
          className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full"
          style={{
            backgroundColor: `${resource.color}20`,
            color: resource.color,
          }}
        >
          <span className="material-symbols-outlined">
            {resource.typeIcon || "inventory_2"}
          </span>
        </div>

        <div className="flex-1">
          <div className="flex flex-wrap items-start justify-between gap-2">
            <div>
              <h4 className="text-xl font-semibold">{resource.name}</h4>
              <p className="text-sm text-[#45464e]">
                {resource.type} • {resource.distance}km away
              </p>
            </div>
            <span
              className={`rounded-full px-2 py-1 text-xs font-bold ${getStatusColor(resource.status)}`}
            >
              {resource.status}
            </span>
          </div>

          {shortageSeverity && (
            <div
              className={`mt-2 flex items-center gap-2 rounded-lg border px-3 py-1.5 ${
                shortageSeverity === "Critical"
                  ? "border-red-200 bg-red-50 text-red-600"
                  : shortageSeverity === "Low"
                  ? "border-orange-200 bg-orange-50 text-orange-500"
                  : "border-yellow-200 bg-yellow-50 text-yellow-600"
              }`}
            >
              <span className="material-symbols-outlined text-sm">
                {shortageSeverity === "Critical" ? "warning" : "priority_high"}
              </span>
              <span className="text-xs font-bold">
                {shortageSeverity === "Critical" ? "CRITICAL" : "Low"} Stock:{" "}
                {shortageAmount} {resource.unit} needed
              </span>
            </div>
          )}

          {resource.type === "Shelter" && resource.capacity > 0 && (
            <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3">
              <div className="flex flex-col">
                <span className="text-xs text-[#45464e]">Occupancy</span>
                <span className="font-semibold">
                  {resource.occupancy}/{resource.capacity} spaces
                </span>
                <div className="mt-1 h-1.5 w-full rounded-full bg-[#e4e2e5]">
                  <div
                    className={`h-full rounded-full ${getOccupancyColor(occupancyPercentage)}`}
                    style={{ width: `${Math.min(occupancyPercentage, 100)}%` }}
                  />
                </div>
              </div>

              {resource.facilities && resource.facilities.length > 0 && (
                <div className="flex flex-col">
                  <span className="text-xs text-[#45464e]">Facilities</span>
                  <div className="mt-1 flex gap-1">
                    {resource.facilities.slice(0, 3).map((facility, idx) => (
                      <span key={idx} className="rounded bg-[#f5f7fb] px-1.5 py-0.5 text-xs">
                        {facility}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {resource.description && (
            <p className="mt-2 text-sm text-[#45464e]">{resource.description}</p>
          )}
        </div>
      </div>

      <div className="mt-4 flex gap-2 border-t border-[#c6c6cf] pt-4">
        <button
          onClick={onViewDetails}
          className="flex-1 rounded-lg border border-[#4b41e1] py-2 font-semibold text-[#4b41e1] transition-colors hover:bg-[#4b41e1]/5"
        >
          View Details
        </button>
        <button
          onClick={onDirections}
          className="flex-1 rounded-lg bg-[#4b41e1] py-2 font-semibold text-white transition-colors hover:bg-[#645efb]"
        >
          Get Directions
        </button>
      </div>
    </div>
  );
};

const ResourceMapPreview = ({ resources, onOpenMap }) => (
  <div className="relative h-64 overflow-hidden rounded-[20px] border border-[#e4e2e5] bg-white shadow-sm">
    <div className="relative flex h-full w-full items-center justify-center bg-[#e4e2e5]">
      <div className="text-center">
        <span className="material-symbols-outlined mb-2 block text-4xl text-[#4b41e1]">
          map
        </span>
        <p className="text-sm text-[#45464e]">Resource Map</p>
        <p className="text-xs text-[#45464e]">{resources.length} resources shown</p>
      </div>

      <div className="pointer-events-none absolute inset-0">
        {resources.slice(0, 5).map((resource, idx) => (
          <div
            key={idx}
            className="absolute flex h-6 w-6 items-center justify-center rounded-full text-white"
            style={{
              backgroundColor: resource.color || "#4b41e1",
              left: `${10 + Math.random() * 80}%`,
              top: `${10 + Math.random() * 80}%`,
            }}
          >
            <span className="material-symbols-outlined text-[14px]">location_on</span>
          </div>
        ))}
      </div>
    </div>

    <div className="absolute inset-0 flex items-end bg-gradient-to-t from-black/30 to-transparent p-4">
      <button
        onClick={onOpenMap}
        className="w-full rounded-lg bg-white py-3 font-semibold text-black shadow transition-colors hover:bg-gray-50"
      >
        Open Interactive Map
      </button>
    </div>
  </div>
);

const EmergencyContactsCard = ({ contacts }) => (
  <div className="rounded-[20px] border border-[#e4e2e5] bg-white p-6 shadow-sm">
    <h3 className="mb-4 text-xl font-semibold">Emergency Contacts</h3>
    <div className="grid grid-cols-2 gap-2">
      {contacts.map((contact) => (
        <div
          key={contact.number}
          className="flex cursor-pointer flex-col items-center rounded-lg bg-[#ffdad6]/30 p-3 transition-colors hover:bg-[#ffdad6]/50"
          onClick={() => {
            window.location.href = `tel:${contact.number}`;
          }}
        >
          <span className="material-symbols-outlined text-2xl text-[#ba1a1a]">
            {contact.icon}
          </span>
          <span className="text-2xl font-bold text-[#ba1a1a]">{contact.number}</span>
          <span className="text-[10px] font-bold text-[#ba1a1a]">{contact.name}</span>
        </div>
      ))}
    </div>
  </div>
);

const SafetyTipsCard = () => (
  <div className="rounded-[20px] bg-[#0e1a39] p-6 text-white shadow-md">
    <h4 className="mb-4 flex items-center gap-2 text-sm font-bold">
      <span className="material-symbols-outlined text-[#c0c1ff]">lightbulb</span>
      Safety Tips
    </h4>
    <ul className="space-y-3 text-sm">
      {[
        "Stay informed through official alerts",
        "Keep emergency contacts ready",
        "Pack essential items for evacuation",
        "Follow instructions from authorities",
      ].map((tip) => (
        <li key={tip} className="flex items-start gap-2">
          <span className="text-[#c0c1ff]">•</span>
          {tip}
        </li>
      ))}
    </ul>
  </div>
);

const ResourceDetailModal = ({
  resource,
  onClose,
  getStatusColor,
  hasShortage,
  getShortageSeverity,
}) => {
  const shortageSeverity = getShortageSeverity(resource);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="flex max-h-[90vh] w-full max-w-2xl flex-col rounded-2xl bg-white">
        <div className="sticky top-0 flex items-center justify-between border-b border-gray-200 bg-white p-6">
          <h3 className="text-2xl font-bold">Resource Details</h3>
          <button onClick={onClose} className="rounded-lg p-2 hover:bg-gray-100">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        <div className="flex-1 space-y-4 overflow-y-auto p-6">
          <div className="flex items-center gap-4">
            <div
              className="flex h-16 w-16 items-center justify-center rounded-full"
              style={{
                backgroundColor: `${resource.color}20`,
                color: resource.color,
              }}
            >
              <span className="material-symbols-outlined text-3xl">
                {resource.typeIcon || "inventory_2"}
              </span>
            </div>
            <div>
              <h4 className="text-2xl font-bold">{resource.name}</h4>
              <p className="text-[#45464e]">{resource.type}</p>
            </div>
          </div>

          {hasShortage(resource) && (
            <div
              className={`rounded-lg border p-3 ${
                shortageSeverity === "Critical"
                  ? "border-red-200 bg-red-50"
                  : "border-orange-200 bg-orange-50"
              }`}
            >
              <p
                className={`text-sm font-bold ${
                  shortageSeverity === "Critical" ? "text-red-600" : "text-orange-500"
                }`}
              >
                {shortageSeverity === "Critical" ? "⚠️ CRITICAL" : "⚠️ Low"} Stock Alert
              </p>
              <p className="text-sm">
                Current: {resource.currentStock} {resource.unit} • Minimum Required:{" "}
                {resource.minThreshold} {resource.unit}
              </p>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div className="rounded-lg bg-[#f5f7fb] p-4">
              <p className="text-xs text-[#45464e]">Status</p>
              <p
                className={`inline-block rounded-full px-2 py-0.5 text-xs font-semibold ${getStatusColor(
                  resource.status
                )}`}
              >
                {resource.status}
              </p>
            </div>
            <div className="rounded-lg bg-[#f5f7fb] p-4">
              <p className="text-xs text-[#45464e]">Distance</p>
              <p className="font-semibold">{resource.distance} km</p>
            </div>

            {resource.capacity > 0 && (
              <>
                <div className="rounded-lg bg-[#f5f7fb] p-4">
                  <p className="text-xs text-[#45464e]">Occupancy</p>
                  <p className="font-semibold">
                    {resource.occupancy}/{resource.capacity}
                  </p>
                </div>
                <div className="rounded-lg bg-[#f5f7fb] p-4">
                  <p className="text-xs text-[#45464e]">Availability</p>
                  <p className="font-semibold">
                    {Math.round((1 - resource.occupancy / resource.capacity) * 100)}% free
                  </p>
                </div>
              </>
            )}
          </div>

          {resource.description && (
            <div>
              <p className="text-xs font-semibold text-[#45464e]">Description</p>
              <p className="text-sm">{resource.description}</p>
            </div>
          )}

          {resource.facilities && resource.facilities.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-[#45464e]">Facilities</p>
              <div className="mt-1 flex flex-wrap gap-2">
                {resource.facilities.map((f, i) => (
                  <span key={i} className="rounded-full bg-[#f5f7fb] px-3 py-1 text-sm">
                    {f}
                  </span>
                ))}
              </div>
            </div>
          )}

          <div>
            <p className="text-xs font-semibold text-[#45464e]">Address</p>
            <p className="text-sm">{resource.address}</p>
          </div>

          {resource.phone && (
            <div>
              <p className="text-xs font-semibold text-[#45464e]">Phone</p>
              <p className="text-sm font-semibold text-[#4b41e1]">{resource.phone}</p>
            </div>
          )}
        </div>

        <div className="flex justify-end gap-3 border-t border-gray-200 p-6">
          <button onClick={onClose} className="rounded-lg border px-4 py-2 hover:bg-gray-50">
            Close
          </button>
          <button
            onClick={() => {
              const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${
                resource.lat || 27.7172
              },${resource.lng || 85.324}`;
              window.open(mapsUrl, "_blank");
            }}
            className="rounded-lg bg-[#4b41e1] px-4 py-2 text-white hover:bg-[#645efb]"
          >
            Get Directions
          </button>
        </div>
      </div>
    </div>
  );
};

export default EmergencyResources;