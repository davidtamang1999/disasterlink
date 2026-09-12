import AdminLayout from "../../layouts/AdminLayout";
import { useDisaster } from "../../context/DisasterContext";

function ShelterManagement() {
  const { incidents } = useDisaster();

  // ---------- Generate shelters from incidents ----------
  const getSheltersFromIncidents = () => {
    const locationMap = {};

    incidents.forEach(inc => {
      if (!inc.location) return;
      if (!locationMap[inc.location]) {
        locationMap[inc.location] = {
          name: `${inc.location} Shelter`,
          location: inc.location,
          incidents: [],
        };
      }
      locationMap[inc.location].incidents.push(inc);
    });

    return Object.values(locationMap).map((item, index) => {
      const totalAffected = item.incidents.reduce(
        (sum, inc) => sum + (parseInt(inc.peopleAffected) || 0),
        0
      );

      const capacity = 150 + index * 50;
      const occupied = Math.min(totalAffected + Math.floor(Math.random() * 20), capacity);
      const percentage = Math.round((occupied / capacity) * 100);

      let status = "Open";
      let statusColor = "text-[#4CAF50]";
      let statusBg = "bg-[#4CAF50]/10";
      let progressColor = "bg-[#6366f1]";

      if (percentage >= 100) {
        status = "Full";
        statusColor = "text-[#FF5252]";
        statusBg = "bg-[#FF5252]/10";
        progressColor = "bg-[#FF5252]";
      } else if (percentage >= 80) {
        status = "Near Capacity";
        statusColor = "text-[#FF9800]";
        statusBg = "bg-[#FF9800]/10";
        progressColor = "bg-[#FF9800]";
      }

      const hasMedical = item.incidents.some(inc =>
        inc.incidentType === "Urban Flooding" || inc.incidentType === "Flash Flood"
      );
      const hasWater = true;
      const hasFood = item.incidents.length > 1;
      const hasSanitizer = item.incidents.some(inc =>
        inc.severity === "Critical" || inc.severity === "CRITICAL"
      );

      return {
        name: item.name,
        id: `SHL-${String(index + 1).padStart(4, "0")}`,
        location: item.location,
        occupied,
        capacity,
        percentage,
        status,
        statusColor,
        statusBg,
        progressColor,
        facilities: [
          { icon: "medical_services", active: hasMedical },
          { icon: "water_drop", active: hasWater },
          { icon: "restaurant", active: hasFood },
          { icon: "sanitizer", active: hasSanitizer },
        ],
        selected: index === 0,
        incidentCount: item.incidents.length,
      };
    });
  };

  const shelters = getSheltersFromIncidents();

  const displayShelters = shelters.length > 0 ? shelters : [
    {
      name: "Kathmandu Community Hall",
      id: "SHL-0018",
      location: "Teku, Kathmandu",
      occupied: 86, capacity: 120, percentage: 72,
      status: "Open", statusColor: "text-[#4CAF50]", statusBg: "bg-[#4CAF50]/10",
      progressColor: "bg-[#6366f1]",
      facilities: [
        { icon: "medical_services", active: true },
        { icon: "water_drop", active: true },
        { icon: "restaurant", active: true },
        { icon: "sanitizer", active: true },
      ],
      selected: true, incidentCount: 3,
    },
    {
      name: "Lalitpur Emergency Center",
      id: "SHL-0017",
      location: "Patan, Lalitpur",
      occupied: 132, capacity: 150, percentage: 88,
      status: "Near Capacity", statusColor: "text-[#FF9800]", statusBg: "bg-[#FF9800]/10",
      progressColor: "bg-[#FF9800]",
      facilities: [
        { icon: "medical_services", active: true },
        { icon: "water_drop", active: true },
        { icon: "restaurant", active: true },
      ],
      incidentCount: 2,
    },
    {
      name: "Bhaktapur Youth Club",
      id: "SHL-0005",
      location: "Bhaktapur",
      occupied: 100, capacity: 100, percentage: 100,
      status: "Full", statusColor: "text-[#FF5252]", statusBg: "bg-[#FF5252]/10",
      progressColor: "bg-[#FF5252]",
      facilities: [
        { icon: "medical_services", active: true },
        { icon: "water_drop", active: false },
        { icon: "restaurant", active: true },
      ],
      incidentCount: 1,
    },
  ];

  // KPIs
  const totalShelters = displayShelters.length;
  const openShelters = displayShelters.filter(s => s.status === "Open").length;
  const nearCapacityShelters = displayShelters.filter(s => s.status === "Near Capacity").length;
  const fullShelters = displayShelters.filter(s => s.status === "Full").length;
  const totalCapacity = displayShelters.reduce((sum, s) => sum + s.capacity, 0);
  const totalOccupied = displayShelters.reduce((sum, s) => sum + s.occupied, 0);
  const availableSpaces = totalCapacity - totalOccupied;
  const overallOccupancy = totalCapacity > 0 ? Math.round((totalOccupied / totalCapacity) * 100) : 0;
  const highCapacityCount = displayShelters.filter(s => s.percentage >= 80).length;

  const kpis = [
    { title: "Total Shelters", value: totalShelters, icon: "home_work", color: "border-[#c6c6cf]", iconColor: "text-[#76767f]", valueColor: "text-[#1b1b1e]" },
    { title: "Open", value: openShelters, icon: "check_circle", color: "border-[#4CAF50]", iconColor: "text-[#4CAF50]", valueColor: "text-[#4CAF50]" },
    { title: "Near Capacity", value: nearCapacityShelters, icon: "warning", color: "border-[#FF9800]", iconColor: "text-[#FF9800]", valueColor: "text-[#FF9800]" },
    { title: "Full", value: fullShelters, icon: "error", color: "border-[#FF5252]", iconColor: "text-[#FF5252]", valueColor: "text-[#FF5252]" },
  ];

  const selectedShelter = displayShelters.find(s => s.selected) || displayShelters[0];

  return (
    <AdminLayout title="Shelter Management">
      <div className="space-y-6">

        {/* Page Header */}
        <section className="flex flex-col justify-between gap-5 xl:flex-row xl:items-end">
          <div>
            <h2 className="font-['Space_Grotesk'] text-3xl font-bold text-[#1b1b1e]">
              Shelter Management
            </h2>
            <p className="mt-2 max-w-2xl text-[#45464e]">
              Monitor emergency shelters, evacuation capacity, occupancy, facilities, and incoming residents.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <button className="flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2 font-semibold text-[#1b1b1e] transition hover:bg-gray-50">
              <span className="material-symbols-outlined text-[18px]">download</span>
              Export Shelter Data
            </button>
            <button className="flex items-center gap-2 rounded-xl bg-[#4b41e1] px-4 py-2 font-semibold text-white transition hover:bg-[#645efb]">
              <span className="material-symbols-outlined text-[18px]">add</span>
              Add Shelter
            </button>
          </div>
        </section>

        {/* KPI */}
        <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-6">
          {kpis.map((kpi) => (
            <div
              key={kpi.title}
              className={`min-h-[150px] rounded-[20px] border-t-4 ${kpi.color} bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-md`}
            >
              <div className="mb-5 flex items-start justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-[#45464e]">{kpi.title}</span>
                <span className={`material-symbols-outlined ${kpi.iconColor}`}>{kpi.icon}</span>
              </div>
              <p className={`text-4xl font-bold ${kpi.valueColor}`}>{kpi.value}</p>
            </div>
          ))}

          <div className="rounded-[20px] border-t-4 border-[#4b41e1] bg-white p-5 shadow-sm sm:col-span-2 xl:col-span-2">
            <div className="flex h-full items-center justify-between gap-5">
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-[#45464e]">Total Capacity</p>
                <p className="mt-2 font-['Space_Grotesk'] text-2xl font-bold">{totalCapacity.toLocaleString()}</p>
              </div>
              <div className="h-12 w-px bg-gray-200" />
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-[#45464e]">Available Spaces</p>
                <p className="mt-2 font-['Space_Grotesk'] text-2xl font-bold text-[#4CAF50]">
                  {availableSpaces.toLocaleString()}
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Main Grid */}
        <section className="grid grid-cols-1 gap-6 xl:grid-cols-12">
          <div className="space-y-6 xl:col-span-8">
            {/* Situation */}
            <div className="rounded-[20px] bg-white p-6 shadow-sm">
              <h3 className="mb-5 font-['Space_Grotesk'] text-xl font-bold">Current Shelter Situation</h3>

              <div className="mb-4 flex flex-col justify-between gap-5 md:flex-row md:items-end">
                <div className="flex flex-wrap gap-8">
                  <div>
                    <p className="text-xs font-bold text-[#45464e]">Open Shelters</p>
                    <p className="mt-1 text-xl font-bold">{openShelters}</p>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-[#45464e]">Occupied</p>
                    <p className="mt-1 text-xl font-bold">{totalOccupied.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-[#45464e]">Available</p>
                    <p className="mt-1 text-xl font-bold text-[#4CAF50]">{availableSpaces.toLocaleString()}</p>
                  </div>
                </div>

                <div className="text-right">
                  <p className="font-['Space_Grotesk'] text-3xl font-bold text-[#FF9800]">{overallOccupancy}%</p>
                  <p className="text-xs font-bold text-[#45464e]">Overall Occupancy</p>
                </div>
              </div>

              <div className="mb-5 h-3 w-full overflow-hidden rounded-full bg-[#eae7eb]">
                <div className="h-full bg-[#4b41e1]" style={{ width: `${overallOccupancy}%` }} />
              </div>

              {highCapacityCount > 0 && (
                <div className="flex flex-col justify-between gap-3 rounded-xl border border-[#FF5252]/20 bg-[#ffdad6]/40 p-4 md:flex-row md:items-center">
                  <div className="flex items-center gap-3">
                    <span className="material-symbols-outlined text-[#FF5252]">campaign</span>
                    <p className="text-sm">
                      <strong>{highCapacityCount} shelter{highCapacityCount > 1 ? "s" : ""}</strong>{" "}
                      {highCapacityCount > 1 ? "are" : "is"} above 80% capacity
                    </p>
                  </div>
                  <button className="text-sm font-bold text-[#FF5252] hover:underline">
                    View Capacity Alerts
                  </button>
                </div>
              )}
            </div>

            {/* Table */}
            <div className="rounded-[20px] bg-white p-6 shadow-sm">
              <div className="mb-6 flex flex-col gap-3 xl:flex-row">
                <div className="relative flex-1">
                  <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-sm text-[#76767f]">search</span>
                  <input
                    type="text"
                    placeholder="Search by shelter name or ID..."
                    className="w-full rounded-xl bg-[#edf0f5] py-2.5 pl-10 pr-4 text-sm outline-none focus:ring-2 focus:ring-[#4b41e1]"
                  />
                </div>

                <select className="rounded-xl bg-[#edf0f5] px-4 py-2 text-sm font-semibold text-[#45464e] outline-none">
                  <option>Status: All</option>
                  <option>Open</option>
                  <option>Near Capacity</option>
                  <option>Full</option>
                </select>
                <select className="rounded-xl bg-[#edf0f5] px-4 py-2 text-sm font-semibold text-[#45464e] outline-none">
                  <option>Capacity: All</option>
                </select>
                <select className="rounded-xl bg-[#edf0f5] px-4 py-2 text-sm font-semibold text-[#45464e] outline-none">
                  <option>Location: All</option>
                </select>

                <button className="flex items-center justify-center gap-1 rounded-xl bg-[#edf0f5] px-4 py-2 text-sm font-semibold text-[#45464e] hover:bg-gray-200">
                  <span className="material-symbols-outlined text-[18px]">tune</span>
                  More
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full min-w-[700px] border-collapse text-left">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="px-2 py-3 text-xs font-bold uppercase tracking-wider text-[#45464e]">Shelter Details</th>
                      <th className="px-2 py-3 text-right text-xs font-bold uppercase tracking-wider text-[#45464e]">Occupancy</th>
                      <th className="px-2 py-3 text-center text-xs font-bold uppercase tracking-wider text-[#45464e]">Status</th>
                      <th className="px-2 py-3 text-xs font-bold uppercase tracking-wider text-[#45464e]">Facilities</th>
                    </tr>
                  </thead>
                  <tbody>
                    {displayShelters.map((shelter) => (
                      <tr
                        key={shelter.id}
                        className={`cursor-pointer border-b border-gray-100 transition hover:bg-[#f5f7fb] ${
                          shelter.selected ? "bg-[#4b41e1]/5" : ""
                        }`}
                      >
                        <td className="px-2 py-4">
                          <p className="font-semibold">{shelter.name}</p>
                          <div className="mt-1 flex items-center gap-2 text-xs text-[#45464e]">
                            <span className="rounded bg-[#edf0f5] px-2 py-1 font-mono text-[#76767f]">{shelter.id}</span>
                            <span>{shelter.location}</span>
                          </div>
                        </td>

                        <td className="px-2 py-4 text-right">
                          <p className="font-semibold">{shelter.occupied} / {shelter.capacity}</p>
                          <div className="mt-2 flex items-center justify-end gap-2">
                            <span className="text-xs text-[#45464e]">{shelter.percentage}%</span>
                            <div className="h-1.5 w-16 overflow-hidden rounded-full bg-[#eae7eb]">
                              <div className={`h-full ${shelter.progressColor}`} style={{ width: `${shelter.percentage}%` }} />
                            </div>
                          </div>
                        </td>

                        <td className="px-2 py-4 text-center">
                          <span className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-3 py-1 text-xs font-bold ${shelter.statusBg} ${shelter.statusColor}`}>
                            <span className={`h-2 w-2 rounded-full ${
                              shelter.status === "Open" ? "bg-[#4CAF50]" :
                              shelter.status === "Near Capacity" ? "bg-[#FF9800]" : "bg-[#FF5252]"
                            }`} />
                            {shelter.status}
                          </span>
                        </td>

                        <td className="px-2 py-4">
                          <div className="flex gap-1">
                            {shelter.facilities.map((facility, index) => (
                              <span
                                key={index}
                                className={`material-symbols-outlined text-[20px] ${facility.active ? "text-[#4CAF50]" : "text-gray-300"}`}
                              >
                                {facility.icon}
                              </span>
                            ))}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-6 xl:col-span-4">
            <div className="relative h-64 overflow-hidden rounded-[20px] bg-white p-2 shadow-sm">
              <div className="relative h-full w-full overflow-hidden rounded-2xl bg-gradient-to-br from-[#dbeafe] to-[#dcfce7]">
                <div className="absolute left-1/3 top-1/4 h-4 w-4 rounded-full border-2 border-white bg-[#4CAF50] shadow-lg" />
                <div className="absolute left-1/2 top-1/2 h-4 w-4 animate-pulse rounded-full border-2 border-white bg-[#FF9800] shadow-lg" />
                <div className="absolute bottom-1/3 right-1/4 h-4 w-4 rounded-full border-2 border-white bg-[#FF5252] shadow-lg" />
              </div>

              <div className="absolute bottom-4 left-4 flex items-center gap-2 rounded-lg border border-gray-200 bg-white/90 px-3 py-2 backdrop-blur-sm">
                <span className="h-2 w-2 rounded-full bg-[#FF5252]" />
                <span className="text-xs font-bold">{incidents.length} Incidents Nearby</span>
              </div>
            </div>

            {selectedShelter && (
              <div className="flex min-h-[550px] flex-col rounded-[20px] bg-white p-6 shadow-sm">
                <div className="mb-5 flex items-start justify-between">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wider text-[#76767f]">Selected Shelter</p>
                    <h3 className="mt-1 font-['Space_Grotesk'] text-xl font-bold">{selectedShelter.name}</h3>
                    <p className="mt-1 text-sm text-[#45464e]">{selectedShelter.location}</p>
                  </div>
                  <button className="text-[#76767f] hover:text-[#1b1b1e]">
                    <span className="material-symbols-outlined">close</span>
                  </button>
                </div>

                <div className="mb-5 grid grid-cols-2 gap-4 border-y border-gray-200 py-5">
                  <div>
                    <p className="mb-3 text-xs font-bold uppercase text-[#45464e]">Demographics</p>
                    <div className="space-y-2 text-sm">
                      <Row label="Adults" value={Math.round(selectedShelter.occupied * 0.5)} />
                      <Row label="Children" value={Math.round(selectedShelter.occupied * 0.25)} />
                      <Row label="Elderly" value={Math.round(selectedShelter.occupied * 0.1)} />
                    </div>
                  </div>

                  <div className="border-l border-gray-200 pl-4">
                    <p className="mb-3 text-xs font-bold uppercase text-[#45464e]">Critical Needs</p>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between text-[#FF5252]">
                        <span className="flex items-center gap-1">
                          <span className="material-symbols-outlined text-[16px]">water_drop</span>
                          Water
                        </span>
                        <span className="font-bold">-{Math.round(selectedShelter.occupied * 2)}L</span>
                      </div>
                      <div className="flex justify-between text-[#FF9800]">
                        <span>Blankets</span>
                        <span>-{Math.round(selectedShelter.occupied * 0.4)}</span>
                      </div>
                      <div className="flex justify-between text-[#FF9800]">
                        <span>First Aid</span>
                        <span>-{Math.round(selectedShelter.occupied * 0.15)}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mb-5 rounded-xl border border-[#bac5ed] bg-[#dbe1ff]/40 p-4">
                  <p className="mb-3 text-xs font-bold uppercase text-[#45464e]">Incoming Evacuees</p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="rounded-lg bg-white p-2 text-[#4b41e1] shadow-sm">
                        <span className="material-symbols-outlined">directions_bus</span>
                      </div>
                      <div>
                        <p className="text-sm font-semibold">
                          {Math.round(selectedShelter.occupied * 0.15)} people expected
                        </p>
                        <p className="text-xs text-[#45464e]">{selectedShelter.location} Response</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-xs font-bold text-[#4b41e1]">ETA 15m</p>
                      <p className="text-[10px] font-bold uppercase text-[#76767f]">En Route</p>
                    </div>
                  </div>
                </div>

                <div className="flex-1">
                  <p className="mb-4 text-xs font-bold uppercase text-[#45464e]">Recent Activity</p>
                  <div className="space-y-5">
                    <Activity color="bg-[#4CAF50]" text="Shelter activated for response" time="Just now" />
                    <Activity color="bg-[#FF5252]" text="Resource request submitted" time="45 mins ago" />
                    <Activity color="bg-[#76767f]" text={`${selectedShelter.incidentCount || 0} incidents linked`} time="Active" />
                  </div>
                </div>

                <div className="mt-5 flex gap-3 border-t border-gray-200 pt-5">
                  <button className="flex-1 rounded-xl border border-gray-300 py-2.5 text-sm font-semibold transition hover:bg-gray-50">
                    Details
                  </button>
                  <button className="flex-1 rounded-xl bg-[#4b41e1] py-2.5 text-sm font-semibold text-white transition hover:bg-[#645efb]">
                    Request Resources
                  </button>
                </div>
              </div>
            )}
          </div>
        </section>
      </div>
    </AdminLayout>
  );
}

const Row = ({ label, value }) => (
  <div className="flex justify-between">
    <span className="text-[#76767f]">{label}</span>
    <span className="font-semibold">{value}</span>
  </div>
);

const Activity = ({ color, text, time }) => (
  <div className="flex gap-3">
    <span className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${color}`} />
    <div>
      <p className="text-sm">{text}</p>
      <p className="mt-1 text-xs text-[#76767f]">{time}</p>
    </div>
  </div>
);

export default ShelterManagement;