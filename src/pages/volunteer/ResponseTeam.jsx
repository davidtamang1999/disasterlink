import { useState, useEffect } from "react";
import VolunteerLayout from "../../layouts/VolunteerLayout";
import { useDisaster } from "../../context/DisasterContext";
import { useAuth } from "../../context/AuthContext";

function ResponseTeam() {
  const { incidents } = useDisaster();
  const { currentUser } = useAuth();

  const [teamMembers, setTeamMembers] = useState([]);
  const [operations, setOperations] = useState([]);
  const [activities, setActivities] = useState([]);
  const [teamStats, setTeamStats] = useState({
    total: 0,
    available: 0,
    onAssignment: 0,
    resting: 0,
    offline: 0,
  });

  // Load team data
  useEffect(() => {
    loadTeamData();
    generateActivities();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [incidents]);

  const loadTeamData = () => {
    const allUsers = JSON.parse(localStorage.getItem("users") || "[]");
    const volunteers = allUsers.filter((u) => u.role === "volunteer");

    if (volunteers.length === 0) {
      setDefaultTeamData();
      return;
    }

    const members = volunteers.map((volunteer, index) => {
      const statuses = ["Available", "On Assignment", "Resting", "Offline"];
      const status = volunteer.status || statuses[index % statuses.length];
      const roles = ["Team Member", "Team Leader", "Rescue Specialist", "Medical Support"];

      return {
        id: volunteer.id,
        name: volunteer.fullName || `Volunteer ${index + 1}`,
        role: `${roles[index % roles.length]} • Active ${Math.floor(Math.random() * 30) + 1}m ago`,
        status,
        statusClass: getStatusClass(status),
        dot: getDotColor(status),
        image:
          volunteer.image ||
          `https://ui-avatars.com/api/?name=${encodeURIComponent(
            volunteer.fullName || "Volunteer"
          )}&background=4648d4&color=fff`,
        action: status === "Available" ? "person" : "task",
      };
    });

    if (members.length > 0 && !members.find((m) => m.status === "Team Leader")) {
      const leader = members[0];
      leader.status = "Leader";
      leader.statusClass = "bg-[#0e1a39] text-white";
      leader.dot = "bg-[#22c55e]";
    }

    setTeamMembers(members);
    calculateTeamStats(members);
    generateOperations();
  };

  const setDefaultTeamData = () => {
    const defaultMembers = [
      {
        name: "Maya Shrestha",
        role: "Command Center • Active 2m ago",
        status: "Leader",
        statusClass: "bg-[#0e1a39] text-white",
        dot: "bg-[#22c55e]",
        image: "https://ui-avatars.com/api/?name=Maya+Shrestha&background=0e1a39&color=fff",
        action: "person",
      },
      {
        name: "Suman Rai",
        role: "Teku Rescue • Active 5m ago",
        status: "On Assignment",
        statusClass: "bg-[#f97316]/10 text-[#f97316]",
        dot: "bg-[#f97316]",
        image: "https://ui-avatars.com/api/?name=Suman+Rai&background=f97316&color=fff",
        action: "task",
      },
      {
        name: "Priya Thapa",
        role: "Baneshwor Evacuation • Active 1m ago",
        status: "At Incident",
        statusClass: "bg-[#4648d4]/10 text-[#4648d4]",
        dot: "bg-[#4648d4]",
        image: "https://ui-avatars.com/api/?name=Priya+Thapa&background=4648d4&color=fff",
        action: "task",
      },
    ];

    setTeamMembers(defaultMembers);
    calculateTeamStats(defaultMembers);

    setOperations([
      {
        priority: "Critical Priority",
        title: "Teku Flood Response",
        deployment: "8/10 Deployed",
        progress: "65% Progress",
        progressWidth: "w-[65%]",
        eta: "ETA: 45m",
        color: "text-[#ba1a1a]",
        bg: "bg-[#ba1a1a]/5",
        border: "border-[#ba1a1a]/20",
        bar: "bg-[#ba1a1a]",
        icon: "warning",
      },
      {
        priority: "High Priority",
        title: "Baneshwor Evacuation",
        deployment: "4/4 Deployed",
        progress: "80% Progress",
        progressWidth: "w-[80%]",
        eta: "ETA: 20m",
        color: "text-[#f97316]",
        bg: "bg-[#f97316]/5",
        border: "border-[#f97316]/20",
        bar: "bg-[#f97316]",
        icon: null,
      },
    ]);
  };

  const calculateTeamStats = (members) => {
    const stats = {
      total: members.length,
      available: members.filter((m) => m.status === "Available" || m.status === "Active").length,
      onAssignment: members.filter((m) => m.status === "On Assignment" || m.status === "At Incident").length,
      resting: members.filter((m) => m.status === "Resting").length,
      offline: members.filter((m) => m.status === "Offline").length,
    };
    setTeamStats(stats);
  };

  const getStatusClass = (status) => {
    const classes = {
      Available: "bg-[#22c55e]/10 text-[#22c55e]",
      "On Assignment": "bg-[#f97316]/10 text-[#f97316]",
      "At Incident": "bg-[#4648d4]/10 text-[#4648d4]",
      Resting: "bg-[#76767f]/10 text-[#76767f]",
      Offline: "bg-[#1b1b1e]/10 text-[#1b1b1e]",
      Leader: "bg-[#0e1a39] text-white",
    };
    return classes[status] || "bg-gray-100 text-gray-600";
  };

  const getDotColor = (status) => {
    const colors = {
      Available: "bg-[#22c55e]",
      "On Assignment": "bg-[#f97316]",
      "At Incident": "bg-[#4648d4]",
      Resting: "bg-[#76767f]",
      Offline: "bg-[#1b1b1e]",
      Leader: "bg-[#22c55e]",
    };
    return colors[status] || "bg-gray-400";
  };

  const generateOperations = () => {
    const activeIncidents = incidents.filter((inc) => inc.status !== "Resolved");

    if (activeIncidents.length === 0) {
      setOperations([
        {
          priority: "Standby Mode",
          title: "No Active Operations",
          deployment: "Ready for deployment",
          progress: "100% Progress",
          progressWidth: "w-[100%]",
          eta: "Ready",
          color: "text-[#22c55e]",
          bg: "bg-[#22c55e]/5",
          border: "border-[#22c55e]/20",
          bar: "bg-[#22c55e]",
          icon: "check_circle",
        },
      ]);
      return;
    }

    const newOperations = activeIncidents.slice(0, 3).map((incident) => {
      const priority =
        incident.severity === "Critical" || incident.severity === "CRITICAL"
          ? "Critical Priority"
          : incident.severity === "High"
          ? "High Priority"
          : "Moderate Priority";

      const progress = Math.floor(Math.random() * 60 + 20);
      const totalVolunteers = Math.floor(Math.random() * 8 + 4);
      const deployed = Math.floor(Math.random() * totalVolunteers + 1);

      return {
        priority,
        title: incident.title || "Active Incident",
        deployment: `${deployed}/${totalVolunteers} Deployed`,
        progress: `${progress}% Progress`,
        progressWidth: `w-[${progress}%]`,
        eta: `ETA: ${Math.floor(Math.random() * 60 + 15)}m`,
        color:
          priority === "Critical Priority" ? "text-[#ba1a1a]" :
          priority === "High Priority" ? "text-[#f97316]" : "text-[#76767f]",
        bg:
          priority === "Critical Priority" ? "bg-[#ba1a1a]/5" :
          priority === "High Priority" ? "bg-[#f97316]/5" : "bg-[#fbf8fc]",
        border:
          priority === "Critical Priority" ? "border-[#ba1a1a]/20" :
          priority === "High Priority" ? "border-[#f97316]/20" : "border-[#76767f]/20",
        bar:
          priority === "Critical Priority" ? "bg-[#ba1a1a]" :
          priority === "High Priority" ? "bg-[#f97316]" : "bg-[#76767f]",
        icon: priority === "Critical Priority" ? "warning" : null,
        incidentId: incident.id,
      };
    });

    setOperations(newOperations);
  };

  const generateActivities = () => {
    const activitiesList = [
      {
        icon: "assignment_ind",
        color: "text-[#f97316]",
        title: "Team member assigned",
        description: "To active incident • 2m ago",
      },
      {
        icon: "location_on",
        color: "text-[#4648d4]",
        title: "Response team arrived",
        description: "At incident location • 8m ago",
      },
      {
        icon: "person_add",
        color: "text-[#22c55e]",
        title: "New volunteer joined",
        description: "Added to response team • 15m ago",
      },
      {
        icon: "local_shipping",
        color: "text-[#0e1a39]",
        title: "Resource delivery",
        description: "Supplies delivered • 1h ago",
      },
    ];

    if (incidents.length > 0) {
      const recentIncidents = incidents.filter((inc) => inc.status !== "Resolved").slice(0, 2);

      recentIncidents.forEach((incident, index) => {
        activitiesList.unshift({
          icon: "emergency",
          color:
            incident.severity === "Critical" || incident.severity === "CRITICAL"
              ? "text-[#ba1a1a]"
              : "text-[#f97316]",
          title: `Incident update: ${incident.title}`,
          description: `${incident.location || "Unknown location"} • ${index === 0 ? "Just now" : "5m ago"}`,
        });
      });
    }

    setActivities(activitiesList.slice(0, 4));
  };

  const getUserInitials = (name) => {
    if (!name) return "V";
    const parts = name.split(" ");
    if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    return name.substring(0, 2).toUpperCase();
  };

  return (
    <VolunteerLayout title="Response Team">
      <div className="mx-auto max-w-[1440px] space-y-8">

        {/* ================= PAGE HEADER ================= */}
        <section className="flex flex-col justify-between gap-4 md:flex-row md:items-start">
          <div>
            <h1 className="font-['Space_Grotesk'] text-3xl font-bold text-[#1b1b1e] md:text-4xl">
              Response Team
            </h1>
            <p className="mt-2 max-w-2xl text-[#45464e]">
              Coordinate with your team and stay informed about ongoing response activities.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <button className="flex items-center gap-2 rounded-xl border border-[#0e1a39]/20 bg-white px-4 py-2.5 text-sm font-semibold transition hover:bg-gray-50">
              <span className="material-symbols-outlined text-[18px]">settings</span>
              Team Settings
            </button>

            <button className="flex items-center gap-2 rounded-xl bg-[#4648d4] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#4648d4]/90">
              <span className="material-symbols-outlined text-[18px]">chat</span>
              Contact Team
            </button>
          </div>
        </section>

        {/* ================= TOP GRID ================= */}
        <section className="grid grid-cols-1 gap-6 md:grid-cols-12">

          {/* Team Overview */}
          <div className="rounded-[20px] bg-white p-6 shadow-sm md:col-span-8">
            <div className="mb-5 flex flex-col gap-4 border-b border-gray-200 pb-5 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <div className="flex flex-wrap items-center gap-3">
                  <h2 className="font-['Space_Grotesk'] text-xl font-bold">
                    Kathmandu Volunteer Response Team
                  </h2>
                  <span className="flex items-center gap-2 rounded-full border border-[#22c55e]/20 bg-[#22c55e]/10 px-3 py-1 text-xs font-bold text-[#22c55e]">
                    <span className="h-1.5 w-1.5 rounded-full bg-[#22c55e]" />
                    Active
                  </span>
                </div>
                <p className="mt-2 text-sm text-[#45464e]">
                  ID: CRT-KTM-004 • Area: Kathmandu Valley
                </p>
              </div>

              {teamMembers.find((m) => m.status === "Leader") && (
                <div className="flex items-center gap-3 rounded-lg bg-[#f6f2f7] px-4 py-3">
                  {teamMembers.find((m) => m.status === "Leader").image ? (
                    <img
                      src={teamMembers.find((m) => m.status === "Leader").image}
                      alt="Team Leader"
                      className="h-10 w-10 rounded-full object-cover"
                    />
                  ) : (
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#0e1a39] font-bold text-white">
                      {getUserInitials(teamMembers.find((m) => m.status === "Leader").name)}
                    </div>
                  )}
                  <div>
                    <p className="text-sm font-semibold">
                      {teamMembers.find((m) => m.status === "Leader").name}
                    </p>
                    <p className="text-xs text-[#45464e]">Team Leader</p>
                  </div>
                </div>
              )}
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              <StatTile value={teamStats.total} label="Total" dot="bg-[#22c55e]" color="text-[#22c55e]" />
              <StatTile value={teamStats.available} label="Available" dot="bg-[#22c55e]" color="text-[#22c55e]" />
              <StatTile value={teamStats.onAssignment} label="On Assignment" dot="bg-[#f97316]" color="text-[#f97316]" />
              <StatTile value={teamStats.offline} label="Offline" dot="bg-[#76767f]" color="text-[#76767f]" />
            </div>
          </div>

          {/* Current Operations */}
          <div className="flex flex-col rounded-[20px] bg-white p-6 shadow-sm md:col-span-4">
            <h3 className="mb-5 font-['Space_Grotesk'] text-xl font-bold">Current Operations</h3>

            <div className="space-y-3">
              {operations.map((operation) => (
                <div
                  key={operation.title}
                  className={`space-y-3 rounded-xl border p-4 transition hover:-translate-y-0.5 hover:shadow-md ${operation.bg} ${operation.border}`}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <p className={`text-[10px] font-bold uppercase tracking-wider ${operation.color}`}>
                        {operation.priority}
                      </p>
                      <h4 className="mt-1 font-semibold">{operation.title}</h4>
                    </div>
                    {operation.icon && (
                      <span className={`material-symbols-outlined ${operation.color}`}>
                        {operation.icon}
                      </span>
                    )}
                  </div>

                  <div className="flex justify-between text-sm text-[#45464e]">
                    <span>{operation.deployment}</span>
                    <span>{operation.progress}</span>
                  </div>

                  <div className="h-1.5 w-full overflow-hidden rounded-full bg-gray-200">
                    <div className={`h-full rounded-full ${operation.progressWidth} ${operation.bar}`} />
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    <span className="text-xs text-[#45464e]">{operation.eta}</span>
                    <button className="text-xs font-bold text-[#4648d4] hover:underline">
                      View Operation
                    </button>
                  </div>
                </div>
              ))}

              {operations.length === 0 && (
                <div className="py-6 text-center text-[#45464e]">
                  <span className="material-symbols-outlined mb-2 block text-4xl text-gray-300">
                    check_circle
                  </span>
                  <p>No active operations</p>
                </div>
              )}
            </div>
          </div>

          {/* Team Roster */}
          <div className="rounded-[20px] bg-white p-6 shadow-sm md:col-span-7">
            <div className="mb-5 flex items-center justify-between border-b border-gray-200 pb-3">
              <h3 className="font-['Space_Grotesk'] text-xl font-bold">Team Roster</h3>
              <button className="text-sm font-bold text-[#4648d4] hover:underline">
                View All ({teamMembers.length})
              </button>
            </div>

            <div className="space-y-4">
              {teamMembers.length > 0 ? (
                teamMembers.map((member, index) => (
                  <div
                    key={member.id || member.name}
                    className={`flex flex-col gap-4 rounded-lg p-3 transition hover:bg-[#f6f2f7] sm:flex-row sm:items-center sm:justify-between ${
                      index !== teamMembers.length - 1 ? "border-b border-gray-200" : ""
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <div className="relative">
                        {member.image ? (
                          <img
                            src={member.image}
                            alt={member.name}
                            className="h-12 w-12 rounded-full object-cover"
                          />
                        ) : (
                          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#4648d4] font-bold text-white">
                            {getUserInitials(member.name)}
                          </div>
                        )}
                        <span className={`absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-white ${member.dot}`} />
                      </div>

                      <div>
                        <p className="font-semibold">
                          {member.name}
                          <span className={`ml-2 rounded px-2 py-1 text-[10px] ${member.statusClass}`}>
                            {member.status}
                          </span>
                        </p>
                        <p className="mt-1 text-sm text-[#45464e]">{member.role}</p>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <button className="rounded-lg border border-gray-300 p-2 transition hover:bg-gray-100">
                        <span className="material-symbols-outlined text-[18px]">
                          {member.action || "person"}
                        </span>
                      </button>
                      <button className="rounded-lg border border-gray-300 p-2 transition hover:bg-gray-100">
                        <span className="material-symbols-outlined text-[18px]">chat</span>
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="py-6 text-center text-[#45464e]">
                  <span className="material-symbols-outlined mb-2 block text-4xl text-gray-300">
                    person_search
                  </span>
                  <p>No team members found</p>
                  <p className="text-sm">Invite volunteers to join your team</p>
                </div>
              )}
            </div>
          </div>

          {/* Live Location Map */}
          <div className="flex min-h-[400px] flex-col rounded-[20px] bg-white p-4 shadow-sm md:col-span-5">
            <h3 className="mb-4 px-2 font-['Space_Grotesk'] text-xl font-bold">
              Live Location Tracking
            </h3>

            <div className="relative flex-1 overflow-hidden rounded-xl bg-[#eae7eb]">
              <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-[#dbeafe] via-[#e0f2fe] to-[#dcfce7]">
                <div className="text-center">
                  <span className="material-symbols-outlined mb-2 block text-6xl text-[#4648d4]/30">
                    map
                  </span>
                  <p className="text-sm text-[#45464e]">Team Locations</p>
                  <p className="text-xs text-[#76767f]">
                    {teamMembers.length} members online
                  </p>
                </div>

                <div className="pointer-events-none absolute inset-0">
                  {teamMembers.slice(0, 5).map((member, idx) => {
                    const colors = ["#0e1a39", "#22c55e", "#f97316", "#4648d4", "#ba1a1a"];
                    return (
                      <div
                        key={idx}
                        className="absolute flex h-4 w-4 animate-pulse items-center justify-center rounded-full border-2 border-white shadow-md"
                        style={{
                          backgroundColor: colors[idx % colors.length],
                          left: `${15 + Math.random() * 70}%`,
                          top: `${15 + Math.random() * 70}%`,
                        }}
                      >
                        <span className="material-symbols-outlined text-[8px] text-white">
                          person
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="absolute left-4 top-4 space-y-2 rounded-lg border border-gray-200 bg-white/90 p-3 text-xs shadow-sm backdrop-blur">
                <LegendItem color="bg-[#0e1a39]" label="Base" />
                <LegendItem color="bg-[#22c55e]" label="Available" />
                <LegendItem color="bg-[#f97316]" label="On Assignment" />
                <LegendItem color="bg-[#4648d4]" label="At Incident" />
              </div>
            </div>
          </div>

          {/* Activity Feed */}
          <div className="rounded-[20px] bg-white p-6 shadow-sm md:col-span-12">
            <h3 className="mb-5 border-b border-gray-200 pb-3 font-['Space_Grotesk'] text-xl font-bold">
              Team Activity Feed
            </h3>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
              {activities.length > 0 ? (
                activities.map((activity) => (
                  <div
                    key={activity.title}
                    className="flex items-start gap-3 rounded-lg bg-[#f6f2f7] p-4"
                  >
                    <span className={`material-symbols-outlined ${activity.color}`}>
                      {activity.icon}
                    </span>
                    <div>
                      <p className="text-sm font-semibold">{activity.title}</p>
                      <p className="mt-1 text-sm text-[#45464e]">{activity.description}</p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="col-span-full py-4 text-center text-[#45464e]">
                  <span className="material-symbols-outlined mb-1 block text-2xl text-gray-300">
                    activity
                  </span>
                  <p className="text-sm">No recent activity</p>
                </div>
              )}
            </div>
          </div>
        </section>
      </div>
    </VolunteerLayout>
  );
}

/* ---------- Small helpers ---------- */

const StatTile = ({ value, label, dot, color }) => (
  <div className="rounded-xl border border-gray-200 bg-[#fbf8fc] p-4 text-center transition hover:-translate-y-0.5 hover:shadow-md">
    <p className="font-['Space_Grotesk'] text-3xl font-bold">{value}</p>
    <p className={`mt-2 flex items-center justify-center gap-2 text-xs font-bold ${color}`}>
      <span className={`h-2 w-2 rounded-full ${dot}`} />
      {label}
    </p>
  </div>
);

const LegendItem = ({ color, label }) => (
  <div className="flex items-center gap-2">
    <span className={`h-2 w-2 rounded-full ${color}`} />
    {label}
  </div>
);

export default ResponseTeam;