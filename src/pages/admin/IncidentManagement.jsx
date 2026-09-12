import { useState } from "react";
import AdminLayout from "../../layouts/AdminLayout";
import { useDisaster } from "../../context/DisasterContext";
import ShelterRecommendation from "../../components/ShelterRecommendation";
import VolunteerMatching from "../../components/VolunteerMatching";

function IncidentManagement() {
  const {
    incidents,
    updateIncident,
    updateIncidentStatus,
    deleteIncident,
  } = useDisaster();

  const [selectedIncident, setSelectedIncident] = useState(null);

  // ---- Modal state (replaces prompt/alert/confirm) ----
  const [modal, setModal] = useState({ type: null, incident: null });

  const closeModal = () => setModal({ type: null, incident: null });
  const openModal = (type, incident = selectedIncident) => setModal({ type, incident });

  // ---- Transform incident for table display ----
  const transformIncident = (inc) => {
    const severityUpper = inc.severity?.toUpperCase() || "MODERATE";

    const severityColorMap = {
      CRITICAL: "bg-[#FF5252] text-white",
      HIGH: "bg-[#FF9800] text-white",
      MODERATE: "bg-[#FFC107] text-white",
      LOW: "bg-[#4CAF50] text-white",
    };

    const statusColorMap = {
      Pending: "bg-[#FF5252]/10 text-[#FF5252] border border-[#FF5252]/20",
      "Under Review": "bg-[#FF9800]/10 text-[#FF9800] border border-[#FF9800]/20",
      "In Progress": "bg-[#4CAF50]/10 text-[#4CAF50] border border-[#4CAF50]/20",
      Resolved: "bg-[#2196F3]/10 text-[#2196F3] border border-[#2196F3]/20",
    };

    const reportTime = inc.timestamp
      ? new Date(inc.timestamp).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })
      : "N/A";

    const reportedAgo = inc.timestamp
      ? `Reported ${Math.floor((Date.now() - new Date(inc.timestamp).getTime()) / 60000)} min ago`
      : "Just now";

    const priorityLevel = inc.priorityLevel || "Low";
    const priorityScore = inc.priorityScore || 0;
    const priorityColor =
      priorityLevel === "Critical" ? "text-red-600" :
      priorityLevel === "High" ? "text-orange-500" :
      priorityLevel === "Moderate" ? "text-yellow-600" : "text-gray-500";
    const priorityDot =
      priorityLevel === "Critical" ? "bg-red-600" :
      priorityLevel === "High" ? "bg-orange-500" :
      priorityLevel === "Moderate" ? "bg-yellow-500" : "bg-gray-400";

    return {
      id: inc.id || `INC-${Math.random().toString(36).substr(2, 4).toUpperCase()}`,
      title: inc.title || "Untitled Report",
      reportedAgo,
      location: inc.location || "Unknown location",
      severity: severityUpper,
      severityColor: severityColorMap[severityUpper] || "bg-[#FFC107] text-white",
      status: inc.status || "Pending",
      statusColor: statusColorMap[inc.status] || "bg-[#FF9800]/10 text-[#FF9800] border border-[#FF9800]/20",
      time: reportTime,
      active: false,
      priorityScore,
      priorityLevel,
      priorityColor,
      priorityDot,
      ...inc,
    };
  };

  const incidentList = incidents.length > 0 ? incidents.map(transformIncident) : [];
  const currentIncident = selectedIncident || incidentList[0] || {};

  // ---- Derived summary stats ----
  const totalIncidents = incidentList.length;
  const pendingIncidents = incidentList.filter(i =>
    i.status === "Pending" || i.status === "Under Review" || i.status === "Submitted"
  ).length;
  const criticalIncidents = incidentList.filter(i =>
    i.severity === "CRITICAL" || i.severity === "Critical"
  ).length;
  const inProgressIncidents = incidentList.filter(i =>
    i.status === "In Progress" || i.status === "Responding"
  ).length;
  const resolvedIncidents = incidentList.filter(i => i.status === "Resolved").length;
  const unassignedIncidents = incidentList.filter(i => !i.assignedTo).length;

  const summaryStats = [
    { title: "Total Incidents", value: totalIncidents, icon: "analytics", color: "text-[#1b1b1e]", border: "" },
    { title: "Pending Verif.", value: pendingIncidents, icon: "pending_actions", color: "text-[#FF9800]", border: "border-l-4 border-[#FF9800]" },
    { title: "Critical", value: criticalIncidents, icon: "warning", color: "text-[#FF5252]", border: "border-l-4 border-[#FF5252]" },
    { title: "In Progress", value: inProgressIncidents, icon: "radio_button_checked", color: "text-[#4b41e1]", border: "border-l-4 border-[#4b41e1]" },
    { title: "Resolved", value: resolvedIncidents, icon: "check_circle", color: "text-[#4CAF50]", border: "border-l-4 border-[#4CAF50]" },
    { title: "Unassigned", value: unassignedIncidents, icon: "person_off", color: "text-[#FF9800]", border: "border-l-4 border-[#FF9800]" },
  ];

  // ---- Mutation handlers (called by modals) ----
  const handleAssignTeam = async (teamName) => {
    if (!modal.incident?.id) return;
    await updateIncident(modal.incident.id, { assignedTo: teamName });
    if (selectedIncident?.id === modal.incident.id) {
      setSelectedIncident({ ...selectedIncident, assignedTo: teamName });
    }
    closeModal();
  };

  const handleChangeStatus = async (newStatus) => {
    if (!modal.incident?.id) return;
    await updateIncidentStatus(modal.incident.id, newStatus);
    if (selectedIncident?.id === modal.incident.id) {
      setSelectedIncident({ ...selectedIncident, status: newStatus });
    }
    closeModal();
  };

  const handleUpdateIncident = async (data) => {
    if (!modal.incident?.id) return;
    await updateIncident(modal.incident.id, data);
    if (selectedIncident?.id === modal.incident.id) {
      setSelectedIncident({ ...selectedIncident, ...data });
    }
    closeModal();
  };

  const handleDeleteIncident = async () => {
    if (!modal.incident?.id) return;
    await deleteIncident(modal.incident.id);
    if (selectedIncident?.id === modal.incident.id) setSelectedIncident(null);
    closeModal();
  };

  return (
    <AdminLayout title="Incident Management">
      <div className="space-y-6">

        {/* Page Header */}
        <section className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
          <div>
            <h2 className="font-['Space_Grotesk'] text-3xl font-bold">Incident Management</h2>
            <p className="mt-2 text-[#45464e]">
              Review, verify, prioritize and coordinate responses to reported disaster incidents.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <button className="flex items-center gap-2 rounded-xl border border-[#0e1a39]/20 px-5 py-2.5 font-semibold text-[#0e1a39] transition hover:bg-white">
              <span className="material-symbols-outlined text-[18px]">download</span>
              Export Reports
            </button>
            <button className="flex items-center gap-2 rounded-xl bg-[#4b41e1] px-5 py-2.5 font-semibold text-white shadow-md transition hover:bg-[#645efb]">
              <span className="material-symbols-outlined text-[18px]">add</span>
              Create Incident
            </button>
          </div>
        </section>

        {/* Summary Stats */}
        <section className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6">
          {summaryStats.map((stat) => (
            <div key={stat.title} className={`rounded-[20px] bg-white p-5 shadow-sm ${stat.border}`}>
              <p className={`text-[11px] font-bold uppercase ${stat.color === "text-[#1b1b1e]" ? "text-[#45464e]" : stat.color}`}>
                {stat.title}
              </p>
              <div className="mt-4 flex items-center justify-between">
                <p className={`text-3xl font-bold ${stat.color}`}>{stat.value}</p>
                <span className={`material-symbols-outlined text-[24px] ${stat.color}`}>{stat.icon}</span>
              </div>
            </div>
          ))}
        </section>

        {/* Filter Bar */}
        <section className="flex flex-col gap-4 rounded-[20px] bg-white p-5 shadow-sm xl:flex-row xl:items-center xl:justify-between">
          <div className="relative w-full xl:w-96">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[#45464e]">search</span>
            <input
              type="text"
              placeholder="Search incident, location or report ID..."
              className="w-full rounded-xl border-none bg-[#f5f7fb] py-3 pl-10 pr-4 text-sm outline-none ring-1 ring-transparent focus:ring-[#4b41e1]"
            />
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <select className="rounded-xl border-none bg-[#f5f7fb] px-4 py-3 text-sm outline-none">
              <option>Status: All</option>
              <option>Pending</option>
              <option>In Progress</option>
              <option>Resolved</option>
            </select>
            <select className="rounded-xl border-none bg-[#f5f7fb] px-4 py-3 text-sm outline-none">
              <option>Severity: All</option>
              <option>Critical</option>
              <option>High</option>
              <option>Moderate</option>
            </select>
            <select className="rounded-xl border-none bg-[#f5f7fb] px-4 py-3 text-sm outline-none">
              <option>Type: All</option>
              <option>Flood</option>
              <option>Landslide</option>
              <option>Fire</option>
            </select>
            <button className="px-2 text-sm font-bold text-[#4b41e1] hover:underline">Clear Filters</button>
          </div>
        </section>

        {/* Main Grid */}
        <section className="grid gap-6 xl:grid-cols-[1fr_400px]">

          {/* Table */}
          <div className="overflow-hidden rounded-[20px] bg-white shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[950px] border-collapse text-left">
                <thead className="bg-[#f5f7fb]">
                  <tr>
                    <th className="px-5 py-4 text-[11px] font-bold uppercase text-[#45464e]">ID / Incident</th>
                    <th className="px-5 py-4 text-[11px] font-bold uppercase text-[#45464e]">Location</th>
                    <th className="px-5 py-4 text-[11px] font-bold uppercase text-[#45464e]">Severity</th>
                    <th className="px-5 py-4 text-[11px] font-bold uppercase text-[#45464e]">Priority</th>
                    <th className="px-5 py-4 text-[11px] font-bold uppercase text-[#45464e]">Status</th>
                    <th className="px-5 py-4 text-[11px] font-bold uppercase text-[#45464e]">Reported</th>
                    <th className="px-5 py-4 text-right text-[11px] font-bold uppercase text-[#45464e]">Actions</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-gray-100">
                  {incidentList.map((incident) => (
                    <tr
                      key={incident.id}
                      className="cursor-pointer transition hover:bg-[#f5f7fb]"
                      onClick={() => setSelectedIncident(incident)}
                    >
                      <td className="px-5 py-5">
                        <p className="font-semibold">{incident.id}</p>
                        <p className="mt-1 max-w-[190px] truncate text-sm text-[#45464e]">
                          {incident.title || "Untitled Report"}
                        </p>
                      </td>

                      <td className="px-5 py-5 text-sm">{incident.location || "Unknown location"}</td>

                      <td className="px-5 py-5">
                        <span className={`rounded-full px-3 py-1 text-[11px] font-bold ${incident.severityColor}`}>
                          {incident.severity}
                        </span>
                      </td>

                      <td className="px-5 py-5">
                        <div className="flex items-center gap-2">
                          <div className={`h-6 w-1.5 rounded-full ${incident.priorityDot || "bg-gray-400"}`} />
                          <div>
                            <span className="text-sm font-bold">{incident.priorityScore || 0}/100</span>
                            <span className={`ml-2 text-[10px] font-bold uppercase ${incident.priorityColor || "text-gray-500"}`}>
                              {incident.priorityLevel || "Low"}
                            </span>
                          </div>
                        </div>
                      </td>

                      <td className="px-5 py-5">
                        <span className={`rounded-full px-3 py-1 text-[11px] font-bold ${incident.statusColor}`}>
                          {incident.status || "Pending"}
                        </span>
                      </td>

                      <td className="px-5 py-5 text-sm text-[#45464e]">{incident.time}</td>

                      <td className="px-5 py-5 text-right">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedIncident(incident);
                            openModal("details", incident);
                          }}
                          className="rounded-full p-2 text-[#4b41e1] transition hover:bg-[#4b41e1]/10"
                          title="View Details"
                        >
                          <span className="material-symbols-outlined">open_in_new</span>
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            openModal("delete", incident);
                          }}
                          className="rounded-full p-2 text-red-500 transition hover:bg-red-50"
                          title="Delete"
                        >
                          <span className="material-symbols-outlined">delete</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex flex-col justify-between gap-3 border-t border-gray-100 bg-[#fafafa] p-4 sm:flex-row sm:items-center">
              <div className="flex gap-2">
                <button
                  onClick={() => openModal("assign")}
                  className="rounded-lg border border-gray-300 px-3 py-2 text-xs font-semibold text-[#45464e] hover:bg-gray-100"
                >
                  Assign Team
                </button>
                <button
                  onClick={() => openModal("status")}
                  className="rounded-lg border border-gray-300 px-3 py-2 text-xs font-semibold text-[#45464e] hover:bg-gray-100"
                >
                  Change Status
                </button>
              </div>
              <div className="flex items-center gap-2 text-sm text-[#45464e]">
                <span>{incidentList.length} incidents</span>
              </div>
            </div>
          </div>

          {/* Details Panel */}
          <aside className="flex min-h-[600px] flex-col overflow-hidden rounded-[20px] bg-white shadow-sm">
            <div className="flex items-start justify-between border-b border-gray-100 bg-[#f5f7fb] p-5">
              <div>
                <div className="mb-2 flex items-center gap-2">
                  <h3 className="font-['Space_Grotesk'] text-xl font-bold">
                    {currentIncident.id || "No Incident Selected"}
                  </h3>
                  <span className={`rounded-full px-3 py-1 text-[10px] font-bold text-white ${
                    currentIncident.severity === "CRITICAL" || currentIncident.severity === "Critical"
                      ? "bg-[#FF5252]"
                      : "bg-[#FF9800]"
                  }`}>
                    {currentIncident.severity || "N/A"}
                  </span>
                </div>
                <p className="font-semibold">
                  {currentIncident.title || "Select an incident to view details"}
                </p>
              </div>
              <button onClick={() => setSelectedIncident(null)} className="text-[#45464e] hover:text-[#1b1b1e]">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <div className="flex-1 space-y-6 overflow-y-auto p-5">
              <div>
                <h4 className="mb-3 text-[11px] font-bold uppercase text-[#45464e]">Situation Report</h4>
                <p className="rounded-xl border border-gray-200 bg-[#f5f7fb] p-4 text-sm leading-relaxed">
                  {currentIncident.description || "No description available."}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="rounded-xl border border-gray-200 bg-[#f5f7fb] p-4">
                  <p className="text-[10px] font-bold uppercase text-[#45464e]">Affected</p>
                  <p className="mt-2 text-xl font-bold">
                    {currentIncident.peopleAffected || 0}{" "}
                    <span className="text-sm font-normal text-[#45464e]">People</span>
                  </p>
                </div>
                <div className="rounded-xl border border-gray-200 bg-[#f5f7fb] p-4">
                  <p className="text-[10px] font-bold uppercase text-[#45464e]">Water Level</p>
                  <p className="mt-2 flex items-center gap-1 text-xl font-bold text-[#FF5252]">
                    {currentIncident.waterLevel || 0}m
                    <span className="material-symbols-outlined text-[18px]">trending_up</span>
                  </p>
                </div>
              </div>

              <div>
                <h4 className="mb-3 text-[11px] font-bold uppercase text-[#45464e]">Location</h4>
                <div className="relative flex h-32 items-center justify-center overflow-hidden rounded-xl bg-gradient-to-br from-[#dbeafe] to-[#dcfce7]">
                  <span className="material-symbols-outlined text-4xl text-[#4b41e1]">location_on</span>
                  <div className="absolute bottom-2 left-2 rounded-lg bg-white/90 px-3 py-1 text-xs font-semibold">
                    {currentIncident.location || "Unknown location"}
                  </div>
                </div>
              </div>

              <div>
                <h4 className="mb-3 text-[11px] font-bold uppercase text-[#45464e]">Assigned Team</h4>
                <div className="flex items-center justify-between rounded-xl border border-gray-200 p-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#4b41e1]/10">
                      <span className="material-symbols-outlined text-[#4b41e1]">group</span>
                    </div>
                    <div>
                      <p className="text-sm font-semibold">{currentIncident.assignedTo || "Unassigned"}</p>
                      <p className="mt-1 flex items-center gap-1 text-xs text-[#4CAF50]">
                        <span className="h-1.5 w-1.5 rounded-full bg-[#4CAF50]" />
                        {currentIncident.assignedTo ? "Active" : "Standby"}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="mb-3 text-[11px] font-bold uppercase text-[#45464e]">Nearby Shelters</h4>
                <ShelterRecommendation
                  incidentLat={currentIncident.lat || 27.7172}
                  incidentLng={currentIncident.lng || 85.3240}
                  title="Recommended Shelters"
                />
              </div>

              <div>
                <h4 className="mb-3 text-[11px] font-bold uppercase text-[#45464e]">Matching Volunteers</h4>
                <VolunteerMatching
                  incidentId={currentIncident.id}
                  incidentType={currentIncident.incidentType || currentIncident.type || "Other"}
                  incidentLat={currentIncident.lat || 27.7172}
                  incidentLng={currentIncident.lng || 85.3240}
                  limit={5}
                />
              </div>

              <div>
                <h4 className="mb-4 text-[11px] font-bold uppercase text-[#45464e]">Incident Activity</h4>
                <div className="ml-2 space-y-5 border-l border-gray-300 pl-5">
                  <div className="relative">
                    <span className="absolute -left-[25px] top-1.5 h-2.5 w-2.5 rounded-full bg-[#4CAF50]" />
                    <p className="text-sm font-semibold">
                      {currentIncident.assignedTo ? `Assigned to ${currentIncident.assignedTo}` : "Awaiting assignment"}
                    </p>
                    <p className="mt-1 text-xs text-[#76767f]">
                      {currentIncident.timestamp ? new Date(currentIncident.timestamp).toLocaleTimeString() : "Just now"}
                    </p>
                  </div>
                  <div className="relative">
                    <span className="absolute -left-[25px] top-1.5 h-2.5 w-2.5 rounded-full bg-gray-300" />
                    <p className="text-sm font-semibold">
                      Incident {currentIncident.status === "Resolved" ? "Resolved" : "In Progress"}
                    </p>
                    <p className="mt-1 text-xs text-[#76767f]">{currentIncident.status || "Pending"}</p>
                  </div>
                  <div className="relative">
                    <span className="absolute -left-[25px] top-1.5 h-2.5 w-2.5 rounded-full bg-gray-300" />
                    <p className="text-sm font-semibold">Reported via Mobile App</p>
                    <p className="mt-1 text-xs text-[#76767f]">
                      {currentIncident.timestamp ? new Date(currentIncident.timestamp).toLocaleDateString() : "Today"}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-3 border-t border-gray-100 bg-[#fafafa] p-5">
              <button
                onClick={() => openModal("update")}
                className="w-full rounded-xl bg-[#4b41e1] py-3 font-semibold text-white transition hover:bg-[#645efb]"
              >
                Update Incident
              </button>

              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => openModal("assign")}
                  className="rounded-xl border border-gray-300 py-2.5 text-xs font-semibold hover:bg-gray-100"
                >
                  Assign Response
                </button>
                <button
                  onClick={() => openModal("status")}
                  className="rounded-xl border border-gray-300 py-2.5 text-xs font-semibold hover:bg-gray-100"
                >
                  Change Status
                </button>
              </div>

              <button
                onClick={() => openModal("delete")}
                className="w-full py-1 text-xs font-bold text-[#FF5252] hover:underline"
              >
                Archive Incident
              </button>
            </div>
          </aside>
        </section>
      </div>

      {/* ===================== MODALS ===================== */}

      {modal.type === "assign" && (
        <AssignTeamModal
          incident={modal.incident || currentIncident}
          onClose={closeModal}
          onSave={handleAssignTeam}
        />
      )}

      {modal.type === "status" && (
        <ChangeStatusModal
          incident={modal.incident || currentIncident}
          onClose={closeModal}
          onSave={handleChangeStatus}
        />
      )}

      {modal.type === "update" && (
        <UpdateIncidentModal
          incident={modal.incident || currentIncident}
          onClose={closeModal}
          onSave={handleUpdateIncident}
        />
      )}

      {modal.type === "delete" && (
        <DeleteModal
          incident={modal.incident || currentIncident}
          onClose={closeModal}
          onConfirm={handleDeleteIncident}
        />
      )}

      {modal.type === "details" && (
        <DetailsModal incident={modal.incident} onClose={closeModal} />
      )}
    </AdminLayout>
  );
}

/* ===================== MODAL COMPONENTS ===================== */

const ModalShell = ({ title, onClose, children, tone = "default" }) => {
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

const AssignTeamModal = ({ incident, onClose, onSave }) => {
  const [team, setTeam] = useState(incident?.assignedTo || "");
  return (
    <ModalShell title="Assign Team" onClose={onClose}>
      <div className="space-y-4">
        <p className="text-sm text-[#45464e]">
          Assign a response team to <span className="font-bold">{incident?.title || "this incident"}</span>.
        </p>

        <div className="space-y-2">
          <label className="text-sm font-semibold">Team Name</label>
          <input
            type="text"
            value={team}
            onChange={(e) => setTeam(e.target.value)}
            placeholder="e.g. Kathmandu Rescue Team"
            className="w-full rounded-lg border border-gray-200 bg-[#f5f7fb] px-4 py-2 outline-none focus:ring-2 focus:ring-[#4b41e1]/30"
            autoFocus
          />
        </div>

        <div className="flex justify-end gap-3 pt-2">
          <button onClick={onClose} className="rounded-lg border px-4 py-2 hover:bg-gray-50">
            Cancel
          </button>
          <button
            onClick={() => team.trim() && onSave(team.trim())}
            disabled={!team.trim()}
            className="rounded-lg bg-[#4b41e1] px-4 py-2 text-white hover:bg-[#645efb] disabled:opacity-50"
          >
            Assign Team
          </button>
        </div>
      </div>
    </ModalShell>
  );
};

const ChangeStatusModal = ({ incident, onClose, onSave }) => {
  const options = ["Pending", "Under Review", "In Progress", "Resolved"];
  const [status, setStatus] = useState(incident?.status || "Pending");
  return (
    <ModalShell title="Change Status" onClose={onClose}>
      <div className="space-y-4">
        <p className="text-sm text-[#45464e]">
          Update status for <span className="font-bold">{incident?.id}</span>.
        </p>

        <div className="space-y-2">
          <label className="text-sm font-semibold">New Status</label>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="w-full rounded-lg border border-gray-200 bg-[#f5f7fb] px-4 py-2 outline-none focus:ring-2 focus:ring-[#4b41e1]/30"
          >
            {options.map((o) => (
              <option key={o} value={o}>{o}</option>
            ))}
          </select>
        </div>

        <div className="flex justify-end gap-3 pt-2">
          <button onClick={onClose} className="rounded-lg border px-4 py-2 hover:bg-gray-50">
            Cancel
          </button>
          <button
            onClick={() => onSave(status)}
            className="rounded-lg bg-[#4b41e1] px-4 py-2 text-white hover:bg-[#645efb]"
          >
            Save Status
          </button>
        </div>
      </div>
    </ModalShell>
  );
};

const UpdateIncidentModal = ({ incident, onClose, onSave }) => {
  const [title, setTitle] = useState(incident?.title || "");
  const [description, setDescription] = useState(incident?.description || "");
  const [peopleAffected, setPeopleAffected] = useState(incident?.peopleAffected || 0);

  const handleSubmit = () => {
    const patch = {};
    if (title.trim()) patch.title = title.trim();
    if (description !== undefined) patch.description = description.trim();
    patch.peopleAffected = parseInt(peopleAffected) || 0;
    onSave(patch);
  };

  return (
    <ModalShell title="Update Incident" onClose={onClose}>
      <div className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-semibold">Title</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full rounded-lg border border-gray-200 bg-[#f5f7fb] px-4 py-2 outline-none focus:ring-2 focus:ring-[#4b41e1]/30"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-semibold">Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows="4"
            className="w-full resize-none rounded-lg border border-gray-200 bg-[#f5f7fb] px-4 py-2 outline-none focus:ring-2 focus:ring-[#4b41e1]/30"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-semibold">People Affected</label>
          <input
            type="number"
            value={peopleAffected}
            onChange={(e) => setPeopleAffected(e.target.value)}
            className="w-full rounded-lg border border-gray-200 bg-[#f5f7fb] px-4 py-2 outline-none focus:ring-2 focus:ring-[#4b41e1]/30"
          />
        </div>

        <div className="flex justify-end gap-3 pt-2">
          <button onClick={onClose} className="rounded-lg border px-4 py-2 hover:bg-gray-50">
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            className="rounded-lg bg-[#4b41e1] px-4 py-2 text-white hover:bg-[#645efb]"
          >
            Save Changes
          </button>
        </div>
      </div>
    </ModalShell>
  );
};

const DeleteModal = ({ incident, onClose, onConfirm }) => (
  <ModalShell title="Delete Incident" onClose={onClose} tone="danger">
    <p className="text-gray-700">
      Are you sure you want to delete <span className="font-bold">{incident?.title || "this incident"}</span>?
      This action cannot be undone.
    </p>

    <div className="mt-6 flex justify-end gap-3">
      <button onClick={onClose} className="rounded-lg border px-4 py-2 hover:bg-gray-50">
        Cancel
      </button>
      <button
        onClick={onConfirm}
        className="rounded-lg bg-red-600 px-4 py-2 text-white hover:bg-red-700"
      >
        Delete
      </button>
    </div>
  </ModalShell>
);

const DetailsModal = ({ incident, onClose }) => (
  <ModalShell title="Incident Details" onClose={onClose}>
    <div className="space-y-4 text-sm">
      <Row label="ID" value={incident?.id} />
      <Row label="Title" value={incident?.title} />
      <Row label="Location" value={incident?.location} />
      <Row label="Severity" value={incident?.severity} />
      <Row label="Priority" value={`${incident?.priorityScore || 0}/100 (${incident?.priorityLevel || "Low"})`} />
      <Row label="Status" value={incident?.status} />
      <Row label="People Affected" value={incident?.peopleAffected || 0} />
      <Row label="Water Level" value={`${incident?.waterLevel || 0}m`} />
      <Row label="Assigned Team" value={incident?.assignedTo || "Unassigned"} />
    </div>

    <div className="mt-6 flex justify-end">
      <button onClick={onClose} className="rounded-lg bg-[#4b41e1] px-4 py-2 text-white hover:bg-[#645efb]">
        Close
      </button>
    </div>
  </ModalShell>
);

const Row = ({ label, value }) => (
  <div className="flex justify-between border-b border-gray-100 py-2">
    <span className="text-[#76767f]">{label}</span>
    <span className="font-semibold text-right">{value}</span>
  </div>
);

export default IncidentManagement;