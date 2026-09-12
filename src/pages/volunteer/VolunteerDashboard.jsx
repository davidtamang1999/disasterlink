import { useNavigate } from "react-router-dom";
import VolunteerLayout from "../../layouts/VolunteerLayout";
import { useDisaster } from "../../context/DisasterContext";
import { useAuth } from "../../context/AuthContext";

function VolunteerDashboard() {
  const navigate = useNavigate();
  const { incidents } = useDisaster();
  const { user } = useAuth();

  // ---------- Recommended incidents ----------
  const getRecommendedIncidents = () => {
    const volunteerSkills = user?.skills || [];
    if (volunteerSkills.length === 0) return [];

    return incidents
      .filter((inc) => inc.status !== "Resolved")
      .map((inc) => {
        const incidentKeywords = (inc.title || inc.description || "").toLowerCase();
        const matchCount = volunteerSkills.filter((skill) =>
          incidentKeywords.includes(skill.toLowerCase())
        ).length;
        return { ...inc, matchCount };
      })
      .sort((a, b) => b.matchCount - a.matchCount)
      .slice(0, 3);
  };

  const recommendedIncidents = getRecommendedIncidents();

  // ---------- My tasks ----------
  const myTasks = incidents.filter(
    (inc) =>
      inc.assignedTo === user?.id ||
      inc.status === "In Progress" ||
      inc.status === "Pending"
  );

  const activeAssignments = myTasks.filter(
    (inc) => inc.status === "In Progress" || inc.status === "Responding"
  ).length;

  const pendingTasks = myTasks.filter(
    (inc) => inc.status === "Pending" || inc.status === "Under Review"
  ).length;

  const completedTasks = myTasks.filter((inc) => inc.status === "Resolved").length;

  const totalAffected = incidents.reduce(
    (sum, inc) => sum + (parseInt(inc.peopleAffected) || 0),
    0
  );

  const stats = [
    {
      title: "Active Assignments",
      value: activeAssignments.toString(),
      subtitle: `${pendingTasks} require attention`,
      icon: "assignment",
      valueColor: "text-[#1b1b1e]",
    },
    {
      title: "Hours Contributed",
      value: (completedTasks * 2).toString(),
      subtitle: "This month",
      icon: "schedule",
      valueColor: "text-[#4b41e1]",
    },
    {
      title: "People Assisted",
      value: totalAffected > 0 ? totalAffected.toString() : "0",
      subtitle: "Through your activities",
      icon: "groups",
      valueColor: "text-[#1b1b1e]",
    },
    {
      title: "Completed Tasks",
      value: completedTasks.toString(),
      subtitle: "Total completed",
      icon: "task_alt",
      valueColor: "text-[#4CAF50]",
    },
  ];

  // ---------- Assignments ----------
  const assignments = myTasks.slice(0, 3).map((inc) => {
    const statusMap = {
      Critical: { label: "High Priority", color: "text-[#FF5252]", bg: "bg-[#FF5252]/10" },
      High: { label: "High Priority", color: "text-[#FF9800]", bg: "bg-[#FF9800]/10" },
      Moderate: { label: "Assigned", color: "text-[#4b41e1]", bg: "bg-[#4b41e1]/10" },
      Low: { label: "Upcoming", color: "text-[#4CAF50]", bg: "bg-[#4CAF50]/10" },
    };
    const statusInfo = statusMap[inc.severity] || statusMap.Moderate;

    return {
      title: inc.title || "Incident Task",
      location: inc.location || "Unknown location",
      time: inc.timestamp
        ? new Date(inc.timestamp).toLocaleString("en-US", {
            month: "short",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          })
        : "Just now",
      status: statusInfo.label,
      icon:
        inc.severity === "Critical" || inc.severity === "High"
          ? "emergency"
          : "assignment",
      color: statusInfo.color,
      bg: statusInfo.bg,
      id: inc.id,
    };
  });

  if (assignments.length === 0) {
    assignments.push({
      title: "No active assignments",
      location: "Check back later for tasks",
      time: "—",
      status: "Available",
      icon: "check_circle",
      color: "text-[#4CAF50]",
      bg: "bg-[#4CAF50]/10",
      id: "empty",
    });
  }

  // ---------- Activities ----------
  const activities = incidents.slice(0, 3).map((inc) => ({
    title: inc.status === "Resolved" ? "Task completed" : "New task received",
    description: `${inc.title || "Incident"} at ${inc.location || "unknown location"}`,
    time: inc.timestamp
      ? new Date(inc.timestamp).toLocaleString("en-US", {
          month: "short",
          day: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        })
      : "Just now",
    icon: inc.status === "Resolved" ? "task_alt" : "assignment",
  }));

  if (activities.length === 0) {
    activities.push({
      title: "No recent activity",
      description: "Your volunteer activity will appear here",
      time: "—",
      icon: "info",
    });
  }

  const uniqueReporters = new Set(incidents.map((inc) => inc.reportedBy?.id)).size;

  // ---------- Header extras ----------
  const headerExtras = (
    <div className="relative hidden sm:block">
      <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[#45464e]">
        search
      </span>
      <input
        type="text"
        placeholder="Search assignments..."
        className="w-64 rounded-full bg-[#edf0f5] py-2 pl-10 pr-4 text-sm outline-none transition focus:ring-2 focus:ring-[#4b41e1]/30"
      />
    </div>
  );

  return (
    <VolunteerLayout title="Volunteer Dashboard" headerRight={headerExtras}>
      {/* ================= WELCOME ================= */}
      <section className="flex flex-col justify-between gap-5 md:flex-row md:items-end">
        <div>
          <div className="mb-2 flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#4CAF50]/10">
              <span className="material-symbols-outlined text-[#4CAF50]">
                volunteer_activism
              </span>
            </span>
            <span className="text-sm font-semibold text-[#4CAF50]">
              Volunteer Status: {activeAssignments > 0 ? "Active" : "Available"}
            </span>
          </div>

          <h2 className="font-['Space_Grotesk'] text-3xl font-bold text-[#1b1b1e]">
            Good morning, {user?.name || "Volunteer"}
          </h2>

          <p className="mt-2 text-[#45464e]">
            Thank you for helping your community stay safe and prepared.
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          <button
            onClick={() => navigate("/volunteer/tasks")}
            className="flex items-center gap-2 rounded-xl border border-[#0e1a39]/20 bg-white px-5 py-2.5 font-semibold text-[#0e1a39] transition hover:bg-gray-50"
          >
            <span className="material-symbols-outlined">assignment</span>
            My Assignments
          </button>

          <button
            onClick={() => navigate("/volunteer/incident-map")}
            className="flex items-center gap-2 rounded-xl bg-[#4b41e1] px-5 py-2.5 font-semibold text-white shadow-md transition hover:bg-[#645efb]"
          >
            <span className="material-symbols-outlined">emergency</span>
            View Incidents
          </button>
        </div>
      </section>

      {/* ================= EMERGENCY STATUS ================= */}
      <section className="flex flex-col gap-5 rounded-[20px] border-l-[6px] border-[#FF9800] bg-white p-6 shadow-sm md:flex-row md:items-center">
        <div className="flex flex-1 items-start gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#FF9800]/10">
            <span className="material-symbols-outlined text-[#FF9800]">warning</span>
          </div>

          <div>
            <div className="flex flex-wrap items-center gap-3">
              <h3 className="font-['Space_Grotesk'] text-xl font-bold">
                Community Response Status
              </h3>

              <span
                className={`rounded-full px-3 py-1 text-xs font-bold ${
                  incidents.length > 0
                    ? "bg-[#FF9800]/10 text-[#FF9800]"
                    : "bg-[#4CAF50]/10 text-[#4CAF50]"
                }`}
              >
                {incidents.length > 0 ? "Elevated Activity" : "All Clear"}
              </span>
            </div>

            <p className="mt-2 text-[#45464e]">
              {incidents.length > 0
                ? `${incidents.length} incident${
                    incidents.length > 1 ? "s" : ""
                  } reported across Kathmandu Valley. Volunteers may be assigned to response activities.`
                : "No active incidents reported. Stay ready for any assignments."}
            </p>
          </div>
        </div>

        <div className="rounded-xl bg-[#f5f7fb] px-4 py-3 text-center">
          <p className="text-xs font-semibold uppercase text-[#76767f]">
            Active Volunteers
          </p>
          <p className="mt-1 text-2xl font-bold text-[#4CAF50]">
            {uniqueReporters || 1}
          </p>
        </div>
      </section>

      {/* ================= STATISTICS ================= */}
      <section className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {stats.map((stat) => (
          <div
            key={stat.title}
            className="flex min-h-[155px] flex-col justify-between rounded-[20px] bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-md"
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
              <div className={`text-3xl font-bold ${stat.valueColor}`}>
                {stat.value}
              </div>
              <p className="mt-1 text-xs text-[#45464e]">{stat.subtitle}</p>
            </div>
          </div>
        ))}
      </section>

      {/* ================= RECOMMENDED ================= */}
      {recommendedIncidents.length > 0 && (
        <section className="rounded-[20px] border border-gray-200 bg-white p-6 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="flex items-center gap-2 text-xl font-semibold">
              <span className="material-symbols-outlined text-[#4648d4]">
                person_search
              </span>
              Recommended for You
            </h3>
            <span className="text-xs text-[#45464e]">Based on your skills</span>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            {recommendedIncidents.map((inc) => (
              <div
                key={inc.id}
                className="rounded-xl border border-gray-200 p-4 transition hover:shadow-md"
              >
                <div className="flex items-start justify-between">
                  <h4 className="font-semibold">{inc.title || "Incident"}</h4>
                  <span
                    className={`rounded-full px-2 py-0.5 text-xs font-bold ${
                      inc.severity === "Critical" || inc.severity === "CRITICAL"
                        ? "bg-red-100 text-red-600"
                        : "bg-orange-100 text-orange-600"
                    }`}
                  >
                    {inc.severity || "Moderate"}
                  </span>
                </div>

                <p className="mt-1 text-sm text-[#45464e]">
                  {inc.location || "Unknown location"}
                </p>

                <div className="mt-3 flex items-center gap-2">
                  <span className="rounded bg-[#4b41e1]/10 px-2 py-0.5 text-xs text-[#4b41e1]">
                    {inc.matchCount} skills match
                  </span>
                </div>

                <button
                  onClick={() => navigate("/volunteer/tasks")}
                  className="mt-3 w-full rounded-lg bg-[#4648d4] py-2 text-sm text-white hover:bg-[#3d3fc4]"
                >
                  View Incident
                </button>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ================= ASSIGNMENTS + MAP ================= */}
      <section className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <div className="rounded-[20px] bg-white p-6 shadow-sm xl:col-span-2">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h3 className="font-['Space_Grotesk'] text-xl font-bold">
                My Assignments
              </h3>
              <p className="mt-1 text-sm text-[#45464e]">
                Your upcoming disaster response activities
              </p>
            </div>

            <button
              onClick={() => navigate("/volunteer/tasks")}
              className="rounded-lg bg-[#4b41e1]/10 px-4 py-2 text-sm font-semibold text-[#4b41e1] transition hover:bg-[#4b41e1]/20"
            >
              View All
            </button>
          </div>

          <div className="space-y-4">
            {assignments.map((assignment) => (
              <div
                key={assignment.id}
                className="flex flex-col gap-4 rounded-xl border border-gray-200 p-4 transition hover:bg-[#f5f7fb] md:flex-row md:items-center md:justify-between"
              >
                <div className="flex items-start gap-4">
                  <div
                    className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${assignment.bg}`}
                  >
                    <span className={`material-symbols-outlined ${assignment.color}`}>
                      {assignment.icon}
                    </span>
                  </div>

                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <h4 className="font-semibold text-[#1b1b1e]">
                        {assignment.title}
                      </h4>
                      <span
                        className={`rounded-full px-2.5 py-1 text-[10px] font-bold ${assignment.bg} ${assignment.color}`}
                      >
                        {assignment.status}
                      </span>
                    </div>

                    <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-sm text-[#45464e]">
                      <span className="flex items-center gap-1">
                        <span className="material-symbols-outlined text-[16px]">
                          location_on
                        </span>
                        {assignment.location}
                      </span>

                      <span className="flex items-center gap-1">
                        <span className="material-symbols-outlined text-[16px]">
                          schedule
                        </span>
                        {assignment.time}
                      </span>
                    </div>
                  </div>
                </div>

                <button className="rounded-lg border border-[#4b41e1]/30 px-4 py-2 text-sm font-semibold text-[#4b41e1] transition hover:bg-[#4b41e1] hover:text-white">
                  View Details
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Response Map */}
        <div className="flex min-h-[450px] flex-col rounded-[20px] bg-white p-6 shadow-sm">
          <div className="mb-5 flex items-center justify-between">
            <div>
              <h3 className="font-['Space_Grotesk'] text-xl font-bold">
                Response Map
              </h3>
              <p className="mt-1 text-sm text-[#45464e]">
                Nearby response activity
              </p>
            </div>

            <button className="text-[#45464e]">
              <span className="material-symbols-outlined">more_horiz</span>
            </button>
          </div>

          <div className="relative flex flex-1 items-center justify-center overflow-hidden rounded-xl border border-gray-200 bg-gradient-to-br from-[#dbeafe] via-[#e0f2fe] to-[#dcfce7]">
            {incidents.length > 0 && (
              <>
                <div className="absolute left-[30%] top-[35%] flex h-9 w-9 items-center justify-center rounded-full border-2 border-white bg-[#FF5252] text-white shadow-lg">
                  <span className="material-symbols-outlined text-[18px]">
                    emergency
                  </span>
                </div>
                <div className="absolute left-[60%] top-[45%] flex h-9 w-9 items-center justify-center rounded-full border-2 border-white bg-[#FF9800] text-white shadow-lg">
                  <span className="material-symbols-outlined text-[18px]">
                    warning
                  </span>
                </div>
                <div className="absolute left-[45%] top-[65%] flex h-9 w-9 items-center justify-center rounded-full border-2 border-white bg-[#4b41e1] text-white shadow-lg">
                  <span className="material-symbols-outlined text-[18px]">
                    volunteer_activism
                  </span>
                </div>
              </>
            )}

            <div className="text-center">
              <span className="material-symbols-outlined text-5xl text-[#4b41e1]/50">
                map
              </span>
              <p className="mt-3 font-semibold text-[#45464e]">
                Kathmandu Response Area
              </p>
              <p className="mt-1 px-6 text-sm text-[#76767f]">
                {incidents.length > 0
                  ? `${incidents.length} incident${
                      incidents.length > 1 ? "s" : ""
                    } in your area`
                  : "No active incidents nearby"}
              </p>
            </div>
          </div>

          <button
            onClick={() => navigate("/volunteer/incident-map")}
            className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-[#4b41e1]/10 py-3 font-semibold text-[#4b41e1] transition hover:bg-[#4b41e1]/20"
          >
            <span className="material-symbols-outlined">map</span>
            Open Response Map
          </button>
        </div>
      </section>

      {/* ================= ACTIVITY + QUICK ACTIONS ================= */}
      <section className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="rounded-[20px] bg-white p-6 shadow-sm lg:col-span-2">
          <div className="mb-6">
            <h3 className="font-['Space_Grotesk'] text-xl font-bold">
              Recent Activity
            </h3>
            <p className="mt-1 text-sm text-[#45464e]">
              Your latest volunteer activities
            </p>
          </div>

          <div className="space-y-5">
            {activities.map((activity, index) => (
              <div key={activity.title + index} className="flex gap-4">
                <div className="flex flex-col items-center">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#4b41e1]/10 text-[#4b41e1]">
                    <span className="material-symbols-outlined">{activity.icon}</span>
                  </div>
                  {index !== activities.length - 1 && (
                    <div className="mt-2 h-10 w-px bg-gray-200" />
                  )}
                </div>

                <div className="pb-2">
                  <h4 className="font-semibold">{activity.title}</h4>
                  <p className="mt-1 text-sm text-[#45464e]">
                    {activity.description}
                  </p>
                  <p className="mt-2 text-xs text-[#76767f]">{activity.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-[20px] bg-white p-6 shadow-sm">
          <h3 className="font-['Space_Grotesk'] text-xl font-bold">Quick Actions</h3>
          <p className="mt-1 text-sm text-[#45464e]">
            Manage your volunteer activities
          </p>

          <div className="mt-6 space-y-3">
            <QuickAction
              icon="emergency"
              iconColor="text-[#FF5252]"
              iconBg="bg-[#FF5252]/10"
              title="Report Emergency"
              subtitle="Report an incident immediately"
              onClick={() => navigate("/report-disaster")}
            />
            <QuickAction
              icon="fact_check"
              iconColor="text-[#4CAF50]"
              iconBg="bg-[#4CAF50]/10"
              title="Update Availability"
              subtitle="Change your response status"
              onClick={() => navigate("/volunteer/profile")}
            />
            <QuickAction
              icon="school"
              iconColor="text-[#4b41e1]"
              iconBg="bg-[#4b41e1]/10"
              title="Training Resources"
              subtitle="Improve your response skills"
            />
          </div>
        </div>
      </section>
    </VolunteerLayout>
  );
}

/* ---------- Small helper ---------- */

const QuickAction = ({ icon, iconColor, iconBg, title, subtitle, onClick }) => (
  <button
    onClick={onClick}
    className="flex w-full items-center gap-3 rounded-xl border border-gray-200 p-4 text-left transition hover:bg-[#f5f7fb]"
  >
    <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${iconBg}`}>
      <span className={`material-symbols-outlined ${iconColor}`}>{icon}</span>
    </div>

    <div>
      <p className="font-semibold">{title}</p>
      <p className="text-xs text-[#76767f]">{subtitle}</p>
    </div>
  </button>
);

export default VolunteerDashboard;