import { useState } from "react";
import { useNavigate } from "react-router-dom";
import ResidentLayout from "../../layouts/ResidentLayout";
import { useDisaster } from "../../context/DisasterContext";
import { useAuth } from "../../context/AuthContext";
import { useAlerts } from "../../context/AlertContext";

const AlertsNotifications = () => {
  const navigate = useNavigate();
  const { incidents } = useDisaster();
  const { user: currentUser } = useAuth();
  const { alerts } = useAlerts();

  const [filter, setFilter] = useState("All");

  // ---------- Derived ----------
  const criticalIncidents = incidents.filter(
    (i) => i.severity === "Critical" || i.severity === "CRITICAL"
  ).length;

  const highSeverityIncidents = incidents.filter(
    (i) =>
      i.severity === "High" || i.severity === "Critical" || i.severity === "CRITICAL"
  ).length;

  const activeAlerts = alerts.filter((a) => a.status === "Active").length;

  const latestCriticalAlert = alerts.find(
    (a) => a.severity === "Critical" && a.status === "Active"
  );

  // Generate alerts from incidents if no context alerts exist
  const incidentAlerts =
    incidents.length > 0 && alerts.length === 0
      ? incidents.slice(0, 5).map((inc) => ({
          id: inc.id,
          title: inc.title || "Incident Reported",
          description:
            inc.description ||
            `${inc.incidentType || "Incident"} reported in your area.`,
          location: inc.location || "Unknown location",
          time: inc.timestamp
            ? new Date(inc.timestamp).toLocaleString()
            : "Just now",
          severity: inc.severity || "Moderate",
          status: "Active",
          type: "incident",
        }))
      : [];

  const allAlerts = [
    ...alerts.map((a) => ({ ...a, type: "alert" })),
    ...incidentAlerts.map((a) => ({ ...a, type: "incident" })),
  ];

  const filteredAlerts =
    filter === "All"
      ? allAlerts
      : allAlerts.filter(
          (a) =>
            a.severity === filter ||
            a.severity?.toLowerCase() === filter.toLowerCase()
        );

  // ---------- Styling helpers ----------
  const getSeverityColor = (severity) => {
    const colors = {
      Critical: "red",
      CRITICAL: "red",
      High: "orange",
      Moderate: "yellow",
      Info: "emerald",
    };
    return colors[severity] || "gray";
  };

  const getSeverityBadge = (severity) => {
    const colors = {
      Critical: "bg-red-100 text-red-600",
      CRITICAL: "bg-red-100 text-red-600",
      High: "bg-orange-100 text-orange-600",
      Moderate: "bg-yellow-100 text-yellow-700",
      Info: "bg-emerald-100 text-emerald-600",
    };
    return colors[severity] || "bg-gray-100 text-gray-600";
  };

  // ---------- Header extras ----------
  const headerExtras = (
    <div className="hidden items-center rounded-full border border-gray-200 bg-white px-4 py-2 shadow-sm md:flex md:w-64">
      <span className="material-symbols-outlined mr-2 text-sm text-gray-400">
        search
      </span>
      <input
        className="w-full border-none bg-white text-sm outline-none placeholder-gray-400"
        placeholder="Search alerts, locations..."
        type="text"
      />
    </div>
  );

  return (
    <ResidentLayout title="Alerts & Notifications" headerRight={headerExtras}>
      <div className="mx-auto flex w-full max-w-[1440px] flex-col gap-6">

        {/* ================= EMERGENCY BANNER ================= */}
        {(latestCriticalAlert || criticalIncidents > 0) && (
          <div className="flex flex-col items-start justify-between gap-4 border-b border-red-200 bg-red-100 px-4 py-3 text-red-900 sm:flex-row sm:items-center md:px-6 md:rounded-xl">
            <div className="flex items-start gap-3">
              <span className="material-symbols-outlined mt-0.5 text-red-600">
                warning
              </span>
              <div>
                <p className="font-bold">
                  ⚠️{" "}
                  {latestCriticalAlert?.title ||
                    `${criticalIncidents} Critical Incident${criticalIncidents > 1 ? "s" : ""}`}
                </p>
                <p className="mt-1 text-sm">
                  {latestCriticalAlert?.message ||
                    latestCriticalAlert?.description ||
                    `${criticalIncidents} critical incident${criticalIncidents > 1 ? "s" : ""} require${criticalIncidents === 1 ? "s" : ""} immediate attention.`}
                </p>
              </div>
            </div>

            <div className="flex w-full items-center gap-2 sm:w-auto">
              <button
                onClick={() => navigate("/resident/map")}
                className="flex-1 rounded-lg bg-red-600 px-4 py-2 text-white hover:bg-red-700 sm:flex-none"
              >
                View Live Map
              </button>
              <button className="flex-1 rounded-lg border border-red-300 px-4 py-2 sm:flex-none">
                Safety Information
              </button>
            </div>
          </div>
        )}

        {/* ================= PAGE HEADER ================= */}
        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
          <div>
            <h2 className="text-3xl font-bold text-black">Alerts & Notifications</h2>
            <p className="mt-2 max-w-2xl text-gray-500">
              Stay informed about emergency situations, flood warnings, safety updates, and community response activities.
            </p>
          </div>

          <button className="flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-black shadow-sm hover:bg-gray-100">
            <span className="material-symbols-outlined text-sm">settings</span>
            Notification Settings
          </button>
        </div>

        {/* ================= SUMMARY CARDS ================= */}
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          <SummaryCard
            title="Critical Alerts"
            value={criticalIncidents + activeAlerts}
            icon="error"
            color="border-red-600"
            iconColor="text-red-600"
          />
          <SummaryCard
            title="Active Warnings"
            value={highSeverityIncidents + activeAlerts}
            icon="warning"
            color="border-orange-500"
            iconColor="text-orange-500"
          />
          <SummaryCard
            title="Safety Updates"
            value={incidents.length}
            icon="info"
            color="border-yellow-500"
            iconColor="text-yellow-500"
          />
          <SummaryCard
            title="Resolved Alerts"
            value={alerts.filter((a) => a.status !== "Active").length}
            icon="check_circle"
            color="border-emerald-500"
            iconColor="text-emerald-500"
          />
        </div>

        {/* ================= FILTERS ================= */}
        <div className="flex flex-col items-center justify-between gap-4 rounded-[20px] bg-white p-4 shadow-sm md:flex-row">
          <div className="flex flex-wrap gap-2">
            {["All", "Critical", "High", "Moderate", "Info"].map((filterOption) => (
              <button
                key={filterOption}
                onClick={() => setFilter(filterOption)}
                className={`rounded-full px-4 py-2 transition-colors ${
                  filter === filterOption
                    ? "bg-indigo-600 text-white"
                    : "border border-gray-300 bg-gray-100 text-gray-800 hover:bg-gray-200"
                }`}
              >
                {filterOption}
              </button>
            ))}
          </div>

          <div className="flex w-full items-center rounded-full border border-gray-200 bg-white px-4 py-2 shadow-sm focus-within:border-[#4648d4] md:w-64">
            <span className="material-symbols-outlined mr-2 text-sm text-gray-400">
              search
            </span>
            <input
              className="w-full border-none bg-white outline-none placeholder-gray-400"
              placeholder="Search alerts..."
              type="text"
            />
          </div>
        </div>

        {/* ================= MAIN AREA ================= */}
        <div className="flex flex-col gap-6 lg:flex-row">
          {/* Alerts Feed */}
          <div className="flex flex-1 flex-col gap-4">
            {filteredAlerts.length > 0 ? (
              filteredAlerts.map((alert, index) => {
                const severityColor = getSeverityColor(alert.severity);
                const severityBadge = getSeverityBadge(alert.severity);

                return (
                  <AlertCard
                    key={alert.id || index}
                    level={alert.severity || "Moderate"}
                    title={alert.title || "Alert"}
                    description={
                      alert.message ||
                      alert.description ||
                      "No description provided."
                    }
                    location={alert.location || "Unknown location"}
                    time={
                      alert.timestamp
                        ? new Date(alert.timestamp).toLocaleString()
                        : alert.time || "Just now"
                    }
                    icon={alert.type === "incident" ? "warning" : "notifications_active"}
                    color={severityColor}
                    badgeColor={severityBadge}
                    status={alert.status || "Active"}
                  />
                );
              })
            ) : (
              <div className="rounded-[20px] border border-gray-200 bg-white p-12 text-center shadow-sm">
                <span className="material-symbols-outlined text-5xl text-gray-300">
                  notifications_off
                </span>
                <h3 className="mt-4 text-xl font-bold text-gray-500">No Alerts</h3>
                <p className="mt-2 text-gray-400">
                  No alerts or incidents to display at this time.
                </p>
              </div>
            )}
          </div>

          {/* Right Sidebar */}
          <div className="flex w-full flex-col gap-6 lg:w-[400px]">
            {/* Alert Insights */}
            {criticalIncidents > 0 && (
              <div className="rounded-[20px] border border-gray-300 bg-white p-6 shadow-sm">
                <div className="mb-4 flex items-center justify-between border-b border-gray-200 pb-4">
                  <h3 className="text-xl font-semibold">Alert Insights</h3>
                  <span className="rounded-md bg-red-100 px-2 py-1 text-xs font-bold uppercase text-red-600">
                    Critical
                  </span>
                </div>

                {incidents
                  .filter(
                    (i) => i.severity === "Critical" || i.severity === "CRITICAL"
                  )
                  .slice(0, 1)
                  .map((inc) => (
                    <div key={inc.id}>
                      <h4 className="mb-2 text-lg font-semibold">
                        {inc.title || "Critical Incident"}
                      </h4>
                      <p className="mb-6 text-sm text-gray-500">
                        {inc.description ||
                          `${inc.location || "Unknown location"} - ${inc.incidentType || "Incident"}`}
                      </p>

                      <div className="mb-6 grid grid-cols-2 gap-4">
                        <div className="rounded-xl bg-gray-100 p-3">
                          <div className="mb-1 text-xs text-gray-500">Affected</div>
                          <div className="text-xl font-bold text-red-600">
                            {inc.peopleAffected || 0}
                          </div>
                          <div className="mt-1 text-[10px] text-red-600">
                            People affected
                          </div>
                        </div>
                        <div className="rounded-xl bg-gray-100 p-3">
                          <div className="mb-1 text-xs text-gray-500">Status</div>
                          <div className="text-xl font-bold">
                            {inc.status || "Pending"}
                          </div>
                          <div className="mt-1 text-[10px] text-gray-500">
                            {inc.status === "Resolved" ? "Resolved" : "Active"}
                          </div>
                        </div>
                      </div>

                      <div className="relative mb-6 flex h-32 items-center justify-center overflow-hidden rounded-xl border bg-gray-100">
                        <span className="material-symbols-outlined text-4xl text-gray-400">
                          map
                        </span>
                        <div className="absolute left-1/2 top-1/2 h-4 w-4 -translate-x-1/2 -translate-y-1/2 animate-ping rounded-full bg-red-600" />
                        <div className="absolute left-1/2 top-1/2 h-2 w-2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-red-600" />
                        <div className="absolute bottom-2 left-2 rounded bg-white/90 px-2 py-1 text-xs font-semibold">
                          {inc.location || "Unknown location"}
                        </div>
                      </div>

                      <button className="w-full rounded-xl bg-indigo-600 py-3 text-white hover:bg-indigo-700">
                        Open Full Report
                      </button>
                    </div>
                  ))}
              </div>
            )}

            {/* Safety Guidance */}
            <div className="rounded-[20px] border border-gray-300 bg-white p-6 shadow-sm">
              <h3 className="mb-4 flex items-center gap-2 text-xl font-semibold">
                <span className="material-symbols-outlined text-indigo-600">
                  health_and_safety
                </span>
                Safety Guidance
              </h3>

              <ul className="space-y-4">
                <SafetyItem
                  icon="directions_run"
                  title="Move to higher ground"
                  description="Immediately relocate to upper floors or designated elevated shelters."
                />
                <SafetyItem
                  icon="no_transfer"
                  title="Avoid flooded roads"
                  description="Do not attempt to walk or drive through floodwaters. Turn around."
                />
                <SafetyItem
                  icon="power_off"
                  title="Disconnect utilities"
                  description="Turn off main power and gas lines to prevent hazards."
                />
              </ul>
            </div>
          </div>
        </div>
      </div>
    </ResidentLayout>
  );
};

/* ---------- Small helpers ---------- */

const SummaryCard = ({ title, value, icon, color, iconColor }) => (
  <div
    className={`flex h-32 flex-col justify-between rounded-[20px] border-l-4 bg-white p-6 shadow-sm ${color}`}
  >
    <div className="flex items-center justify-between">
      <span className="text-sm text-gray-500">{title}</span>
      <span className={`material-symbols-outlined text-xl ${iconColor}`}>{icon}</span>
    </div>
    <div className="text-3xl font-bold">{value}</div>
  </div>
);

const AlertCard = ({
  level,
  title,
  description,
  location,
  time,
  icon,
  color,
  badgeColor,
  status,
}) => {
  const colors = {
    red: {
      border: "border-red-600",
      bg: "bg-red-100",
      text: "text-red-600",
    },
    orange: {
      border: "border-orange-500",
      bg: "bg-orange-100",
      text: "text-orange-600",
    },
    yellow: {
      border: "border-yellow-500",
      bg: "bg-yellow-100",
      text: "text-yellow-600",
    },
    emerald: {
      border: "border-emerald-500",
      bg: "bg-emerald-100",
      text: "text-emerald-600",
    },
    gray: {
      border: "border-gray-400",
      bg: "bg-gray-100",
      text: "text-gray-600",
    },
  };

  const style = colors[color] || colors.gray;
  const badgeStyle = badgeColor || "bg-gray-100 text-gray-600";

  return (
    <div
      className={`relative rounded-[20px] border-l-4 bg-white p-6 shadow-sm ${style.border}`}
    >
      <div className="absolute right-4 top-4">
        <span
          className={`${badgeStyle} rounded-md px-2 py-1 text-xs font-bold uppercase`}
        >
          {status || "Active"}
        </span>
      </div>

      <div className="flex gap-4">
        <div
          className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full ${style.bg} ${style.text}`}
        >
          <span className="material-symbols-outlined text-2xl">{icon}</span>
        </div>

        <div className="flex-1">
          <div className="mb-1 flex items-center gap-2">
            <span
              className={`h-2 w-2 rounded-full ${style.text.replace("text", "bg")}`}
            />
            <h3 className="text-xl font-semibold">{title}</h3>
          </div>

          <p className="mb-3 text-sm text-gray-500">{description}</p>

          <div className="mb-4 flex flex-wrap items-center gap-4 text-xs text-gray-500">
            <span>📍 {location}</span>
            <span>🕒 {time}</span>
            <span className={`rounded ${badgeStyle} px-2 py-0.5 text-xs font-bold`}>
              {level}
            </span>
          </div>

          <div className="flex gap-3">
            <button className="rounded-lg bg-indigo-600 px-4 py-2 text-sm text-white hover:bg-indigo-700">
              View Details
            </button>
            <button className="rounded-lg border border-gray-300 px-4 py-2 text-sm hover:bg-gray-100">
              View on Map
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const SafetyItem = ({ icon, title, description }) => (
  <li className="flex items-start gap-3">
    <span className="material-symbols-outlined mt-0.5 text-lg text-red-500">
      {icon}
    </span>
    <div>
      <div className="font-semibold text-black">{title}</div>
      <div className="mt-1 text-xs text-gray-500">{description}</div>
    </div>
  </li>
);

export default AlertsNotifications;