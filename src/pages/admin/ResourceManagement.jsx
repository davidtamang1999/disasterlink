import { useState } from "react";
import AdminLayout from "../../layouts/AdminLayout";
import { useDisaster } from "../../context/DisasterContext";
import { useResources } from "../../context/ResourceContext";
import { useToast } from "../../components/shared";

const ResourceManagement = () => {
  const { incidents } = useDisaster();
  const { allocateResource, loading: allocating } = useResources();
  const toast = useToast();

  const [showAllocateModal, setShowAllocateModal] = useState(false);
  const [selectedResource, setSelectedResource] = useState(null);
  const [allocateData, setAllocateData] = useState({
    volunteerName: "",
    quantity: "",
    destination: "",
    notes: "",
  });

  // ---------- Generate inventory from incident data ----------
  const generateInventory = () => {
    const floodCount = incidents.filter(i =>
      i.incidentType === "Urban Flooding" ||
      i.incidentType === "Flash Flood" ||
      i.incidentType === "Waterlogging"
    ).length;

    const totalAffected = incidents.reduce((sum, i) => sum + (parseInt(i.peopleAffected) || 0), 0);
    const criticalCount = incidents.filter(i =>
      i.severity === "Critical" || i.severity === "CRITICAL"
    ).length;

    const waterRequired = 5000 + totalAffected * 10;
    const waterAvailable = Math.max(100, 5000 + totalAffected * 5 - criticalCount * 200);
    const waterShortage = waterRequired - waterAvailable > 0 ? waterRequired - waterAvailable : 0;
    const waterStatus = waterShortage > 500 ? "Critical" : waterShortage > 100 ? "Shortage" : "Available";

    const foodRequired = 10000 + totalAffected * 20;
    const foodAvailable = Math.max(200, 10000 + totalAffected * 15 - criticalCount * 100);
    const foodShortage = foodRequired - foodAvailable > 0 ? foodRequired - foodAvailable : 0;
    const foodStatus = foodShortage > 500 ? "Critical" : foodShortage > 100 ? "Shortage" : "Available";

    const medicalRequired = 200 + floodCount * 10 + criticalCount * 5;
    const medicalAvailable = Math.max(20, 200 + floodCount * 5 - criticalCount * 3);
    const medicalShortage = medicalRequired - medicalAvailable > 0 ? medicalRequired - medicalAvailable : 0;
    const medicalStatus = medicalShortage > 50 ? "Critical" : medicalShortage > 20 ? "Shortage" : "Available";

    const boatRequired = 15 + floodCount * 2;
    const boatAvailable = Math.max(2, 15 + floodCount - criticalCount);
    const boatShortage = boatRequired - boatAvailable > 0 ? boatRequired - boatAvailable : 0;
    const boatStatus = boatShortage > 5 ? "Critical" : boatShortage > 2 ? "Shortage" : "Available";

    const blanketRequired = 3000 + totalAffected * 5;
    const blanketAvailable = Math.max(100, 3000 + totalAffected * 4 - criticalCount * 50);
    const blanketShortage = blanketRequired - blanketAvailable > 0 ? blanketRequired - blanketAvailable : 0;
    const blanketStatus = blanketShortage > 500 ? "Critical" : blanketShortage > 100 ? "Shortage" : "Available";

    return [
      { icon: "💧", name: "20L Water Cans", category: "Drinking Water", location: "Kathmandu", required: waterRequired.toLocaleString(), available: waterAvailable.toLocaleString(), transit: Math.round(waterAvailable * 0.15).toLocaleString(), status: waterStatus, shortage: waterShortage },
      { icon: "🍽️", name: "High-Calorie Biscuits", category: "Food", location: "Lalitpur", required: foodRequired.toLocaleString(), available: foodAvailable.toLocaleString(), transit: Math.round(foodAvailable * 0.1).toLocaleString(), status: foodStatus, shortage: foodShortage },
      { icon: "🏥", name: "Trauma Kits", category: "Medical", location: "Bhaktapur", required: medicalRequired.toLocaleString(), available: medicalAvailable.toLocaleString(), transit: Math.round(medicalAvailable * 0.2).toLocaleString(), status: medicalStatus, shortage: medicalShortage },
      { icon: "🚤", name: "Inflatable Boats", category: "Rescue Gear", location: "Kathmandu", required: boatRequired.toLocaleString(), available: boatAvailable.toLocaleString(), transit: Math.round(boatAvailable * 0.3).toLocaleString(), status: boatStatus, shortage: boatShortage },
      { icon: "🛏️", name: "Thermal Blankets", category: "First Aid", location: "Lalitpur", required: blanketRequired.toLocaleString(), available: blanketAvailable.toLocaleString(), transit: Math.round(blanketAvailable * 0.05).toLocaleString(), status: blanketStatus, shortage: blanketShortage },
    ];
  };

  const inventory = generateInventory();

  const totalResources = inventory.reduce((sum, i) => sum + parseInt(i.available.replace(/,/g, "")), 0);
  const availableCount = inventory.filter(i => i.status === "Available").length;
  const shortageCount = inventory.filter(i => i.status === "Shortage" || i.status === "Critical").length;
  const criticalCount = inventory.filter(i => i.status === "Critical").length;
  const transitCount = inventory.reduce((sum, i) => sum + parseInt(i.transit.replace(/,/g, "")), 0);
  const distributedCount = Math.round(totalResources * 0.15);

  const criticalItems = inventory.filter(i => i.status === "Critical" || i.status === "Shortage");

  const getStatusStyle = (status) => {
    switch (status) {
      case "Available": return "bg-green-100 text-green-700 border-green-200";
      case "Critical": return "bg-red-100 text-red-700 border-red-200";
      case "Shortage": return "bg-orange-100 text-orange-700 border-orange-200";
      case "In Transit": return "bg-indigo-100 text-indigo-700 border-indigo-200";
      default: return "bg-gray-100 text-gray-700 border-gray-200";
    }
  };

  // ---------- Modal handlers ----------
  const handleOpenAllocate = (resource) => {
    setSelectedResource(resource);
    setAllocateData({
      volunteerName: "",
      quantity: "",
      destination: resource.location || "",
      notes: "",
    });
    setShowAllocateModal(true);
  };

  const handleConfirmAllocate = async () => {
    if (!allocateData.volunteerName.trim()) {
      toast.error("Please enter a volunteer name");
      return;
    }
    if (!allocateData.quantity || parseInt(allocateData.quantity) <= 0) {
      toast.error("Please enter a valid quantity");
      return;
    }
    if (!allocateData.destination.trim()) {
      toast.error("Please enter a destination");
      return;
    }

    const qty = parseInt(allocateData.quantity);
    const availableNum = parseInt(selectedResource.available.replace(/,/g, ""));

    if (qty > availableNum) {
      toast.error(
        `Not enough stock!\nAvailable: ${availableNum}\nRequested: ${qty}`
      );
      return;
    }

    const created = await allocateResource({
      resource: selectedResource.name,
      category: selectedResource.category,
      quantity: qty,
      volunteer: allocateData.volunteerName.trim(),
      destination: allocateData.destination.trim(),
      notes: allocateData.notes.trim(),
    });

    setShowAllocateModal(false);

    toast.success(
      `Resource Allocated Successfully\n` +
      `📦 ${selectedResource.name}\n` +
      `🔢 Qty: ${qty}\n` +
      `👤 ${created.volunteer}\n` +
      `📍 ${created.destination}`
    );

    setSelectedResource(null);
    setAllocateData({ volunteerName: "", quantity: "", destination: "", notes: "" });
  };

  return (
    <AdminLayout title="Resource Management">
      <div className="mx-auto max-w-[1500px] space-y-8">

        {/* PAGE HEADER */}
        <div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-end">
          <div>
            <h2 className="text-3xl font-bold tracking-tight text-slate-950">
              Resource Management
            </h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500 md:text-base">
              Monitor emergency supplies, coordinate shortages, approve requests, and track resource distribution.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <button className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold shadow-sm transition hover:bg-slate-50">
              ↓ Export Inventory
            </button>
            <button className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold shadow-sm transition hover:bg-slate-50">
              📄 Create Request
            </button>
            <button className="rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700">
              ＋ Add Resource
            </button>
          </div>
        </div>

        {/* SUMMARY CARDS */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
          <SummaryTile label="📦 TOTAL RESOURCES" value={totalResources.toLocaleString()} sub="Items currently tracked" />
          <SummaryTile label="✓ AVAILABLE" labelClass="text-green-600" value={availableCount} sub="Resource types ready" border="border-green-100" />
          <SummaryTile
            label={`⚠ ${shortageCount > 0 ? "SHORTAGES" : "NO SHORTAGES"}`}
            labelClass={shortageCount > 0 ? "text-red-600" : "text-slate-500"}
            value={shortageCount}
            sub={shortageCount > 0 ? "Immediate action required" : "All resources available"}
            border={shortageCount > 0 ? "border-red-200 bg-red-50" : "border-slate-200"}
            valueClass={shortageCount > 0 ? "text-red-600" : "text-slate-500"}
          />
          <SummaryTile
            label={`⚡ ${criticalCount > 0 ? "CRITICAL" : "NO CRITICAL"}`}
            labelClass={criticalCount > 0 ? "text-red-600" : "text-slate-500"}
            value={criticalCount}
            sub={criticalCount > 0 ? "Highest priority shortages" : "No critical shortages"}
            border={criticalCount > 0 ? "border-red-200 bg-red-50" : "border-slate-200"}
            valueClass={criticalCount > 0 ? "text-red-600" : "text-slate-500"}
          />
          <SummaryTile label="🚚 IN TRANSIT" labelClass="text-indigo-600" value={transitCount.toLocaleString()} sub="Currently being delivered" />
          <SummaryTile label="↗ DISTRIBUTED" value={distributedCount.toLocaleString()} sub="Items distributed today" />
        </div>

        {/* MAIN GRID */}
        <div className="grid gap-6 xl:grid-cols-[1fr_400px]">
          <div className="space-y-6">
            {/* CRITICAL SHORTAGES */}
            {criticalItems.length > 0 && (
              <section className="rounded-2xl border border-red-100 border-l-4 border-l-red-600 bg-white p-6 shadow-sm">
                <h3 className="mb-5 flex items-center gap-2 text-xl font-bold">
                  <span className="text-red-600">📢</span>
                  Critical Resource Shortages
                </h3>

                <div className="space-y-4">
                  {criticalItems.map((item, index) => (
                    <div key={index} className="flex flex-col justify-between gap-4 rounded-xl border border-red-100 bg-red-50 p-4 md:flex-row md:items-center">
                      <div>
                        <div className="mb-2 flex items-center gap-2">
                          <h4 className="font-bold">{item.name}</h4>
                          <span className={`rounded px-2 py-1 text-xs font-bold text-white ${item.status === "Critical" ? "bg-red-600" : "bg-orange-500"}`}>
                            {item.status}
                          </span>
                        </div>

                        <div className="flex flex-wrap gap-x-4 gap-y-2 text-sm text-slate-600">
                          <span>Req vs Avail: <strong className="ml-1 text-slate-900">{item.required} / {item.available}</strong></span>
                          <span className="font-medium text-red-600">↓ Short: {item.shortage}</span>
                          <span>📍 {item.location}</span>
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <button
                          onClick={() => handleOpenAllocate(item)}
                          className="rounded-lg border border-red-500 px-5 py-2 text-sm font-semibold text-red-600 transition hover:bg-red-100"
                        >
                          Allocate
                        </button>
                        <button className="rounded-lg bg-slate-200 px-5 py-2 text-sm font-semibold transition hover:bg-slate-300">
                          View
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* INVENTORY */}
            <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
              <div className="flex items-center justify-between border-b border-slate-200 bg-slate-50 px-5 py-4">
                <h3 className="text-xl font-bold">Emergency Resource Inventory</h3>
                <button className="rounded-lg p-2 hover:bg-slate-200">☰</button>
              </div>

              <div className="flex gap-6 overflow-x-auto border-b border-slate-200 px-5">
                <button className="whitespace-nowrap border-b-2 border-indigo-600 px-1 py-4 text-sm font-semibold text-indigo-600">All Resources</button>
                <button className="whitespace-nowrap px-1 py-4 text-sm text-slate-500 hover:text-slate-900">Drinking Water</button>
                <button className="whitespace-nowrap px-1 py-4 text-sm text-slate-500 hover:text-slate-900">Food</button>
                <button className="whitespace-nowrap px-1 py-4 text-sm text-slate-500 hover:text-slate-900">First Aid</button>
                <button className="whitespace-nowrap px-1 py-4 text-sm text-slate-500 hover:text-slate-900">Rescue Gear</button>
                <button className="whitespace-nowrap px-1 py-4 text-sm text-slate-500 hover:text-slate-900">Medical</button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full min-w-[800px] text-left">
                  <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                    <tr>
                      <th className="px-5 py-4">Resource</th>
                      <th className="px-5 py-4">Required</th>
                      <th className="px-5 py-4">Available</th>
                      <th className="px-5 py-4">In Transit</th>
                      <th className="px-5 py-4">Status</th>
                      <th className="px-5 py-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {inventory.map((item, index) => (
                      <tr key={index} className="transition hover:bg-slate-50">
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-100 text-lg">{item.icon}</div>
                            <div>
                              <p className="font-semibold text-slate-900">{item.name}</p>
                              <p className="mt-1 text-xs text-slate-500">{item.category} • {item.location}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-5 py-4 text-sm text-slate-600">{item.required}</td>
                        <td className={`px-5 py-4 text-sm font-bold ${item.status === "Critical" ? "text-red-600" : item.status === "Shortage" ? "text-orange-500" : "text-slate-900"}`}>
                          {item.available}
                        </td>
                        <td className="px-5 py-4 text-sm text-slate-600">{item.transit}</td>
                        <td className="px-5 py-4">
                          <span className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold ${getStatusStyle(item.status)}`}>
                            {item.status}
                          </span>
                        </td>
                        <td className="px-5 py-4 text-right">
                          <button
                            onClick={() => handleOpenAllocate(item)}
                            className="rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-indigo-700"
                          >
                            Allocate
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          </div>

          {/* RIGHT SIDE */}
          <div className="space-y-6">
            <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
              <div className="flex items-center justify-between border-b border-slate-200 bg-slate-50 px-5 py-4">
                <h3 className="text-lg font-bold">🗺 Locations</h3>
                <div className="flex gap-2 text-xs">
                  <span className="text-red-600">● Short</span>
                  <span className="text-indigo-600">● Stock</span>
                  <span className="text-orange-500">● Dist</span>
                </div>
              </div>

              <div className="relative flex h-64 items-center justify-center overflow-hidden bg-slate-200">
                <div className="absolute inset-0 opacity-30">
                  <div className="h-full w-full bg-[linear-gradient(to_right,#94a3b8_1px,transparent_1px),linear-gradient(to_bottom,#94a3b8_1px,transparent_1px)] bg-[size:30px_30px]" />
                </div>
                <div className="relative text-center">
                  <div className="mb-2 text-4xl">🗺️</div>
                  <p className="font-semibold text-slate-700">Kathmandu Valley</p>
                  <p className="mt-1 text-sm text-slate-500">{incidents.length} incidents active</p>
                </div>

                {incidents.length > 0 && (
                  <>
                    <div className="absolute left-[38%] top-[30%] flex h-5 w-5 animate-pulse rounded-full border-2 border-white bg-red-600 shadow-lg" />
                    <div className="absolute left-[65%] top-[60%] flex h-4 w-4 rounded-full border-2 border-white bg-indigo-600 shadow-lg" />
                    <div className="absolute left-[55%] top-[45%] flex h-4 w-4 rounded-full border-2 border-white bg-orange-500 shadow-lg" />
                  </>
                )}
              </div>
            </section>

            <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="mb-5 flex items-center justify-between">
                <h3 className="text-lg font-bold">Pending Requests</h3>
                <span className={`rounded-full px-3 py-1 text-xs font-bold ${incidents.length > 0 ? "bg-orange-100 text-orange-600" : "bg-slate-100 text-slate-500"}`}>
                  {incidents.length > 0 ? `${incidents.length} New` : "0 New"}
                </span>
              </div>

              {incidents.length > 0 ? (
                <div className="space-y-4">
                  {incidents.slice(0, 3).map((inc) => (
                    <div key={inc.id} className="rounded-xl border border-slate-200 bg-slate-50 p-4 transition hover:border-indigo-300">
                      <div className="mb-3 flex items-center justify-between">
                        <span className="rounded bg-slate-200 px-2 py-1 font-mono text-xs">{inc.id}</span>
                        <span className="text-xs text-slate-500">🕒 {inc.timestamp ? new Date(inc.timestamp).toLocaleTimeString() : "Just now"}</span>
                      </div>

                      <h4 className="mb-2 font-bold">{inc.peopleAffected || 0} affected • {inc.incidentType || "Incident"}</h4>

                      <div className="mb-4 space-y-1 text-sm text-slate-500">
                        <p>👥 {inc.reportedBy?.name || "Resident"}</p>
                        <p>📍 {inc.location || "Unknown location"}</p>
                        <p>⚠ {inc.severity || "Moderate"} severity</p>
                      </div>

                      <div className="flex gap-2">
                        <button className="flex-1 rounded-lg bg-indigo-600 py-2 text-sm font-semibold text-white transition hover:bg-indigo-700">Approve</button>
                        <button className="flex-1 rounded-lg border border-slate-300 bg-white py-2 text-sm font-semibold transition hover:bg-slate-100">Review</button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-8 text-center text-slate-500">
                  <p>No pending requests</p>
                  <p className="text-sm">Requests will appear here when incidents are reported</p>
                </div>
              )}
            </section>
          </div>
        </div>
      </div>

      {/* ALLOCATE MODAL */}
      {showAllocateModal && selectedResource && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl">
            <div className="mb-5 flex items-start justify-between">
              <div>
                <h3 className="text-2xl font-bold">📦 Allocate Resource</h3>
                <p className="mt-1 text-sm text-slate-500">
                  Assign <span className="font-semibold text-indigo-600">{selectedResource.name}</span> to a volunteer
                </p>
              </div>
              <button
                onClick={() => setShowAllocateModal(false)}
                className="text-2xl text-slate-400 hover:text-slate-600"
              >
                ✕
              </button>
            </div>

            <div className="mb-5 rounded-xl border border-indigo-100 bg-indigo-50 p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-white text-2xl">{selectedResource.icon}</div>
                <div className="flex-1">
                  <p className="font-bold">{selectedResource.name}</p>
                  <p className="text-xs text-slate-600">{selectedResource.category} • {selectedResource.location}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-slate-500">Available</p>
                  <p className="text-lg font-bold text-indigo-600">{selectedResource.available}</p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <ModalField label="👤 Assign to Volunteer *">
                <input
                  type="text"
                  placeholder="Enter volunteer name (e.g., John Doe)"
                  className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                  value={allocateData.volunteerName}
                  onChange={(e) => setAllocateData({ ...allocateData, volunteerName: e.target.value })}
                />
              </ModalField>

              <ModalField label="🔢 Quantity to Allocate *">
                <input
                  type="number"
                  placeholder="Enter quantity"
                  className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                  value={allocateData.quantity}
                  onChange={(e) => setAllocateData({ ...allocateData, quantity: e.target.value })}
                  max={parseInt(selectedResource.available.replace(/,/g, ""))}
                />
                <p className="mt-1 text-xs text-slate-500">Max available: {selectedResource.available}</p>
              </ModalField>

              <ModalField label="📍 Destination *">
                <input
                  type="text"
                  placeholder="Enter delivery location"
                  className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                  value={allocateData.destination}
                  onChange={(e) => setAllocateData({ ...allocateData, destination: e.target.value })}
                />
              </ModalField>

              <ModalField label="📝 Notes (Optional)">
                <textarea
                  rows="3"
                  placeholder="Add any special instructions..."
                  className="w-full resize-none rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                  value={allocateData.notes}
                  onChange={(e) => setAllocateData({ ...allocateData, notes: e.target.value })}
                />
              </ModalField>
            </div>

            <div className="mt-6 flex gap-3">
              <button
                onClick={() => setShowAllocateModal(false)}
                disabled={allocating}
                className="flex-1 rounded-xl border border-slate-300 py-3 font-semibold hover:bg-slate-50 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmAllocate}
                disabled={allocating}
                className={`flex flex-1 items-center justify-center gap-2 rounded-xl py-3 font-semibold text-white transition ${
                  allocating ? "cursor-not-allowed bg-slate-400" : "bg-indigo-600 hover:bg-indigo-700"
                }`}
              >
                {allocating ? (
                  <>
                    <span className="animate-spin">⏳</span>
                    Allocating...
                  </>
                ) : (
                  <>✅ Confirm Allocation</>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
};

/* ---------- Small inline helpers ---------- */

const SummaryTile = ({ label, labelClass = "text-slate-500", value, sub, border = "border-slate-200", valueClass = "text-slate-900" }) => (
  <div className={`rounded-2xl border ${border} bg-white p-5 shadow-sm`}>
    <div className={`mb-3 text-sm font-semibold ${labelClass}`}>{label}</div>
    <div className={`text-3xl font-bold ${valueClass}`}>{value}</div>
    {sub && <p className="mt-2 text-xs text-slate-500">{sub}</p>}
  </div>
);

const ModalField = ({ label, children }) => (
  <div>
    <label className="mb-2 block text-sm font-semibold">{label}</label>
    {children}
  </div>
);

export default ResourceManagement;