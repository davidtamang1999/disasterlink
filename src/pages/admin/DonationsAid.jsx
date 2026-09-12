import { useNavigate } from "react-router-dom";
import AdminLayout from "../../layouts/AdminLayout";
import { useDisaster } from "../../context/DisasterContext";
import { useAuth } from "../../context/AuthContext";

function DonationsAid() {
  const navigate = useNavigate();
  const { incidents } = useDisaster();
  const { user } = useAuth();

  const totalIncidents = incidents.length;
  const totalAffected = incidents.reduce((sum, i) => sum + (parseInt(i.peopleAffected) || 0), 0);
  const criticalIncidents = incidents.filter(i =>
    i.severity === "Critical" || i.severity === "CRITICAL"
  ).length;

  const waterNeed = totalAffected * 10;
  const waterAvailable = Math.max(100, waterNeed - criticalIncidents * 200);
  const waterShortage = Math.max(0, waterNeed - waterAvailable);

  const foodNeed = totalAffected * 3;
  const foodAvailable = Math.max(50, foodNeed - criticalIncidents * 50);
  const foodShortage = Math.max(0, foodNeed - foodAvailable);

  const medicalNeed = Math.max(20, totalIncidents * 5 + criticalIncidents * 10);
  const medicalAvailable = Math.max(10, medicalNeed - criticalIncidents * 3);
  const medicalShortage = Math.max(0, medicalNeed - medicalAvailable);

  const totalDonations = totalAffected * 2000 + totalIncidents * 10000;
  const monthlyDonations = Math.round(totalDonations * 0.3);
  const itemsReceived = totalAffected * 3 + totalIncidents * 50;
  const distributedItems = Math.round(itemsReceived * 0.7);

  const uniqueLocations = [...new Set(incidents.map(i => i.location).filter(Boolean))];

  const aidRequirements = [];
  if (waterShortage > 0) {
    aidRequirements.push({
      title: "Drinking Water",
      required: `${waterNeed}L`,
      available: `${waterAvailable}L`,
      shortage: `${waterShortage}L`,
      location: uniqueLocations[0] || "Kathmandu Valley",
      icon: "water_drop",
      critical: waterShortage > 500,
    });
  }
  if (foodShortage > 0) {
    aidRequirements.push({
      title: "Food Packages",
      required: `${foodNeed} pkgs`,
      available: `${foodAvailable} pkgs`,
      shortage: `${foodShortage} pkgs`,
      location: uniqueLocations[1] || "Lalitpur",
      icon: "restaurant",
      critical: foodShortage > 200,
    });
  }
  if (medicalShortage > 0) {
    aidRequirements.push({
      title: "Medical Kits",
      required: `${medicalNeed} kits`,
      available: `${medicalAvailable} kits`,
      shortage: `${medicalShortage} kits`,
      location: uniqueLocations[2] || "Patan",
      icon: "medical_services",
      critical: medicalShortage > 20,
    });
  }
  if (aidRequirements.length === 0) {
    aidRequirements.push({
      title: "All Supplies",
      required: "Adequate",
      available: "Sufficient",
      shortage: "None",
      location: "All locations",
      icon: "check_circle",
      critical: false,
    });
  }

  const recentDonations = incidents.slice(0, 3).map((inc, index) => ({
    id: `DON-${String(10000 + index).padStart(5, "0")}`,
    donor: inc.reportedBy?.name || `Resident ${index + 1}`,
    details: inc.incidentType || "Emergency Supply",
    qty: `${Math.round((parseInt(inc.peopleAffected) || 1) * 1.5)} units`,
    location: inc.location || "Kathmandu",
    status:
      inc.status === "Resolved" ? "Received" :
      inc.status === "In Progress" ? "In Distribution" :
      "Pending",
    statusColor:
      inc.status === "Resolved" ? "bg-green-100 text-green-600" :
      inc.status === "In Progress" ? "bg-indigo-100 text-[#4648d4]" :
      "bg-orange-100 text-orange-500",
  }));

  if (recentDonations.length === 0) {
    recentDonations.push({
      id: "DON-00001",
      donor: "Nepal Red Cross",
      details: "Emergency Supplies",
      qty: "500 units",
      location: "Kathmandu",
      status: "Received",
      statusColor: "bg-green-100 text-green-600",
    });
  }

  const inventory = [
    { icon: "payments", name: "Financial", value: `NPR ${(totalDonations / 1000000).toFixed(1)}M` },
    { icon: "restaurant", name: "Food", value: `${foodAvailable} pkgs` },
    { icon: "water_drop", name: "Water", value: `${waterAvailable}L` },
    { icon: "medical_services", name: "Medical", value: `${medicalAvailable} kits` },
  ];

  return (
    <AdminLayout title="Donations & Aid">
      <div className="space-y-8">

        {/* Page Header */}
        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
          <div>
            <h1 className="text-3xl font-bold md:text-5xl">CrisisGuard Admin Command Center</h1>
            <p className="mt-2 max-w-2xl text-gray-600">
              Coordinate emergency donations, aid contributions, distribution, and community needs.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <button className="flex items-center gap-2 rounded-xl border border-gray-300 px-4 py-3 text-sm font-semibold hover:bg-gray-100">
              <span className="material-symbols-outlined text-lg">download</span>
              Export Aid Report
            </button>
            <button className="flex items-center gap-2 rounded-xl bg-[#4648d4] px-4 py-3 text-sm font-semibold text-white hover:bg-[#6063ee]">
              <span className="material-symbols-outlined text-lg">add</span>
              Record Donation
            </button>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3 lg:grid-cols-6">
          <div className="col-span-1 flex flex-col justify-between rounded-2xl bg-white p-6 shadow-sm md:col-span-2">
            <div className="mb-4 flex items-center gap-2 text-green-500">
              <span className="material-symbols-outlined">payments</span>
              <span className="text-xs font-bold uppercase tracking-wider text-gray-500">Total Donations</span>
            </div>
            <div>
              <div className="text-3xl font-bold">NPR {(totalDonations / 1000000).toFixed(1)}M</div>
              <div className="mt-2 flex items-center gap-2 text-sm text-gray-500">
                <span className="h-2 w-2 rounded-full bg-green-500" />
                Received
              </div>
            </div>
          </div>

          <div className="flex flex-col justify-between rounded-2xl bg-white p-6 shadow-sm">
            <div className="mb-4 text-xs font-bold uppercase tracking-wider text-gray-500">This Month</div>
            <div>
              <div className="text-2xl font-bold">NPR {(monthlyDonations / 1000000).toFixed(1)}M</div>
              <div className="mt-2 flex items-center gap-1 text-sm font-semibold text-green-500">
                <span className="material-symbols-outlined text-sm">trending_up</span>
                +18%
              </div>
            </div>
          </div>

          <div className="flex flex-col justify-between rounded-2xl bg-white p-6 shadow-sm">
            <div className="mb-4 text-xs font-bold uppercase tracking-wider text-gray-500">Items Received</div>
            <div className="text-2xl font-bold">{itemsReceived.toLocaleString()}</div>
          </div>

          <div className="flex flex-col justify-between rounded-2xl bg-white p-6 shadow-sm">
            <div className="mb-4 text-xs font-bold uppercase tracking-wider text-gray-500">Distributed</div>
            <div className="text-2xl font-bold text-green-500">{distributedItems.toLocaleString()}</div>
          </div>

          <div className={`flex flex-col justify-between rounded-2xl p-6 shadow-sm ${
            criticalIncidents > 0 ? "border border-red-200 bg-red-50" : "bg-white"
          }`}>
            <div className="mb-4 flex items-center gap-1 text-xs font-bold uppercase tracking-wider text-red-600">
              <span className="material-symbols-outlined text-base">warning</span>
              Urgent Needs
            </div>
            <div className={`text-3xl font-bold ${criticalIncidents > 0 ? "text-red-600" : "text-gray-400"}`}>
              {criticalIncidents > 0 ? criticalIncidents : "0"}
            </div>
          </div>
        </div>

        {/* Main Grid */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="space-y-6 lg:col-span-2">
            {aidRequirements.some(a => a.critical) && (
              <div className="overflow-hidden rounded-2xl bg-white shadow-sm">
                <div className="flex items-center gap-2 bg-[#ba1a1a] p-4 text-white">
                  <span className="material-symbols-outlined">error</span>
                  <h2 className="text-xl font-bold">Critical Aid Requirements</h2>
                </div>

                <div className="space-y-4 p-4">
                  {aidRequirements.filter(a => a.critical).map((req, index) => (
                    <div key={index} className="flex flex-col justify-between gap-4 rounded-xl border border-red-200 bg-red-50 p-4 transition hover:-translate-y-0.5 sm:flex-row sm:items-center">
                      <div className="flex items-start gap-4">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-red-100 text-red-600">
                          <span className="material-symbols-outlined">{req.icon}</span>
                        </div>
                        <div>
                          <div className="flex flex-wrap items-center gap-2">
                            <h3 className="text-lg font-bold">{req.title}</h3>
                            <span className="rounded-full bg-red-600 px-2 py-1 text-[10px] font-bold uppercase text-white">
                              Critical
                            </span>
                          </div>
                          <div className="mt-1 flex flex-wrap gap-x-4 text-sm text-gray-600">
                            <span>Req: {req.required}</span>
                            <span>Avail: {req.available}</span>
                            <span className="font-medium text-red-600">Shortage: {req.shortage}</span>
                          </div>
                          <div className="mt-2 flex items-center gap-1 text-xs text-gray-500">
                            <span className="material-symbols-outlined text-sm">location_on</span>
                            {req.location}
                          </div>
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <button className="rounded-xl border border-[#4648d4] px-4 py-2 text-sm font-semibold text-[#4648d4]">
                          Find Source
                        </button>
                        <button className="rounded-xl bg-[#4648d4] px-4 py-2 text-sm font-semibold text-white">
                          Allocate Now
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="overflow-hidden rounded-2xl bg-white shadow-sm">
              <div className="border-b border-gray-200 p-6">
                <h2 className="text-xl font-bold">Recent Donations</h2>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-gray-50 text-xs font-bold uppercase text-gray-500">
                    <tr>
                      <th className="p-4">ID / Donor</th>
                      <th className="p-4">Details</th>
                      <th className="p-4">Amount/Qty</th>
                      <th className="p-4">Location</th>
                      <th className="p-4">Status</th>
                      <th className="p-4 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentDonations.map((donation, index) => (
                      <tr key={index} className="border-b border-gray-100">
                        <td className="p-4">
                          <div className="font-semibold">{donation.id}</div>
                          <div className="text-xs text-gray-500">{donation.donor}</div>
                        </td>
                        <td className="p-4">
                          <div>{donation.details}</div>
                          <div className="text-xs text-gray-500">Emergency Supply</div>
                        </td>
                        <td className="p-4 font-semibold">{donation.qty}</td>
                        <td className="p-4">{donation.location}</td>
                        <td className="p-4">
                          <span className={`rounded-md px-2 py-1 text-xs font-medium ${donation.statusColor}`}>
                            ● {donation.status}
                          </span>
                        </td>
                        <td className="p-4 text-right">
                          <button className="font-semibold text-[#4648d4]">View</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="flex h-[400px] flex-col overflow-hidden rounded-2xl bg-white shadow-sm">
              <div className="border-b border-gray-200 p-6">
                <h2 className="text-xl font-bold">Aid Needs Map</h2>
                <p className="text-sm text-gray-500">
                  {uniqueLocations.length > 0 ? uniqueLocations.join(", ") : "Kathmandu Valley"}
                </p>
              </div>

              <div className="relative flex-1 bg-gradient-to-br from-[#dbeafe] to-[#dcfce7]">
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#94a3b8_1px,transparent_1px),linear-gradient(to_bottom,#94a3b8_1px,transparent_1px)] bg-[size:30px_30px] opacity-20" />

                {uniqueLocations.slice(0, 3).map((location, index) => {
                  const positions = [
                    { top: "35%", left: "30%" },
                    { top: "55%", left: "65%" },
                    { top: "70%", left: "40%" },
                  ];
                  const pos = positions[index % positions.length];
                  const isCritical = incidents.filter(i =>
                    i.location === location && (i.severity === "Critical" || i.severity === "CRITICAL")
                  ).length > 0;

                  return (
                    <div
                      key={location}
                      className="absolute h-4 w-4 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white shadow"
                      style={{
                        top: pos.top,
                        left: pos.left,
                        backgroundColor: isCritical ? "#dc2626" : "#4648d4",
                      }}
                    >
                      {isCritical && (
                        <div className="absolute inset-0 animate-ping rounded-full bg-red-600 opacity-70" />
                      )}
                    </div>
                  );
                })}

                <div className="absolute bottom-4 right-4 space-y-2 rounded-lg border border-gray-200 bg-white/90 p-3 text-[10px] font-bold uppercase shadow">
                  <div className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-red-600" />
                    Shortage ({aidRequirements.filter(a => a.critical).length})
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-[#4648d4]" />
                    Stock
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-orange-500" />
                    Dist. Point ({uniqueLocations.length})
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded-2xl bg-white p-6 shadow-sm">
              <h2 className="mb-4 text-xl font-bold">Current Aid Inventory</h2>
              <div className="space-y-2">
                {inventory.map((item, index) => (
                  <InventoryItem key={index} {...item} />
                ))}
              </div>
              <button className="mt-4 w-full rounded-xl border border-gray-300 px-4 py-3 text-sm font-semibold hover:bg-gray-100">
                View Distribution Overview
              </button>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}

function InventoryItem({ icon, name, value }) {
  return (
    <div className="flex items-center justify-between rounded-lg bg-gray-50 p-3">
      <div className="flex items-center gap-3">
        <span className="material-symbols-outlined text-gray-500">{icon}</span>
        <span className="text-sm">{name}</span>
      </div>
      <span className="text-sm font-semibold">{value}</span>
    </div>
  );
}

export default DonationsAid;