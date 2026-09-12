import AdminLayout from "../../layouts/AdminLayout";
import { useAuth } from "../../context/AuthContext";
import { useSettings } from "../../context/SettingsContext";
import { useAudit } from "../../context/AuditContext";
import { useToast, ConfirmModal } from "../../components/shared";
import { useState } from "react";

const SystemSettings = () => {
  const { currentUser } = useAuth();
  const {
    settings,
    loading,
    updateSetting,
    saveSettings,
    resetSettings,
    disableAllNotifications,
  } = useSettings();
  const { logAction } = useAudit();
  const toast = useToast();

  const [saveStatus, setSaveStatus] = useState(false);
  const [confirm, setConfirm] = useState({ type: null });

  // ---------- Audit log (via context) ----------
  const saveAuditLog = (action, details) => {
    logAction(action, details, {
      user: currentUser?.fullName || "System Admin",
      role: currentUser?.role || "Administrator",
      actionIcon: "settings",
      module: "System Settings",
      recordId: "SET-001",
    });
  };

  // ---------- Save ----------
  const handleSave = async () => {
    await saveSettings();
    saveAuditLog("System Settings Updated", "Updated system configuration");
    setSaveStatus(true);
    toast.success("All changes saved");
    setTimeout(() => setSaveStatus(false), 3000);
  };

  // ---------- Danger actions ----------
  const handleDisableNotifications = async () => {
    await disableAllNotifications();
    saveAuditLog(
      "Emergency Notifications Disabled",
      "All emergency notifications were disabled"
    );
    setConfirm({ type: null });
    toast.warning("All emergency notifications have been disabled.");
  };

  const handleResetSystem = async () => {
    await resetSettings();
    saveAuditLog("System Reset to Defaults", "All system settings were reset to factory defaults");
    setConfirm({ type: null });
    toast.success("System has been reset to factory defaults.");
  };

  const scrollToSection = (e, sectionId) => {
    e.preventDefault();
    document.getElementById(sectionId)?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  };

  // Header extras: save status + save button
  const headerExtras = (
    <div className="flex items-center gap-4">
      <span
        className={`hidden text-sm font-semibold text-green-500 transition-opacity duration-300 md:inline-flex md:items-center md:gap-1 ${saveStatus ? "opacity-100" : "opacity-0"
          }`}
      >
        <span className="material-symbols-outlined text-sm">check_circle</span>
        All changes saved
      </span>

      <button
        onClick={handleSave}
        disabled={loading}
        className="flex items-center gap-2 rounded-xl bg-[#4648d4] px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:bg-[#6063ee] disabled:opacity-50"
      >
        <span className="material-symbols-outlined text-sm">save</span>
        {loading ? "Saving..." : "Save Changes"}
      </button>
    </div>
  );

  return (
    <AdminLayout title="System Settings" headerRight={headerExtras}>
      <div className="mx-auto max-w-[1440px] space-y-8">

        {/* Page Header */}
        <div>
          <h2 className="text-3xl font-semibold tracking-tight text-gray-900">
            System Settings
          </h2>
          <p className="mt-2 max-w-2xl text-base leading-relaxed text-gray-600">
            Configure DisasterLink system behavior, emergency response preferences,
            and administrative controls for the Kathmandu Valley command center.
          </p>
        </div>

        <div className="flex flex-col gap-8 lg:flex-row">
          {/* Local settings sidebar */}
          <div className="w-full flex-shrink-0 lg:w-64">
            <nav className="sticky top-24 space-y-1">
              {[
                { id: "general", label: "General" },
                { id: "emergency", label: "Emergency Response" },
                { id: "incident", label: "Incident Configuration" },
                { id: "notifications", label: "Notifications" },
                { id: "map", label: "Map & Location" },
                { id: "resources", label: "Resource & Shelter" },
                { id: "security", label: "Security & Status" },
              ].map((item, index) => (
                <a
                  key={item.id}
                  className={`block rounded-lg px-4 py-3 text-sm font-semibold ${index === 0
                    ? "bg-[#4648d4]/10 text-[#4648d4]"
                    : "text-gray-600 transition-colors hover:bg-gray-100"
                    }`}
                  href={`#${item.id}`}
                  onClick={(e) => scrollToSection(e, item.id)}
                >
                  {item.label}
                </a>
              ))}
            </nav>
          </div>

          {/* Settings content */}
          <div className="max-w-4xl flex-1 space-y-8">

            {/* General */}
            <section
              id="general"
              className="rounded-2xl border border-gray-200 bg-white p-8 shadow-[0px_4px_20px_rgba(11,23,54,0.05)]"
            >
              <SectionHeader
                icon="tune"
                title="General Configuration"
                subtitle="Core operational parameters for the command center."
              />

              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <Field label="System Name">
                  <input
                    className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 focus:border-[#4648d4] focus:ring-2 focus:ring-[#4648d4]/20"
                    type="text"
                    value={settings.systemName}
                    onChange={(e) => updateSetting("systemName", e.target.value)}
                  />
                </Field>

                <Field label="Default Location">
                  <select
                    className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 focus:border-[#4648d4] focus:ring-2 focus:ring-[#4648d4]/20"
                    value={settings.defaultLocation}
                    onChange={(e) => updateSetting("defaultLocation", e.target.value)}
                  >
                    <option>Kathmandu Valley (Primary)</option>
                    <option>Pokhara Region</option>
                    <option>Chitwan District</option>
                  </select>
                </Field>

                <div className="md:col-span-2">
                  <Field label="System Description">
                    <textarea
                      className="h-24 w-full resize-none rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 leading-relaxed focus:border-[#4648d4] focus:ring-2 focus:ring-[#4648d4]/20"
                      value={settings.systemDescription}
                      onChange={(e) => updateSetting("systemDescription", e.target.value)}
                    />
                  </Field>
                </div>

                <Field label="Time Zone">
                  <select
                    className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 focus:border-[#4648d4] focus:ring-2 focus:ring-[#4648d4]/20"
                    value={settings.timeZone}
                    onChange={(e) => updateSetting("timeZone", e.target.value)}
                  >
                    <option>Asia/Kathmandu (NPT +05:45)</option>
                    <option>UTC</option>
                  </select>
                </Field>

                <Field label="Date Format">
                  <select
                    className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 focus:border-[#4648d4] focus:ring-2 focus:ring-[#4648d4]/20"
                    value={settings.dateFormat}
                    onChange={(e) => updateSetting("dateFormat", e.target.value)}
                  >
                    <option>YYYY-MM-DD (ISO)</option>
                    <option>DD/MM/YYYY</option>
                  </select>
                </Field>
              </div>
            </section>

            {/* Emergency */}
            <section
              id="emergency"
              className="relative overflow-hidden rounded-2xl border border-gray-200 bg-white p-8 shadow-[0px_4px_20px_rgba(11,23,54,0.05)]"
            >
              <div className="absolute bottom-0 left-0 top-0 w-1.5 bg-red-600" />

              <SectionHeader
                icon="warning"
                iconColor="text-red-600"
                title="Emergency Response Logic"
                subtitle="High-priority settings governing automated system actions during critical events."
              />

              <div className="space-y-4">
                <ToggleRow
                  title="Automatic Incident Escalation"
                  description="Ensures critical events aren't missed by upgrading High severity incidents to Critical after inactivity."
                  checked={settings.autoEscalation}
                  onChange={(v) => updateSetting("autoEscalation", v)}
                />
                <ToggleRow
                  title="Flood-Risk Automated Warnings"
                  description="Dispatches immediate alerts when river sensors detect water levels above safety thresholds."
                  checked={settings.floodWarnings}
                  onChange={(v) => updateSetting("floodWarnings", v)}
                />
                <ToggleRow
                  title="Shelter Capacity Override"
                  description="Allows emergency routing to full shelters during extreme mass-casualty events."
                  checked={settings.shelterOverride}
                  onChange={(v) => updateSetting("shelterOverride", v)}
                />
              </div>
            </section>

            {/* Incident */}
            <section
              id="incident"
              className="rounded-2xl border border-gray-200 bg-white p-8 shadow-[0px_4px_20px_rgba(11,23,54,0.05)]"
            >
              <SectionHeader
                icon="emergency"
                title="Incident Configuration"
                subtitle="Settings for incident management and response workflows."
              />

              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <Field label="Critical Threshold (minutes)">
                  <input
                    type="number"
                    className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 focus:border-[#4648d4] focus:ring-2 focus:ring-[#4648d4]/20"
                    value={settings.criticalThreshold}
                    onChange={(e) => updateSetting("criticalThreshold", e.target.value)}
                  />
                </Field>

                <Field label="Auto-Assign Volunteers">
                  <select
                    className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 focus:border-[#4648d4] focus:ring-2 focus:ring-[#4648d4]/20"
                    value={settings.autoAssignVolunteers ? "true" : "false"}
                    onChange={(e) => updateSetting("autoAssignVolunteers", e.target.value === "true")}
                  >
                    <option value="true">Enabled</option>
                    <option value="false">Disabled</option>
                  </select>
                </Field>

                <div className="md:col-span-2">
                  <Field label="Require Verification for Reports">
                    <select
                      className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 focus:border-[#4648d4] focus:ring-2 focus:ring-[#4648d4]/20"
                      value={settings.requireVerification ? "true" : "false"}
                      onChange={(e) => updateSetting("requireVerification", e.target.value === "true")}
                    >
                      <option value="true">Enabled</option>
                      <option value="false">Disabled</option>
                    </select>
                  </Field>
                </div>
              </div>
            </section>

            {/* Notifications */}
            <section
              id="notifications"
              className="rounded-2xl border border-gray-200 bg-white p-8 shadow-[0px_4px_20px_rgba(11,23,54,0.05)]"
            >
              <SectionHeader
                icon="notifications"
                title="Notifications"
                subtitle="Configure how alerts are delivered to users."
              />

              <div className="space-y-4">
                <ToggleRow
                  title="SMS Notifications"
                  description="Send critical alerts via SMS"
                  checked={settings.smsEnabled}
                  onChange={(v) => updateSetting("smsEnabled", v)}
                />
                <ToggleRow
                  title="Push Notifications"
                  description="Send in-app push notifications"
                  checked={settings.pushEnabled}
                  onChange={(v) => updateSetting("pushEnabled", v)}
                />
                <ToggleRow
                  title="Email Notifications"
                  description="Send alerts via email"
                  checked={settings.emailEnabled}
                  onChange={(v) => updateSetting("emailEnabled", v)}
                />

                <Field label="Alert Retention (days)">
                  <input
                    type="number"
                    className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 focus:border-[#4648d4] focus:ring-2 focus:ring-[#4648d4]/20"
                    value={settings.alertRetention}
                    onChange={(e) => updateSetting("alertRetention", e.target.value)}
                  />
                </Field>
              </div>
            </section>

            {/* Map */}
            <section
              id="map"
              className="rounded-2xl border border-gray-200 bg-white p-8 shadow-[0px_4px_20px_rgba(11,23,54,0.05)]"
            >
              <SectionHeader
                icon="map"
                title="Map & Location"
                subtitle="Configure map providers and location services."
              />

              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <Field label="Map Provider">
                  <select
                    className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 focus:border-[#4648d4] focus:ring-2 focus:ring-[#4648d4]/20"
                    value={settings.mapProvider}
                    onChange={(e) => updateSetting("mapProvider", e.target.value)}
                  >
                    <option>Google Maps</option>
                    <option>OpenStreetMap</option>
                    <option>Mapbox</option>
                  </select>
                </Field>

                <Field label="Default Zoom Level">
                  <select
                    className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 focus:border-[#4648d4] focus:ring-2 focus:ring-[#4648d4]/20"
                    value={settings.defaultZoom}
                    onChange={(e) => updateSetting("defaultZoom", e.target.value)}
                  >
                    <option value="10">City View (10)</option>
                    <option value="12">District View (12)</option>
                    <option value="14">Street View (14)</option>
                  </select>
                </Field>

                <div className="md:col-span-2">
                  <Field label="Show Heatmap">
                    <select
                      className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 focus:border-[#4648d4] focus:ring-2 focus:ring-[#4648d4]/20"
                      value={settings.showHeatmap ? "true" : "false"}
                      onChange={(e) => updateSetting("showHeatmap", e.target.value === "true")}
                    >
                      <option value="true">Enabled</option>
                      <option value="false">Disabled</option>
                    </select>
                  </Field>
                </div>
              </div>
            </section>

            {/* Resources */}
            <section
              id="resources"
              className="rounded-2xl border border-gray-200 bg-white p-8 shadow-[0px_4px_20px_rgba(11,23,54,0.05)]"
            >
              <SectionHeader
                icon="inventory_2"
                title="Resource & Shelter"
                subtitle="Manage resource thresholds and shelter operations."
              />

              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <Field label="Resource Shortage Threshold (%)">
                  <input
                    type="number"
                    className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 focus:border-[#4648d4] focus:ring-2 focus:ring-[#4648d4]/20"
                    value={settings.resourceThreshold}
                    onChange={(e) => updateSetting("resourceThreshold", e.target.value)}
                  />
                </Field>

                <Field label="Auto-Reorder Resources">
                  <select
                    className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 focus:border-[#4648d4] focus:ring-2 focus:ring-[#4648d4]/20"
                    value={settings.autoReorder ? "true" : "false"}
                    onChange={(e) => updateSetting("autoReorder", e.target.value === "true")}
                  >
                    <option value="true">Enabled</option>
                    <option value="false">Disabled</option>
                  </select>
                </Field>

                <div className="md:col-span-2">
                  <Field label="Shelter Update Interval (minutes)">
                    <input
                      type="number"
                      className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 focus:border-[#4648d4] focus:ring-2 focus:ring-[#4648d4]/20"
                      value={settings.shelterUpdateInterval}
                      onChange={(e) => updateSetting("shelterUpdateInterval", e.target.value)}
                    />
                  </Field>
                </div>
              </div>
            </section>

            {/* Security */}
            <section
              id="security"
              className="rounded-2xl border border-gray-200 bg-white p-8 shadow-[0px_4px_20px_rgba(11,23,54,0.05)]"
            >
              <SectionHeader
                icon="security"
                title="Security & Status"
                subtitle="Security policies and system status monitoring."
              />

              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <Field label="Session Timeout (minutes)">
                  <input
                    type="number"
                    className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 focus:border-[#4648d4] focus:ring-2 focus:ring-[#4648d4]/20"
                    value={settings.sessionTimeout}
                    onChange={(e) => updateSetting("sessionTimeout", e.target.value)}
                  />
                </Field>

                <Field label="Two-Factor Authentication">
                  <select
                    className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 focus:border-[#4648d4] focus:ring-2 focus:ring-[#4648d4]/20"
                    value={settings.twoFactorAuth ? "true" : "false"}
                    onChange={(e) => updateSetting("twoFactorAuth", e.target.value === "true")}
                  >
                    <option value="true">Enabled</option>
                    <option value="false">Disabled</option>
                  </select>
                </Field>

                <div className="md:col-span-2">
                  <Field label="Audit Log Retention (days)">
                    <input
                      type="number"
                      className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 focus:border-[#4648d4] focus:ring-2 focus:ring-[#4648d4]/20"
                      value={settings.auditRetention}
                      onChange={(e) => updateSetting("auditRetention", e.target.value)}
                    />
                  </Field>
                </div>
              </div>
            </section>

            {/* Danger Zone */}
            <section className="mt-12 rounded-2xl border border-red-300 bg-red-50 p-8">
              <div className="mb-6">
                <h3 className="flex items-center gap-2 text-xl font-semibold text-red-600">
                  <span className="material-symbols-outlined">gpp_bad</span>
                  Danger Zone
                </h3>
                <p className="mt-1 text-sm text-gray-900">
                  These actions can severely impact system operations. Proceed with extreme caution.
                </p>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between gap-6 rounded-xl border border-red-200 bg-white p-5">
                  <div>
                    <h4 className="text-sm font-semibold text-gray-900">
                      Disable Emergency Notifications
                    </h4>
                    <p className="mt-1 text-sm text-gray-600">
                      Temporarily halt ALL outgoing automated alerts.
                    </p>
                  </div>
                  <button
                    onClick={() => setConfirm({ type: "disable-notifications" })}
                    className="rounded-lg border-2 border-red-600 px-6 py-2 font-semibold text-red-600 transition-all hover:bg-red-600 hover:text-white"
                  >
                    Disable
                  </button>
                </div>

                <div className="flex items-center justify-between gap-6 rounded-xl border border-red-200 bg-white p-5">
                  <div>
                    <h4 className="text-sm font-semibold text-gray-900">
                      Factory Reset Configuration
                    </h4>
                    <p className="mt-1 text-sm text-gray-600">
                      Revert all settings to deployment defaults. This action is irreversible.
                    </p>
                  </div>
                  <button
                    onClick={() => setConfirm({ type: "reset-system" })}
                    className="rounded-lg bg-red-600 px-6 py-2 font-semibold text-white shadow-sm transition-all hover:bg-red-700"
                  >
                    Reset System
                  </button>
                </div>
              </div>
            </section>
          </div>
        </div>
      </div>

      {/* Confirm modals */}
      {confirm.type === "disable-notifications" && (
        <ConfirmModal
          title="Disable All Notifications"
          message="⚠️ Are you sure you want to disable all emergency notifications?"
          confirmLabel="Disable"
          onConfirm={handleDisableNotifications}
          onClose={() => setConfirm({ type: null })}
        />
      )}

      {confirm.type === "reset-system" && (
        <ConfirmModal
          title="Reset System"
          message="⚠️⚠️⚠️ WARNING: This will reset ALL system settings to defaults. This cannot be undone. Are you sure?"
          confirmLabel="Reset System"
          onConfirm={handleResetSystem}
          onClose={() => setConfirm({ type: null })}
        />
      )}
    </AdminLayout>
  );
};

/* ---------- Small inline helpers ---------- */

const SectionHeader = ({ icon, iconColor = "text-[#4648d4]", title, subtitle }) => (
  <div className="mb-6 border-b border-gray-200 pb-4">
    <h3 className="flex items-center gap-2 text-xl font-semibold text-gray-900">
      <span className={`material-symbols-outlined ${iconColor}`}>{icon}</span>
      {title}
    </h3>
    {subtitle && <p className="mt-1 text-sm text-gray-600">{subtitle}</p>}
  </div>
);

const Field = ({ label, children }) => (
  <div className="space-y-2">
    <label className="block text-xs font-bold uppercase tracking-wider text-gray-600">
      {label}
    </label>
    {children}
  </div>
);

const ToggleRow = ({ title, description, checked, onChange }) => (
  <div className="flex items-center justify-between gap-6 rounded-xl border border-gray-200 bg-gray-50 p-5">
    <div className="max-w-xl">
      <h4 className="text-sm font-semibold text-gray-900">{title}</h4>
      {description && <p className="mt-1 text-sm text-gray-600">{description}</p>}
    </div>

    <label className="relative inline-flex cursor-pointer items-center">
      <input
        type="checkbox"
        className="peer sr-only"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
      />
      <div className="h-6 w-11 rounded-full bg-gray-300 after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:border after:bg-white after:transition-all after:content-[''] peer-checked:bg-[#4648d4] peer-checked:after:translate-x-full" />
    </label>
  </div>
);

export default SystemSettings;