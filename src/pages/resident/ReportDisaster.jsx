import { useState } from "react";
import ResidentLayout from "../../layouts/ResidentLayout";
import { useDisaster } from "../../context/DisasterContext";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../components/shared";
import geocodeLocation from "../../utils/geocode";

export default function ReportDisaster() {
  const { addIncident } = useDisaster();
  const { user } = useAuth();
  const toast = useToast();

  const [severity, setSeverity] = useState("High");
  const [trend, setTrend] = useState("Rising");
  const [roadAccess, setRoadAccess] = useState("Blocked");
  const [evacuation, setEvacuation] = useState("");
  const [selectedEvents, setSelectedEvents] = useState(["People Trapped", "Road Blocked"]);
  const [location, setLocation] = useState("");
  const [peopleAffected, setPeopleAffected] = useState("");
  const [waterLevel, setWaterLevel] = useState("");
  const [incidentTitle, setIncidentTitle] = useState("");
  const [description, setDescription] = useState("");
  const [incidentType, setIncidentType] = useState("Urban Flooding");
  const [urgentAssistance, setUrgentAssistance] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const eventOptions = [
    "Water Rising",
    "People Trapped",
    "Road Blocked",
    "Power Outage",
    "Bridge Issue",
  ];

  const severityStyles = {
    Low: "border-slate-300 text-slate-600 bg-white",
    Moderate: "border-slate-300 text-slate-600 bg-white",
    High: "border-orange-400 bg-orange-50 text-orange-600",
    Critical: "border-red-500 bg-red-50 text-red-600",
  };

  const toggleEvent = (event) => {
    setSelectedEvents((prev) =>
      prev.includes(event) ? prev.filter((item) => item !== event) : [...prev, event]
    );
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);

    try {
      let lat = 27.7172;
      let lng = 85.324;

      if (location && location.trim() !== "") {
        try {
          const coords = await geocodeLocation(location);
          if (coords) {
            lat = coords.lat;
            lng = coords.lng;
          }
        } catch (error) {
          console.error("Geocoding failed:", error);
        }
      }

      const incidentData = {
        incidentType,
        severity,
        title: incidentTitle || "Untitled Report",
        events: selectedEvents,
        waterDepth: document.querySelector("select option:checked")?.text || "",
        floodTrend: trend,
        roadAccess,
        peopleAffected: parseInt(peopleAffected) || 0,
        waterLevel: parseFloat(waterLevel) || 0,
        urgentAssistance: parseInt(urgentAssistance) || 0,
        evacuationRequired: evacuation,
        location: location || "Unknown location",
        lat,
        lng,
        description: description || "",
        evidence: [],
        reportedBy: {
          id: user?.id || "resident-1",
          name: user?.name || user?.fullName || "Resident",
          role: "resident",
        },
      };

      const result = await addIncident(incidentData);

      if (result) {
        toast.success(
          `Report submitted successfully\n` +
          `Incident ID: ${result.id}\n` +
          `Priority Score: ${result.priorityScore}/100\n` +
          `Status: ${result.status}`
        );

        // Reset form
        setIncidentTitle("");
        setLocation("");
        setDescription("");
        setPeopleAffected("");
        setWaterLevel("");
        setUrgentAssistance("");
        setSeverity("High");
        setTrend("Rising");
        setRoadAccess("Blocked");
        setEvacuation("");
        setSelectedEvents(["People Trapped", "Road Blocked"]);
      } else {
        toast.error("Failed to submit report. Please try again.");
      }
    } catch (error) {
      console.error("Submit error:", error);
      toast.error("Error submitting report. Please check console for details.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // ---------- Header extras ----------
  const headerExtras = (
    <div className="relative hidden md:block">
      <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-500">
        search
      </span>
      <input
        type="text"
        placeholder="Search incidents..."
        className="w-64 rounded-full bg-slate-100 py-2 pl-10 pr-4 text-sm outline-none focus:ring-2 focus:ring-indigo-500"
      />
    </div>
  );

  return (
    <ResidentLayout title="Report Disaster" headerRight={headerExtras}>
      <div className="mx-auto max-w-[1440px]">

        {/* Page Header */}
        <div className="mb-6">
          <h2 className="mb-2 text-3xl font-bold">Report a Disaster</h2>
          <p className="text-slate-500">
            Help your community respond faster by reporting an incident in your area.
          </p>
        </div>

        {/* Safety Checklist */}
        <div className="mb-8 flex gap-3 rounded-xl border border-amber-200 bg-amber-50 p-5">
          <span className="material-symbols-outlined text-amber-500">warning</span>
          <div className="flex-1">
            <h3 className="mb-3 font-semibold">Safety First Checklist</h3>
            <div className="grid grid-cols-1 gap-2 text-sm text-slate-600 md:grid-cols-2">
              {[
                "Stay away from power lines",
                "Avoid walking through flood water",
                "Follow local evacuation orders",
                "Keep emergency contacts ready",
              ].map((item) => (
                <div key={item} className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-sm text-green-600">
                    check_circle
                  </span>
                  {item}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Main Grid */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
          {/* Left: Incident Details */}
          <div className="lg:col-span-7">
            <div className="rounded-[20px] border bg-white p-6 shadow-sm">
              <h2 className="mb-8 text-xl font-bold">Incident Details</h2>

              <div className="space-y-7">
                <Field label="Incident Type">
                  <select
                    className="w-full rounded-xl border border-slate-200 bg-slate-100 px-4 py-3 outline-none focus:ring-2 focus:ring-indigo-500"
                    value={incidentType}
                    onChange={(e) => setIncidentType(e.target.value)}
                  >
                    <option>Urban Flooding</option>
                    <option>Flash Flood</option>
                    <option>Waterlogging</option>
                    <option>Landslide</option>
                    <option>Road Blockage</option>
                    <option>Infrastructure Damage</option>
                    <option>Heavy Rainfall</option>
                    <option>Other</option>
                  </select>
                </Field>

                <div>
                  <label className="mb-3 block text-sm font-semibold text-slate-600">
                    Severity
                  </label>
                  <div className="flex flex-wrap gap-3">
                    {["Low", "Moderate", "High", "Critical"].map((level) => (
                      <button
                        key={level}
                        onClick={() => setSeverity(level)}
                        className={`rounded-full border px-5 py-2 text-sm font-semibold transition ${
                          severity === level
                            ? severityStyles[level]
                            : "border-slate-300 bg-white text-slate-500"
                        }`}
                      >
                        {level}
                      </button>
                    ))}
                  </div>
                </div>

                <Field label="Incident Title">
                  <input
                    type="text"
                    placeholder="e.g. Road flooding near Baneshwor"
                    value={incidentTitle}
                    onChange={(e) => setIncidentTitle(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-slate-100 px-4 py-3 outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </Field>

                <div>
                  <label className="mb-3 block text-sm font-semibold text-slate-600">
                    What is happening? (Select all that apply)
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {eventOptions.map((event) => {
                      const active = selectedEvents.includes(event);
                      return (
                        <button
                          key={event}
                          onClick={() => toggleEvent(event)}
                          className={`rounded-full border px-4 py-2 text-xs font-semibold transition ${
                            active
                              ? "border-indigo-500 bg-indigo-50 text-indigo-600"
                              : "border-slate-300 text-slate-500"
                          }`}
                        >
                          {event}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                  <Field label="Estimated Water Depth">
                    <select className="w-full rounded-xl border bg-slate-100 px-4 py-3 outline-none">
                      <option>&lt; 0.5m (Ankle Deep)</option>
                      <option>0.5m - 1.0m (Waist Deep)</option>
                      <option>&gt; 1.0m (Dangerous)</option>
                    </select>
                  </Field>

                  <div>
                    <label className="mb-2 block text-sm font-semibold text-slate-600">
                      Flood Trend
                    </label>
                    <div className="flex rounded-xl bg-slate-100 p-1">
                      {["Rising", "Stable", "Falling"].map((item) => (
                        <button
                          key={item}
                          onClick={() => setTrend(item)}
                          className={`flex-1 rounded-lg py-2 text-sm font-semibold ${
                            trend === item
                              ? "bg-white text-indigo-600 shadow"
                              : "text-slate-500"
                          }`}
                        >
                          {item}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <Field label="Water Level (meters)" hint="Current water level in meters (if known)">
                  <input
                    type="number"
                    step="0.1"
                    placeholder="e.g. 4.2"
                    value={waterLevel}
                    onChange={(e) => setWaterLevel(e.target.value)}
                    className="w-full rounded-xl border bg-slate-100 px-4 py-3 outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </Field>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-600">
                    Road Accessibility
                  </label>
                  <div className="flex rounded-xl bg-slate-100 p-1">
                    {["Open", "Partial", "Blocked"].map((item) => (
                      <button
                        key={item}
                        onClick={() => setRoadAccess(item)}
                        className={`flex-1 rounded-lg py-2 text-sm font-semibold ${
                          roadAccess === item
                            ? item === "Blocked"
                              ? "bg-red-600 text-white shadow"
                              : "bg-white text-indigo-600 shadow"
                            : "text-slate-500"
                        }`}
                      >
                        {item}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <Field label="Estimated People Affected">
                    <input
                      type="number"
                      placeholder="0"
                      value={peopleAffected}
                      onChange={(e) => setPeopleAffected(e.target.value)}
                      className="w-full rounded-xl border bg-slate-100 px-4 py-3 outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </Field>

                  <Field label="People Needing Urgent Assistance">
                    <input
                      type="number"
                      placeholder="0"
                      value={urgentAssistance}
                      onChange={(e) => setUrgentAssistance(e.target.value)}
                      className="w-full rounded-xl border bg-slate-100 px-4 py-3 outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </Field>
                </div>

                <div>
                  <label className="mb-3 block text-sm font-semibold text-slate-600">
                    Evacuation Required?
                  </label>
                  <div className="flex gap-3">
                    {["No", "Yes"].map((option) => (
                      <button
                        key={option}
                        onClick={() => setEvacuation(option)}
                        className={`rounded-xl border px-8 py-3 font-semibold ${
                          evacuation === option
                            ? option === "Yes"
                              ? "border-red-600 bg-red-600 text-white"
                              : "border-indigo-600 bg-indigo-600 text-white"
                            : "border-slate-300 text-slate-500"
                        }`}
                      >
                        {option}
                      </button>
                    ))}
                  </div>
                </div>

                <Field label="Description">
                  <textarea
                    rows="6"
                    placeholder="Describe what is happening, including water depth, affected roads/buildings, and any immediate danger."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full resize-y rounded-xl border bg-slate-100 px-4 py-3 outline-none"
                  />
                </Field>

                <Field label="Upload Evidence">
                  <div className="cursor-pointer rounded-xl border-2 border-dashed border-slate-300 p-8 text-center transition hover:bg-slate-50">
                    <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-indigo-100">
                      <span className="material-symbols-outlined text-indigo-600">
                        cloud_upload
                      </span>
                    </div>
                    <p className="mb-1 text-sm font-semibold">
                      Click to upload or drag and drop
                    </p>
                    <p className="text-sm text-slate-500">
                      Photos, Videos, or Documents (max. 50MB)
                    </p>
                  </div>
                </Field>
              </div>
            </div>
          </div>

          {/* Right: Location */}
          <div className="lg:col-span-5">
            <div className="overflow-hidden rounded-[20px] border bg-white shadow-sm">
              <div className="border-b p-6">
                <h2 className="mb-4 text-xl font-bold">Location</h2>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-500">
                    search
                  </span>
                  <input
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="Search or enter location..."
                    className="w-full rounded-xl bg-slate-100 py-3 pl-10 pr-12 outline-none"
                  />
                  <button className="absolute right-3 top-1/2 -translate-y-1/2 text-indigo-600">
                    <span className="material-symbols-outlined">location_on</span>
                  </button>
                </div>
              </div>

              <div className="relative flex h-64 items-center justify-center bg-slate-200">
                <div className="absolute inset-0 bg-gradient-to-br from-slate-300 to-slate-200" />
                <div className="relative text-center">
                  <span className="material-symbols-outlined text-5xl text-red-600">
                    location_on
                  </span>
                  <p className="mt-2 font-semibold text-slate-700">Kathmandu Map</p>
                </div>
              </div>

              <div className="border-b p-4 text-center">
                <p className="font-semibold">
                  {location || "New Baneshwor, Kathmandu"}
                </p>
                <p className="text-sm text-slate-500">27.6920° N, 85.3420° E</p>
              </div>

              <div className="bg-slate-50 p-6">
                <h3 className="mb-4 text-xs font-bold uppercase tracking-wider text-slate-500">
                  Area Information
                </h3>
                <div className="grid grid-cols-2 gap-3">
                  <AreaStat label="Area Risk" value="HIGH" valueClass="text-red-600" />
                  <AreaStat label="Nearby Reports" value="3" />
                  <AreaStat label="Active Alerts" value="1" valueClass="text-orange-600" />
                  <AreaStat label="Bagmati Level" value="6.2m" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Completeness */}
        <div className="mt-6 rounded-xl border bg-slate-100 p-6">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h3 className="font-semibold">Report Completeness</h3>
              <p className="text-sm text-slate-500">
                High accuracy reports get faster response
              </p>
            </div>
            <span className="text-xl font-bold text-indigo-600">85%</span>
          </div>
          <div className="mb-6 h-2 w-full rounded-full bg-slate-300">
            <div className="h-2 rounded-full bg-indigo-600" style={{ width: "85%" }} />
          </div>
          <p className="mb-3 text-xs font-bold uppercase text-slate-500">
            Summary Preview
          </p>
          <div className="flex flex-wrap gap-5 text-sm text-slate-600">
            <div className="flex items-center gap-1">
              <span className="material-symbols-outlined text-base">location_on</span>
              {location || "Baneshwor"}
            </div>
            <div className="flex items-center gap-1">
              <span className="material-symbols-outlined text-base">water_drop</span>
              {incidentType}
            </div>
            <div className="flex items-center gap-1">
              <span className="material-symbols-outlined text-base">warning</span>
              {severity} Severity
            </div>
          </div>
        </div>

        {/* Submit */}
        <div className="mt-6 flex items-center justify-between border-t pb-10 pt-6">
          <button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className={`flex items-center gap-2 rounded-xl px-8 py-4 font-bold text-white shadow-lg transition ${
              isSubmitting
                ? "cursor-not-allowed bg-gray-400"
                : "bg-red-600 hover:bg-red-700"
            }`}
          >
            <span className="material-symbols-outlined">
              {isSubmitting ? "hourglass_empty" : "send"}
            </span>
            {isSubmitting ? "Submitting..." : "Submit Emergency Report"}
          </button>
        </div>
      </div>
    </ResidentLayout>
  );
}

/* ---------- Small helpers ---------- */

const Field = ({ label, hint, children }) => (
  <div>
    <label className="mb-2 block text-sm font-semibold text-slate-600">
      {label}
    </label>
    {children}
    {hint && <p className="mt-1 text-xs text-slate-400">{hint}</p>}
  </div>
);

const AreaStat = ({ label, value, valueClass = "" }) => (
  <div className="rounded-lg border bg-white p-3">
    <p className="text-xs uppercase text-slate-500">{label}</p>
    <p className={`font-bold ${valueClass}`}>{value}</p>
  </div>
);