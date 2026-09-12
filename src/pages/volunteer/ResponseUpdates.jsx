import { useState, useEffect } from "react";
import VolunteerLayout from "../../layouts/VolunteerLayout";
import { useDisaster } from "../../context/DisasterContext";
import { useAuth } from "../../context/AuthContext";

function ResponseUpdates() {
  const { incidents } = useDisaster();
  const { currentUser } = useAuth();

  const [updates, setUpdates] = useState([]);
  const [filteredUpdates, setFilteredUpdates] = useState([]);
  const [fieldReports, setFieldReports] = useState([]);
  const [activityTimeline, setActivityTimeline] = useState([]);
  const [filterType, setFilterType] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [summaryStats, setSummaryStats] = useState({
    newUpdates: 0,
    fieldReports: 0,
    incidentChanges: 0,
    announcements: 0,
  });
  const [criticalUpdate, setCriticalUpdate] = useState(null);

  useEffect(() => {
    loadUpdates();
    loadFieldReports();
    loadActivityTimeline();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [incidents]);

  // Recalculate stats whenever updates change
  useEffect(() => {
    calculateStats();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [updates]);

  // ---------- Safe string conversion ----------
  const safeString = (value) => {
    if (value === null || value === undefined) return "";
    if (typeof value === "object") {
      try {
        return JSON.stringify(value);
      } catch {
        return String(value);
      }
    }
    return String(value);
  };

  // ---------- Load updates ----------
  const loadUpdates = () => {
    try {
      const savedUpdates = JSON.parse(localStorage.getItem("responseUpdates") || "[]");

      if (savedUpdates.length > 0) {
        setUpdates(savedUpdates);
        setFilteredUpdates(savedUpdates);
        const critical = savedUpdates.find((u) => u.type === "Critical");
        setCriticalUpdate(critical || savedUpdates[0]);
        return;
      }

      const generatedUpdates = [];

      if (incidents && incidents.length > 0) {
        incidents.forEach((incident, index) => {
          const types = ["Critical", "Field Report", "Announcement", "Status Update"];
          const type =
            incident.severity === "Critical" || incident.severity === "CRITICAL"
              ? "Critical"
              : types[index % types.length];

          const typeClasses = {
            Critical: "bg-[#ba1a1a]/10 text-[#ba1a1a]",
            "Field Report": "bg-[#4648d4]/10 text-[#4648d4]",
            Announcement: "bg-[#22c55e]/10 text-[#22c55e]",
            "Status Update": "bg-[#f97316]/10 text-[#f97316]",
          };

          const locations = safeString(incident.location || "Unknown location");
          const teams = ["Alpha Team", "Beta Team", "Rescue Unit 1", "Rescue Unit 2", "Medical Unit"];

          const descriptions = {
            Critical: `Immediate response required. ${safeString(incident.description || "Situation critical.")}`,
            "Field Report": `Field team reporting: ${safeString(incident.description || "Situation under assessment.")}`,
            Announcement: `Important update: ${safeString(incident.title || "New update available")}`,
            "Status Update": `Status update for ${safeString(incident.title || "ongoing incident")}`,
          };

          const timeAgo = incident.timestamp
            ? getTimeAgo(new Date(incident.timestamp))
            : `${Math.floor(Math.random() * 60) + 1} mins ago`;

          generatedUpdates.push({
            id: `update-${Date.now()}-${index}`,
            type: safeString(type),
            typeClass: safeString(typeClasses[type] || "bg-gray-100 text-gray-600"),
            time: safeString(timeAgo),
            title: safeString(incident.title || `Incident ${index + 1}`),
            description: safeString(descriptions[type] || incident.description || "Update available"),
            location: safeString(locations),
            team: safeString(teams[index % teams.length]),
            severity: safeString(incident.severity || ""),
            timestamp: incident.timestamp || new Date().toISOString(),
            incidentId: safeString(incident.id || ""),
          });
        });
      }

      if (generatedUpdates.length === 0) {
        generatedUpdates.push(
          {
            id: "update-001",
            type: "Critical",
            typeClass: "bg-[#ba1a1a]/10 text-[#ba1a1a]",
            time: "2 mins ago",
            title: "Water levels rising near Teku",
            description:
              "Immediate monitoring required at the western embankment. Water levels have exceeded the 4.5m safety threshold.",
            location: "Teku Bridge Area",
            team: "Alpha Team",
            severity: "Critical",
            timestamp: new Date().toISOString(),
            incidentId: "inc-001",
          },
          {
            id: "update-002",
            type: "Field Report",
            typeClass: "bg-[#4648d4]/10 text-[#4648d4]",
            time: "15 mins ago",
            title: "Evacuation completed at Baneshwor",
            description:
              "All 45 households in the high-risk zone have been successfully relocated to the community center.",
            location: "Baneshwor Sector 4",
            team: "Rescue Unit 2",
            severity: "High",
            timestamp: new Date().toISOString(),
            incidentId: "inc-002",
          }
        );
      }

      localStorage.setItem("responseUpdates", JSON.stringify(generatedUpdates));
      setUpdates(generatedUpdates);
      setFilteredUpdates(generatedUpdates);

      const critical = generatedUpdates.find((u) => u.type === "Critical");
      setCriticalUpdate(critical || generatedUpdates[0]);
    } catch (error) {
      console.error("Error loading updates:", error);
      setUpdates([]);
      setFilteredUpdates([]);
    }
  };

  // ---------- Load field reports ----------
  const loadFieldReports = () => {
    try {
      const reports = [];

      if (incidents && incidents.length > 0) {
        const filtered = incidents.filter((inc) => inc.status !== "Resolved").slice(0, 5);
        filtered.forEach((incident, index) => {
          reports.push({
            id: `report-${Date.now()}-${index}`,
            title: safeString(incident.title || `Report ${index + 1}`),
            description: safeString(incident.description || "Field report available"),
            reportedBy: safeString(incident.reportedBy || `Team ${String.fromCharCode(65 + index)}`),
            time: incident.timestamp
              ? getTimeAgo(new Date(incident.timestamp))
              : `${Math.floor(Math.random() * 4) + 1}h ago`,
            status: incident.status === "Resolved" ? "Verified" : "Pending",
            statusIcon: incident.status === "Resolved" ? "check_circle" : "pending",
            statusColor: incident.status === "Resolved" ? "text-[#22c55e]" : "text-[#f97316]",
          });
        });
      }

      if (reports.length === 0) {
        reports.push({
          id: "report-001",
          title: "Drinking water shortage",
          description: "Water supply disrupted in Sector 3",
          reportedBy: "J. Doe",
          time: "1h ago",
          status: "Verified",
          statusIcon: "check_circle",
          statusColor: "text-[#22c55e]",
        });
      }

      setFieldReports(reports);
    } catch (error) {
      console.error("Error loading field reports:", error);
      setFieldReports([]);
    }
  };

  // ---------- Load activity timeline ----------
  const loadActivityTimeline = () => {
    try {
      const timeline = [];

      if (incidents && incidents.length > 0) {
        const sorted = [...incidents]
          .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
          .slice(0, 5);

        sorted.forEach((incident) => {
          const time = incident.timestamp
            ? new Date(incident.timestamp).toLocaleTimeString("en-US", {
                hour: "2-digit",
                minute: "2-digit",
              })
            : "09:00 AM";

          timeline.push({
            id: `activity-${Date.now()}-${Math.random()}`,
            time: safeString(time),
            title: safeString(incident.title || "Active incident"),
            description: safeString(incident.location || "Active incident"),
            color:
              incident.severity === "Critical" || incident.severity === "CRITICAL"
                ? "bg-[#ba1a1a]"
                : incident.severity === "High"
                ? "bg-[#f97316]"
                : "bg-[#4648d4]",
          });
        });
      }

      if (timeline.length === 0) {
        timeline.push({
          id: "activity-001",
          time: "09:00 AM",
          title: "Emergency shelter opened at City Hall",
          description: "Sector 4, Kathmandu",
          color: "bg-[#4648d4]",
        });
      }

      setActivityTimeline(timeline);
    } catch (error) {
      console.error("Error loading activity timeline:", error);
      setActivityTimeline([]);
    }
  };

  // ---------- Stats ----------
  const calculateStats = () => {
    try {
      const newUpdates = updates.filter((u) => u.type !== "Status Update").length;
      const fieldReportsCount = updates.filter((u) => u.type === "Field Report").length;
      const incidentChanges = updates.filter(
        (u) => u.type === "Status Update" || u.type === "Critical"
      ).length;
      const announcements = updates.filter((u) => u.type === "Announcement").length;

      setSummaryStats({
        newUpdates,
        fieldReports: fieldReportsCount,
        incidentChanges,
        announcements,
      });
    } catch (error) {
      console.error("Error calculating stats:", error);
    }
  };

  const getTimeAgo = (date) => {
    try {
      const now = new Date();
      const diffMs = now - date;
      const diffMins = Math.floor(diffMs / 60000);
      const diffHours = Math.floor(diffMins / 60);
      const diffDays = Math.floor(diffHours / 24);

      if (diffDays > 0) return `${diffDays}d ago`;
      if (diffHours > 0) return `${diffHours}h ago`;
      if (diffMins > 0) return `${diffMins}m ago`;
      return "Just now";
    } catch {
      return "Recently";
    }
  };

  // ---------- Filters ----------
  const handleFilter = (type) => {
    setFilterType(type);
    setFilteredUpdates(type === "all" ? updates : updates.filter((u) => u.type === type));
  };

  const handleSearch = (e) => {
    const term = e.target.value.toLowerCase();
    setSearchTerm(term);
    if (term === "") {
      setFilteredUpdates(updates);
    } else {
      setFilteredUpdates(
        updates.filter(
          (u) =>
            safeString(u.title).toLowerCase().includes(term) ||
            safeString(u.description).toLowerCase().includes(term) ||
            safeString(u.location).toLowerCase().includes(term) ||
            safeString(u.team).toLowerCase().includes(term)
        )
      );
    }
  };

  // ---------- Header extras ----------
  const headerExtras = (
    <button className="hidden items-center gap-2 rounded-lg bg-[#4648d4] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#4648d4]/90 sm:flex">
      <span className="material-symbols-outlined text-[18px]">add</span>
      Report Field Update
    </button>
  );

  return (
    <VolunteerLayout title="Response Updates" headerRight={headerExtras}>
      <div className="mx-auto max-w-7xl space-y-8">

        {/* ================= PAGE HEADER ================= */}
        <section className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
          <div className="max-w-2xl">
            <h1 className="font-['Space_Grotesk'] text-3xl font-bold md:text-4xl">
              Response Updates
            </h1>
            <p className="mt-3 text-[#45464e]">
              Stay informed about incidents, field conditions, team activities, and important response announcements.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <button className="flex items-center gap-2 rounded-xl border border-[#0e1a39]/20 bg-white px-4 py-2.5 text-sm font-semibold transition hover:bg-gray-50">
              <span className="material-symbols-outlined text-[18px]">settings</span>
              Notification Settings
            </button>

            <button className="flex items-center gap-2 rounded-xl bg-[#4648d4] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#4648d4]/90">
              <span className="material-symbols-outlined text-[18px]">add</span>
              Report Field Update
            </button>
          </div>
        </section>

        {/* ================= CRITICAL BANNER ================= */}
        {criticalUpdate && (
          <section className="flex items-start gap-4 rounded-r-xl border-l-4 border-[#ba1a1a] bg-[#ffdad6]/30 p-5 shadow-sm">
            <span className="material-symbols-outlined mt-1 text-[#ba1a1a]">error</span>

            <div className="flex-1">
              <div className="mb-2 flex flex-col gap-2 sm:flex-row sm:items-center">
                <h2 className="font-['Space_Grotesk'] text-xl font-bold text-[#ba1a1a]">
                  Critical Response Update
                </h2>
                <span className="text-sm text-[#ba1a1a]/70 sm:ml-auto">
                  {safeString(criticalUpdate.time || "Updated recently")}
                </span>
              </div>

              <p className="text-[#1b1b1e]">{safeString(criticalUpdate.description)}</p>

              <button className="mt-4 flex items-center gap-2 text-sm font-bold text-[#ba1a1a] hover:underline">
                View Incident
                <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
              </button>
            </div>
          </section>
        )}

        {/* ================= SUMMARY CARDS ================= */}
        <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-4">
          <SummaryStat
            icon="notifications_active"
            iconColor="text-[#4648d4]"
            iconBg="bg-[#4648d4]/10"
            label="New Updates"
            value={summaryStats.newUpdates}
            dot="bg-[#4648d4]"
          />
          <SummaryStat
            icon="assignment"
            iconColor="text-[#0e1a39]"
            iconBg="bg-[#0e1a39]/5"
            label="Field Reports"
            value={summaryStats.fieldReports}
          />
          <SummaryStat
            icon="warning"
            iconColor="text-[#0e1a39]"
            iconBg="bg-[#0e1a39]/5"
            label="Incident Changes"
            value={summaryStats.incidentChanges}
          />
          <SummaryStat
            icon="campaign"
            iconColor="text-[#0e1a39]"
            iconBg="bg-[#0e1a39]/5"
            label="Team Announcements"
            value={summaryStats.announcements}
          />
        </section>

        {/* ================= FILTER BAR ================= */}
        <section className="flex flex-col items-center justify-between gap-4 rounded-xl border border-gray-200 bg-white p-4 shadow-sm lg:flex-row">
          <div className="flex flex-wrap gap-2">
            <FilterButton active={filterType === "all"} onClick={() => handleFilter("all")}>
              All
            </FilterButton>
            <FilterButton
              active={filterType === "Critical"}
              onClick={() => handleFilter("Critical")}
              activeClass="bg-[#ba1a1a] text-white"
            >
              Critical
            </FilterButton>
            <FilterButton
              active={filterType === "Field Report"}
              onClick={() => handleFilter("Field Report")}
            >
              Field Reports
            </FilterButton>
            <FilterButton
              active={filterType === "Announcement"}
              onClick={() => handleFilter("Announcement")}
              activeClass="bg-[#22c55e] text-white"
            >
              Announcements
            </FilterButton>
          </div>

          <div className="flex w-full gap-2 lg:w-auto">
            <div className="relative flex-1 lg:w-64">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[20px] text-[#45464e]">
                search
              </span>
              <input
                type="text"
                placeholder="Search updates..."
                className="w-full rounded-lg border border-gray-200 bg-white py-2 pl-10 pr-4 text-sm outline-none transition focus:border-[#4648d4]"
                value={searchTerm}
                onChange={handleSearch}
              />
            </div>

            <button className="rounded-lg border border-gray-200 p-2 text-[#45464e] transition hover:bg-gray-50">
              <span className="material-symbols-outlined">filter_list</span>
            </button>
          </div>
        </section>

        {/* ================= CONTENT GRID ================= */}
        <section className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          {/* Latest Updates */}
          <div className="space-y-4 lg:col-span-2">
            <h2 className="font-['Space_Grotesk'] text-xl font-bold">
              Latest Response Updates
            </h2>

            <div className="space-y-4">
              {filteredUpdates.length > 0 ? (
                filteredUpdates.map((update) => (
                  <div
                    key={update.id}
                    className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm transition hover:border-[#4648d4]/30"
                  >
                    <div className="mb-3 flex items-start justify-between">
                      <div className="flex flex-wrap items-center gap-2">
                        <span
                          className={`rounded px-2 py-1 text-[10px] font-bold uppercase ${safeString(
                            update.typeClass
                          )}`}
                        >
                          {safeString(update.type)}
                        </span>
                        <span className="text-sm text-[#45464e]">• {safeString(update.time)}</span>
                      </div>

                      <button className="text-[#45464e]">
                        <span className="material-symbols-outlined">more_vert</span>
                      </button>
                    </div>

                    <h3 className="font-['Space_Grotesk'] text-lg font-bold">
                      {safeString(update.title)}
                    </h3>

                    <p className="mt-2 text-[#45464e]">{safeString(update.description)}</p>

                    <div className="mt-5 flex flex-wrap items-center gap-4 border-t border-gray-100 pt-4 text-sm text-[#45464e]">
                      <div className="flex items-center gap-1">
                        <span className="material-symbols-outlined text-[18px]">location_on</span>
                        {safeString(update.location)}
                      </div>
                      <div className="flex items-center gap-1">
                        <span className="material-symbols-outlined text-[18px]">person</span>
                        {safeString(update.team)}
                      </div>
                      <button className="ml-auto font-bold text-[#4648d4] hover:underline">
                        View Details
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="rounded-xl border border-gray-200 bg-white py-12 text-center">
                  <span className="material-symbols-outlined mb-4 block text-6xl text-gray-300">
                    search_off
                  </span>
                  <p className="text-[#45464e]">No updates found</p>
                  <p className="text-sm text-[#45464e]">Try adjusting your filters</p>
                </div>
              )}
            </div>
          </div>

          {/* Right sidebar */}
          <div className="space-y-6">
            {/* Field reports */}
            <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
              <h2 className="mb-5 font-['Space_Grotesk'] text-xl font-bold">
                Recent Field Reports
              </h2>

              <div className="space-y-4">
                {fieldReports.length > 0 ? (
                  fieldReports.slice(0, 3).map((report) => (
                    <div
                      key={report.id}
                      className="flex gap-3 border-b border-gray-100 pb-4 last:border-0 last:pb-0"
                    >
                      <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-[#e4e1e5] text-[#4648d4]">
                        <span className="material-symbols-outlined text-[20px]">description</span>
                      </div>

                      <div>
                        <p className="font-semibold">{safeString(report.title)}</p>
                        <p className="mt-1 text-sm text-[#45464e]">
                          Reported by {safeString(report.reportedBy)} • {safeString(report.time)}
                        </p>
                        <div
                          className={`mt-2 flex items-center gap-1 ${safeString(
                            report.statusColor
                          )}`}
                        >
                          <span className="material-symbols-outlined text-[14px]">
                            {safeString(report.statusIcon)}
                          </span>
                          <span className="text-xs font-bold">{safeString(report.status)}</span>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="py-4 text-center text-[#45464e]">
                    <p>No field reports available</p>
                  </div>
                )}
              </div>
            </div>

            {/* Activity */}
            <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
              <h2 className="mb-5 font-['Space_Grotesk'] text-xl font-bold">Response Activity</h2>

              <div className="space-y-6 border-l-2 border-gray-200 pl-6">
                {activityTimeline.length > 0 ? (
                  activityTimeline.map((activity) => (
                    <div key={activity.id} className="relative">
                      <span
                        className={`absolute -left-[31px] top-1 h-4 w-4 rounded-full border-4 border-white ${safeString(
                          activity.color
                        )}`}
                      />
                      <p className="text-xs font-bold uppercase text-[#45464e]">
                        {safeString(activity.time)}
                      </p>
                      <p className="mt-1 text-sm font-semibold">
                        {safeString(activity.title)}
                      </p>
                      <p className="text-xs text-[#45464e]">
                        {safeString(activity.description)}
                      </p>
                    </div>
                  ))
                ) : (
                  <div className="py-4 text-center text-[#45464e]">
                    <p>No recent activity</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>
      </div>
    </VolunteerLayout>
  );
}

/* ---------- Small helpers ---------- */

const SummaryStat = ({ icon, iconColor, iconBg, label, value, dot }) => (
  <div className="relative overflow-hidden rounded-[20px] border border-gray-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-md">
    <div className="mb-5 flex items-center justify-between">
      <div className={`flex h-10 w-10 items-center justify-center rounded-full ${iconBg} ${iconColor}`}>
        <span className="material-symbols-outlined">{icon}</span>
      </div>
      {dot && <span className={`h-2.5 w-2.5 rounded-full ${dot}`} />}
    </div>
    <p className="text-xs font-bold uppercase tracking-wider text-[#45464e]">{label}</p>
    <h3 className="mt-2 font-['Space_Grotesk'] text-4xl font-bold">{value}</h3>
  </div>
);

const FilterButton = ({ active, onClick, children, activeClass = "bg-[#4648d4] text-white" }) => (
  <button
    onClick={onClick}
    className={`rounded-lg px-4 py-2 text-sm font-semibold ${
      active ? activeClass : "border border-gray-200 text-[#45464e] hover:bg-gray-50"
    }`}
  >
    {children}
  </button>
);

export default ResponseUpdates;