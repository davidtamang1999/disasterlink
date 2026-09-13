import { useState } from "react";
import VolunteerLayout from "../../layouts/VolunteerLayout";
import { useDisaster } from "../../context/DisasterContext";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../components/shared";
import { incidentService } from "../../services/incidentService";

function MyTasks() {
  const { incidents, updateIncident } = useDisaster();
  const { user } = useAuth();
  const toast = useToast();

  const [selectedTaskId, setSelectedTaskId] = useState(null);
  const [fieldUpdate, setFieldUpdate] = useState("");
  const [peopleAssisted, setPeopleAssisted] = useState("");
  const [resourcesUsed, setResourcesUsed] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Filter: incidents assigned to this volunteer OR in their district
  const myTasks = incidents.filter((inc) => {
    const assignedToMe =
      inc.assignedTo === user?.id ||
      inc.assignedTo === user?.email ||
      (Array.isArray(inc.responders) && inc.responders.includes(user?.id));

    const inMyDistrict =
      user?.district &&
      inc.district &&
      inc.district.toLowerCase() === user.district.toLowerCase();

    // Also include incidents from report location matching user district
    const locationMatches =
      user?.district &&
      inc.location &&
      inc.location.toLowerCase().includes(user.district.toLowerCase());

    return assignedToMe || inMyDistrict || locationMatches;
  });

  // If no matches, fall back to all open incidents so the page isn't empty
  const displayedTasks = myTasks.length > 0
    ? myTasks
    : incidents.filter((inc) => inc.status !== "Resolved");

  // ---------- Stats ----------
  const assignedCount = displayedTasks.filter((t) =>
    t.status === "Pending" || t.status === "Under Review" || t.status === "Submitted"
  ).length;

  const inProgressCount = displayedTasks.filter((t) =>
    t.status === "In Progress" || t.status === "Responding"
  ).length;

  const completedCount = displayedTasks.filter((t) => t.status === "Resolved").length;

  const highPriorityCount = displayedTasks.filter(
    (t) => t.severity === "Critical" || t.severity === "CRITICAL" || t.severity === "High"
  ).length;

  const selectedTask =
    displayedTasks.find((t) => t.id === selectedTaskId) || displayedTasks[0];

  // ---------- Styling helpers ----------
  const getStatusColor = (status) => {
    const colors = {
      Pending: "bg-gray-100 text-gray-700",
      "Under Review": "bg-orange-100 text-orange-600",
      Submitted: "bg-blue-100 text-blue-600",
      "In Progress": "bg-[#4b41e1]/10 text-[#4b41e1]",
      Responding: "bg-[#4b41e1]/10 text-[#4b41e1]",
      Resolved: "bg-emerald-100 text-emerald-600",
    };
    return colors[status] || "bg-gray-100 text-gray-700";
  };

  const getSeverityColor = (severity) => {
    const colors = {
      Critical: "bg-red-100 text-red-600",
      CRITICAL: "bg-red-100 text-red-600",
      High: "bg-orange-100 text-orange-600",
      Moderate: "bg-blue-100 text-blue-600",
      Low: "bg-emerald-100 text-emerald-600",
    };
    return colors[severity] || "bg-gray-100 text-gray-700";
  };

  // ---------- Status update ----------
  const handleStatusUpdate = async (newStatus) => {
    if (!selectedTask) return;
    try {
      await updateIncident(selectedTask.id, { status: newStatus });
      toast.success(`Task status updated to: ${newStatus}`);
    } catch (err) {
      toast.error("Failed to update status");
    }
  };

  // ---------- Field update (real submit) ----------
  const handleFieldUpdate = async () => {
    if (!fieldUpdate.trim()) {
      toast.error("Please add a status update.");
      return;
    }
    if (!selectedTask) {
      toast.error("No task selected.");
      return;
    }

    setSubmitting(true);
    try {
      await incidentService.createResponseUpdate({
        incidentId: selectedTask.id,
        userId: user?.id,
        userName: user?.fullName || user?.name || "Volunteer",
        title: `Field update — ${selectedTask.title || "Incident"}`,
        description: fieldUpdate.trim(),
        peopleAssisted: parseInt(peopleAssisted) || 0,
        resourcesUsed: resourcesUsed || "",
        status: "Submitted",
      });

      toast.success("Field update submitted successfully!");
      setFieldUpdate("");
      setPeopleAssisted("");
      setResourcesUsed("");
    } catch (err) {
      console.error("Field update failed:", err);
      toast.error("Failed to submit field update. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <VolunteerLayout title="My Tasks">
      {/* ================= PAGE HEADER ================= */}
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div>
          <h2 className="text-3xl font-bold text-[#1b1b1e]">My Tasks</h2>
          <p className="mt-1 text-gray-600">
            {myTasks.length > 0
              ? "Tasks assigned to you or in your district."
              : "Open incidents in your area."}
          </p>
        </div>

        <button className="flex items-center justify-center gap-2 rounded-xl bg-[#4b41e1] px-6 py-3 font-semibold text-white shadow-sm transition-colors hover:bg-[#4037c9]">
          <span className="material-symbols-outlined">add</span>
          Report Field Update
        </button>
      </div>

      {/* ================= SUMMARY CARDS ================= */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <SummaryTile
          label="Assigned"
          value={assignedCount}
          icon="assignment_ind"
          iconColor="text-gray-400"
        />
        <SummaryTile
          label="In Progress"
          value={inProgressCount}
          icon="pending_actions"
          iconColor="text-[#4b41e1]"
        />
        <SummaryTile
          label="Completed"
          value={completedCount}
          icon="task_alt"
          iconColor="text-emerald-500"
        />
        <SummaryTile
          label="High Priority"
          value={highPriorityCount}
          icon="warning"
          highlight={highPriorityCount > 0}
        />
      </div>

      {/* ================= MAIN LAYOUT ================= */}
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
        {/* LEFT COLUMN */}
        <div className="space-y-4 lg:col-span-7">
          {/* Filters */}
          <div className="flex flex-wrap items-center gap-3 rounded-[20px] bg-white p-4 shadow-sm">
            <div className="relative min-w-[200px] flex-1">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[18px] text-gray-500">
                search
              </span>
              <input
                className="w-full rounded-lg border-none bg-[#EDF0F5] py-2 pl-10 pr-4 text-sm focus:ring-2 focus:ring-[#4b41e1]"
                placeholder="Filter tasks..."
                type="text"
              />
            </div>

            <select className="rounded-lg border-none bg-[#EDF0F5] py-2 pl-3 pr-8 text-sm text-gray-600">
              <option>Status: All</option>
              <option>Pending</option>
              <option>In Progress</option>
              <option>Resolved</option>
            </select>

            <select className="rounded-lg border-none bg-[#EDF0F5] py-2 pl-3 pr-8 text-sm text-gray-600">
              <option>Priority: All</option>
              <option>Critical</option>
              <option>High</option>
              <option>Moderate</option>
            </select>
          </div>

          {/* Task list */}
          {displayedTasks.length > 0 ? (
            displayedTasks.map((task, index) => {
              const isSelected =
                selectedTaskId === task.id || (index === 0 && !selectedTaskId);
              const severityColor = getSeverityColor(task.severity);
              const statusColor = getStatusColor(task.status);
              const isHighPriority =
                task.severity === "Critical" ||
                task.severity === "CRITICAL" ||
                task.severity === "High";

              return (
                <div
                  key={task.id}
                  onClick={() => setSelectedTaskId(task.id)}
                  className={`relative cursor-pointer overflow-hidden rounded-[20px] border-2 bg-white p-6 shadow-sm transition-all ${
                    isSelected
                      ? "border-[#4b41e1]"
                      : "border-transparent hover:border-gray-200"
                  }`}
                >
                  {isHighPriority && (
                    <div className="absolute left-0 top-0 h-full w-1.5 bg-[#4b41e1]" />
                  )}

                  <div className="mb-5 flex items-start justify-between">
                    <div>
                      <div className="mb-2 flex flex-wrap items-center gap-2">
                        <span className={`rounded-full px-2 py-1 text-[10px] font-bold uppercase ${severityColor}`}>
                          {task.severity || "Moderate"}
                        </span>
                        <span className={`rounded-full px-2 py-1 text-[10px] font-bold uppercase ${statusColor}`}>
                          {task.status || "Pending"}
                        </span>
                        <span className="rounded-full bg-gray-200 px-2 py-1 text-[10px] font-bold uppercase text-gray-700">
                          {task.incidentType || "Incident"}
                        </span>
                      </div>

                      <h3 className="text-xl font-bold text-gray-900">
                        {task.title || "Untitled Task"}
                      </h3>
                    </div>

                    <div className="text-right">
                      <span className="flex items-center gap-1 text-xs text-gray-500">
                        <span className="material-symbols-outlined text-[16px]">schedule</span>
                        {task.timestamp || task.createdAt
                          ? new Date(task.timestamp || task.createdAt).toLocaleString("en-US", {
                              month: "short",
                              day: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            })
                          : "Just now"}
                      </span>

                      {isHighPriority && (
                        <span className="mt-1 block text-[10px] font-bold text-red-600">
                          High Priority
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="mb-5 grid grid-cols-2 gap-4">
                    <div className="flex items-start gap-2">
                      <span className="material-symbols-outlined text-gray-500">location_on</span>
                      <div>
                        <div className="font-semibold text-gray-900">
                          {task.location || "Unknown location"}
                        </div>
                        <div className="text-sm text-gray-500">
                          {task.lat && task.lng
                            ? `${task.lat.toFixed(3)}, ${task.lng.toFixed(3)}`
                            : "Location pending"}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-start gap-2">
                      <span className="material-symbols-outlined text-gray-500">group</span>
                      <div>
                        <div className="font-semibold text-gray-900">
                          {task.peopleAffected || 0} People Affected
                        </div>
                        <div className="text-sm text-gray-500">
                          {task.urgentAssistance || 0} Need Urgent Help
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between border-t border-gray-100 pt-3">
                    <span className="text-xs font-bold uppercase text-[#4b41e1]">
                      Status: {task.status || "Pending"}
                    </span>
                    <span className="text-xs text-gray-500">
                      Reported:{" "}
                      {task.timestamp || task.createdAt
                        ? new Date(task.timestamp || task.createdAt).toLocaleDateString()
                        : "N/A"}
                    </span>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="rounded-[20px] bg-white p-12 text-center shadow-sm">
              <span className="material-symbols-outlined text-5xl text-gray-300">assignment</span>
              <p className="mt-4 text-gray-500">No tasks available.</p>
              <p className="text-sm text-gray-400">Check back later for new incidents.</p>
            </div>
          )}
        </div>

        {/* RIGHT COLUMN — Task Details */}
        <div className="hidden lg:col-span-5 lg:block">
          {selectedTask ? (
            <div className="sticky top-24 max-h-[calc(100vh-120px)] overflow-y-auto rounded-[20px] bg-white p-6 shadow-sm">
              {/* Header */}
              <div className="mb-6 flex items-start justify-between border-b border-gray-200 pb-4">
                <div>
                  <h3 className="text-2xl font-bold text-gray-900">
                    {selectedTask.title || "Task Details"}
                  </h3>
                  <p className="text-sm text-gray-500">
                    Task ID: {selectedTask.id || "N/A"}
                  </p>
                </div>

                <div className="flex gap-2">
                  <button className="flex items-center gap-2 rounded-lg bg-[#4b41e1]/10 px-3 py-2 text-xs font-bold text-[#4b41e1] hover:bg-[#4b41e1]/20">
                    <span className="material-symbols-outlined text-[18px]">directions</span>
                    Get Directions
                  </button>
                  <button className="flex h-10 w-10 items-center justify-center rounded-full bg-[#EDF0F5] text-gray-700">
                    <span className="material-symbols-outlined">map</span>
                  </button>
                </div>
              </div>

              <div className="space-y-6">
                {/* Description */}
                <div>
                  <h4 className="mb-2 font-bold text-gray-900">Description</h4>
                  <p className="leading-relaxed text-gray-600">
                    {selectedTask.description || "No description provided."}
                  </p>
                </div>

                {/* Details */}
                <div className="grid grid-cols-2 gap-4">
                  <DetailTile label="Severity" value={selectedTask.severity || "Moderate"} />
                  <DetailTile label="Status" value={selectedTask.status || "Pending"} />
                  <DetailTile label="Affected" value={`${selectedTask.peopleAffected || 0} people`} />
                  <DetailTile label="Location" value={selectedTask.location || "Unknown"} />
                </div>

                {/* Timeline */}
                <div>
                  <h4 className="mb-4 font-bold text-gray-900">Status Timeline</h4>
                  <div className="space-y-4">
                    <TimelineStep
                      label="Reported"
                      done={selectedTask.status !== "Pending"}
                    />
                    <TimelineStep
                      label="In Progress"
                      done={
                        selectedTask.status === "Resolved" ||
                        selectedTask.status === "In Progress" ||
                        selectedTask.status === "Responding"
                      }
                      current={
                        selectedTask.status === "In Progress" ||
                        selectedTask.status === "Responding"
                      }
                    />
                    <TimelineStep
                      label="Completed"
                      done={selectedTask.status === "Resolved"}
                    />
                  </div>
                </div>

                {/* Field Update Form */}
                <div className="rounded-xl bg-[#EDF0F5]/60 p-4">
                  <h4 className="mb-3 font-bold text-gray-900">Submit Field Update</h4>

                  <div className="space-y-3">
                    <textarea
                      value={fieldUpdate}
                      onChange={(e) => setFieldUpdate(e.target.value)}
                      className="w-full resize-none rounded-lg border border-gray-200 bg-white p-3 text-sm focus:ring-2 focus:ring-[#4b41e1]"
                      placeholder="Add status notes..."
                      rows="2"
                    />

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-[10px] font-bold uppercase text-gray-500">
                          People Assisted
                        </label>
                        <input
                          value={peopleAssisted}
                          onChange={(e) => setPeopleAssisted(e.target.value)}
                          className="mt-1 w-full rounded-lg border border-gray-200 bg-white p-2 text-sm"
                          placeholder="0"
                          type="number"
                        />
                      </div>

                      <div>
                        <label className="text-[10px] font-bold uppercase text-gray-500">
                          Resources Used
                        </label>
                        <input
                          value={resourcesUsed}
                          onChange={(e) => setResourcesUsed(e.target.value)}
                          className="mt-1 w-full rounded-lg border border-gray-200 bg-white p-2 text-sm"
                          placeholder="e.g. 2x Water"
                          type="text"
                        />
                      </div>
                    </div>

                    <button
                      onClick={handleFieldUpdate}
                      disabled={submitting}
                      className={`w-full rounded-lg py-2 font-semibold text-white transition ${
                        submitting
                          ? "cursor-not-allowed bg-gray-400"
                          : "bg-[#4b41e1] hover:bg-[#4037c9]"
                      }`}
                    >
                      {submitting ? "Submitting..." : "Update Current Status"}
                    </button>
                  </div>
                </div>

                {/* Status buttons */}
                <div className="flex gap-3">
                  {selectedTask.status !== "In Progress" &&
                    selectedTask.status !== "Responding" &&
                    selectedTask.status !== "Resolved" && (
                      <button
                        onClick={() => handleStatusUpdate("In Progress")}
                        className="flex-1 rounded-xl bg-[#4b41e1] py-3 font-semibold text-white hover:bg-[#4037c9]"
                      >
                        Start Task
                      </button>
                    )}

                  {selectedTask.status !== "Resolved" && (
                    <button
                      onClick={() => handleStatusUpdate("Resolved")}
                      className={`flex-1 rounded-xl py-3 font-semibold text-white hover:opacity-90 ${
                        selectedTask.status === "In Progress" ||
                        selectedTask.status === "Responding"
                          ? "bg-emerald-600"
                          : "bg-gray-300"
                      }`}
                    >
                      Complete Task
                    </button>
                  )}
                </div>

                {/* Update history */}
                <div>
                  <h4 className="mb-3 font-bold text-gray-900">Field Update History</h4>
                  <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
                    <div className="mb-1 flex justify-between">
                      <span className="text-sm font-bold text-[#4b41e1]">Reported</span>
                      <span className="text-xs text-gray-500">
                        {selectedTask.timestamp || selectedTask.createdAt
                          ? new Date(selectedTask.timestamp || selectedTask.createdAt).toLocaleString("en-US", {
                              hour: "2-digit",
                              minute: "2-digit",
                            })
                          : "Just now"}
                      </span>
                    </div>

                    <p className="text-xs text-gray-500">
                      {selectedTask.description || "Incident reported"}
                    </p>

                    <div className="mt-2 flex gap-2">
                      <span className="material-symbols-outlined text-[16px] text-gray-500">
                        location_on
                      </span>
                      {selectedTask.location || "Location pending"}
                    </div>
                  </div>
                </div>

                {/* Bottom actions */}
                <div className="flex gap-4 border-t border-gray-200 pt-4">
                  <button className="flex-1 rounded-xl border border-gray-300 py-3 font-semibold text-gray-800 hover:bg-gray-50">
                    View Incident
                  </button>
                  <button className="flex-1 rounded-xl bg-[#4b41e1] py-3 font-semibold text-white hover:bg-[#4037c9]">
                    Update Status
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="sticky top-24 rounded-[20px] bg-white p-12 text-center shadow-sm">
              <span className="material-symbols-outlined text-5xl text-gray-300">info</span>
              <p className="mt-4 text-gray-500">Select a task to view details</p>
            </div>
          )}
        </div>
      </div>
    </VolunteerLayout>
  );
}

/* ---------- Small helpers ---------- */

const SummaryTile = ({ label, value, icon, iconColor = "text-gray-400", highlight = false }) => (
  <div
    className={`rounded-[20px] p-6 shadow-sm ${
      highlight ? "border border-red-100 bg-red-50" : "bg-white"
    }`}
  >
    <div className="mb-3 flex items-start justify-between">
      <span
        className={`text-sm font-bold uppercase ${
          highlight ? "text-red-600" : "text-gray-500"
        }`}
      >
        {label}
      </span>
      <span className={`material-symbols-outlined ${highlight ? "text-red-600" : iconColor}`}>
        {icon}
      </span>
    </div>
    <div className={`text-4xl font-bold ${highlight ? "text-red-600" : "text-gray-900"}`}>
      {value}
    </div>
  </div>
);

const DetailTile = ({ label, value }) => (
  <div className="rounded-xl bg-[#EDF0F5]/50 p-3">
    <p className="text-[10px] font-bold uppercase text-gray-500">{label}</p>
    <p className="font-semibold">{value}</p>
  </div>
);

const TimelineStep = ({ label, done, current = false }) => (
  <div className="flex items-center gap-4">
    <div
      className={`flex h-6 w-6 items-center justify-center rounded-full ${
        done
          ? "bg-emerald-500 text-white"
          : current
          ? "border-2 border-[#4b41e1] bg-white"
          : "border-2 border-gray-300 bg-white"
      }`}
    >
      {done ? (
        <span className="material-symbols-outlined text-[14px]">check</span>
      ) : (
        <div
          className={`h-2 w-2 rounded-full ${
            current ? "bg-[#4b41e1]" : "bg-gray-300"
          }`}
        />
      )}
    </div>
    <div>
      <p
        className={`text-sm font-semibold ${
          done || current ? "" : "text-gray-400"
        }`}
      >
        {label}
      </p>
      {current && <p className="text-xs text-[#4b41e1]">Current Status</p>}
    </div>
  </div>
);

export default MyTasks;