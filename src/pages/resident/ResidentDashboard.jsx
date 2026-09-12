import { useNavigate } from "react-router-dom";
import ResidentLayout from "../../layouts/ResidentLayout";
import { useDisaster } from "../../context/DisasterContext";
import { useAuth } from "../../context/AuthContext";
import PriorityBadge from "../../components/PriorityBadge";
import DisasterSituationScore from "../../components/DisasterSituationScore";

function ResidentDashboard() {
  const navigate = useNavigate();
  const { incidents, getHighestPriorityIncident, getPrioritySummary } = useDisaster();
  const { user } = useAuth();

  // ---------- Derived ----------
  const highestPriority = getHighestPriorityIncident();
  const prioritySummary = getPrioritySummary();

  const totalIncidents = incidents.length;
  const myReports = incidents.filter((inc) => inc.reportedBy?.id === user?.id).length;
  const criticalAlerts = incidents.filter(
    (inc) => inc.severity === "Critical" || inc.severity === "CRITICAL"
  ).length;
  const resolvedIncidents = incidents.filter((inc) => inc.status === "Resolved").length;
  const totalAffected = incidents.reduce(
    (sum, inc) => sum + (parseInt(inc.peopleAffected) || 0),
    0
  );
  const shelterLocations = [...new Set(incidents.map((inc) => inc.location))].length;

  const situationScore =
    incidents.length > 0
      ? Math.round(
          incidents.reduce((sum, inc) => sum + (inc.priorityScore || 0), 0) /
            incidents.length
        )
      : { score: 0, level: "Low", details: {}, summary: {} };

  const formatAffected = (num) => {
    if (num >= 1000) return (num / 1000).toFixed(1) + "k";
    return num.toString();
  };

  const stats = [
    {
      title: "Active Incidents",
      value: totalIncidents.toString(),
      subtitle: `${incidents.filter((inc) => inc.status !== "Resolved").length} active`,
      icon: "emergency",
      valueColor: "text-[#1b1b1e]",
    },
    {
      title: "My Reports",
      value: myReports.toString(),
      subtitle: `${incidents.filter((inc) => inc.reportedBy?.id === user?.id && inc.status === "Pending").length} awaiting review`,
      icon: "assignment_ind",
      valueColor: "text-[#1b1b1e]",
    },
    {
      title: "Critical Alerts",
      value: criticalAlerts.toString(),
      subtitle: "Action needed",
      icon: "notifications_active",
      valueColor: "text-[#FF5252]",
    },
    {
      title: "Resolved",
      value: resolvedIncidents.toString(),
      subtitle: "Total resolved",
      icon: "check_circle",
      valueColor: "text-[#4CAF50]",
    },
    {
      title: "Affected",
      value: formatAffected(totalAffected),
      subtitle: "People affected",
      icon: "groups",
      valueColor: "text-[#1b1b1e]",
    },
    {
      title: "Shelters",
      value: shelterLocations.toString(),
      subtitle: "Areas with shelters",
      icon: "home_pin",
      valueColor: "text-[#4b41e1]",
    },
  ];

  // ---------- Header extras ----------
  const headerExtras = (
    <div className="relative hidden sm:block">
      <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[#45464e]">
        search
      </span>
      <input
        type="text"
        placeholder="Search resources, alerts..."
        className="w-64 rounded-full border border-transparent bg-[#edf0f5] py-2 pl-10 pr-4 text-sm outline-none focus:border-[#4b41e1]"
      />
    </div>
  );

  return (
    <ResidentLayout title="Resident Dashboard" headerRight={headerExtras}>
      {/* ================= WELCOME ================= */}
      <section className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div>
          <h2 className="font-['Space_Grotesk'] text-3xl font-bold text-[#1b1b1e]">
            Good morning, {user?.name || user?.fullName || "Resident"}
          </h2>
          <p className="mt-2 text-[#45464e]">
            Stay informed about flood conditions and community emergencies.
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          <button
            onClick={() => navigate("/report-disaster")}
            className="rounded-xl border border-[#0e1a39]/20 px-6 py-2 font-semibold text-[#0e1a39] transition hover:bg-white"
          >
            Report Disaster
          </button>

          <button
            onClick={() => navigate("/resident/map")}
            className="flex items-center gap-2 rounded-xl bg-[#4b41e1] px-6 py-2 font-semibold text-white shadow-md transition hover:bg-[#645efb]"
          >
            <span className="material-symbols-outlined text-[18px]">map</span>
            View Live Map
          </button>
        </div>
      </section>

      {/* ================= CURRENT SITUATION ================= */}
      <section className="flex flex-col gap-6 rounded-[20px] border-l-[6px] border-[#FFC107] bg-white p-6 shadow-sm md:flex-row md:items-center">
        <div className="flex-1">
          <div className="mb-2 flex flex-wrap items-center gap-3">
            <h3 className="font-['Space_Grotesk'] text-xl font-bold">
              Current Flood Situation
            </h3>
            <span className="flex items-center gap-1 rounded-full bg-[#FFC107]/10 px-3 py-1 text-xs font-bold text-[#d99f00]">
              <span className="material-symbols-outlined text-[16px]">warning</span>
              {criticalAlerts > 0 ? "High Risk" : "Moderate Risk"}
            </span>
          </div>

          <p className="mb-4 text-[#45464e]">
            {totalIncidents > 0
              ? `${totalIncidents} active incidents reported. ${criticalAlerts} critical alerts require immediate attention.`
              : "No active incidents reported. Stay alert and report any emergencies."}
          </p>

          <div className="flex flex-wrap gap-4">
            <StatPill icon="water" label="Active Incidents" value={totalIncidents} />
            <StatPill
              icon="warning"
              label="Critical"
              value={criticalAlerts}
              valueClass="text-[#FF5252]"
            />
          </div>
        </div>

        <div className="self-start rounded-lg bg-[#f5f7fb] px-3 py-2 text-xs text-[#45464e] md:self-center">
          Last Updated: Just now
        </div>
      </section>

      {/* ================= SITUATION SCORE ================= */}
      <section>
        <DisasterSituationScore
          score={situationScore.score}
          level={situationScore.level}
          details={situationScore.details}
          summary={situationScore.summary}
        />
      </section>

      {/* ================= PRIORITY OVERVIEW ================= */}
      <section className="rounded-[20px] border border-gray-200 bg-white p-6 shadow-sm">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="flex items-center gap-2 text-xl font-semibold">
            <span className="material-symbols-outlined text-[#4648d4]">priority</span>
            Priority Overview
          </h3>
          <span className="text-xs text-[#45464e]">
            Auto-calculated from incident data
          </span>
        </div>

        <div className="grid grid-cols-2 gap-4 md:grid-cols-5">
          <PriorityTile value={prioritySummary.critical} label="Critical" variant="critical" />
          <PriorityTile value={prioritySummary.high} label="High" variant="high" />
          <PriorityTile value={prioritySummary.moderate} label="Moderate" variant="moderate" />
          <PriorityTile value={prioritySummary.low} label="Low" variant="low" />
          <PriorityTile value={prioritySummary.averageScore} label="Avg Score" variant="avg" />
        </div>

        {highestPriority && (
          <div className="mt-4 flex items-center justify-between rounded-xl border border-[#4648d4]/20 bg-[#4648d4]/5 p-4">
            <div>
              <p className="text-sm font-semibold text-gray-600">
                Highest Priority Incident
              </p>
              <p className="font-bold">{highestPriority.title}</p>
              <p className="text-sm text-gray-500">{highestPriority.location}</p>
            </div>
            <PriorityBadge
              score={highestPriority.priorityScore}
              level={highestPriority.priorityLevel}
            />
          </div>
        )}
      </section>

      {/* ================= MAP + ALERTS ================= */}
      <section className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Map */}
        <div className="flex min-h-[500px] flex-col rounded-[20px] bg-white p-6 shadow-sm lg:col-span-2">
          <div className="mb-6 flex items-center justify-between">
            <h3 className="font-['Space_Grotesk'] text-xl font-bold">
              Live Flood Situation
            </h3>
            <button>
              <span className="material-symbols-outlined">more_horiz</span>
            </button>
          </div>

          <div className="relative min-h-[400px] flex-1 overflow-hidden rounded-xl border border-gray-200 bg-gradient-to-br from-[#dbeafe] to-[#dcfce7]">
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <span className="material-symbols-outlined text-6xl text-[#4b41e1]">map</span>
                <p className="mt-3 font-semibold text-[#45464e]">
                  Kathmandu Valley Disaster Map
                </p>
                <p className="mt-1 text-sm text-[#76767f]">
                  {totalIncidents} incidents reported
                </p>
              </div>
            </div>

            {criticalAlerts > 0 && (
              <div className="absolute left-[48%] top-[45%]">
                <div className="h-5 w-5 rounded-full border-2 border-white bg-[#FF5252] shadow-md" />
              </div>
            )}

            {totalIncidents > 0 && (
              <div className="absolute left-[52%] top-[55%]">
                <div className="h-4 w-4 rounded-full border-2 border-white bg-[#FF9800] shadow-md" />
              </div>
            )}

            <div className="absolute left-[30%] top-[60%] flex h-8 w-8 items-center justify-center rounded-full border-2 border-white bg-[#4b41e1] text-white shadow-md">
              <span className="material-symbols-outlined text-[17px]">home</span>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-5 px-2 pt-5 text-sm">
            <span className="text-xs font-bold uppercase text-[#45464e]">Legend:</span>
            <LegendDot color="bg-[#FF5252]" label="Critical" />
            <LegendDot color="bg-[#FF9800]" label="High Risk" />
            <LegendDot color="bg-[#FFC107]" label="Moderate" />
            <div className="flex items-center gap-2">
              <div className="flex h-5 w-5 items-center justify-center rounded-full bg-[#4b41e1]">
                <span className="material-symbols-outlined text-[12px] text-white">home</span>
              </div>
              Shelter
            </div>
          </div>
        </div>

        {/* Alerts */}
        <div className="flex flex-col rounded-[20px] bg-white p-6 shadow-sm">
          <div className="mb-6 flex items-center justify-between">
            <h3 className="font-['Space_Grotesk'] text-xl font-bold">Active Alerts</h3>
            <span className="rounded-full bg-[#FF5252]/10 px-3 py-1 text-xs font-bold text-[#FF5252]">
              {criticalAlerts} New
            </span>
          </div>

          <div className="flex-1 space-y-4">
            {incidents.length > 0 ? (
              incidents.slice(0, 3).map((inc) => {
                const isCritical = inc.severity === "Critical" || inc.severity === "CRITICAL";
                return (
                  <div
                    key={inc.id}
                    className={`rounded-xl border p-4 ${
                      isCritical
                        ? "border-[#FF5252]/20 bg-[#FF5252]/5"
                        : "border-[#FF9800]/20 bg-[#FF9800]/5"
                    }`}
                  >
                    <div className="flex gap-3">
                      <div
                        className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${
                          isCritical ? "bg-[#FF5252]/20" : "bg-[#FF9800]/20"
                        }`}
                      >
                        <span
                          className={`material-symbols-outlined ${
                            isCritical ? "text-[#FF5252]" : "text-[#FF9800]"
                          }`}
                        >
                          {isCritical ? "warning" : "rainy"}
                        </span>
                      </div>
                      <div>
                        <h4 className="font-semibold">
                          {inc.title || "Incident Reported"}
                        </h4>
                        <p className="mt-1 text-sm text-[#45464e]">
                          {inc.location || "Unknown location"} · {inc.severity || "Unknown"}{" "}
                          severity
                        </p>
                        <p className="mt-3 text-xs text-[#76767f]">
                          {inc.timestamp
                            ? new Date(inc.timestamp).toLocaleTimeString()
                            : "Just now"}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="rounded-xl border border-gray-200 p-4 text-center text-[#45464e]">
                No active alerts at this time.
              </div>
            )}
          </div>

          <button
            onClick={() => navigate("/resident/alerts")}
            className="mt-4 w-full rounded-xl bg-[#4b41e1]/10 py-3 font-semibold text-[#4b41e1] transition hover:bg-[#4b41e1]/20"
          >
            View All Alerts
          </button>
        </div>
      </section>

      {/* ================= STATS ================= */}
      <section className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6">
        {stats.map((stat) => (
          <div
            key={stat.title}
            className="flex min-h-[150px] flex-col justify-between rounded-[20px] bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-md"
          >
            <div className="flex items-start justify-between">
              <span className="text-[11px] font-bold uppercase text-[#45464e]">
                {stat.title}
              </span>
              <span className="material-symbols-outlined text-[#0e1a39]/50">
                {stat.icon}
              </span>
            </div>

            <div>
              <div className={`text-3xl font-bold ${stat.valueColor}`}>{stat.value}</div>
              <p className="mt-1 text-xs text-[#45464e]">{stat.subtitle}</p>
            </div>
          </div>
        ))}
      </section>

      {/* ================= TRENDS ================= */}
      <section className="rounded-[20px] bg-white p-6 shadow-sm">
        <div className="mb-6">
          <h3 className="font-['Space_Grotesk'] text-xl font-bold">Incident Overview</h3>
          <p className="mt-1 text-sm text-[#45464e]">
            {totalIncidents} total incidents reported
          </p>
        </div>

        <div className="flex h-[250px] items-center justify-center rounded-xl border border-gray-200 bg-[#f5f7fb]">
          <div className="text-center">
            <span className="material-symbols-outlined text-5xl text-[#4b41e1]">
              show_chart
            </span>
            <p className="mt-3 font-semibold text-[#45464e]">
              {totalIncidents} Incidents Reported
            </p>
            <p className="mt-1 text-sm text-[#76767f]">
              {resolvedIncidents} resolved · {criticalAlerts} critical
            </p>
          </div>
        </div>
      </section>
    </ResidentLayout>
  );
}

/* ---------- Small helpers ---------- */

const StatPill = ({ icon, label, value, valueClass = "" }) => (
  <div className="flex items-center gap-3 rounded-xl border border-gray-200 bg-[#f5f7fb] px-4 py-3">
    <span className="material-symbols-outlined text-[#4b41e1]">{icon}</span>
    <div>
      <p className="text-[10px] font-bold uppercase text-[#45464e]">{label}</p>
      <p className={`font-semibold ${valueClass}`}>{value}</p>
    </div>
  </div>
);

const PriorityTile = ({ value, label, variant }) => {
  const styles = {
    critical: "border-red-200 bg-red-50 text-red-600",
    high: "border-orange-200 bg-orange-50 text-orange-500",
    moderate: "border-yellow-200 bg-yellow-50 text-yellow-600",
    low: "border-gray-200 bg-gray-50 text-gray-500",
    avg: "border-[#4648d4]/20 bg-[#4648d4]/5 text-[#4648d4]",
  }[variant];

  return (
    <div className={`rounded-xl border p-4 text-center ${styles}`}>
      <div className="text-2xl font-bold">{value}</div>
      <div className="text-xs font-semibold">{label}</div>
    </div>
  );
};

const LegendDot = ({ color, label }) => (
  <div className="flex items-center gap-2">
    <div className={`h-3 w-3 rounded-full ${color}`} />
    {label}
  </div>
);

export default ResidentDashboard;