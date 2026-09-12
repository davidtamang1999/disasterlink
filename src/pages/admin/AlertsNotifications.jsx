import { useState } from "react";
import AdminLayout from "../../layouts/AdminLayout";
import { useDisaster } from "../../context/DisasterContext";
import { useAuth } from "../../context/AuthContext";
import { useAlerts } from "../../context/AlertContext";

const AlertsNotifications = () => {
  const { incidents } = useDisaster();
  const { user } = useAuth();
  const { activeAlerts, latestAlert, broadcastAlert, cancelAlert, loading } = useAlerts();

  const [alertType, setAlertType] = useState("Flood Warning");
  const [severity, setSeverity] = useState("Critical");
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [selectedLocations, setSelectedLocations] = useState([]);

  // ---------- Derived stats from incidents ----------
  const criticalIncidents = incidents.filter(i =>
    i.severity === "Critical" || i.severity === "CRITICAL"
  ).length;
  const activeIncidents = incidents.filter(i => i.status !== "Resolved").length;
  const highSeverityIncidents = incidents.filter(i =>
    i.severity === "High" || i.severity === "Critical" || i.severity === "CRITICAL"
  ).length;

  const uniqueLocations = [...new Set(incidents.map(i => i.location).filter(Boolean))];

  // ---------- Handlers ----------
  const toggleLocation = (location) => {
    setSelectedLocations(prev =>
      prev.includes(location) ? prev.filter(l => l !== location) : [...prev, location]
    );
  };

  const handleBroadcast = async () => {
    const recipients =
      selectedLocations.length > 0 ? selectedLocations.length * 100 : 2840;

    const created = await broadcastAlert({
      type: alertType,
      severity,
      title: title || "Emergency Alert",
      message: message || "Please stay safe and follow local guidance.",
      locations: selectedLocations,
      createdBy: user?.name || "Admin",
      recipients,
    });

    if (created) {
      alert(
        "✅ Emergency Alert Broadcasted!\n\n" +
        `Title: ${created.title}\n` +
        `Severity: ${created.severity}\n` +
        `Locations: ${created.locations.join(", ")}\n` +
        `Recipients: ~${created.recipients} people`
      );

      setTitle("");
      setMessage("");
      setSelectedLocations([]);
    }
  };

  const handleCancelAlert = async () => {
    if (!latestAlert) return;
    await cancelAlert(latestAlert.id);
  };

  // ---------- Header extras (page-specific) ----------
  const headerExtras = (
    <button className="hidden md:flex items-center gap-2 text-sm font-semibold text-gray-600 hover:bg-gray-100 px-3 py-2 rounded-lg">
      <span className="material-symbols-outlined text-xl">history</span>
      Alert History
    </button>
  );

  return (
    <AdminLayout title="Alerts & Notifications" headerRight={headerExtras}>
      <div className="max-w-[1440px] mx-auto space-y-6">

        {/* Page Header */}
        <div>
          <h2 className="text-3xl font-bold">Alerts & Notifications</h2>
          <p className="text-gray-600 mt-1">
            Create, distribute, and monitor emergency warnings and system notifications.
          </p>
        </div>

        {/* Emergency Banner */}
        {latestAlert ? (
          <div className={`rounded-xl p-4 md:p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4 ${
            latestAlert.severity === "Critical"
              ? "bg-[#ffdad6] border border-red-200"
              : "bg-[#fff3e0] border border-orange-200"
          }`}>
            <div className="flex items-start gap-4">
              <div className={`p-3 rounded-full shrink-0 ${
                latestAlert.severity === "Critical"
                  ? "bg-[#ba1a1a] text-white"
                  : "bg-[#FF9800] text-white"
              }`}>
                <span className="material-symbols-outlined text-2xl">warning</span>
              </div>

              <div>
                <h3 className={`text-xl font-bold flex items-center gap-2 flex-wrap ${
                  latestAlert.severity === "Critical" ? "text-[#93000a]" : "text-[#bf5c00]"
                }`}>
                  {latestAlert.title}
                  <span className={`text-[10px] font-bold px-2 py-1 rounded-full uppercase ${
                    latestAlert.severity === "Critical"
                      ? "bg-[#ba1a1a] text-white"
                      : "bg-[#FF9800] text-white"
                  }`}>
                    {latestAlert.severity}
                  </span>
                </h3>

                <p className={`text-sm mt-1 ${
                  latestAlert.severity === "Critical"
                    ? "text-[#93000a]/80"
                    : "text-[#bf5c00]/80"
                }`}>
                  Affected areas: {latestAlert.locations?.join(", ") || "All areas"}
                </p>

                <div className="flex gap-4 mt-2 text-xs font-semibold flex-wrap">
                  <span className="flex items-center gap-1">
                    <span className="material-symbols-outlined text-[16px]">schedule</span>
                    Issued {new Date(latestAlert.timestamp).toLocaleTimeString()}
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="material-symbols-outlined text-[16px]">groups</span>
                    ~{latestAlert.recipients || 2840} recipients
                  </span>
                </div>
              </div>
            </div>

            <div className="flex gap-2 shrink-0">
              <button
                onClick={handleCancelAlert}
                disabled={loading}
                className="px-4 py-2 bg-white text-[#ba1a1a] font-semibold rounded-lg border border-red-200 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                disabled={loading}
                className="px-4 py-2 bg-[#ba1a1a] text-white font-semibold rounded-lg disabled:opacity-50"
              >
                Update
              </button>
            </div>
          </div>
        ) : (
          <div className="bg-green-50 border border-green-200 rounded-xl p-4 md:p-6 shadow-sm">
            <div className="flex items-start gap-4">
              <div className="bg-[#4CAF50] text-white p-3 rounded-full shrink-0">
                <span className="material-symbols-outlined text-2xl">check_circle</span>
              </div>
              <div>
                <h3 className="text-xl font-bold text-green-700">No Active Alerts</h3>
                <p className="text-sm text-green-600/80 mt-1">
                  All systems normal. Create an emergency alert if needed.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
          <StatCard icon="notifications" label="Active Alerts" value={activeAlerts.length.toString()} />
          <StatCard icon="emergency" label="Critical" value={criticalIncidents.toString()}
            color="text-[#ba1a1a]" border="border-l-4 border-l-[#ba1a1a]" />
          <StatCard icon="send" label="Active Incidents" value={activeIncidents.toString()} />
          <StatCard icon="groups" label="Affected People"
            value={incidents.reduce((sum, i) => sum + (parseInt(i.peopleAffected) || 0), 0).toLocaleString()} />
          <StatCard icon="pending_actions" label="Locations" value={uniqueLocations.length.toString()} />
          <StatCard icon="error" label="High Severity" value={highSeverityIncidents.toString()}
            color="text-orange-500" border="border-l-4 border-l-orange-500" />
        </div>

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Form */}
          <div className="lg:col-span-7 bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
              <span className="material-symbols-outlined text-[#4648d4]">edit_document</span>
              Create Emergency Alert
            </h3>

            <form className="space-y-5" onSubmit={(e) => e.preventDefault()}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-semibold">Alert Type</label>
                  <select
                    value={alertType}
                    onChange={(e) => setAlertType(e.target.value)}
                    className="w-full bg-[#EDF0F5] rounded-xl px-4 py-3 text-sm border-none"
                  >
                    <option>Flood Warning</option>
                    <option>Landslide Warning</option>
                    <option>Severe Weather</option>
                    <option>Evacuation Notice</option>
                    <option>Road Closure</option>
                    <option>Safety Advisory</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-semibold">Severity</label>
                  <select
                    value={severity}
                    onChange={(e) => setSeverity(e.target.value)}
                    className={`w-full bg-[#EDF0F5] rounded-xl px-4 py-3 text-sm font-semibold border-none ${
                      severity === "Critical" ? "text-red-700" :
                      severity === "High" ? "text-orange-600" :
                      severity === "Moderate" ? "text-yellow-600" : "text-green-600"
                    }`}
                  >
                    <option value="Critical">Critical (Red)</option>
                    <option value="High">High (Orange)</option>
                    <option value="Moderate">Moderate (Yellow)</option>
                    <option value="Info">Info (Green)</option>
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold">Alert Title</label>
                <input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full bg-[#EDF0F5] rounded-xl px-4 py-3 text-sm border-none"
                  type="text"
                  placeholder="Enter alert title..."
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold">Message Content</label>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="w-full bg-[#EDF0F5] rounded-xl px-4 py-3 text-sm resize-none border-none"
                  rows="4"
                  placeholder="Describe the situation, affected areas, and recommended actions..."
                />
              </div>

              <div className="space-y-3">
                <label className="text-sm font-semibold">Delivery Channels</label>
                <div className="flex flex-wrap gap-3">
                  <label className="flex items-center gap-2 bg-[#4648d4]/10 text-[#4648d4] px-3 py-2 rounded-lg border border-[#4648d4]/20 cursor-pointer">
                    <input defaultChecked className="rounded" type="checkbox" />
                    <span className="text-sm font-semibold">SMS</span>
                  </label>
                  <label className="flex items-center gap-2 bg-[#4648d4]/10 text-[#4648d4] px-3 py-2 rounded-lg border border-[#4648d4]/20 cursor-pointer">
                    <input defaultChecked className="rounded" type="checkbox" />
                    <span className="text-sm font-semibold">Push Notification</span>
                  </label>
                  <label className="flex items-center gap-2 bg-gray-100 text-gray-600 px-3 py-2 rounded-lg border border-gray-200 cursor-pointer">
                    <input className="rounded" type="checkbox" />
                    <span className="text-sm font-semibold">Email</span>
                  </label>
                </div>
              </div>

              <div className="pt-4 border-t border-gray-200 flex justify-end gap-3">
                <button
                  className="px-5 py-2.5 rounded-xl font-semibold text-gray-600 hover:bg-gray-100"
                  type="button"
                >
                  Save Draft
                </button>
                <button
                  onClick={handleBroadcast}
                  disabled={loading}
                  className="px-5 py-2.5 bg-[#4648d4] text-white rounded-xl font-semibold hover:bg-[#6063ee] flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  type="button"
                >
                  <span className="material-symbols-outlined text-sm">podcasts</span>
                  {loading ? "Broadcasting..." : "Broadcast Alert"}
                </button>
              </div>
            </form>
          </div>

          {/* Right Column */}
          <div className="lg:col-span-5 space-y-6 flex flex-col">
            {/* Target Map */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden flex-1 min-h-[300px] flex flex-col">
              <div className="p-4 border-b border-gray-200 flex justify-between items-center bg-white flex-wrap gap-2">
                <h3 className="text-xl font-bold">Target Area</h3>
                <div className="flex items-center gap-2">
                  <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded-md text-xs font-semibold">
                    Est. Recipients: {(selectedLocations.length || uniqueLocations.length) * 100}
                  </span>
                  <button
                    onClick={() => setSelectedLocations([])}
                    className="px-3 py-1 text-xs font-semibold text-[#4648d4] border border-[#4648d4]/20 rounded-md"
                  >
                    Clear Selection
                  </button>
                </div>
              </div>

              <div className="flex-1 relative bg-gray-100 min-h-[250px]">
                <div
                  className="absolute inset-0 bg-cover bg-center opacity-50"
                  style={{
                    backgroundImage:
                      "url('https://lh3.googleusercontent.com/aida-public/AB6AXuAoe_t3DYnQ_RkORGQwc5Lw4qP-QYq9cYoCcLQlB2o4LiwcCoXRLINXh72H8itTpl-yIuu_ZPe6oTrc2xd_Z9xWyHCOBSUTgDhi4rkP7MLsK4pwzcYLFw_tCb7WaSUK8WFP9bDi0m6_JnkDqNVb1zLBboCHjfRHn0RCtGXBZBfwkZZ6zORVpa0XBTBUyedOXN3Uk6GtZ1hchfMV80E0VQsF8JGm_Fnt4W-Wkv9aV50tfcqoabjRSyuC')",
                  }}
                />
                <div className="absolute inset-0 p-4 flex flex-col justify-between">
                  <div className="flex justify-end">
                    <button className="bg-white p-2 rounded-lg shadow-sm">
                      <span className="material-symbols-outlined">zoom_in</span>
                    </button>
                  </div>
                  <div className="bg-white/90 backdrop-blur-sm p-3 rounded-lg shadow-sm border border-gray-200 max-w-[200px]">
                    <p className="text-xs font-bold flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-red-600" />
                      Selected Zones ({selectedLocations.length || uniqueLocations.length})
                    </p>
                    <p className="text-xs text-gray-600 mt-1">
                      {selectedLocations.length > 0
                        ? selectedLocations.slice(0, 3).join(", ") +
                          (selectedLocations.length > 3 ? ` +${selectedLocations.length - 3} more` : "")
                        : uniqueLocations.slice(0, 3).join(", ") +
                          (uniqueLocations.length > 3 ? ` +${uniqueLocations.length - 3} more` : "")}
                    </p>
                    <button className="mt-2 w-full py-1 text-[10px] font-semibold bg-[#4648d4] text-white rounded">
                      + Add Zone
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Mobile Preview */}
            <div className="bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl shadow-sm border border-gray-200 p-6 flex items-center justify-center">
              <div className="w-[280px] bg-[#1c1c1e] rounded-[32px] p-2 shadow-xl border-4 border-[#3a3a3c] relative">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-6 bg-[#3a3a3c] rounded-b-xl" />
                <div className="bg-[#1c1c1e] h-[200px] rounded-[24px] p-4 flex flex-col justify-center">
                  <div className={`rounded-2xl p-4 shadow-lg mb-4 ${
                    severity === "Critical" ? "bg-[#ba1a1a]/20" :
                    severity === "High" ? "bg-[#FF9800]/20" :
                    "bg-[#2c2c2e]"
                  }`}>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-white/50 text-[10px] font-semibold tracking-wider">
                        DISASTERLINK
                      </span>
                      <span className="text-white/40 text-[10px]">Now</span>
                    </div>
                    <p className={`font-bold text-sm ${
                      severity === "Critical" ? "text-[#ff6b6b]" :
                      severity === "High" ? "text-[#ffb74d]" : "text-white"
                    }`}>
                      {title || "EMERGENCY ALERT"}
                    </p>
                    <p className="text-white/70 text-xs mt-1 leading-snug">
                      {message || "Please stay safe and follow local guidance."}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>
    </AdminLayout>
  );
};

/* StatCard helper — will move to shared components in a later step */
const StatCard = ({ icon, label, value, color = "", border = "" }) => (
  <div className={`bg-white rounded-xl p-4 shadow-sm border border-gray-200 ${border}`}>
    <span className={`material-symbols-outlined text-sm mb-1 ${color || "text-gray-500"}`}>
      {icon}
    </span>
    <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">{label}</p>
    <p className={`text-3xl font-bold mt-2 ${color || "text-[#1b1b1e]"}`}>{value}</p>
  </div>
);

export default AlertsNotifications;