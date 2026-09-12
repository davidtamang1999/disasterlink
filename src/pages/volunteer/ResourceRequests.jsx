import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import VolunteerLayout from "../../layouts/VolunteerLayout";
import { useDisaster } from "../../context/DisasterContext";
import { useAuth } from "../../context/AuthContext";
import { useResources } from "../../context/ResourceContext";
import { useToast } from "../../components/shared";

function ResourceRequests() {
  const navigate = useNavigate();
  const { incidents } = useDisaster();
  const { currentUser } = useAuth();
  const {
    requests,
    createResourceRequest,
    offerResourceToRequest,
    loading: allocating,
  } = useResources();
  const toast = useToast();

  const [filteredRequests, setFilteredRequests] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [offerModalOpen, setOfferModalOpen] = useState(false);
  const [requestModalOpen, setRequestModalOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [offerFormData, setOfferFormData] = useState({
    quantity: "",
    unit: "Bottles",
    location: "",
    deliveryTime: "",
    deliveryMethod: "Self-Delivery (Vehicle)",
  });
  const [requestFormData, setRequestFormData] = useState({
    resourceType: "Drinking Water",
    quantity: "",
    unit: "Kits",
    incidentId: "",
    destination: "",
    urgency: "High",
    requiredBy: "",
    reason: "",
  });

  // ---------- Seed demo requests from incidents on first load ----------
  useEffect(() => {
    if (requests.length > 0) return;

    // Only seed once per session — check a flag
    const seeded = sessionStorage.getItem("resourceRequestsSeeded");
    if (seeded) return;

    const seedDemoData = async () => {
      sessionStorage.setItem("resourceRequestsSeeded", "1");

      const resourceTypes = [
        { type: "Drinking Water", icon: "water_drop", unit: "btls" },
        { type: "Food Packages", icon: "restaurant", unit: "packages" },
        { type: "First Aid Kits", icon: "medical_services", unit: "kits" },
        { type: "Rescue Boats", icon: "directions_boat", unit: "boats" },
        { type: "Blankets", icon: "bed", unit: "blankets" },
        { type: "Medical Supplies", icon: "local_hospital", unit: "supplies" },
      ];

      const activeIncidents = incidents.filter((i) => i.status !== "Resolved");

      if (activeIncidents.length > 0) {
        for (let index = 0; index < Math.min(activeIncidents.length, 4); index++) {
          const incident = activeIncidents[index];
          const resource = resourceTypes[index % resourceTypes.length];
          const required = Math.floor(Math.random() * 200) + 20;
          const available = Math.floor(Math.random() * required * 0.5);
          const shortage = required - available;
          const priority =
            shortage > required * 0.7
              ? "Critical"
              : shortage > required * 0.4
              ? "High"
              : "Moderate";

          const colorMap = {
            Critical: { color: "#FF5252", bg: "bg-[#FF5252]/10", text: "text-[#FF5252]", border: "border-[#FF5252]" },
            High: { color: "#FF9800", bg: "bg-[#FF9800]/10", text: "text-[#FF9800]", border: "border-[#FF9800]" },
            Moderate: { color: "#EAB308", bg: "bg-[#EAB308]/10", text: "text-[#A16207]", border: "border-[#EAB308]" },
          };
          const colors = colorMap[priority];

          await createResourceRequest({
            title: resource.type,
            icon: resource.icon,
            organization: `${incident.location?.split(",")[0] || "Local"} Response Team`,
            location: incident.location || "Unknown location",
            distance: `${(Math.random() * 8 + 0.5).toFixed(1)} km`,
            required,
            available,
            shortage,
            priority,
            status: ["Pending", "Processing", "Fulfilled"][Math.floor(Math.random() * 3)],
            unit: resource.unit,
            incidentId: incident.id,
            ...colors,
          });
        }
      } else {
        // Default demo requests if no incidents
        const defaults = [
          {
            title: "Drinking Water Required",
            icon: "water_drop",
            organization: "Kathmandu Volunteer Response Team",
            location: "Teku Response Center",
            distance: "1.2 km",
            required: 500,
            available: 120,
            shortage: 380,
            priority: "Critical",
            status: "Processing",
            unit: "btls",
            color: "#FF5252",
            bg: "bg-[#FF5252]/10",
            text: "text-[#FF5252]",
            border: "border-[#FF5252]",
          },
          {
            title: "First Aid Kits",
            icon: "medical_services",
            organization: "Red Cross Patan Unit",
            location: "Patan Relief Center",
            distance: "3.4 km",
            required: 40,
            available: 12,
            shortage: 28,
            priority: "Critical",
            status: "Processing",
            unit: "kits",
            color: "#FF5252",
            bg: "bg-[#FF5252]/10",
            text: "text-[#FF5252]",
            border: "border-[#FF5252]",
          },
          {
            title: "Food Packages",
            icon: "restaurant",
            organization: "Local Community Group",
            location: "Baneshwor Shelter",
            distance: "5.1 km",
            required: 300,
            available: 180,
            shortage: 120,
            priority: "High",
            status: "Pending",
            unit: "packages",
            color: "#FF9800",
            bg: "bg-[#FF9800]/10",
            text: "text-[#FF9800]",
            border: "border-[#FF9800]",
          },
        ];
        for (const d of defaults) {
          await createResourceRequest(d);
        }
      }
    };

    seedDemoData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [incidents, requests.length]);

  // ---------- Apply filters whenever requests or filters change ----------
  useEffect(() => {
    let filtered = requests;

    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (r) =>
          r.title?.toLowerCase().includes(q) ||
          r.location?.toLowerCase().includes(q) ||
          r.organization?.toLowerCase().includes(q) ||
          r.id?.toLowerCase().includes(q)
      );
    }
    if (typeFilter !== "all") filtered = filtered.filter((r) => r.title === typeFilter);
    if (priorityFilter !== "all") filtered = filtered.filter((r) => r.priority === priorityFilter);
    if (statusFilter !== "all") filtered = filtered.filter((r) => r.status === statusFilter);

    setFilteredRequests(filtered);
  }, [requests, searchTerm, typeFilter, priorityFilter, statusFilter]);

  const clearFilters = () => {
    setSearchTerm("");
    setTypeFilter("all");
    setPriorityFilter("all");
    setStatusFilter("all");
  };

  const resourceTypes = [...new Set(requests.map((r) => r.title))];
  const priorities = ["Critical", "High", "Moderate", "Low"];
  const statuses = ["Pending", "Processing", "Fulfilled", "Cancelled"];

  // ---------- Stats ----------
  const urgentRequests = requests.filter((r) => r.priority === "Critical").length;
  const activeRequests = requests.filter(
    (r) => r.status === "Processing" || r.status === "Pending"
  ).length;
  const totalAvailable = requests.reduce((sum, r) => sum + (r.available || 0), 0);
  const fulfilledToday = requests.filter((r) => r.status === "Fulfilled").length;

  // ---------- Offer resource ----------
  const handleOfferResource = (request) => {
    setSelectedRequest(request);
    setOfferFormData({
      quantity: "",
      unit: request.unit || "units",
      location: currentUser?.location || "My Location",
      deliveryTime: "",
      deliveryMethod: "Self-Delivery (Vehicle)",
    });
    setOfferModalOpen(true);
  };

  const confirmOffer = async () => {
    if (!selectedRequest || !offerFormData.quantity) {
      toast.error("Please enter a quantity to offer.");
      return;
    }

    const updated = await offerResourceToRequest(selectedRequest.id, {
      ...offerFormData,
      offeredBy: currentUser?.fullName || "Anonymous",
    });

    setOfferModalOpen(false);
    setSelectedRequest(null);

    toast.success(
      `Resource offered successfully\n` +
        `📦 ${offerFormData.quantity} ${offerFormData.unit}\n` +
        `To: ${updated.title} — ${updated.location}`
    );
  };

  // ---------- Request resource ----------
  const handleRequestResource = async () => {
    if (!requestFormData.quantity || !requestFormData.destination) {
      toast.error("Please fill in all required fields.");
      return;
    }

    const colorMap = {
      Critical: { color: "#FF5252", bg: "bg-[#FF5252]/10", text: "text-[#FF5252]", border: "border-[#FF5252]" },
      High: { color: "#FF9800", bg: "bg-[#FF9800]/10", text: "text-[#FF9800]", border: "border-[#FF9800]" },
      Moderate: { color: "#EAB308", bg: "bg-[#EAB308]/10", text: "text-[#A16207]", border: "border-[#EAB308]" },
    };
    const urgencyKey = requestFormData.urgency.split(" ")[0];
    const colors = colorMap[urgencyKey] || colorMap.High;

    await createResourceRequest({
      title: requestFormData.resourceType,
      icon: getIconForType(requestFormData.resourceType),
      organization: currentUser?.fullName || "Volunteer",
      location: requestFormData.destination,
      distance: "0 km",
      required: parseInt(requestFormData.quantity),
      available: 0,
      shortage: parseInt(requestFormData.quantity),
      priority: urgencyKey,
      status: "Pending",
      unit: requestFormData.unit,
      incidentId: requestFormData.incidentId,
      reason: requestFormData.reason,
      ...colors,
    });

    setRequestModalOpen(false);
    setRequestFormData({
      resourceType: "Drinking Water",
      quantity: "",
      unit: "Kits",
      incidentId: "",
      destination: "",
      urgency: "High",
      requiredBy: "",
      reason: "",
    });

    toast.success("Resource request submitted successfully!");
  };

  const getIconForType = (type) => {
    const icons = {
      "Drinking Water": "water_drop",
      "Food Packages": "restaurant",
      "First Aid Kits": "medical_services",
      "Rescue Boats": "directions_boat",
      Blankets: "bed",
      "Medical Supplies": "local_hospital",
    };
    return icons[type] || "inventory_2";
  };

  const incidentOptions = incidents
    .filter((inc) => inc.status !== "Resolved")
    .map((inc) => ({
      value: inc.id,
      label: `${inc.title} (${inc.location})`,
    }));

  const myOffers = requests.filter((r) =>
    (r.offers || []).some((o) => o.offeredBy === currentUser?.fullName)
  );

  // ---------- Header extras ----------
  const headerExtras = (
    <div className="relative hidden sm:block">
      <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[#45464e]">
        search
      </span>
      <input
        type="text"
        placeholder="Search resources..."
        className="w-64 rounded-full bg-[#edf0f5] py-2 pl-10 pr-4 text-sm outline-none transition focus:ring-2 focus:ring-[#4b41e1]/30"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />
    </div>
  );

  return (
    <VolunteerLayout title="Resource Requests" headerRight={headerExtras}>
      <div className="space-y-8">

        {/* ================= PAGE HEADER ================= */}
        <section className="flex flex-col justify-between gap-5 md:flex-row md:items-end">
          <div>
            <h2 className="font-['Space_Grotesk'] text-3xl font-bold text-[#1b1b1e]">
              Resource Requests
            </h2>
            <p className="mt-2 text-[#45464e]">
              Coordinate emergency supplies and support needed at disaster locations.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => navigate("/volunteer/incident-map")}
              className="flex items-center gap-2 rounded-xl border border-[#0e1a39]/20 bg-white px-5 py-2.5 font-semibold text-[#0e1a39] transition hover:bg-gray-50"
            >
              <span className="material-symbols-outlined">map</span>
              View Resource Map
            </button>

            <button
              onClick={() => setRequestModalOpen(true)}
              className="flex items-center gap-2 rounded-xl bg-[#4b41e1] px-5 py-2.5 font-semibold text-white shadow-md transition hover:bg-[#645efb]"
            >
              <span className="material-symbols-outlined">add</span>
              Request Resources
            </button>
          </div>
        </section>

        {/* ================= SUMMARY CARDS ================= */}
        <section className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          <SummaryTile icon="warning" iconColor="text-[#FF5252]" iconBg="bg-[#FF5252]/10" label="Urgent Requests" value={urgentRequests} />
          <SummaryTile icon="pending_actions" iconColor="text-[#FF9800]" iconBg="bg-[#FF9800]/10" label="Active Requests" value={activeRequests} />
          <SummaryTile icon="inventory_2" iconColor="text-[#4CAF50]" iconBg="bg-[#4CAF50]/10" label="Resources Available" value={totalAvailable} />
          <SummaryTile icon="check_circle" iconColor="text-[#4b41e1]" iconBg="bg-[#4b41e1]/10" label="Fulfilled" value={fulfilledToday} />
        </section>

        {/* ================= MAIN GRID ================= */}
        <section className="grid grid-cols-1 gap-6 xl:grid-cols-3">
          {/* LEFT */}
          <div className="space-y-8 xl:col-span-2">

            {/* Critical shortages */}
            {requests.filter((r) => r.priority === "Critical" && r.status !== "Fulfilled").length > 0 && (
              <section>
                <div className="mb-4 flex items-center gap-2">
                  <span className="material-symbols-outlined text-[#FF5252]">error</span>
                  <h3 className="font-['Space_Grotesk'] text-xl font-bold">Critical Shortages</h3>
                </div>

                {requests
                  .filter((r) => r.priority === "Critical" && r.status !== "Fulfilled")
                  .slice(0, 1)
                  .map((request) => (
                    <div key={request.id} className="rounded-[20px] border-l-[6px] border-[#FF5252] bg-white p-6 shadow-sm">
                      <div className="flex flex-col justify-between gap-5 md:flex-row">
                        <div>
                          <div className="flex flex-wrap items-center gap-3">
                            <span className="rounded-full bg-[#FF5252]/10 px-3 py-1 text-[10px] font-bold uppercase text-[#FF5252]">
                              Critical Priority
                            </span>
                            <span className="flex items-center gap-1 text-xs text-[#76767f]">
                              <span className="material-symbols-outlined text-[14px]">schedule</span>
                              {request.time || "Requested recently"}
                            </span>
                          </div>

                          <h4 className="mt-4 font-['Space_Grotesk'] text-2xl font-bold">{request.title}</h4>

                          <p className="mt-2 flex items-center gap-1 text-sm text-[#45464e]">
                            <span className="material-symbols-outlined text-[17px]">location_on</span>
                            {request.location} ({request.distance})
                          </p>
                        </div>

                        <div className="md:text-right">
                          <p className="text-xs text-[#76767f]">Requested by</p>
                          <p className="mt-1 text-sm font-semibold">{request.organization}</p>
                          <span
                            className={`mt-3 inline-block rounded px-2 py-1 text-[10px] font-bold uppercase ${
                              request.status === "Processing"
                                ? "bg-[#FF9800]/10 text-[#FF9800]"
                                : request.status === "Fulfilled"
                                ? "bg-[#4CAF50]/10 text-[#4CAF50]"
                                : "bg-[#FF5252]/10 text-[#FF5252]"
                            }`}
                          >
                            Status: {request.status}
                          </span>
                        </div>
                      </div>

                      <div className="mt-6 grid grid-cols-3 rounded-xl bg-[#f5f7fb] p-4">
                        <div>
                          <p className="text-xs text-[#76767f]">Required</p>
                          <p className="mt-1 text-xl font-bold">
                            {request.required} {request.unit || "units"}
                          </p>
                        </div>
                        <div className="border-l border-gray-200 pl-4">
                          <p className="text-xs text-[#76767f]">Available</p>
                          <p className="mt-1 text-xl font-bold">
                            {request.available} {request.unit || "units"}
                          </p>
                        </div>
                        <div className="border-l border-gray-200 pl-4">
                          <p className="text-xs text-[#FF5252]">Shortage</p>
                          <p className="mt-1 text-xl font-bold text-[#FF5252]">
                            {request.shortage} {request.unit || "units"}
                          </p>
                        </div>
                      </div>

                      <div className="mt-6 flex flex-wrap gap-3">
                        <button
                          onClick={() => handleOfferResource(request)}
                          className="rounded-xl bg-[#4b41e1] px-5 py-2.5 font-semibold text-white transition hover:bg-[#645efb]"
                        >
                          Offer Resource
                        </button>
                        <button
                          onClick={() => navigate("/volunteer/tasks")}
                          className="rounded-xl border border-gray-300 px-5 py-2.5 font-semibold text-[#45464e] transition hover:bg-gray-50"
                        >
                          View Details
                        </button>
                      </div>
                    </div>
                  ))}
              </section>
            )}

            {/* Active requests */}
            <section>
              <h3 className="mb-4 font-['Space_Grotesk'] text-xl font-bold">
                Active Resource Requests
              </h3>

              {/* Filters */}
              <div className="mb-4 flex flex-wrap gap-3 rounded-xl bg-white p-3 shadow-sm">
                <div className="relative min-w-[200px] flex-1">
                  <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-sm text-[#76767f]">
                    search
                  </span>
                  <input
                    type="text"
                    placeholder="Search requests..."
                    className="w-full rounded-lg bg-[#f5f7fb] py-2 pl-9 pr-3 text-sm outline-none focus:ring-2 focus:ring-[#4b41e1]/20"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>

                <select
                  className="rounded-lg bg-[#f5f7fb] px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[#4b41e1]/20"
                  value={typeFilter}
                  onChange={(e) => setTypeFilter(e.target.value)}
                >
                  <option value="all">All Types</option>
                  {resourceTypes.map((type) => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>

                <select
                  className="rounded-lg bg-[#f5f7fb] px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[#4b41e1]/20"
                  value={priorityFilter}
                  onChange={(e) => setPriorityFilter(e.target.value)}
                >
                  <option value="all">Priority</option>
                  {priorities.map((p) => (
                    <option key={p} value={p}>{p}</option>
                  ))}
                </select>

                <select
                  className="rounded-lg bg-[#f5f7fb] px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[#4b41e1]/20"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <option value="all">Status</option>
                  {statuses.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>

                {(searchTerm || typeFilter !== "all" || priorityFilter !== "all" || statusFilter !== "all") && (
                  <button onClick={clearFilters} className="text-sm font-semibold text-[#4b41e1] hover:underline">
                    Clear Filters
                  </button>
                )}
              </div>

              {/* Cards */}
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                {filteredRequests.length > 0 ? (
                  filteredRequests.map((request) => (
                    <div
                      key={request.id}
                      className={`flex min-h-[300px] flex-col rounded-[20px] border-t-4 ${request.border} bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-md`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span className="material-symbols-outlined text-lg" style={{ color: request.color }}>
                            {request.icon}
                          </span>
                          <h4 className="font-semibold">{request.title}</h4>
                        </div>

                        <span
                          className={`rounded px-2 py-1 text-[9px] font-bold uppercase ${
                            request.status === "Processing"
                              ? "bg-[#FF9800]/10 text-[#FF9800]"
                              : request.status === "Fulfilled"
                              ? "bg-[#4CAF50]/10 text-[#4CAF50]"
                              : "bg-[#FF5252]/10 text-[#FF5252]"
                          }`}
                        >
                          {request.status}
                        </span>
                      </div>

                      <div className="mt-4 space-y-1 text-xs text-[#45464e]">
                        <p className="font-semibold">{request.organization}</p>
                        <p className="flex items-center gap-1">
                          <span className="material-symbols-outlined text-[14px]">location_on</span>
                          {request.location} ({request.distance})
                        </p>
                        <p className="flex items-center gap-1">
                          <span className="material-symbols-outlined text-[14px]">schedule</span>
                          {request.time || "Recently"}
                        </p>
                      </div>

                      <div className="mt-auto grid grid-cols-3 gap-2 border-t border-gray-200 pt-4">
                        <div>
                          <p className="text-[9px] uppercase text-[#76767f]">Req</p>
                          <p className="font-semibold">{request.required}</p>
                        </div>
                        <div>
                          <p className="text-[9px] uppercase text-[#76767f]">Avail</p>
                          <p className="font-semibold">{request.available}</p>
                        </div>
                        <div>
                          <p className={`text-[9px] uppercase ${request.text}`}>Short</p>
                          <p className={`font-semibold ${request.text}`}>{request.shortage}</p>
                        </div>
                      </div>

                      <div className="mt-4 flex items-center justify-between border-t border-gray-200 pt-3">
                        <span className={`flex items-center gap-1 text-xs font-bold ${request.text}`}>
                          <span className="material-symbols-outlined text-[14px]">priority_high</span>
                          {request.priority}
                        </span>
                        <button
                          onClick={() => handleOfferResource(request)}
                          className="text-sm font-semibold text-[#4b41e1] hover:underline"
                        >
                          Offer
                        </button>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="col-span-3 py-12 text-center text-[#45464e]">
                    <span className="material-symbols-outlined mb-4 block text-6xl text-gray-300">search_off</span>
                    <p className="font-semibold">No requests found</p>
                    <p className="text-sm">Try adjusting your filters</p>
                  </div>
                )}
              </div>
            </section>

            {/* My contributions */}
            <section>
              <h3 className="mb-4 font-['Space_Grotesk'] text-xl font-bold">
                My Resource Contributions
              </h3>

              <div className="rounded-[20px] bg-white p-5 shadow-sm">
                {myOffers.length > 0 ? (
                  myOffers.slice(0, 2).map((request) => {
                    const offer = request.offers.find(
                      (o) => o.offeredBy === currentUser?.fullName
                    );
                    return (
                      <div key={request.id} className="mb-4 rounded-xl border border-gray-200 p-5 last:mb-0">
                        <div className="flex flex-col justify-between gap-3 sm:flex-row">
                          <div>
                            <h4 className="font-semibold">
                              {offer?.quantity || 0} {request.unit || "units"} {request.title}
                            </h4>
                            <p className="mt-1 text-xs text-[#76767f]">
                              To: {request.location} (Req: {request.id})
                            </p>
                          </div>
                          <span className="h-fit rounded-full bg-[#4b41e1]/10 px-3 py-1 text-xs font-semibold text-[#4b41e1]">
                            {request.status === "Fulfilled" ? "Delivered" : "En Route"}
                          </span>
                        </div>

                        <div className="relative mt-8">
                          <div className="absolute left-0 top-3 h-1 w-full bg-gray-200">
                            <div
                              className={`h-full ${
                                request.status === "Fulfilled" ? "w-full" : "w-1/2"
                              } bg-[#4b41e1]`}
                            />
                          </div>

                          <div className="relative z-10 flex justify-between">
                            {[
                              ["check", "Offered", true],
                              ["check", "Accepted", request.status !== "Pending"],
                              [
                                "local_shipping",
                                "En Route",
                                request.status === "Processing" || request.status === "Fulfilled",
                              ],
                              ["inventory", "Delivered", request.status === "Fulfilled"],
                              ["done_all", "Confirmed", request.status === "Fulfilled"],
                            ].map(([icon, label, active]) => (
                              <div key={label} className="flex flex-col items-center bg-white px-1">
                                <div
                                  className={`flex h-7 w-7 items-center justify-center rounded-full border-2 ${
                                    active
                                      ? "border-[#4b41e1] bg-[#4b41e1] text-white"
                                      : "border-gray-300 bg-white text-gray-400"
                                  }`}
                                >
                                  <span className="material-symbols-outlined text-[15px]">{icon}</span>
                                </div>
                                <span className="mt-2 text-[9px] text-[#45464e]">{label}</span>
                              </div>
                            ))}
                          </div>
                        </div>

                        <div className="mt-6 flex items-center justify-between border-t border-gray-200 pt-4 text-xs text-[#76767f]">
                          <span>Est. Arrival: {offer?.deliveryTime || "Today, 14:30"}</span>
                          <button className="font-semibold text-[#4b41e1] hover:underline">
                            Update Status
                          </button>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="py-8 text-center text-[#45464e]">
                    <span className="material-symbols-outlined mb-2 block text-4xl text-gray-300">
                      volunteer_activism
                    </span>
                    <p>No contributions yet</p>
                    <p className="text-sm">Offer resources to help those in need</p>
                  </div>
                )}
              </div>
            </section>
          </div>

          {/* RIGHT SIDEBAR */}
          <div className="space-y-6">
            <section className="overflow-hidden rounded-[20px] bg-white shadow-sm">
              <div className="flex items-center justify-between border-b border-gray-200 p-5">
                <h3 className="font-['Space_Grotesk'] text-lg font-bold">Resource Map</h3>
                <button
                  onClick={() => navigate("/volunteer/incident-map")}
                  className="text-[#4b41e1]"
                >
                  <span className="material-symbols-outlined">open_in_full</span>
                </button>
              </div>

              <div className="relative h-[330px] overflow-hidden bg-gradient-to-br from-[#dbeafe] via-[#e0f2fe] to-[#dcfce7]">
                <div className="absolute left-[40%] top-[30%] flex h-9 w-9 items-center justify-center rounded-full border-2 border-white bg-[#FF5252] text-white shadow-lg">
                  <span className="material-symbols-outlined text-[17px]">water_drop</span>
                </div>
                <div className="absolute left-[60%] top-[50%] flex h-9 w-9 items-center justify-center rounded-full border-2 border-white bg-[#4CAF50] text-white shadow-lg">
                  <span className="material-symbols-outlined text-[17px]">local_hospital</span>
                </div>
                <div className="absolute left-[28%] top-[65%] flex h-9 w-9 items-center justify-center rounded-full border-2 border-white bg-[#4b41e1] text-white shadow-lg">
                  <span className="material-symbols-outlined text-[17px]">home</span>
                </div>

                <div className="flex h-full flex-col items-center justify-center">
                  <span className="material-symbols-outlined text-6xl text-[#4b41e1]/30">map</span>
                  <p className="mt-3 font-semibold text-[#45464e]">Kathmandu Resource Map</p>
                  <p className="mt-1 text-xs text-[#76767f]">
                    {filteredRequests.length} active requests nearby
                  </p>
                </div>
              </div>
            </section>

            <section>
              <h3 className="mb-4 font-['Space_Grotesk'] text-xl font-bold">Available Nearby</h3>
              <div className="space-y-4">
                {requests
                  .filter((r) => r.available > 0 && r.status !== "Fulfilled")
                  .slice(0, 2)
                  .map((request) => (
                    <div key={request.id} className="rounded-xl bg-white p-5 shadow-sm">
                      <div className="flex items-start justify-between">
                        <div>
                          <h4 className="font-semibold">{request.title}</h4>
                          <p className="mt-1 text-xs text-[#76767f]">{request.organization}</p>
                        </div>
                        <span
                          className={`rounded px-2 py-1 text-[10px] font-bold ${
                            request.available > request.required * 0.5
                              ? "bg-[#4CAF50]/10 text-[#4CAF50]"
                              : "bg-[#FF9800]/10 text-[#FF9800]"
                          }`}
                        >
                          {request.available > request.required * 0.5 ? "Available" : "Limited"}
                        </span>
                      </div>

                      <div className="mt-4 flex gap-4 text-sm">
                        <span className="flex items-center gap-1">
                          <span className="material-symbols-outlined text-[15px] text-[#76767f]">
                            inventory_2
                          </span>
                          {request.available} {request.unit || "units"}
                        </span>
                        <span className="flex items-center gap-1 text-[#76767f]">
                          <span className="material-symbols-outlined text-[15px]">near_me</span>
                          {request.distance}
                        </span>
                      </div>

                      <button
                        onClick={() => handleOfferResource(request)}
                        className="mt-4 w-full rounded-lg bg-[#4b41e1]/10 py-2 text-sm font-semibold text-[#4b41e1] transition hover:bg-[#4b41e1]/20"
                      >
                        Offer to Request
                      </button>
                    </div>
                  ))}
              </div>
            </section>
          </div>
        </section>
      </div>

      {/* ================= OFFER MODAL ================= */}
      {offerModalOpen && selectedRequest && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4">
          <div className="relative max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-[20px] bg-white p-6 shadow-2xl">
            <button
              onClick={() => setOfferModalOpen(false)}
              className="absolute right-4 top-4 text-[#45464e] hover:text-[#1b1b1e]"
            >
              <span className="material-symbols-outlined">close</span>
            </button>

            <h3 className="font-['Space_Grotesk'] text-2xl font-bold">Offer Resources</h3>
            <p className="mt-2 text-sm text-[#45464e]">
              Provide details for the resources you are committing to {selectedRequest.title}.
            </p>

            <div className="mt-6 space-y-5">
              <div className="rounded-xl bg-[#f5f7fb] p-4">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-[#4b41e1]">{selectedRequest.icon}</span>
                  <h4 className="font-semibold">{selectedRequest.title}</h4>
                </div>
                <div className="mt-4 grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-[#76767f]">Required</p>
                    <p className="text-lg font-bold">
                      {selectedRequest.required} {selectedRequest.unit || "units"}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-[#76767f]">Remaining Need</p>
                    <p className="text-lg font-bold text-[#FF5252]">
                      {selectedRequest.shortage} {selectedRequest.unit || "units"}
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <FormField label="Quantity to Offer">
                  <input
                    type="number"
                    placeholder="Enter amount"
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 outline-none focus:ring-2 focus:ring-[#4b41e1]/30"
                    value={offerFormData.quantity}
                    onChange={(e) => setOfferFormData({ ...offerFormData, quantity: e.target.value })}
                    max={selectedRequest.shortage}
                  />
                </FormField>

                <FormField label="Unit">
                  <input
                    type="text"
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 outline-none"
                    value={offerFormData.unit}
                    onChange={(e) => setOfferFormData({ ...offerFormData, unit: e.target.value })}
                    placeholder={selectedRequest.unit || "units"}
                  />
                </FormField>
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <FormField label="Current Location">
                  <input
                    type="text"
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 outline-none"
                    value={offerFormData.location}
                    onChange={(e) => setOfferFormData({ ...offerFormData, location: e.target.value })}
                    placeholder="Your current location"
                  />
                </FormField>

                <FormField label="Destination">
                  <input
                    type="text"
                    value={selectedRequest.location}
                    disabled
                    className="w-full rounded-lg border border-gray-200 bg-gray-100 px-3 py-2 text-[#76767f]"
                  />
                </FormField>
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <FormField label="Estimated Delivery">
                  <input
                    type="datetime-local"
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 outline-none"
                    value={offerFormData.deliveryTime}
                    onChange={(e) => setOfferFormData({ ...offerFormData, deliveryTime: e.target.value })}
                  />
                </FormField>

                <FormField label="Delivery Method">
                  <select
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 outline-none"
                    value={offerFormData.deliveryMethod}
                    onChange={(e) => setOfferFormData({ ...offerFormData, deliveryMethod: e.target.value })}
                  >
                    <option>Self-Delivery (Vehicle)</option>
                    <option>Self-Delivery (Foot/Bike)</option>
                    <option>Request Transport</option>
                  </select>
                </FormField>
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-3 border-t border-gray-200 pt-5">
              <button
                onClick={() => setOfferModalOpen(false)}
                disabled={allocating}
                className="rounded-xl px-5 py-2.5 font-semibold text-[#45464e] hover:bg-gray-100 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={confirmOffer}
                disabled={allocating}
                className="rounded-xl bg-[#4b41e1] px-5 py-2.5 font-semibold text-white transition hover:bg-[#645efb] disabled:opacity-50"
              >
                {allocating ? "Submitting..." : "Confirm Offer"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= REQUEST MODAL ================= */}
      {requestModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4">
          <div className="relative max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-[20px] bg-white p-6 shadow-2xl">
            <button
              onClick={() => setRequestModalOpen(false)}
              className="absolute right-4 top-4 text-[#45464e]"
            >
              <span className="material-symbols-outlined">close</span>
            </button>

            <h3 className="font-['Space_Grotesk'] text-2xl font-bold">Request Resources</h3>
            <p className="mt-2 text-sm text-[#45464e]">
              Submit a new request for resources needed at a location.
            </p>

            <div className="mt-6 space-y-5">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <FormField label="Resource Type">
                  <select
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 outline-none focus:ring-2 focus:ring-[#4b41e1]/30"
                    value={requestFormData.resourceType}
                    onChange={(e) =>
                      setRequestFormData({ ...requestFormData, resourceType: e.target.value })
                    }
                  >
                    <option>Drinking Water</option>
                    <option>Food Packages</option>
                    <option>First Aid Kits</option>
                    <option>Rescue Boats</option>
                    <option>Blankets</option>
                    <option>Medical Supplies</option>
                  </select>
                </FormField>

                <div className="grid grid-cols-2 gap-3">
                  <FormField label="Quantity">
                    <input
                      type="number"
                      placeholder="Amount"
                      className="w-full rounded-lg border border-gray-300 px-3 py-2 outline-none focus:ring-2 focus:ring-[#4b41e1]/30"
                      value={requestFormData.quantity}
                      onChange={(e) =>
                        setRequestFormData({ ...requestFormData, quantity: e.target.value })
                      }
                    />
                  </FormField>

                  <FormField label="Unit">
                    <input
                      type="text"
                      placeholder="e.g. Kits"
                      className="w-full rounded-lg border border-gray-300 px-3 py-2 outline-none focus:ring-2 focus:ring-[#4b41e1]/30"
                      value={requestFormData.unit}
                      onChange={(e) =>
                        setRequestFormData({ ...requestFormData, unit: e.target.value })
                      }
                    />
                  </FormField>
                </div>
              </div>

              <FormField label="Incident Association">
                <select
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 outline-none focus:ring-2 focus:ring-[#4b41e1]/30"
                  value={requestFormData.incidentId}
                  onChange={(e) =>
                    setRequestFormData({ ...requestFormData, incidentId: e.target.value })
                  }
                >
                  <option value="">Select an incident</option>
                  {incidentOptions.map((inc) => (
                    <option key={inc.value} value={inc.value}>{inc.label}</option>
                  ))}
                  <option value="general">General Supply Request</option>
                </select>
              </FormField>

              <FormField label="Destination Location">
                <input
                  type="text"
                  placeholder="Enter destination location..."
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 outline-none focus:ring-2 focus:ring-[#4b41e1]/30"
                  value={requestFormData.destination}
                  onChange={(e) =>
                    setRequestFormData({ ...requestFormData, destination: e.target.value })
                  }
                />
              </FormField>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <FormField label="Urgency Level">
                  <select
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 outline-none focus:ring-2 focus:ring-[#4b41e1]/30"
                    value={requestFormData.urgency}
                    onChange={(e) =>
                      setRequestFormData({ ...requestFormData, urgency: e.target.value })
                    }
                  >
                    <option>Critical (Immediate)</option>
                    <option>High (Within 4 hrs)</option>
                    <option>Moderate (Within 12 hrs)</option>
                    <option>Low (Within 24 hrs)</option>
                  </select>
                </FormField>

                <FormField label="Required By">
                  <input
                    type="datetime-local"
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 outline-none focus:ring-2 focus:ring-[#4b41e1]/30"
                    value={requestFormData.requiredBy}
                    onChange={(e) =>
                      setRequestFormData({ ...requestFormData, requiredBy: e.target.value })
                    }
                  />
                </FormField>
              </div>

              <FormField label="Reason for Request">
                <textarea
                  placeholder="Briefly describe why these resources are needed..."
                  className="h-28 w-full resize-none rounded-lg border border-gray-300 px-3 py-2 outline-none focus:ring-2 focus:ring-[#4b41e1]/30"
                  value={requestFormData.reason}
                  onChange={(e) =>
                    setRequestFormData({ ...requestFormData, reason: e.target.value })
                  }
                />
              </FormField>
            </div>

            <div className="mt-6 flex justify-end gap-3 border-t border-gray-200 pt-5">
              <button
                onClick={() => setRequestModalOpen(false)}
                disabled={allocating}
                className="rounded-xl px-5 py-2.5 font-semibold text-[#45464e] hover:bg-gray-100 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleRequestResource}
                disabled={allocating}
                className="rounded-xl bg-[#4b41e1] px-5 py-2.5 font-semibold text-white transition hover:bg-[#645efb] disabled:opacity-50"
              >
                {allocating ? "Submitting..." : "Submit Request"}
              </button>
            </div>
          </div>
        </div>
      )}
    </VolunteerLayout>
  );
}

/* ---------- Small helpers ---------- */

const SummaryTile = ({ icon, iconColor, iconBg, label, value }) => (
  <div className="flex items-center gap-4 rounded-[20px] bg-white p-5 shadow-sm">
    <div className={`flex h-12 w-12 items-center justify-center rounded-full ${iconBg}`}>
      <span className={`material-symbols-outlined ${iconColor}`}>{icon}</span>
    </div>
    <div>
      <p className="text-[10px] font-bold uppercase text-[#45464e]">{label}</p>
      <p className="mt-1 text-3xl font-bold">{value}</p>
    </div>
  </div>
);

const FormField = ({ label, children }) => (
  <div>
    <label className="mb-2 block text-sm font-semibold">{label}</label>
    {children}
  </div>
);

export default ResourceRequests;