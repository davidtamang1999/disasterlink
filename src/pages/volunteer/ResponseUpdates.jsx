import { useState, useEffect } from "react";
import VolunteerLayout from "../../layouts/VolunteerLayout";
import { useDisaster } from "../../context/DisasterContext";
import { useAuth } from "../../context/AuthContext";

function ResponseUpdates() {
  const { incidents, responseUpdates, addResponseUpdate, getLatestCriticalUpdate } = useDisaster();
  const { currentUser } = useAuth();

  const [filteredUpdates, setFilteredUpdates] = useState([]);
  const [fieldReports, setFieldReports] = useState([]);
  const [activityTimeline, setActivityTimeline] = useState([]);
  const [filterType, setFilterType] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");

  // ---------- Seed demo updates from incidents (once per session) ----------
  useEffect(() => {
    if (responseUpdates.length > 0) return;
    if (sessionStorage.getItem("responseUpdatesSeeded")) return;

    sessionStorage.setItem("responseUpdatesSeeded", "1");

    const seedDemoData = async () => {
      const seedTypes = ["Critical", "Field Report", "Announcement", "Status Update"];
      const teams = ["Alpha Team", "Beta Team", "Rescue Unit 1", "Rescue Unit 2", "Medical Unit"];

      if (incidents.length > 0) {
        for (let index = 0; index < Math.min(incidents.length, 5); index++) {
          const incident = incidents[index];
          const type =
            incident.severity === "Critical" || incident.severity === "CRITICAL"
              ? "Critical"
              : seedTypes[index % seedTypes.length];

          const descriptions = {
            Critical: `Immediate response required. ${incident.description || "Situation critical."}`,
            "Field Report": `Field team reporting: ${incident.description || "Situation under assessment."}`,
            Announcement: `Important update: ${incident.title || "New update available"}`,
            "Status Update": `Status update for ${incident.title || "ongoing incident"}`,
          };

          await addResponseUpdate({
            type,
            title: incident.title || `Incident ${index + 1}`,
            description: descriptions[type] || "Update available",
            location: incident.location || "Unknown location",
            team: teams[index % teams.length],
            severity: incident.severity || "Moderate",
            status: "Active",
            incidentId: incident.id,
            userId: incident.reportedBy?.id || null,
            userName: incident.reportedBy?.name || "System",
          });
        }
      } else {
        const defaults = [
          {
            type: "Critical",
            title: "Water levels rising near Teku",
            description:
              "Immediate monitoring required at the western embankment. Water levels have exceeded the 4.5m safety threshold.",
            location: "Teku Bridge Area",
            team: "Alpha Team",
            severity: "Critical",
            status: "Active",
            incidentId: "inc-001",
            userId: "system",
            userName: "System Admin",
          },
          {
            type: "Field Report",
            title: "Evacuation completed at Baneshwor",
            description:
              "All 45 households in the high-risk zone have been successfully relocated to the community center.",
            location: "Baneshwor Sector 4",
            team: "Rescue Unit 2",
            severity: "High",
            status: "Active",
            incidentId: "inc-002",
            userId: "system",
            userName: "System Admin",
          },
        ];
        for (const d of defaults) await addResponseUpdate(d);
      }
    };

    seedDemoData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [incidents, responseUpdates.length]);

  // ---------- Apply filters whenever updates or filters change ----------
  useEffect(() => {
    let filtered = responseUpdates;

    if (filterType !== "all") {
      filtered = filtered.filter((u) => u.type === filterType);
    }
    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (u) =>
          u.title?.toLowerCase().includes(q) ||
          u.description?.toLowerCase().includes(q) ||
          u.location?.toLowerCase().includes(q) ||
          u.team?.toLowerCase().includes(q)
      );
    }

    setFilteredUpdates(filtered);
  }, [responseUpdates, filterType, searchTerm]);

  // ---------- Build field reports + activity timeline from context ----------
  useEffect(() => {
    // Field reports = non-critical, non-announcement updates
    const reports = responseUpdates
      .filter((u) => u.type === "Field Report" || u.type === "Status Update")
      .slice(0, 3)
      .map((u) => ({
        id: u.id,
        title: u.title,
        description: u.description,
        reportedBy: u.team || "Team",
        time: u.timestamp
          ? new Date(u.timestamp).toLocaleTimeString("en-US", {
              hour: "2-digit",
              minute: "2-digit",
            })
          : "Just now",
        status: "Verified",
        statusIcon: "check_circle",
        statusColor: "text-[#22c55e]",
      }));

    setFieldReports(reports);

    // Activity timeline = recent 5 updates sorted by time
    const timeline = [...responseUpdates]
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
      .slice(0, 5)
      .map((u) => ({
        id: u.id,
        time: u.timestamp
          ? new Date(u.timestamp).toLocaleTimeString("en-US", {
              hour: "2-digit",
              minute: "2-digit",
            })
          : "—",
        title: u.title,
        description: u.location,
        color:
          u.severity === "Critical" || u.severity === "CRITICAL"
            ? "bg-[#ba1a1a]"
            : u.severity === "High"
            ? "bg-[#f97316]"
            : "bg-[#4648d4]",
      }));

    setActivityTimeline(timeline);
  }, [responseUpdates]);

  // ---------- Derived stats ----------
  const summaryStats = {
    newUpdates: responseUpdates.filter((u) => u.type !== "Status Update").length,
    fieldReports: responseUpdates.filter((u) => u.type === "Field Report").length,
    incidentChanges: responseUpdates.filter(
      (u) => u.type === "Status Update" || u.type === "Critical"
    ).length,
    announcements: responseUpdates.filter((u) => u.type === "Announcement").length,
  };

  const criticalUpdate = getLatestCriticalUpdate();

  // ---------- Styling helpers ----------
  const getTypeClass = (type) => {
    const map = {
      Critical: "bg-[#ba1a1a]/10 text-[#ba1a1a]",
      "Field Report": "bg-[#4648d4]/10 text-[#4648d4]",
      Announcement: "bg-[#22c55e]/10 text-[#22c55e]",
      "Status Update": "bg-[#f97316]/10 text-[#f97316]",
    };
    return map[type] || "bg-gray-100 text-gray-600";
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
                  {criticalUpdate.timestamp
                    ? new Date(criticalUpdate.timestamp).toLocaleTimeString()
                    : "Updated recently"}
                </span>
              </div>

              <p className="text-[#1b1b1e]">{criticalUpdate.description}</p>

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
            <FilterButton active={filterType === "all"} onClick={() => setFilterType("all")}>
              All
            </FilterButton>
            <FilterButton
              active={filterType === "Critical"}
              onClick={() => setFilterType("Critical")}
              activeClass="bg-[#ba1a1a] text-white"
            >
              Critical
            </FilterButton>
            <FilterButton
              active={filterType === "Field Report"}
              onClick={() => setFilterType("Field Report")}
            >
              Field Reports
            </FilterButton>
            <FilterButton
              active={filterType === "Announcement"}
              onClick={() => setFilterType("Announcement")}
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
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <button className="rounded-lg border border-gray-200 p-2 text-[#45464e] transition hover:bg-gray-50">
              <span className="material-symbols-outlined">filter_list</span>
            </button>
          </div>
        </section>

        {/* ================= CONTENT GRID ================= */}
        <section className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          {/* Latest updates */}
          <div className="space-y-4 lg:col-span-2">
            <h2 className="font-['Space_Grotesk'] text-xl font-bold">Latest Response Updates</h2>

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
                          className={`rounded px-2 py-1 text-[10px] font-bold uppercase ${getTypeClass(update.type)}`}
                        >
                          {update.type}
                        </span>
                        <span className="text-sm text-[#45464e]">
                          •{" "}
                          {update.timestamp
                            ? new Date(update.timestamp).toLocaleTimeString()
                            : "—"}
                        </span>
                      </div>

                      <button className="text-[#45464e]">
                        <span className="material-symbols-outlined">more_vert</span>
                      </button>
                    </div>

                    <h3 className="font-['Space_Grotesk'] text-lg font-bold">
                      {update.title}
                    </h3>

                    <p className="mt-2 text-[#45464e]">{update.description}</p>

                    <div className="mt-5 flex flex-wrap items-center gap-4 border-t border-gray-100 pt-4 text-sm text-[#45464e]">
                      <div className="flex items-center gap-1">
                        <span className="material-symbols-outlined text-[18px]">location_on</span>
                        {update.location}
                      </div>
                      <div className="flex items-center gap-1">
                        <span className="material-symbols-outlined text-[18px]">person</span>
                        {update.team}
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
            <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
              <h2 className="mb-5 font-['Space_Grotesk'] text-xl font-bold">
                Recent Field Reports
              </h2>

              <div className="space-y-4">
                {fieldReports.length > 0 ? (
                  fieldReports.map((report) => (
                    <div
                      key={report.id}
                      className="flex gap-3 border-b border-gray-100 pb-4 last:border-0 last:pb-0"
                    >
                      <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-[#e4e1e5] text-[#4648d4]">
                        <span className="material-symbols-outlined text-[20px]">
                          description
                        </span>
                      </div>
                      <div>
                        <p className="font-semibold">{report.title}</p>
                        <p className="mt-1 text-sm text-[#45464e]">
                          Reported by {report.reportedBy} • {report.time}
                        </p>
                        <div className={`mt-2 flex items-center gap-1 ${report.statusColor}`}>
                          <span className="material-symbols-outlined text-[14px]">
                            {report.statusIcon}
                          </span>
                          <span className="text-xs font-bold">{report.status}</span>
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

            <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
              <h2 className="mb-5 font-['Space_Grotesk'] text-xl font-bold">
                Response Activity
              </h2>

              <div className="space-y-6 border-l-2 border-gray-200 pl-6">
                {activityTimeline.length > 0 ? (
                  activityTimeline.map((activity) => (
                    <div key={activity.id} className="relative">
                      <span
                        className={`absolute -left-[31px] top-1 h-4 w-4 rounded-full border-4 border-white ${activity.color}`}
                      />
                      <p className="text-xs font-bold uppercase text-[#45464e]">
                        {activity.time}
                      </p>
                      <p className="mt-1 text-sm font-semibold">{activity.title}</p>
                      <p className="text-xs text-[#45464e]">{activity.description}</p>
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