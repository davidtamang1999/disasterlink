import { useState, useEffect, useMemo, useRef } from "react";
import AdminLayout from "../../layouts/AdminLayout";
import { useAuth } from "../../context/AuthContext";
import { useDisaster } from "../../context/DisasterContext";
import { useAudit } from "../../context/AuditContext";

function AuditLogs() {
  const { currentUser } = useAuth();
  const { incidents } = useDisaster();
  const {
    logs,
    loading,
    bulkAddLogs,
    getStats,
    getModuleActivity,
    getUniqueModules,
    getUniqueActions,
    getUniqueStatuses,
    getUniqueUsers,
  } = useAudit();

  const [searchTerm, setSearchTerm] = useState("");
  const [eventTypeFilter, setEventTypeFilter] = useState("all");
  const [actionFilter, setActionFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [userFilter, setUserFilter] = useState("all");
  const [selectedLog, setSelectedLog] = useState(null);
  const [showDetails, setShowDetails] = useState(false);
  const [securityEvents, setSecurityEvents] = useState([]);

  const seededRef = useRef(false);

  // ---------- Seed sample logs on first visit if none exist ----------
  useEffect(() => {
    if (seededRef.current) return;
    if (logs.length > 0) return;

    seededRef.current = true;

    const defaultLogs = [
      {
        id: "log-seed-001",
        timestamp: new Date().toISOString(),
        user: currentUser?.fullName || "Aashish Shrestha",
        userInitials: getUserInitials(currentUser?.fullName || "Aashish Shrestha"),
        role: "Administrator",
        action: "Updated",
        module: "Incident Management",
        recordId: "INC-0248",
        status: "Success",
        details: "Changed severity from High to Critical",
        isSystem: false,
      },
      {
        id: "log-seed-002",
        timestamp: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
        user: "System Admin",
        userInitials: null,
        role: "Administrator",
        action: "Approved",
        module: "Resource Management",
        recordId: "REQ-0082",
        status: "Success",
        details: "Resource request approved",
        isSystem: true,
      },
      {
        id: "log-seed-003",
        timestamp: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
        user: "Aarav Sharma",
        userInitials: "AS",
        role: "Volunteer",
        action: "Submitted",
        module: "Incident Management",
        recordId: "INC-0247",
        status: "Success",
        details: "Submitted new incident report",
        isSystem: false,
      },
    ];

    bulkAddLogs(defaultLogs);
  }, [logs.length, currentUser, bulkAddLogs]);

  // ---------- Sync security events from logs ----------
  useEffect(() => {
    const events = logs
      .filter((log) => log.status === "Failed" || log.action === "Failed")
      .slice(0, 5)
      .map((log) => ({
        id: log.id,
        title: `${log.action} ${log.module}`,
        user: log.user,
        time: log.time,
        details: log.details || `${log.action} action failed`,
        ip: `192.168.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`,
        severity: Math.random() > 0.5 ? "high" : "medium",
      }));

    if (events.length === 0) {
      events.push({
        id: "sec-001",
        title: "Failed administrator login",
        user: "admin@example.com",
        time: new Date(Date.now() - 1000 * 60 * 20).toLocaleTimeString("en-US", {
          hour: "2-digit",
          minute: "2-digit",
        }),
        details: "Incorrect password attempt",
        ip: "45.12.88.1",
        severity: "high",
      });
      events.push({
        id: "sec-002",
        title: "Multiple failed attempts",
        user: "Unknown user",
        time: new Date(Date.now() - 1000 * 60 * 50).toLocaleTimeString("en-US", {
          hour: "2-digit",
          minute: "2-digit",
        }),
        details: "5 attempts detected",
        ip: "192.168.1.105",
        severity: "medium",
      });
    }

    setSecurityEvents(events);
  }, [logs]);

  // ---------- Derived stats (from context) ----------
  const stats = useMemo(() => getStats(), [logs, getStats]);
  const moduleActivity = useMemo(() => getModuleActivity(), [logs, getModuleActivity]);
  const uniqueModules = useMemo(() => getUniqueModules(), [logs, getUniqueModules]);
  const uniqueActions = useMemo(() => getUniqueActions(), [logs, getUniqueActions]);
  const uniqueStatuses = useMemo(() => getUniqueStatuses(), [logs, getUniqueStatuses]);
  const uniqueUsers = useMemo(() => getUniqueUsers(), [logs, getUniqueUsers]);

  // ---------- Filtering ----------
  const filteredLogs = useMemo(() => {
    let filtered = logs;

    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (log) =>
          log.user?.toLowerCase().includes(q) ||
          log.action?.toLowerCase().includes(q) ||
          log.recordId?.toLowerCase().includes(q) ||
          log.module?.toLowerCase().includes(q) ||
          log.details?.toLowerCase().includes(q)
      );
    }
    if (eventTypeFilter !== "all") filtered = filtered.filter((log) => log.module === eventTypeFilter);
    if (actionFilter !== "all") filtered = filtered.filter((log) => log.action === actionFilter);
    if (statusFilter !== "all") filtered = filtered.filter((log) => log.status === statusFilter);
    if (userFilter !== "all") filtered = filtered.filter((log) => log.user === userFilter);

    return filtered;
  }, [logs, searchTerm, eventTypeFilter, actionFilter, statusFilter, userFilter]);

  const clearFilters = () => {
    setSearchTerm("");
    setEventTypeFilter("all");
    setActionFilter("all");
    setStatusFilter("all");
    setUserFilter("all");
  };

  const handleViewDetails = (log) => {
    setSelectedLog(log);
    setShowDetails(true);
  };

  // Header extras
  const headerExtras = (
    <div className="flex items-center gap-3">
      <button
        className="flex items-center justify-center rounded-lg border border-[#c6c6cf] bg-[#e4e1e5] p-2.5 text-[#45464e] shadow-sm transition hover:bg-[#dcd9dd]"
        title="Refresh logs"
      >
        <span className="material-symbols-outlined">refresh</span>
      </button>

      <button className="flex items-center gap-2 rounded-lg bg-[#4648d4] px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#6063ee]">
        <span className="material-symbols-outlined text-[18px]">download</span>
        Export Logs
      </button>
    </div>
  );

  return (
    <AdminLayout title="Audit Logs" headerRight={headerExtras}>
      <div className="mx-auto flex max-w-[1440px] flex-col gap-8">

        {/* Page Header */}
        <section>
          <h1 className="font-['Space_Grotesk'] text-3xl font-bold text-[#1b1b1e] md:text-4xl">
            Audit Logs
          </h1>
          <p className="mt-2 max-w-2xl text-[#45464e]">
            Monitor system activity, administrative actions, security events, and operational changes.
          </p>
          <p className="mt-3 flex items-center gap-1 text-xs font-semibold text-[#76767f]">
            <span className="material-symbols-outlined text-[14px]">schedule</span>
            Last updated: {new Date().toLocaleTimeString()}
          </p>
        </section>

        {/* Security Banner */}
        <section className="flex items-center justify-between rounded-xl border border-[#c6c6cf] bg-white p-4 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#22c55e]/10">
              <span className="material-symbols-outlined text-[20px] text-[#22c55e]">
                verified_user
              </span>
            </div>
            <div>
              <h3 className="flex flex-wrap items-center gap-2 text-sm font-semibold">
                System Activity Monitoring Active
                <span className="rounded-full bg-[#22c55e]/10 px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-[#22c55e]">
                  Live
                </span>
              </h3>
              <p className="mt-1 text-sm text-[#45464e]">
                All administrative and security-sensitive actions are currently being recorded.
              </p>
            </div>
          </div>
          <span className="hidden text-xs font-semibold text-[#76767f] md:block">
            Encryption: AES-256
          </span>
        </section>

        {/* Summary Cards */}
        <section className="grid grid-cols-2 gap-4 md:grid-cols-5">
          <SummaryCard label="Total Events" value={stats.total.toLocaleString()} />
          <SummaryCard label="Today" value={stats.today} />
          <SummaryCard label="Admin Actions" value={stats.adminActions} />
          <SummaryCard
            label="Security Events"
            value={stats.securityEvents}
            borderClass="border-[#f97316]/20 bg-[#f97316]/10"
            labelClass="text-[#f97316]"
          />
          <SummaryCard
            label="Failed Actions"
            value={stats.failedActions}
            borderClass="border-[#ba1a1a]/20 bg-[#ffdad6]/50"
            labelClass="text-[#ba1a1a]"
          />
        </section>

        {/* Main Grid */}
        <section className="grid grid-cols-1 gap-6 lg:grid-cols-12">
          <div className="flex flex-col gap-6 lg:col-span-8">

            {/* Table */}
            <div className="overflow-hidden rounded-[20px] border border-gray-200 bg-white shadow-sm">
              {/* Filters */}
              <div className="border-b border-gray-200 bg-white p-4">
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[#45464e]">
                    search
                  </span>
                  <input
                    type="text"
                    placeholder="Search by user, action, record ID..."
                    className="w-full rounded-lg border border-[#c6c6cf] bg-[#f6f2f7] py-3 pl-10 pr-4 text-sm outline-none transition focus:border-[#4648d4] focus:ring-1 focus:ring-[#4648d4]"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>

                <div className="mt-4 flex flex-wrap items-center gap-2">
                  <FilterSelect value={eventTypeFilter} onChange={setEventTypeFilter} defaultLabel="Event Type" options={uniqueModules} />
                  <FilterSelect value={actionFilter} onChange={setActionFilter} defaultLabel="Action" options={uniqueActions} />
                  <FilterSelect value={statusFilter} onChange={setStatusFilter} defaultLabel="Status" options={uniqueStatuses} />
                  <FilterSelect value={userFilter} onChange={setUserFilter} defaultLabel="User" options={uniqueUsers} />

                  {(searchTerm || eventTypeFilter !== "all" || actionFilter !== "all" || statusFilter !== "all" || userFilter !== "all") && (
                    <button
                      onClick={clearFilters}
                      className="ml-auto text-xs font-semibold text-[#4648d4] hover:underline"
                    >
                      Clear Filters
                    </button>
                  )}
                </div>
              </div>

              {/* Table body */}
              <div className="overflow-x-auto">
                <table className="w-full whitespace-nowrap text-left">
                  <thead className="border-b border-gray-200 bg-[#fbf8fc] text-xs font-semibold text-[#45464e]">
                    <tr>
                      <th className="px-4 py-3">Timestamp</th>
                      <th className="px-4 py-3">User</th>
                      <th className="px-4 py-3">Action</th>
                      <th className="px-4 py-3">Module & Record ID</th>
                      <th className="px-4 py-3">Status</th>
                      <th className="px-4 py-3 text-right">Details</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 text-sm">
                    {filteredLogs.length > 0 ? (
                      filteredLogs.map((log) => (
                        <tr
                          key={log.id}
                          className={`group cursor-pointer transition hover:bg-[#fbf8fc] ${
                            log.status === "Failed" ? "bg-[#ffdad6]/10" : ""
                          } ${log.isSystem ? "bg-[#f6f2f7]/30" : ""}`}
                          onClick={() => handleViewDetails(log)}
                        >
                          <td className="px-4 py-4 text-[#45464e]">{log.time}</td>

                          <td className="px-4 py-4">
                            <div className="flex items-center gap-3">
                              <div
                                className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold shadow-sm ${
                                  log.isSystem
                                    ? "bg-[#0e1a39] text-white"
                                    : log.role === "Administrator" || log.role === "admin"
                                    ? "bg-[#6063ee] text-white"
                                    : log.role === "Volunteer"
                                    ? "bg-[#e4e1e5] text-[#45464e]"
                                    : "bg-[#4648d4]/20 text-[#4648d4]"
                                }`}
                              >
                                {log.isSystem ? (
                                  <span className="material-symbols-outlined text-[16px]">smart_toy</span>
                                ) : (
                                  log.userInitials || "U"
                                )}
                              </div>
                              <div>
                                <p className="text-sm font-semibold">{log.user}</p>
                                <p className="text-xs text-[#45464e]">{log.role}</p>
                              </div>
                            </div>
                          </td>

                          <td className="px-4 py-4">
                            <span
                              className={`inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs font-bold ${getActionStyle(
                                log.action,
                                log.status
                              )}`}
                            >
                              <span className="material-symbols-outlined text-[14px]">
                                {log.actionIcon || "edit"}
                              </span>
                              {log.action}
                            </span>
                          </td>

                          <td className="px-4 py-4">
                            <p className="font-medium">{log.module}</p>
                            <p className="mt-1 text-xs text-[#45464e]">{log.recordId}</p>
                          </td>

                          <td className="px-4 py-4">
                            <span className={`inline-flex items-center gap-2 text-xs font-bold ${getStatusColor(log.status)}`}>
                              <span className={`h-2 w-2 rounded-full ${getStatusDotColor(log.status)}`} />
                              {log.status}
                            </span>
                          </td>

                          <td className="px-4 py-4 text-right">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleViewDetails(log);
                              }}
                              className="text-[#45464e] transition group-hover:text-[#4648d4]"
                            >
                              <span className="material-symbols-outlined">visibility</span>
                            </button>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="6" className="px-4 py-8 text-center text-[#45464e]">
                          <span className="material-symbols-outlined mb-2 block text-4xl text-gray-300">search_off</span>
                          No audit logs found matching your filters
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Change Details */}
            {showDetails && selectedLog && (
              <div className="relative overflow-hidden rounded-[20px] border border-[#4648d4]/20 bg-white p-6 shadow-sm">
                <div className="absolute bottom-0 left-0 top-0 w-1 bg-[#4648d4]" />

                <div className="mb-6 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#4648d4]/10 text-[#4648d4]">
                      <span className="material-symbols-outlined">history_toggle_off</span>
                    </div>
                    <div>
                      <h3 className="font-['Space_Grotesk'] text-xl font-bold">Change Details</h3>
                      <p className="mt-1 text-xs text-[#45464e]">
                        Record ID: <span className="font-bold text-[#4648d4]">{selectedLog.recordId}</span> • {selectedLog.time}
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => setShowDetails(false)}
                    className="flex h-8 w-8 items-center justify-center rounded-full transition hover:bg-gray-100"
                  >
                    <span className="material-symbols-outlined text-[#45464e]">close</span>
                  </button>
                </div>

                <div className="mb-6 rounded-lg border-l-4 border-[#4648d4]/30 bg-[#f6f2f7] p-4">
                  <p className="text-sm italic text-[#1b1b1e]">
                    "{selectedLog.details || `${selectedLog.action} action performed`}"
                  </p>
                  <p className="mt-3 text-xs text-[#45464e]">
                    Modified by: <span className="font-semibold text-[#1b1b1e]">{selectedLog.user} ({selectedLog.role})</span>
                  </p>
                </div>

                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                  <div>
                    <p className="mb-4 text-xs font-bold uppercase tracking-widest text-[#45464e]">Previous State</p>
                    <div className="space-y-3 rounded-lg border border-[#c6c6cf] bg-[#fbf8fc] p-4">
                      <Row label="Status" value={selectedLog.status === "Success" ? "Pending" : "Active"} />
                      {selectedLog.severity && <Row label="Severity" value={selectedLog.severity} />}
                      {selectedLog.location && <Row label="Location" value={selectedLog.location} />}
                    </div>
                  </div>

                  <div>
                    <p className="mb-4 text-xs font-bold uppercase tracking-widest text-[#4648d4]">New State</p>
                    <div className="space-y-3 rounded-lg border border-[#4648d4]/30 bg-[#4648d4]/5 p-4">
                      <div className="flex justify-between">
                        <span className="text-xs font-semibold text-[#45464e]">Status</span>
                        <span className={`text-sm font-bold ${getStatusColor(selectedLog.status)}`}>{selectedLog.status}</span>
                      </div>
                      {selectedLog.severity && (
                        <div className="flex justify-between">
                          <span className="text-xs font-semibold text-[#45464e]">Severity</span>
                          <span className={`text-sm font-bold ${selectedLog.severity === "Critical" ? "text-[#ba1a1a]" : ""}`}>
                            {selectedLog.severity}
                          </span>
                        </div>
                      )}
                      <Row label="Updated By" value={selectedLog.user} bold />
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Right Column */}
          <div className="flex flex-col gap-6 lg:col-span-4">
            {/* Security Events */}
            <div className="rounded-[20px] border border-gray-200 bg-white p-6 shadow-sm">
              <h3 className="mb-5 flex items-center gap-2 font-['Space_Grotesk'] text-xl font-bold">
                <span className="material-symbols-outlined text-[#f97316]">security</span>
                Security Events
              </h3>

              <div className="space-y-4">
                {securityEvents.length > 0 ? (
                  securityEvents.map((event) => (
                    <div
                      key={event.id}
                      className={`flex items-start gap-4 rounded-xl border p-4 ${
                        event.severity === "high"
                          ? "border-[#ba1a1a]/20 bg-[#ffdad6]/20"
                          : "border-[#f97316]/20 bg-[#f6f2f7]"
                      }`}
                    >
                      <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${event.severity === "high" ? "bg-[#ffdad6]" : "bg-[#f97316]/10"}`}>
                        <span className={`material-symbols-outlined text-[20px] ${event.severity === "high" ? "text-[#ba1a1a]" : "text-[#f97316]"}`}>
                          {event.severity === "high" ? "gpp_maybe" : "lock_reset"}
                        </span>
                      </div>
                      <div>
                        <p className="text-sm font-semibold">{event.title}</p>
                        <p className="mt-1 text-sm text-[#45464e]">{event.user}</p>
                        <p className="mt-2 text-xs text-[#76767f]">{event.time} • IP: {event.ip}</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="py-6 text-center text-[#45464e]">
                    <span className="material-symbols-outlined mb-2 block text-4xl text-gray-300">security</span>
                    <p>No security events</p>
                  </div>
                )}
              </div>
            </div>

            {/* Module Activity */}
            <div className="rounded-[20px] border border-gray-200 bg-white p-6 shadow-sm">
              <h3 className="mb-5 font-['Space_Grotesk'] text-xl font-bold">Activity by Module</h3>
              <div className="space-y-5">
                {moduleActivity.length > 0 ? (
                  moduleActivity.map((module) => (
                    <div key={module.name}>
                      <div className="mb-2 flex justify-between text-xs font-bold">
                        <span>{module.name}</span>
                        <span>{module.percentage}</span>
                      </div>
                      <div className="h-2 w-full overflow-hidden rounded-full bg-[#e4e1e5]">
                        <div className={`h-full rounded-full bg-[#4648d4] ${module.opacity}`} style={{ width: module.percentage }} />
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="py-4 text-center text-[#45464e]">No module activity data</div>
                )}
              </div>
            </div>

            {/* Retention Info */}
            <div className="flex items-center justify-between rounded-[20px] border border-[#c6c6cf] bg-[#f6f2f7] p-6">
              <div>
                <p className="text-sm font-semibold">Log Retention</p>
                <p className="mt-1 text-sm text-[#45464e]">Current retention: 365 days</p>
              </div>
              <span className="inline-flex items-center gap-2 rounded-md bg-[#22c55e]/10 px-2 py-1 text-xs font-bold text-[#22c55e]">
                <span className="h-2 w-2 rounded-full bg-[#22c55e]" />
                Healthy
              </span>
            </div>
          </div>
        </section>
      </div>
    </AdminLayout>
  );
}

/* ---------- Helpers ---------- */

const getUserInitials = (name) => {
  if (!name) return "A";
  const parts = name.split(" ");
  if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
  return name.substring(0, 2).toUpperCase();
};

const getStatusColor = (status) => {
  if (status === "Success") return "text-[#22c55e]";
  if (status === "Failed") return "text-[#ba1a1a]";
  return "text-[#FF9800]";
};

const getStatusDotColor = (status) => {
  if (status === "Success") return "bg-[#22c55e]";
  if (status === "Failed") return "bg-[#ba1a1a]";
  return "bg-[#FF9800]";
};

const getActionStyle = (action, status) => {
  if (status === "Failed") return "bg-[#ffdad6] text-[#ba1a1a] border border-[#ff8a80]";
  const styles = {
    Updated: "bg-[#e1e0ff] text-[#4648d4] border border-[#c0c1ff]",
    Approved: "bg-[#dcfce7] text-[#22c55e] border border-[#86efac]",
    Submitted: "bg-[#e4e1e5] text-[#45464e] border border-[#c6c6cf]",
    Created: "bg-[#e1e0ff] text-[#4648d4] border border-[#c0c1ff]",
    Reviewed: "bg-[#e1e0ff] text-[#4648d4] border border-[#c0c1ff]",
    Assigned: "bg-[#fef3c7] text-[#d97706] border border-[#fcd34d]",
    Resolved: "bg-[#dcfce7] text-[#22c55e] border border-[#86efac]",
    Deleted: "bg-[#ffdad6] text-[#ba1a1a] border border-[#ff8a80]",
  };
  return styles[action] || "bg-[#e4e1e5] text-[#45464e] border border-[#c6c6cf]";
};

const SummaryCard = ({ label, value, borderClass = "border-gray-200", labelClass = "text-[#45464e]" }) => (
  <div className={`rounded-xl border ${borderClass} bg-white p-5 shadow-sm`}>
    <p className={`text-xs font-bold uppercase tracking-wide ${labelClass}`}>{label}</p>
    <p className="mt-2 font-['Space_Grotesk'] text-3xl font-bold">{value}</p>
  </div>
);

const FilterSelect = ({ value, onChange, defaultLabel, options }) => (
  <select
    className="rounded-lg border border-[#c6c6cf] bg-[#f6f2f7] px-3 py-2 text-xs font-semibold outline-none focus:border-[#4648d4]"
    value={value}
    onChange={(e) => onChange(e.target.value)}
  >
    <option value="all">{defaultLabel}</option>
    {options.map((opt) => (
      <option key={opt} value={opt}>{opt}</option>
    ))}
  </select>
);

const Row = ({ label, value, bold = false }) => (
  <div className="flex justify-between">
    <span className="text-xs font-semibold text-[#45464e]">{label}</span>
    <span className={`text-sm ${bold ? "font-bold" : ""}`}>{value}</span>
  </div>
);

export default AuditLogs;