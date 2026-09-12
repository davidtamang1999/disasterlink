import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import VolunteerLayout from "../../layouts/VolunteerLayout";
import { useAuth } from "../../context/AuthContext";
import { useUsers } from "../../context/UserContext";
import { useDisaster } from "../../context/DisasterContext";
import { useToast } from "../../components/shared";

function Profile() {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const { users, updateUser, getInitials } = useUsers();
  const { incidents } = useDisaster();
  const toast = useToast();

  const [showAvailabilityModal, setShowAvailabilityModal] = useState(false);
  const [newAvailability, setNewAvailability] = useState("Available");
  const [showEditModal, setShowEditModal] = useState(false);
  const [editFormData, setEditFormData] = useState({
    fullName: "",
    phone: "",
    location: "",
    skills: [],
    preferredAreas: [],
    maxTravelDistance: "5 km",
    emergencyContact: "",
    emergencyPhone: "",
  });

  // ---------- Find this user in the shared context ----------
  const userData = users.find((u) => u.id === currentUser?.id) || null;

  // ---------- Redirect if not logged in ----------
  useEffect(() => {
    if (!currentUser) navigate("/login");
  }, [currentUser, navigate]);

  // ---------- Sync edit form when userData changes ----------
  useEffect(() => {
    if (!userData) return;
    setEditFormData({
      fullName: userData.fullName || "",
      phone: userData.phone || "",
      location: userData.location || "",
      skills: userData.skills || ["Flood Rescue", "Evacuation Assistance", "First Aid"],
      preferredAreas: userData.preferredAreas || ["Kathmandu", "Lalitpur", "Bhaktapur"],
      maxTravelDistance: userData.maxTravelDistance || "5 km",
      emergencyContact: userData.emergencyContact || "",
      emergencyPhone: userData.emergencyPhone || "",
    });
  }, [userData]);

  // ---------- Derived helpers ----------
  const getAssignedIncidents = () =>
    userData
      ? incidents.filter(
          (inc) =>
            inc.assignedTo === userData.id ||
            inc.volunteerId === userData.id ||
            inc.responders?.includes(userData.id)
        )
      : [];

  const getCompletedTasks = () =>
    getAssignedIncidents().filter((inc) => inc.status === "Resolved");

  const getPeopleAssisted = () =>
    getAssignedIncidents().reduce(
      (sum, inc) => sum + (parseInt(inc.peopleAffected) || 0),
      0
    );

  const getResponseHours = () => (getCompletedTasks().length * 1.5).toFixed(1);

  const getReliabilityScore = () => {
    const completed = getCompletedTasks().length;
    const total = getAssignedIncidents().length;
    if (total === 0) return 4.5;
    return (4 + (completed / total) * 0.8).toFixed(1);
  };

  const getVolunteerId = () => {
    if (!userData) return "VOL-000000";
    if (typeof userData.id === "string" && userData.id.startsWith("admin")) {
      return userData.id;
    }
    return `VOL-${String(userData.id).padStart(6, "0")}`;
  };

  const getMemberSince = () => {
    if (!userData?.createdAt) return "Jan 2026";
    const date = new Date(userData.createdAt);
    return date.toLocaleDateString("en-US", { month: "short", year: "numeric" });
  };

  // ---------- Mutations ----------
  const toggleAvailability = async (newStatus) => {
    if (!userData) return;
    await updateUser(userData.id, { status: newStatus });
    setShowAvailabilityModal(false);
    toast.success(`Availability updated to ${newStatus}`);
  };

  const handleSaveEdit = async () => {
    if (!userData) return;
    await updateUser(userData.id, { ...editFormData });
    setShowEditModal(false);
    toast.success("Profile updated successfully");
  };

  const toggleSkill = (skill) => {
    setEditFormData((prev) => ({
      ...prev,
      skills: prev.skills.includes(skill)
        ? prev.skills.filter((s) => s !== skill)
        : [...prev.skills, skill],
    }));
  };

  const toggleArea = (area) => {
    setEditFormData((prev) => ({
      ...prev,
      preferredAreas: prev.preferredAreas.includes(area)
        ? prev.preferredAreas.filter((a) => a !== area)
        : [...prev.preferredAreas, area],
    }));
  };

  const availableSkills = [
    "Flood Rescue",
    "Evacuation Assistance",
    "First Aid",
    "Logistics",
    "Food Distribution",
    "Emergency Assessment",
    "Search & Rescue",
    "Paramedic",
    "Triage",
    "Comms",
  ];
  const availableAreas = ["Kathmandu", "Lalitpur", "Bhaktapur", "Pokhara", "Chitwan"];
  const distanceOptions = ["1 km", "3 km", "5 km", "10 km", "Any Distance"];

  // ---------- Loading / not found ----------
  if (!currentUser) return null;

  if (!userData) {
    return (
      <VolunteerLayout title="My Profile">
        <div className="flex items-center justify-center py-32">
          <div className="text-center">
            <div className="mx-auto mb-4 h-16 w-16 animate-spin rounded-full border-4 border-[#4648d4] border-t-transparent" />
            <p className="text-gray-500">Loading profile...</p>
          </div>
        </div>
      </VolunteerLayout>
    );
  }

  const completedTasks = getCompletedTasks();
  const peopleAssisted = getPeopleAssisted();
  const responseHours = getResponseHours();
  const reliabilityScore = getReliabilityScore();
  const assignedIncidents = getAssignedIncidents();

  const recentActivity = [...assignedIncidents]
    .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
    .slice(0, 5);

  const initials = userData.fullName
    ? userData.fullName.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
    : "V";

  // ---------- Header extras ----------
  const headerExtras = (
    <button
      onClick={() => setShowEditModal(true)}
      className="hidden items-center gap-2 rounded-lg bg-[#4648d4] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#6063ee] sm:flex"
    >
      <span className="material-symbols-outlined text-[18px]">edit</span>
      Edit Profile
    </button>
  );

  return (
    <VolunteerLayout title="My Profile" headerRight={headerExtras}>
      <div className="mx-auto max-w-[1440px] space-y-6">

        {/* ================= PAGE HEADER ================= */}
        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
          <div>
            <h2 className="text-4xl font-bold leading-tight tracking-tight md:text-5xl">
              My Profile
            </h2>
            <p className="mt-1 max-w-2xl text-[#45464e]">
              Manage your volunteer information, availability, skills, and response preferences.
            </p>
          </div>

          <button
            onClick={() => setShowEditModal(true)}
            className="flex-shrink-0 rounded-xl bg-[#4648d4] px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#6063ee]"
          >
            Edit Profile
          </button>
        </div>

        {/* ================= PROFILE HEADER CARD ================= */}
        <div className="relative overflow-hidden rounded-[20px] border border-[#eae7eb] bg-white p-6 shadow-[0px_4px_20px_rgba(11,23,54,0.05)] lg:p-8">
          <div className="pointer-events-none absolute right-0 top-0 h-64 w-64 -translate-y-1/2 translate-x-1/4 rounded-full bg-[#4648d4]/5 blur-3xl" />

          <div className="relative z-10 flex flex-col items-start gap-6 md:flex-row md:items-center">
            <div className="flex h-28 w-28 flex-shrink-0 items-center justify-center overflow-hidden rounded-2xl border-4 border-white bg-[#4648d4]/10 text-5xl font-bold text-[#4648d4] shadow-md ring-1 ring-[#c6c6cf] md:h-40 md:w-40">
              {initials}
            </div>

            <div className="flex-1">
              <div className="mb-1 flex flex-wrap items-center gap-3">
                <h3 className="text-3xl font-bold">{userData.fullName || "Volunteer"}</h3>
                <span className="rounded-full bg-[#f0edf1] px-3 py-1 text-xs font-bold text-[#45464e]">
                  {getVolunteerId()}
                </span>
              </div>

              <p className="mb-4 flex items-center gap-2 text-sm font-semibold text-[#4648d4]">
                <span className="material-symbols-outlined text-[18px]">verified_user</span>
                Disaster Response Volunteer
              </p>

              <div className="mb-4 flex flex-wrap gap-4 text-sm text-[#45464e]">
                <div className="flex items-center gap-1">
                  <span className="material-symbols-outlined text-[16px]">calendar_today</span>
                  Member since {getMemberSince()}
                </div>
                <div className="flex items-center gap-1">
                  <span className="material-symbols-outlined text-[16px]">location_on</span>
                  Response Area: {userData.location || "N/A"}
                </div>
              </div>
            </div>

            <AvailabilityCard
              userData={userData}
              onOpen={() => setShowAvailabilityModal(true)}
            />
          </div>
        </div>

        {/* ================= BENTO GRID ================= */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
          {/* LEFT COLUMN */}
          <div className="space-y-6 lg:col-span-7">

            <Card title="Personal Information" icon="badge" onEdit={() => setShowEditModal(true)}>
              <div className="mb-8 grid grid-cols-1 gap-x-12 gap-y-6 sm:grid-cols-2">
                <div className="space-y-6">
                  <FieldValue label="Full Name" value={userData.fullName || "N/A"} />
                  <FieldValue label="Phone Number" value={userData.phone || "N/A"} />
                </div>
                <div className="space-y-6">
                  <FieldValue label="Email Address" value={userData.email || "N/A"} />
                  <FieldValue label="Primary Address" value={userData.location || "N/A"} />
                </div>
              </div>

              <div className="flex flex-col items-start justify-between gap-4 rounded-2xl border border-[#4648d4]/10 bg-[#4648d4]/5 p-4 sm:flex-row sm:items-center">
                <div className="flex items-center gap-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#4648d4]/10 text-[#4648d4]">
                    <span className="material-symbols-outlined">contact_emergency</span>
                  </div>
                  <div>
                    <div className="text-[11px] font-bold uppercase tracking-wider text-[#45464e]">
                      Emergency Contact
                    </div>
                    <div className="font-bold">
                      {userData.emergencyContact || "Not set"}
                    </div>
                  </div>
                </div>
                <div className="font-medium text-[#4648d4]">
                  {userData.emergencyPhone || "N/A"}
                </div>
              </div>
            </Card>

            <Card title="Response Skills" icon="build">
              <div className="flex flex-wrap gap-3">
                {(userData.skills || []).map((skill) => (
                  <div
                    key={skill}
                    className="flex items-center gap-2 rounded-xl bg-[#4648d4] px-4 py-2 text-sm font-bold text-white shadow-sm"
                  >
                    <span className="material-symbols-outlined text-[18px]">
                      {getSkillIcon(skill)}
                    </span>
                    {skill}
                  </div>
                ))}

                {(!userData.skills || userData.skills.length === 0) && (
                  <div className="text-sm text-[#45464e]">
                    No skills added yet. Edit your profile to add skills.
                  </div>
                )}
              </div>
            </Card>

            <Card title="Recent Activity" icon="history">
              <div className="relative space-y-6 before:absolute before:bottom-2 before:left-[11px] before:top-2 before:w-0.5 before:bg-[#eae7eb]">
                {recentActivity.length > 0 ? (
                  recentActivity.map((incident) => (
                    <div key={incident.id} className="relative pl-8">
                      <div
                        className={`absolute left-0 top-1.5 flex h-6 w-6 items-center justify-center rounded-full ring-4 ring-white ${
                          incident.status === "Resolved"
                            ? "bg-[#22c55e]"
                            : incident.status === "In Progress"
                            ? "bg-[#FF9800]"
                            : "bg-[#4648d4]"
                        }`}
                      >
                        <span className="material-symbols-outlined text-[14px] text-white">
                          {incident.status === "Resolved" && "check"}
                          {incident.status === "In Progress" && "sync"}
                          {incident.status === "Pending" && "pending"}
                          {incident.status === "Assigned" && "assignment"}
                          {!["Resolved", "In Progress", "Pending", "Assigned"].includes(
                            incident.status
                          ) && "task"}
                        </span>
                      </div>

                      <div className="text-sm font-bold">
                        {incident.status === "Resolved"
                          ? `Completed: ${incident.title}`
                          : incident.status === "In Progress"
                          ? `Working on: ${incident.title}`
                          : `Assigned to: ${incident.title}`}
                      </div>

                      <div className="text-xs text-[#45464e]">
                        {incident.timestamp
                          ? new Date(incident.timestamp).toLocaleDateString() +
                            " at " +
                            new Date(incident.timestamp).toLocaleTimeString()
                          : "Recently"}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="py-4 text-center text-[#45464e]">
                    <span className="material-symbols-outlined mb-2 block text-4xl text-gray-300">
                      history
                    </span>
                    <p>No recent activity</p>
                    <p className="text-sm">You haven't been assigned to any incidents yet</p>
                  </div>
                )}
              </div>
            </Card>
          </div>

          {/* RIGHT COLUMN */}
          <div className="space-y-6 lg:col-span-5">
            <div className="relative overflow-hidden rounded-[20px] bg-[#0e1a39] p-6 text-white shadow-md">
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-[#4648d4]/30 via-transparent to-transparent" />

              <h4 className="relative z-10 mb-8 flex items-center gap-2 text-xl font-semibold">
                <span className="material-symbols-outlined text-[#c0c1ff]">monitoring</span>
                My Response Impact
              </h4>

              <div className="relative z-10 grid grid-cols-2 gap-4">
                <ImpactTile icon="task_alt" value={completedTasks.length} label="Tasks Completed" />
                <ImpactTile
                  icon="volunteer_activism"
                  value={peopleAssisted.toLocaleString()}
                  label="People Assisted"
                />
                <ImpactTile icon="schedule" value={responseHours} suffix="h" label="Response Time" />
                <ImpactTile
                  icon="star"
                  value={reliabilityScore}
                  suffix="/5"
                  suffixClass="text-[#bac5ed]"
                  label="Reliability"
                />
              </div>
            </div>

            <Card title="Preferred Response Areas" icon="map">
              <div className="mb-8 grid grid-cols-1 gap-3">
                {(userData.preferredAreas || ["Kathmandu", "Lalitpur", "Bhaktapur"]).map(
                  (area) => (
                    <div
                      key={area}
                      className="flex items-center justify-between rounded-2xl border-2 border-[#4648d4] bg-[#4648d4]/5 p-4"
                    >
                      <div className="flex items-center gap-3">
                        <span className="material-symbols-outlined text-[#4648d4]">
                          location_on
                        </span>
                        <span className="text-sm font-bold">{area}</span>
                      </div>
                      <span className="material-symbols-outlined text-[#4648d4]">
                        check_circle
                      </span>
                    </div>
                  )
                )}
              </div>

              <div>
                <label className="mb-3 block text-[11px] font-bold uppercase tracking-wider text-[#45464e]">
                  Maximum Travel Distance
                </label>
                <div className="w-full rounded-xl border border-[#c6c6cf] bg-[#f6f2f7] px-4 py-3 text-sm font-medium">
                  {userData.maxTravelDistance || "5 km"}
                </div>
              </div>
            </Card>

            <Card
              title="Verification"
              icon="verified"
              iconColor="text-[#22c55e]"
              trailing={
                <span
                  className={`rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-widest ${
                    userData.verification === "Verified"
                      ? "bg-[#22c55e]/10 text-[#22c55e]"
                      : "bg-[#FF9800]/10 text-[#FF9800]"
                  }`}
                >
                  {userData.verification || "Unverified"}
                </span>
              }
            >
              <div className="space-y-4">
                {[
                  { label: "Identity Verified", verified: userData.verification === "Verified" },
                  { label: "Emergency Contact Added", verified: !!userData.emergencyContact },
                  {
                    label: "Skills Profile Complete",
                    verified: (userData.skills || []).length > 0,
                  },
                  { label: "Location Verified", verified: !!userData.location },
                ].map((item) => (
                  <div key={item.label} className="flex items-center gap-3">
                    <span
                      className={`material-symbols-outlined text-[20px] ${
                        item.verified ? "text-[#22c55e]" : "text-[#c6c6cf]"
                      }`}
                    >
                      {item.verified ? "check_circle" : "radio_button_unchecked"}
                    </span>
                    <span
                      className={`text-sm font-medium ${
                        item.verified ? "text-[#1b1b1e]" : "text-[#45464e]"
                      }`}
                    >
                      {item.label}
                    </span>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </div>
      </div>

      {/* ================= AVAILABILITY MODAL ================= */}
      {showAvailabilityModal && (
        <Modal title="Change Availability" onClose={() => setShowAvailabilityModal(false)}>
          <p className="text-sm text-[#45464e]">
            Update your current availability status for disaster response.
          </p>

          <div className="mt-4 space-y-3">
            {["Available", "On Assignment", "Offline"].map((status) => (
              <label
                key={status}
                className={`flex cursor-pointer items-center gap-3 rounded-xl border-2 p-4 transition-all ${
                  newAvailability === status
                    ? "border-[#4648d4] bg-[#4648d4]/5"
                    : "border-gray-200 hover:border-[#4648d4]/30"
                }`}
              >
                <input
                  type="radio"
                  name="availability"
                  value={status}
                  checked={newAvailability === status}
                  onChange={(e) => setNewAvailability(e.target.value)}
                  className="h-4 w-4 text-[#4648d4] focus:ring-[#4648d4]"
                />
                <div>
                  <div
                    className={`font-semibold ${
                      status === "Available"
                        ? "text-[#22c55e]"
                        : status === "On Assignment"
                        ? "text-[#FF9800]"
                        : "text-[#45464e]"
                    }`}
                  >
                    {status}
                  </div>
                  <div className="text-xs text-[#45464e]">
                    {status === "Available"
                      ? "Ready for deployment"
                      : status === "On Assignment"
                      ? "Currently on a mission"
                      : "Not available"}
                  </div>
                </div>
              </label>
            ))}
          </div>

          <div className="mt-6 flex justify-end gap-3">
            <button
              onClick={() => setShowAvailabilityModal(false)}
              className="rounded-lg border px-4 py-2 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              onClick={() => toggleAvailability(newAvailability)}
              className="rounded-lg bg-[#4648d4] px-4 py-2 text-white hover:bg-[#6063ee]"
            >
              Update Status
            </button>
          </div>
        </Modal>
      )}

      {/* ================= EDIT MODAL ================= */}
      {showEditModal && (
        <Modal
          title="Edit Profile"
          onClose={() => setShowEditModal(false)}
          size="lg"
          footer={
            <>
              <button
                onClick={() => setShowEditModal(false)}
                className="rounded-lg border px-4 py-2 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveEdit}
                className="rounded-lg bg-[#4648d4] px-4 py-2 text-white hover:bg-[#6063ee]"
              >
                Save Changes
              </button>
            </>
          }
        >
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <EditField label="Full Name">
              <input
                type="text"
                value={editFormData.fullName}
                onChange={(e) => setEditFormData({ ...editFormData, fullName: e.target.value })}
                className="w-full rounded-lg bg-[#f5f7fb] px-4 py-2 outline-none focus:ring-2 focus:ring-[#4648d4]/30"
              />
            </EditField>

            <EditField label="Phone">
              <input
                type="text"
                value={editFormData.phone}
                onChange={(e) => setEditFormData({ ...editFormData, phone: e.target.value })}
                className="w-full rounded-lg bg-[#f5f7fb] px-4 py-2 outline-none focus:ring-2 focus:ring-[#4648d4]/30"
              />
            </EditField>

            <EditField label="Location" span>
              <input
                type="text"
                value={editFormData.location}
                onChange={(e) => setEditFormData({ ...editFormData, location: e.target.value })}
                className="w-full rounded-lg bg-[#f5f7fb] px-4 py-2 outline-none focus:ring-2 focus:ring-[#4648d4]/30"
                placeholder="e.g. Kathmandu, Nepal"
              />
            </EditField>

            <EditField label="Emergency Contact" span>
              <input
                type="text"
                value={editFormData.emergencyContact}
                onChange={(e) =>
                  setEditFormData({ ...editFormData, emergencyContact: e.target.value })
                }
                className="w-full rounded-lg bg-[#f5f7fb] px-4 py-2 outline-none focus:ring-2 focus:ring-[#4648d4]/30"
                placeholder="e.g. Jane Doe (Spouse)"
              />
            </EditField>

            <EditField label="Emergency Phone" span>
              <input
                type="text"
                value={editFormData.emergencyPhone}
                onChange={(e) =>
                  setEditFormData({ ...editFormData, emergencyPhone: e.target.value })
                }
                className="w-full rounded-lg bg-[#f5f7fb] px-4 py-2 outline-none focus:ring-2 focus:ring-[#4648d4]/30"
                placeholder="e.g. +977 984-0000000"
              />
            </EditField>

            <EditField label="Maximum Travel Distance" span>
              <select
                value={editFormData.maxTravelDistance}
                onChange={(e) =>
                  setEditFormData({ ...editFormData, maxTravelDistance: e.target.value })
                }
                className="w-full rounded-lg bg-[#f5f7fb] px-4 py-2 outline-none focus:ring-2 focus:ring-[#4648d4]/30"
              >
                {distanceOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </EditField>

            <EditField label="Skills" span>
              <div className="flex flex-wrap gap-2">
                {availableSkills.map((skill) => (
                  <button
                    key={skill}
                    type="button"
                    onClick={() => toggleSkill(skill)}
                    className={`rounded-lg px-3 py-1.5 text-sm font-semibold transition-all ${
                      editFormData.skills.includes(skill)
                        ? "bg-[#4648d4] text-white"
                        : "bg-[#f5f7fb] text-[#45464e] hover:bg-[#eae7eb]"
                    }`}
                  >
                    {skill}
                  </button>
                ))}
              </div>
            </EditField>

            <EditField label="Preferred Response Areas" span>
              <div className="flex flex-wrap gap-2">
                {availableAreas.map((area) => (
                  <button
                    key={area}
                    type="button"
                    onClick={() => toggleArea(area)}
                    className={`rounded-lg px-3 py-1.5 text-sm font-semibold transition-all ${
                      editFormData.preferredAreas.includes(area)
                        ? "bg-[#4648d4] text-white"
                        : "bg-[#f5f7fb] text-[#45464e] hover:bg-[#eae7eb]"
                    }`}
                  >
                    {area}
                  </button>
                ))}
              </div>
            </EditField>
          </div>
        </Modal>
      )}
    </VolunteerLayout>
  );
}

/* ---------- Small helpers ---------- */

const getSkillIcon = (skill) => {
  const map = {
    "Flood Rescue": "water_drop",
    "Evacuation Assistance": "exit_to_app",
    "First Aid": "medical_services",
    Logistics: "inventory_2",
    "Food Distribution": "restaurant",
    "Emergency Assessment": "analytics",
    "Search & Rescue": "search",
    Paramedic: "local_hospital",
    Triage: "emergency",
    Comms: "settings_overscan",
  };
  return map[skill] || "star";
};

const AvailabilityCard = ({ userData, onOpen }) => {
  const status = userData.status || "Available";
  const config = {
    Available: {
      bg: "bg-[#22c55e]/5",
      border: "border-[#22c55e]/20",
      dot: "bg-[#22c55e]",
      text: "text-[#22c55e]",
      desc: "Ready for immediate deployment",
      ping: true,
    },
    "On Assignment": {
      bg: "bg-[#FF9800]/5",
      border: "border-[#FF9800]/20",
      dot: "bg-[#FF9800]",
      text: "text-[#FF9800]",
      desc: "Currently on a response mission",
    },
    Offline: {
      bg: "bg-[#f0edf1]",
      border: "border-[#c6c6cf]/40",
      dot: "bg-[#1b1b1e]",
      text: "text-[#45464e]",
      desc: "Not currently available",
    },
  }[status] || {
    bg: "bg-[#f0edf1]",
    border: "border-[#c6c6cf]/40",
    dot: "bg-[#1b1b1e]",
    text: "text-[#45464e]",
    desc: "Status unknown",
  };

  return (
    <div
      className={`flex w-full flex-col items-start gap-4 rounded-2xl border p-6 md:w-auto md:items-end ${config.bg} ${config.border}`}
    >
      <div className="flex items-center gap-2.5">
        <div className="relative">
          <div className={`h-3.5 w-3.5 rounded-full ${config.dot}`} />
          {config.ping && (
            <div
              className={`absolute inset-0 h-3.5 w-3.5 animate-ping rounded-full opacity-40 ${config.dot}`}
            />
          )}
        </div>
        <span className={`text-lg font-bold ${config.text}`}>{status}</span>
      </div>

      <p className="text-sm font-medium text-[#45464e]">{config.desc}</p>

      <button
        onClick={onOpen}
        className="w-full rounded-xl border border-[#c6c6cf] bg-white px-6 py-2.5 text-sm font-bold text-[#1b1b1e] shadow-sm transition-all hover:border-[#4648d4] hover:bg-[#f6f2f7]"
      >
        Change Availability
      </button>
    </div>
  );
};

const Card = ({ title, icon, iconColor = "text-[#4648d4]", trailing, onEdit, children }) => (
  <div className="rounded-[20px] border border-[#eae7eb] bg-white p-6 shadow-[0px_4px_20px_rgba(11,23,54,0.05)] transition-transform hover:-translate-y-[2px]">
    <div className="mb-6 flex items-center justify-between">
      <h4 className="flex items-center gap-2 text-xl font-semibold">
        <span className={`material-symbols-outlined ${iconColor}`}>{icon}</span>
        {title}
      </h4>

      {onEdit && (
        <button
          onClick={onEdit}
          className="flex items-center gap-1 text-sm font-bold text-[#4648d4] hover:underline"
        >
          <span className="material-symbols-outlined text-[18px]">edit</span>
          Edit
        </button>
      )}

      {trailing}
    </div>

    {children}
  </div>
);

const FieldValue = ({ label, value }) => (
  <div>
    <label className="mb-1.5 block text-[11px] font-bold uppercase tracking-wider text-[#45464e]">
      {label}
    </label>
    <div className="text-lg font-medium">{value}</div>
  </div>
);

const ImpactTile = ({ icon, value, suffix = "", suffixClass = "", label }) => (
  <div className="rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur-md transition-colors hover:bg-white/10">
    <span className="material-symbols-outlined mb-3 text-[#c0c1ff]">{icon}</span>
    <div className="mb-1 text-4xl font-bold">
      {value}
      {suffix && <span className={`text-lg ${suffixClass}`}>{suffix}</span>}
    </div>
    <div className="text-[11px] font-bold uppercase tracking-widest text-[#bac5ed]">
      {label}
    </div>
  </div>
);

const Modal = ({ title, onClose, children, footer, size = "md" }) => {
  const width = size === "lg" ? "max-w-2xl" : "max-w-md";
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className={`flex max-h-[90vh] w-full ${width} flex-col rounded-2xl bg-white`}>
        <div className="flex items-center justify-between border-b border-gray-200 p-6">
          <h3 className="text-2xl font-bold">{title}</h3>
          <button onClick={onClose} className="rounded-lg p-2 hover:bg-gray-100">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6">{children}</div>

        {footer && (
          <div className="flex justify-end gap-3 border-t border-gray-200 p-6">{footer}</div>
        )}
      </div>
    </div>
  );
};

const EditField = ({ label, children, span = false }) => (
  <div className={`space-y-2 ${span ? "md:col-span-2" : ""}`}>
    <label className="text-sm font-semibold">{label}</label>
    {children}
  </div>
);

export default Profile;