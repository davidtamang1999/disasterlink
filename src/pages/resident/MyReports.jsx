import { useState } from "react";
import { useNavigate } from "react-router-dom";
import ResidentLayout from "../../layouts/ResidentLayout";
import { useDisaster } from "../../context/DisasterContext";
import { useToast } from "../../components/shared";

export default function MyReports() {
  const { incidents, deleteIncident, deleteMultipleIncidents } = useDisaster();
  const navigate = useNavigate();
  const toast = useToast();

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [typeFilter, setTypeFilter] = useState("All");
  const [severityFilter, setSeverityFilter] = useState("All");
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [reportToDelete, setReportToDelete] = useState(null);

  const [selectedReports, setSelectedReports] = useState([]);
  const [selectAll, setSelectAll] = useState(false);
  const [showBulkDeleteModal, setShowBulkDeleteModal] = useState(false);

  const reports = incidents;

  // ---------- Filters ----------
  const filteredReports = reports.filter((report) => {
    const matchesSearch =
      (report.title || "").toLowerCase().includes(search.toLowerCase()) ||
      (report.location || "").toLowerCase().includes(search.toLowerCase());

    const matchesStatus = statusFilter === "All" || report.status === statusFilter;
    const matchesType =
      typeFilter === "All" ||
      report.type === typeFilter ||
      report.incidentType === typeFilter;
    const matchesSeverity =
      severityFilter === "All" || report.severity === severityFilter;

    return matchesSearch && matchesStatus && matchesType && matchesSeverity;
  });

  // ---------- Styling helpers ----------
  const getStatusClass = (status) => {
    if (status === "Resolved" || status === "resolved") return "bg-green-100 text-green-600";
    if (status === "Responding" || status === "In Progress" || status === "in progress")
      return "bg-orange-100 text-orange-500";
    if (status === "Pending" || status === "pending") return "bg-yellow-100 text-yellow-600";
    return "bg-blue-100 text-blue-500";
  };

  const getSeverityClass = (severity) => {
    if (severity === "Critical" || severity === "CRITICAL") return "text-red-500";
    if (severity === "High") return "text-orange-500";
    if (severity === "Moderate") return "text-yellow-600";
    return "text-blue-500";
  };

  const getSeverityColor = (severity) => {
    if (severity === "Critical" || severity === "CRITICAL") return "#ef4444";
    if (severity === "High") return "#f97316";
    if (severity === "Moderate") return "#eab308";
    return "#3498db";
  };

  const getStepForStatus = (status) => {
    if (status === "Resolved" || status === "resolved") return 4;
    if (status === "Responding" || status === "In Progress" || status === "in progress") return 3;
    if (status === "Pending" || status === "pending") return 2;
    return 1;
  };

  const getStatusLabel = (status) => {
    if (!status) return "Submitted";
    const map = {
      pending: "Pending",
      Pending: "Pending",
      "in progress": "In Progress",
      "In Progress": "In Progress",
      responding: "Responding",
      Responding: "Responding",
      resolved: "Resolved",
      Resolved: "Resolved",
    };
    return map[status] || status;
  };

  // ---------- Single delete ----------
  const handleDeleteClick = (report) => {
    setReportToDelete(report);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!reportToDelete) return;
    await deleteIncident(reportToDelete.id);
    setSelectedReports((prev) => prev.filter((id) => id !== reportToDelete.id));
    setShowDeleteModal(false);
    setReportToDelete(null);
    toast.success("Report deleted successfully!");
  };

  const cancelDelete = () => {
    setShowDeleteModal(false);
    setReportToDelete(null);
  };

  // ---------- Bulk select ----------
  const handleSelectReport = (reportId) => {
    setSelectedReports((prev) =>
      prev.includes(reportId) ? prev.filter((id) => id !== reportId) : [...prev, reportId]
    );
  };

  const handleSelectAll = () => {
    if (selectAll) {
      setSelectedReports([]);
    } else {
      setSelectedReports(filteredReports.map((r) => r.id));
    }
    setSelectAll(!selectAll);
  };

  const handleBulkDelete = () => {
    if (selectedReports.length === 0) return;
    setShowBulkDeleteModal(true);
  };

  const confirmBulkDelete = async () => {
    const count = selectedReports.length;
    await deleteMultipleIncidents(selectedReports);
    setShowBulkDeleteModal(false);
    setSelectedReports([]);
    setSelectAll(false);
    toast.success(`${count} reports deleted successfully!`);
  };

  const cancelBulkDelete = () => {
    setShowBulkDeleteModal(false);
  };

  // ---------- Unique types ----------
  const getUniqueTypes = () => {
    const types = new Set();
    reports.forEach((r) => {
      if (r.incidentType) types.add(r.incidentType);
      if (r.type) types.add(r.type);
    });
    return Array.from(types);
  };

  // ---------- Header extras ----------
  const headerExtras = (
    <div className="flex items-center gap-2 text-sm">
      <span className="font-medium text-slate-500">CrisisGuard</span>
      <span className="material-symbols-outlined text-lg text-slate-400">chevron_right</span>
      <span className="font-bold text-[#4b41e1]">My Reports</span>
    </div>
  );

  return (
    <ResidentLayout title="My Reports" headerRight={headerExtras}>
      <div className="mx-auto max-w-[1440px]">

        {/* ================= PAGE HEADER ================= */}
        <div className="mb-8 flex flex-col justify-between gap-5 md:flex-row md:items-center">
          <div>
            <h1 className="mb-2 text-3xl font-bold text-[#000000]">My Reports</h1>
            <p className="text-slate-500">
              Track the disaster reports you've submitted and follow their response progress.
            </p>
          </div>

          <div className="flex gap-3">
            {selectedReports.length > 0 && (
              <button
                onClick={handleBulkDelete}
                className="flex items-center gap-2 rounded-xl bg-red-600 px-6 py-3 font-semibold text-white transition hover:bg-red-700"
              >
                <span className="material-symbols-outlined">delete_sweep</span>
                Delete Selected ({selectedReports.length})
              </button>
            )}

            <button
              onClick={() => navigate("/report-disaster")}
              className="flex items-center gap-2 rounded-xl bg-[#4b41e1] px-6 py-3 font-semibold text-white hover:opacity-90"
            >
              <span className="material-symbols-outlined">add</span>
              Report a Disaster
            </button>
          </div>
        </div>

        {/* ================= STATS ================= */}
        <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
          <StatTile
            icon="assignment"
            iconColor="text-slate-600"
            iconBg="bg-slate-100"
            value={reports.length}
            label="Total Reports"
            sub="All submitted reports"
          />
          <StatTile
            icon="pending_actions"
            iconColor="text-blue-500"
            iconBg="bg-blue-100"
            value={
              reports.filter(
                (r) =>
                  r.status === "Under Review" ||
                  r.status === "Pending" ||
                  r.status === "pending"
              ).length
            }
            label="Pending Review"
            sub="Awaiting verification"
            border="border-b-4 border-[#3498db]"
          />
          <StatTile
            icon="local_shipping"
            iconColor="text-orange-500"
            iconBg="bg-orange-100"
            value={
              reports.filter(
                (r) =>
                  r.status === "Responding" ||
                  r.status === "In Progress" ||
                  r.status === "in progress"
              ).length
            }
            label="In Progress"
            sub="Response in progress"
            border="border-b-4 border-[#f39c12]"
          />
          <StatTile
            icon="check_circle"
            iconColor="text-green-500"
            iconBg="bg-green-100"
            value={
              reports.filter((r) => r.status === "Resolved" || r.status === "resolved").length
            }
            label="Resolved"
            sub="Successfully resolved"
            border="border-b-4 border-[#2dcc70]"
          />
        </div>

        {/* ================= FILTERS ================= */}
        <div className="mb-8 flex flex-col gap-4 rounded-[20px] bg-white p-5 shadow-sm lg:flex-row">
          <div className="relative flex-1">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
              search
            </span>
            <input
              type="text"
              placeholder="Search reports..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-lg bg-[#EDF0F5] py-3 pl-10 pr-4 outline-none focus:ring-2 focus:ring-[#4b41e1]"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="rounded-lg bg-[#EDF0F5] px-4 py-3 outline-none"
          >
            <option value="All">Status: All</option>
            <option value="Pending">Pending</option>
            <option value="Under Review">Under Review</option>
            <option value="In Progress">In Progress</option>
            <option value="Responding">Responding</option>
            <option value="Resolved">Resolved</option>
          </select>

          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="rounded-lg bg-[#EDF0F5] px-4 py-3 outline-none"
          >
            <option value="All">Type: All Types</option>
            {getUniqueTypes().map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>

          <select
            value={severityFilter}
            onChange={(e) => setSeverityFilter(e.target.value)}
            className="rounded-lg bg-[#EDF0F5] px-4 py-3 outline-none"
          >
            <option value="All">Severity: All</option>
            <option value="Critical">Critical</option>
            <option value="High">High</option>
            <option value="Moderate">Moderate</option>
            <option value="Low">Low</option>
          </select>
        </div>

        {/* ================= REPORTS LIST ================= */}
        <div>
          <div className="mb-5 flex items-center justify-between">
            <h2 className="text-xl font-bold">
              Recent Reports
              {selectedReports.length > 0 && (
                <span className="ml-3 text-sm font-normal text-slate-500">
                  ({selectedReports.length} selected)
                </span>
              )}
            </h2>

            {filteredReports.length > 0 && (
              <label className="flex cursor-pointer items-center gap-2 text-sm text-slate-600">
                <input
                  type="checkbox"
                  checked={selectAll}
                  onChange={handleSelectAll}
                  className="h-4 w-4 rounded accent-[#4b41e1]"
                />
                Select All
              </label>
            )}
          </div>

          <div className="flex flex-col gap-5">
            {filteredReports.length > 0 ? (
              filteredReports.map((report) => {
                const isSelected = selectedReports.includes(report.id);
                const step = getStepForStatus(report.status);
                const statusLabel = getStatusLabel(report.status);
                const severityColor = getSeverityColor(report.severity);
                const reportType = report.incidentType || report.type || "Unknown";

                return (
                  <div
                    key={report.id}
                    className={`flex flex-col items-start justify-between gap-6 rounded-[20px] bg-white p-6 shadow-sm transition md:flex-row md:items-center ${
                      isSelected ? "bg-indigo-50/30 ring-2 ring-[#4b41e1]" : ""
                    }`}
                    style={{
                      borderLeft: `4px solid ${isSelected ? "#4b41e1" : severityColor}`,
                    }}
                  >
                    <div className="flex w-full flex-1 items-start gap-4">
                      <div className="pt-1">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => handleSelectReport(report.id)}
                          className="h-5 w-5 cursor-pointer rounded accent-[#4b41e1]"
                        />
                      </div>

                      <div className="w-full flex-1">
                        <div className="mb-3 flex items-center gap-3">
                          <span
                            className={`flex items-center gap-2 rounded-full px-3 py-1 text-xs font-bold uppercase ${getStatusClass(
                              report.status
                            )}`}
                          >
                            <span
                              className="h-2 w-2 rounded-full"
                              style={{ backgroundColor: severityColor }}
                            />
                            {statusLabel}
                          </span>

                          <span className="text-sm text-slate-400">
                            {report.timestamp
                              ? new Date(report.timestamp).toLocaleString()
                              : "N/A"}
                          </span>
                        </div>

                        <h3 className="mb-4 text-xl font-bold">
                          {report.title || "Untitled Report"}
                        </h3>

                        <div className="mb-5 flex items-center gap-2">
                          {[1, 2, 3, 4].map((s) => (
                            <div
                              key={s}
                              className={`h-1 flex-1 rounded-full ${
                                s <= step ? "bg-[#4b41e1]" : "bg-slate-200"
                              }`}
                            />
                          ))}
                          <span className="ml-2 text-[10px] font-bold uppercase text-[#4b41e1]">
                            Step {step}/4
                          </span>
                        </div>

                        <div className="flex flex-wrap items-center gap-x-6 gap-y-3 text-sm text-slate-500">
                          <div className="flex items-center gap-2">
                            <span className="material-symbols-outlined text-[18px]">
                              water_drop
                            </span>
                            {reportType}
                          </div>

                          <div className="flex items-center gap-2">
                            <span className="material-symbols-outlined text-[18px]">
                              location_on
                            </span>
                            {report.location || "Unknown location"}
                          </div>

                          <div className="flex items-center gap-2">
                            <span className="material-symbols-outlined text-[18px]">
                              group
                            </span>
                            {report.peopleAffected
                              ? `${report.peopleAffected} affected`
                              : "0 affected"}
                          </div>

                          <div
                            className={`flex items-center gap-2 text-xs font-bold uppercase ${getSeverityClass(
                              report.severity
                            )}`}
                          >
                            <span
                              className="h-2 w-2 rounded-full"
                              style={{ backgroundColor: severityColor }}
                            />
                            {report.severity || "Unknown"}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col gap-2 sm:flex-row">
                      <button
                        onClick={() =>
                          toast.info(`Viewing details for: ${report.title}`)
                        }
                        className="flex items-center gap-2 whitespace-nowrap rounded-xl border border-slate-300 px-5 py-3 font-semibold text-[#0e1a39] hover:bg-slate-100"
                      >
                        View Details
                        <span className="material-symbols-outlined text-[18px]">
                          arrow_forward
                        </span>
                      </button>

                      <button
                        onClick={() => handleDeleteClick(report)}
                        className="flex items-center gap-2 whitespace-nowrap rounded-xl border border-red-300 px-5 py-3 font-semibold text-red-600 hover:bg-red-50"
                      >
                        <span className="material-symbols-outlined text-[18px]">delete</span>
                        Delete
                      </button>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="rounded-[20px] bg-white p-10 text-center shadow-sm">
                <span className="material-symbols-outlined text-5xl text-slate-300">
                  search_off
                </span>
                <p className="mt-4 text-slate-500">
                  No reports found. Submit your first report!
                </p>
                <button
                  onClick={() => navigate("/report-disaster")}
                  className="mt-4 inline-flex items-center gap-2 rounded-xl bg-[#4b41e1] px-6 py-3 font-semibold text-white hover:opacity-90"
                >
                  <span className="material-symbols-outlined">add</span>
                  Report a Disaster
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ================= SINGLE DELETE MODAL ================= */}
      {showDeleteModal && reportToDelete && (
        <ConfirmModal
          icon="warning"
          title="Delete Report"
          subtitle="This action cannot be undone"
          onClose={cancelDelete}
          onConfirm={confirmDelete}
          confirmLabel="Delete Report"
          confirmIcon="delete"
        >
          Are you sure you want to delete "
          <span className="font-semibold">{reportToDelete.title}</span>"? This will
          permanently remove this report from the system.
        </ConfirmModal>
      )}

      {/* ================= BULK DELETE MODAL ================= */}
      {showBulkDeleteModal && (
        <ConfirmModal
          icon="delete_sweep"
          title="Bulk Delete"
          subtitle="This action cannot be undone"
          onClose={cancelBulkDelete}
          onConfirm={confirmBulkDelete}
          confirmLabel={`Delete All (${selectedReports.length})`}
          confirmIcon="delete_sweep"
        >
          Are you sure you want to delete{" "}
          <span className="font-semibold text-red-600">{selectedReports.length}</span>{" "}
          selected reports? This will permanently remove all of them from the system.

          <div className="mt-4 max-h-32 overflow-y-auto rounded-xl bg-slate-50 p-3">
            {reports
              .filter((r) => selectedReports.includes(r.id))
              .slice(0, 5)
              .map((r) => (
                <div
                  key={r.id}
                  className="border-b border-slate-200 py-1 text-sm text-slate-600 last:border-0"
                >
                  • {r.title || "Untitled Report"}
                </div>
              ))}
            {selectedReports.length > 5 && (
              <div className="pt-1 text-sm text-slate-400">
                + {selectedReports.length - 5} more...
              </div>
            )}
          </div>
        </ConfirmModal>
      )}
    </ResidentLayout>
  );
}

/* ---------- Small helpers ---------- */

const StatTile = ({ icon, iconColor, iconBg, value, label, sub, border = "" }) => (
  <div className={`rounded-[20px] bg-white p-6 shadow-sm ${border}`}>
    <div className={`mb-5 flex h-11 w-11 items-center justify-center rounded-full ${iconBg}`}>
      <span className={`material-symbols-outlined ${iconColor}`}>{icon}</span>
    </div>
    <h2 className="text-4xl font-bold">{value}</h2>
    <p className="mt-2 text-sm font-bold uppercase text-slate-500">{label}</p>
    <p className="mt-2 text-sm text-slate-400">{sub}</p>
  </div>
);

const ConfirmModal = ({
  icon,
  title,
  subtitle,
  onClose,
  onConfirm,
  confirmLabel,
  confirmIcon,
  children,
}) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
    <div className="mx-4 w-full max-w-md rounded-2xl bg-white p-8 shadow-2xl">
      <div className="mb-4 flex items-center gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
          <span className="material-symbols-outlined text-3xl text-red-600">{icon}</span>
        </div>
        <div>
          <h3 className="text-xl font-bold text-[#1b1b1e]">{title}</h3>
          <p className="text-sm text-slate-500">{subtitle}</p>
        </div>
      </div>

      <div className="mb-6 text-slate-600">{children}</div>

      <div className="flex gap-3">
        <button
          onClick={onClose}
          className="flex-1 rounded-xl border border-slate-300 px-4 py-3 font-semibold transition hover:bg-slate-50"
        >
          Cancel
        </button>
        <button
          onClick={onConfirm}
          className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-red-600 px-4 py-3 font-semibold text-white transition hover:bg-red-700"
        >
          <span className="material-symbols-outlined text-[18px]">{confirmIcon}</span>
          {confirmLabel}
        </button>
      </div>
    </div>
  </div>
);