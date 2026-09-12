import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import AdminLayout from "../../layouts/AdminLayout";
import { useDisaster } from "../../context/DisasterContext";
import { useAuth } from "../../context/AuthContext";
import { useUsers } from "../../context/UserContext";

function VolunteerManagement() {
  const navigate = useNavigate();
  const { incidents } = useDisaster();
  const { currentUser } = useAuth();

  // ✅ Volunteers live in UserContext (role === "volunteer")
  const { volunteers, loading, getInitials, updateUser, deleteUser } = useUsers();

  // ---- UI state ----
  const [filteredVolunteers, setFilteredVolunteers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [availabilityFilter, setAvailabilityFilter] = useState("all");
  const [skillFilter, setSkillFilter] = useState("all");
  const [locationFilter, setLocationFilter] = useState("all");
  const [selectedVolunteer, setSelectedVolunteer] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [volunteerToDelete, setVolunteerToDelete] = useState(null);
  const [editFormData, setEditFormData] = useState({
    skills: [],
    team: "",
    status: "",
  });

  // Apply filters whenever volunteers or filter values change
  useEffect(() => {
    applyFilters(volunteers, searchTerm, availabilityFilter, skillFilter, locationFilter);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [volunteers, searchTerm, availabilityFilter, skillFilter, locationFilter]);

  // Auto-select first volunteer
  useEffect(() => {
    if (filteredVolunteers.length > 0 && !selectedVolunteer) {
      setSelectedVolunteer(filteredVolunteers[0]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filteredVolunteers]);

  // ---- Normalize a raw user into a "volunteer shape" ----
  const toVolunteer = (u) => {
    const status = u.status || "Available";
    return {
      ...u,
      name: u.fullName || "Unnamed Volunteer",
      initials: getInitials(u.fullName),
      status,
      skills: u.skills || ["General Support"],
      team: u.team || "Unassigned",
      statusColor: statusColor(status),
      statusBg: statusBg(status),
      dotColor: dotColor(status),
      offline: status === "Offline" || status === "Suspended",
    };
  };

  const statusColor = (s) => ({
    Available: "text-[#4CAF50]",
    "On Assignment": "text-[#FF9800]",
    Offline: "text-[#1b1b1e]",
    Suspended: "text-[#FF5252]",
    Active: "text-[#4CAF50]",
    Pending: "text-[#FFC107]",
  }[s] || "text-[#76767f]");

  const statusBg = (s) => ({
    Available: "bg-[#4CAF50]/10",
    "On Assignment": "bg-[#FF9800]/10",
    Offline: "bg-[#e4e1e5]",
    Suspended: "bg-[#FF5252]/10",
    Active: "bg-[#4CAF50]/10",
    Pending: "bg-[#FFC107]/10",
  }[s] || "bg-[#f5f7fb]");

  const dotColor = (s) => ({
    Available: "bg-[#4CAF50]",
    "On Assignment": "bg-[#FF9800]",
    Offline: "bg-[#1b1b1e]",
    Suspended: "bg-[#FF5252]",
    Active: "bg-[#4CAF50]",
    Pending: "bg-[#FFC107]",
  }[s] || "bg-[#76767f]");

  // ---- Filtering ----
  const applyFilters = (list, search, availability, skill, location) => {
    let filtered = list.map(toVolunteer);

    if (search) {
      const q = search.toLowerCase();
      filtered = filtered.filter(v =>
        v.name?.toLowerCase().includes(q) ||
        v.id?.toString().includes(q) ||
        v.email?.toLowerCase().includes(q) ||
        v.skills?.some(s => s.toLowerCase().includes(q)) ||
        v.team?.toLowerCase().includes(q)
      );
    }
    if (availability !== "all") filtered = filtered.filter(v => v.status === availability);
    if (skill !== "all") filtered = filtered.filter(v => v.skills?.includes(skill));
    if (location !== "all") filtered = filtered.filter(v => v.location === location);

    setFilteredVolunteers(filtered);
  };

  const clearFilters = () => {
    setSearchTerm("");
    setAvailabilityFilter("all");
    setSkillFilter("all");
    setLocationFilter("all");
  };

  // ---- Derived option lists ----
  const volunteersNormalized = volunteers.map(toVolunteer);
  const allSkills = [...new Set(volunteersNormalized.flatMap(v => v.skills || []))];
  const allLocations = [...new Set(volunteersNormalized.map(v => v.location).filter(Boolean))];

  // ---- Incident helpers ----
  const getVolunteerIncidentCount = (volunteerId) =>
    incidents.filter(inc =>
      inc.assignedTo === volunteerId ||
      inc.volunteerId === volunteerId ||
      inc.responders?.includes(volunteerId)
    ).length;

  const getActiveIncident = (volunteerId) =>
    incidents.find(inc =>
      (inc.assignedTo === volunteerId || inc.volunteerId === volunteerId) &&
      inc.status !== "Resolved"
    );

  // ---- Handlers ----
  const handleEditVolunteer = () => {
    if (!selectedVolunteer) return;
    setEditFormData({
      skills: selectedVolunteer.skills || [],
      team: selectedVolunteer.team || "",
      status: selectedVolunteer.status || "Available",
    });
    setShowEditModal(true);
  };

  const handleSaveEdit = async () => {
    if (!selectedVolunteer) return;
    await updateUser(selectedVolunteer.id, {
      skills: editFormData.skills,
      team: editFormData.team,
      status: editFormData.status,
    });
    setShowEditModal(false);
  };

  const handleDeleteVolunteer = async () => {
    if (!volunteerToDelete) return;
    await deleteUser(volunteerToDelete.id);
    setShowDeleteModal(false);
    setVolunteerToDelete(null);
    setSelectedVolunteer(null);
  };

  const toggleVolunteerStatus = async (volunteer) => {
    const statusMap = {
      Available: "On Assignment",
      "On Assignment": "Offline",
      Offline: "Available",
    };
    const newStatus = statusMap[volunteer.status] || "Available";
    await updateUser(volunteer.id, { status: newStatus });
  };

  // ---- Summary stats ----
  const totalVolunteers = volunteersNormalized.length;
  const availableVolunteers = volunteersNormalized.filter(v => v.status === "Available").length;
  const deployedVolunteers = volunteersNormalized.filter(v => v.status === "On Assignment").length;
  const offlineVolunteers = volunteersNormalized.filter(v =>
    v.status === "Offline" || v.status === "Suspended"
  ).length;
  const activeTeams = [...new Set(volunteersNormalized.map(v => v.team).filter(Boolean))].length;

  const summary = [
    { title: "Total Force", value: totalVolunteers, borderColor: "border-transparent" },
    { title: "Available", value: availableVolunteers, borderColor: "border-[#4CAF50]" },
    { title: "Deployed", value: deployedVolunteers, borderColor: "border-[#FF9800]" },
    { title: "Offline", value: offlineVolunteers, borderColor: "border-[#1b1b1e]" },
    { title: "Active Teams", value: activeTeams, borderColor: "border-transparent", icon: "groups" },
  ];

  return (
    <AdminLayout title="Volunteer Management">
      <div className="flex flex-col gap-6 xl:flex-row">

        {/* ---- Main Area ---- */}
        <div className="min-w-0 flex-1 space-y-6">

          {/* Header */}
          <section className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
            <div>
              <h2 className="font-['Space_Grotesk'] text-3xl font-bold text-[#1b1b1e]">
                Volunteer Management
              </h2>
              <p className="mt-2 max-w-2xl text-[#45464e]">
                Monitor volunteer availability, skills, assignments, teams, and disaster-response activity.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <button className="flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2.5 font-semibold text-[#1b1b1e] transition hover:bg-gray-50">
                <span className="material-symbols-outlined text-[18px]">download</span>
                Export Volunteers
              </button>

              <button
                onClick={() => navigate("/register")}
                className="flex items-center gap-2 rounded-xl bg-[#4b41e1] px-4 py-2.5 font-semibold text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-[#645efb]"
              >
                <span className="material-symbols-outlined text-[18px]">person_add</span>
                Add Volunteer
              </button>
            </div>
          </section>

          {/* Summary Cards */}
          <section className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-5">
            {summary.map((item) => (
              <div
                key={item.title}
                className={`rounded-xl border-t-4 ${item.borderColor} bg-white p-4 shadow-sm transition hover:-translate-y-1 hover:shadow-md`}
              >
                <p className="mb-2 flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider text-[#45464e]">
                  {item.icon && (
                    <span className="material-symbols-outlined text-[16px]">{item.icon}</span>
                  )}
                  {item.title}
                </p>
                <p className="font-['Space_Grotesk'] text-3xl font-bold">{item.value}</p>
              </div>
            ))}
          </section>

          {/* Filters */}
          <section className="flex flex-wrap items-center gap-4 rounded-xl bg-white p-4 shadow-sm">
            <div className="relative min-w-[240px] flex-1">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[18px] text-[#45464e]">
                search
              </span>
              <input
                type="text"
                placeholder="Search by name, ID, or skill..."
                className="w-full rounded-xl border border-gray-200 bg-[#f5f7fb] py-2.5 pl-10 pr-4 text-sm outline-none focus:ring-2 focus:ring-[#4b41e1]/30"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <select
                className="cursor-pointer rounded-xl border border-gray-200 bg-[#f5f7fb] px-4 py-2.5 text-sm font-semibold outline-none"
                value={availabilityFilter}
                onChange={(e) => setAvailabilityFilter(e.target.value)}
              >
                <option value="all">Availability: All</option>
                <option value="Available">Available</option>
                <option value="On Assignment">On Assignment</option>
                <option value="Offline">Offline</option>
              </select>

              <select
                className="cursor-pointer rounded-xl border border-gray-200 bg-[#f5f7fb] px-4 py-2.5 text-sm font-semibold outline-none"
                value={skillFilter}
                onChange={(e) => setSkillFilter(e.target.value)}
              >
                <option value="all">Skill: All Types</option>
                {allSkills.map(skill => (
                  <option key={skill} value={skill}>{skill}</option>
                ))}
              </select>

              <select
                className="cursor-pointer rounded-xl border border-gray-200 bg-[#f5f7fb] px-4 py-2.5 text-sm font-semibold outline-none"
                value={locationFilter}
                onChange={(e) => setLocationFilter(e.target.value)}
              >
                <option value="all">Location: All Areas</option>
                {allLocations.map(loc => (
                  <option key={loc} value={loc}>{loc}</option>
                ))}
              </select>

              {(searchTerm || availabilityFilter !== "all" || skillFilter !== "all" || locationFilter !== "all") && (
                <button
                  onClick={clearFilters}
                  className="ml-2 whitespace-nowrap text-xs font-bold text-[#4b41e1] hover:underline"
                >
                  Clear Filters
                </button>
              )}
            </div>
          </section>

          {/* Volunteer Table */}
          <section className="min-h-[400px] overflow-hidden rounded-[20px] bg-white shadow-sm">
            <div className="overflow-x-auto">
              <table className="min-w-[900px] w-full text-left">
                <thead className="border-b border-gray-200 bg-white">
                  <tr>
                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-[#45464e]">Volunteer</th>
                    <th className="px-4 py-4 text-xs font-bold uppercase tracking-wider text-[#45464e]">Status & Location</th>
                    <th className="px-4 py-4 text-xs font-bold uppercase tracking-wider text-[#45464e]">Skills & Team</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-gray-100">
                  {filteredVolunteers.length > 0 ? (
                    filteredVolunteers.map((v) => {
                      const activeIncident = getActiveIncident(v.id);

                      return (
                        <tr
                          key={v.id}
                          className={`cursor-pointer transition hover:bg-[#f5f7fb] ${
                            selectedVolunteer?.id === v.id ? "bg-[#e1e0ff]/30" : ""
                          } ${v.offline ? "opacity-70" : ""}`}
                          onClick={() => setSelectedVolunteer(v)}
                        >
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#4b41e1]/10 font-bold text-[#4b41e1]">
                                {v.initials}
                              </div>
                              <div>
                                <p className="text-sm font-semibold">{v.name}</p>
                                <p className="mt-1 text-xs text-[#76767f]">
                                  {typeof v.id === "string" && v.id.startsWith("admin")
                                    ? v.id
                                    : `VOL-${String(v.id).padStart(6, "0")}`}
                                </p>
                              </div>
                            </div>
                          </td>

                          <td className="px-4 py-4">
                            <div className="flex flex-col items-start gap-2">
                              <span className={`inline-flex items-center gap-2 rounded-md px-2.5 py-1 text-xs font-bold ${v.statusBg} ${v.statusColor}`}>
                                <span className={`h-1.5 w-1.5 rounded-full ${v.dotColor}`} />
                                {v.status}
                              </span>
                              <span className="flex items-center gap-1 text-sm text-[#45464e]">
                                <span className="material-symbols-outlined text-[14px]">location_on</span>
                                {v.location}
                              </span>
                            </div>
                          </td>

                          <td className="px-4 py-4">
                            <div className="flex flex-col gap-2">
                              <div className="flex flex-wrap gap-1">
                                {(v.skills || ["General Support"]).slice(0, 3).map(skill => (
                                  <span key={skill} className="rounded border border-gray-200 bg-[#f5f7fb] px-2 py-1 text-xs text-[#45464e]">
                                    {skill}
                                  </span>
                                ))}
                                {(v.skills || []).length > 3 && (
                                  <span className="rounded border border-gray-200 bg-[#f5f7fb] px-2 py-1 text-xs text-[#45464e]">
                                    +{(v.skills || []).length - 3}
                                  </span>
                                )}
                              </div>
                              <p className="max-w-[220px] truncate text-sm text-[#45464e]">
                                {v.team || "Unassigned"}
                              </p>
                              {activeIncident && (
                                <span className="text-xs font-semibold text-[#FF9800]">
                                  Active: {activeIncident.title}
                                </span>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan="3" className="p-8 text-center text-gray-500">
                        <span className="material-symbols-outlined mb-2 block text-4xl">person_search</span>
                        No volunteers found matching your filters
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </section>
        </div>

        {/* ---- Right Detail Panel ---- */}
        <aside className="flex min-h-[850px] w-full flex-col overflow-hidden rounded-[20px] bg-white shadow-sm xl:w-[400px]">
          {selectedVolunteer ? (
            <>
              <div className="relative h-32 bg-[#4b41e1]/10">
                <button
                  onClick={() => setSelectedVolunteer(null)}
                  className="absolute left-4 top-4 flex h-8 w-8 items-center justify-center rounded-full bg-white/70 text-[#45464e] backdrop-blur hover:bg-white"
                >
                  <span className="material-symbols-outlined text-[18px]">close</span>
                </button>
                <button
                  onClick={handleEditVolunteer}
                  className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full bg-white/70 text-[#45464e] backdrop-blur hover:bg-white"
                >
                  <span className="material-symbols-outlined text-[18px]">edit</span>
                </button>
              </div>

              <div className="relative flex-1 overflow-y-auto px-6 pb-6">
                <div className="-mt-12 mb-5 flex items-end justify-between">
                  <div className="flex h-24 w-24 items-center justify-center rounded-2xl border-4 border-white bg-[#4b41e1]/10 text-3xl font-bold text-[#4b41e1] shadow-sm">
                    {selectedVolunteer.initials}
                  </div>

                  <div className="flex gap-2 pb-2">
                    <button className="flex h-10 w-10 items-center justify-center rounded-full border border-gray-200 text-[#4b41e1] hover:bg-[#4b41e1]/5">
                      <span className="material-symbols-outlined">chat</span>
                    </button>
                    <button className="flex h-10 w-10 items-center justify-center rounded-full border border-gray-200 text-[#4b41e1] hover:bg-[#4b41e1]/5">
                      <span className="material-symbols-outlined">call</span>
                    </button>
                    <button
                      onClick={() => toggleVolunteerStatus(selectedVolunteer)}
                      className="flex h-10 w-10 items-center justify-center rounded-full border border-gray-200 text-[#1b1b1e] hover:bg-gray-50"
                      title="Change Status"
                    >
                      <span className="material-symbols-outlined">sync</span>
                    </button>
                  </div>
                </div>

                <div className="mb-6">
                  <h3 className="font-['Space_Grotesk'] text-2xl font-bold">{selectedVolunteer.name}</h3>
                  <p className="mt-1 flex items-center gap-2 text-sm text-[#45464e]">
                    {`VOL-${String(selectedVolunteer.id).padStart(6, "0")}`}
                    <span className="h-1 w-1 rounded-full bg-gray-300" />
                    {selectedVolunteer.team || "Unassigned"}
                  </p>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {(selectedVolunteer.skills || ["General Support"]).map(skill => (
                      <span
                        key={skill}
                        className={`rounded-lg px-3 py-1.5 text-xs font-semibold ${
                          ["Rescue", "First Aid", "Paramedic"].includes(skill)
                            ? "bg-[#e1e0ff]/60 text-[#07006c]"
                            : "bg-[#f5f7fb] text-[#45464e]"
                        }`}
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>

                <hr className="mb-6 border-gray-200" />

                {/* Current Status */}
                <div className="mb-6">
                  <div className="mb-3 flex items-center justify-between">
                    <h4 className="text-xs font-bold uppercase tracking-wide">Current Status</h4>
                    <span className={`inline-flex items-center gap-2 rounded-md px-2.5 py-1 text-xs font-bold ${selectedVolunteer.statusBg} ${selectedVolunteer.statusColor}`}>
                      <span className={`h-2 w-2 animate-pulse rounded-full ${selectedVolunteer.dotColor}`} />
                      {selectedVolunteer.status.toUpperCase()}
                    </span>
                  </div>

                  {(() => {
                    const activeIncident = getActiveIncident(selectedVolunteer.id);
                    if (!activeIncident) {
                      return (
                        <div className="rounded-xl border border-gray-200 bg-[#fafafa] p-4 text-center text-[#76767f]">
                          <span className="material-symbols-outlined mb-2 block text-2xl">check_circle</span>
                          <p className="text-sm">No active assignments</p>
                          <p className="mt-1 text-xs">Available for deployment</p>
                        </div>
                      );
                    }

                    const isCritical =
                      activeIncident.severity === "Critical" || activeIncident.severity === "CRITICAL";
                    const severityClass = isCritical
                      ? "bg-[#ffdad6] text-[#93000a]"
                      : activeIncident.severity === "High"
                      ? "bg-[#fff3e0] text-[#bf5c00]"
                      : "bg-[#e8f5e9] text-[#1e6b2b]";

                    return (
                      <div className="rounded-xl border border-gray-200 bg-[#fafafa] p-4">
                        <div className="space-y-4">
                          <div>
                            <p className="text-xs font-bold text-[#76767f]">Active Incident</p>
                            <p className="mt-1 text-sm font-semibold">
                              {activeIncident.id}: {activeIncident.title}
                            </p>
                          </div>
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-xs font-bold text-[#76767f]">Location</p>
                              <p className="mt-1 text-sm">{activeIncident.location || "Unknown"}</p>
                            </div>
                            <span className={`rounded px-2 py-1 text-[11px] font-bold uppercase ${severityClass}`}>
                              {activeIncident.severity || "Moderate"}
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })()}

                  <div className="mt-4 flex gap-2">
                    <button className="flex-1 rounded-lg bg-[#f5f7fb] py-2.5 text-sm font-semibold hover:bg-gray-200">
                      Reassign
                    </button>
                    <button className="flex-1 rounded-lg border border-gray-200 py-2.5 text-sm font-semibold text-[#4b41e1] hover:bg-[#4b41e1]/5">
                      View Incident
                    </button>
                  </div>
                </div>

                {/* Incident Stats */}
                <div className="mb-6 grid grid-cols-3 gap-3 rounded-xl bg-[#f5f7fb] p-4">
                  <div className="text-center">
                    <p className="font-['Space_Grotesk'] text-2xl font-bold text-[#4b41e1]">
                      {getVolunteerIncidentCount(selectedVolunteer.id)}
                    </p>
                    <p className="mt-1 text-[10px] font-bold uppercase tracking-wider text-[#76767f]">Tasks</p>
                  </div>
                  <div className="border-x border-gray-200 text-center">
                    <p className="font-['Space_Grotesk'] text-2xl font-bold">
                      {incidents.filter(inc =>
                        inc.assignedTo === selectedVolunteer.id && inc.status === "Resolved"
                      ).length}
                    </p>
                    <p className="mt-1 text-[10px] font-bold uppercase tracking-wider text-[#76767f]">Resolved</p>
                  </div>
                  <div className="text-center">
                    <p className="font-['Space_Grotesk'] text-2xl font-bold">
                      {selectedVolunteer.verification === "Verified" ? "✅" : "⏳"}
                    </p>
                    <p className="mt-1 text-[10px] font-bold uppercase tracking-wider text-[#76767f]">Verified</p>
                  </div>
                </div>

                {/* Contact */}
                <div className="mb-6">
                  <h4 className="mb-3 text-xs font-bold uppercase tracking-wide">Contact Information</h4>
                  <div className="space-y-2 text-sm">
                    <p className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-[16px] text-[#76767f]">email</span>
                      {selectedVolunteer.email || "N/A"}
                    </p>
                    <p className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-[16px] text-[#76767f]">phone</span>
                      {selectedVolunteer.phone || "N/A"}
                    </p>
                    <p className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-[16px] text-[#76767f]">location_on</span>
                      {selectedVolunteer.location || "N/A"}
                    </p>
                  </div>
                </div>

                {/* Recent Activity */}
                <div>
                  <h4 className="mb-4 text-xs font-bold uppercase tracking-wide">Recent Activity</h4>
                  <div className="ml-2 space-y-5 border-l-2 border-gray-200 pl-6">
                    {incidents
                      .filter(inc =>
                        inc.assignedTo === selectedVolunteer.id ||
                        inc.volunteerId === selectedVolunteer.id
                      )
                      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
                      .slice(0, 3)
                      .map((incident, idx) => (
                        <div key={incident.id} className="relative">
                          <span className={`absolute -left-[33px] top-1 h-4 w-4 rounded-full border-2 border-white ${idx === 0 ? "bg-[#FF9800]" : "bg-[#76767f]"}`} />
                          <p className="mb-1 text-xs font-bold text-[#76767f]">
                            {incident.timestamp
                              ? new Date(incident.timestamp).toLocaleTimeString() + " • " + new Date(incident.timestamp).toLocaleDateString()
                              : "Recently"}
                          </p>
                          <p className="text-sm">
                            {incident.status === "Resolved"
                              ? `Resolved: ${incident.title}`
                              : `Assigned to: ${incident.title}`}
                          </p>
                        </div>
                      ))}

                    {incidents.filter(inc =>
                      inc.assignedTo === selectedVolunteer.id ||
                      inc.volunteerId === selectedVolunteer.id
                    ).length === 0 && (
                      <div className="text-sm text-[#76767f]">No recent activity</div>
                    )}
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="space-y-3 border-t border-gray-200 bg-white p-6">
                <button
                  onClick={handleEditVolunteer}
                  className="w-full rounded-xl bg-[#4b41e1] py-3 font-semibold text-white transition hover:bg-[#645efb]"
                >
                  Update Profile
                </button>
                <button
                  onClick={() => {
                    setVolunteerToDelete(selectedVolunteer);
                    setShowDeleteModal(true);
                  }}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#ffdad6]/60 py-3 font-semibold text-[#93000a] transition hover:bg-[#ffdad6]"
                >
                  <span className="material-symbols-outlined text-[18px]">delete</span>
                  Remove Volunteer
                </button>
              </div>
            </>
          ) : (
            <div className="flex flex-1 items-center justify-center p-8 text-center">
              <div>
                <span className="material-symbols-outlined mb-4 block text-6xl text-gray-300">person_search</span>
                <h3 className="text-xl font-bold text-[#1b1b1e]">No Volunteer Selected</h3>
                <p className="mt-2 text-sm text-[#76767f]">Click on a volunteer from the list to view their details</p>
              </div>
            </div>
          )}
        </aside>
      </div>

      {/* ---- Edit Modal ---- */}
      {showEditModal && selectedVolunteer && (
        <Modal onClose={() => setShowEditModal(false)} title="Edit Volunteer">
          <div className="space-y-4">
            <Field label="Status">
              <select
                value={editFormData.status}
                onChange={(e) => setEditFormData({ ...editFormData, status: e.target.value })}
                className="w-full rounded-lg bg-[#f5f7fb] px-4 py-2 outline-none focus:ring-2 focus:ring-[#4b41e1]/30"
              >
                <option value="Available">Available</option>
                <option value="On Assignment">On Assignment</option>
                <option value="Offline">Offline</option>
                <option value="Suspended">Suspended</option>
              </select>
            </Field>

            <Field label="Team">
              <input
                type="text"
                value={editFormData.team}
                onChange={(e) => setEditFormData({ ...editFormData, team: e.target.value })}
                className="w-full rounded-lg bg-[#f5f7fb] px-4 py-2 outline-none focus:ring-2 focus:ring-[#4b41e1]/30"
                placeholder="Enter team name"
              />
            </Field>

            <Field label="Skills (comma separated)">
              <input
                type="text"
                value={editFormData.skills.join(", ")}
                onChange={(e) =>
                  setEditFormData({
                    ...editFormData,
                    skills: e.target.value.split(",").map(s => s.trim()).filter(Boolean),
                  })
                }
                className="w-full rounded-lg bg-[#f5f7fb] px-4 py-2 outline-none focus:ring-2 focus:ring-[#4b41e1]/30"
                placeholder="e.g. Rescue, First Aid, Logistics"
              />
            </Field>

            <div className="flex justify-end gap-3 pt-2">
              <button onClick={() => setShowEditModal(false)} className="rounded-lg border px-4 py-2 hover:bg-gray-50">
                Cancel
              </button>
              <button
                onClick={handleSaveEdit}
                disabled={loading}
                className="rounded-lg bg-[#4b41e1] px-4 py-2 text-white hover:bg-[#645efb] disabled:opacity-50"
              >
                {loading ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* ---- Delete Modal ---- */}
      {showDeleteModal && volunteerToDelete && (
        <Modal onClose={() => setShowDeleteModal(false)} title="Remove Volunteer" tone="danger">
          <p className="text-gray-700">
            Are you sure you want to remove{" "}
            <span className="font-bold">{volunteerToDelete.name}</span> from the volunteer force?
            This action cannot be undone.
          </p>
          {getVolunteerIncidentCount(volunteerToDelete.id) > 0 && (
            <p className="mt-2 text-sm font-semibold text-orange-500">
              ⚠️ This volunteer has {getVolunteerIncidentCount(volunteerToDelete.id)} assigned incidents.
            </p>
          )}
          <div className="mt-6 flex justify-end gap-3">
            <button onClick={() => setShowDeleteModal(false)} className="rounded-lg border px-4 py-2 hover:bg-gray-50">
              Cancel
            </button>
            <button
              onClick={handleDeleteVolunteer}
              disabled={loading}
              className="rounded-lg bg-red-600 px-4 py-2 text-white hover:bg-red-700 disabled:opacity-50"
            >
              {loading ? "Removing..." : "Remove Volunteer"}
            </button>
          </div>
        </Modal>
      )}
    </AdminLayout>
  );
}

/* ---------- Small inline helpers (will move to shared components later) ---------- */

const Modal = ({ children, onClose, title, tone = "default" }) => {
  const titleColor = tone === "danger" ? "text-red-600" : "text-[#1b1b1e]";
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-md rounded-2xl bg-white">
        <div className="flex items-center justify-between border-b border-gray-200 p-6">
          <h3 className={`text-2xl font-bold ${titleColor}`}>{title}</h3>
          <button onClick={onClose} className="rounded-lg p-2 hover:bg-gray-100">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>
        <div className="max-h-[70vh] overflow-y-auto p-6">{children}</div>
      </div>
    </div>
  );
};

const Field = ({ label, children }) => (
  <div className="space-y-2">
    <label className="text-sm font-semibold">{label}</label>
    {children}
  </div>
);

export default VolunteerManagement;