import { useState } from "react";
import AdminLayout from "../../layouts/AdminLayout";
import { useDisaster } from "../../context/DisasterContext";
import { useAuth } from "../../context/AuthContext";

const ReportsAnalytics = () => {
  const { incidents } = useDisaster();
  const { currentUser } = useAuth();
  const [timeRange, setTimeRange] = useState("weekly");

  const processChartData = () => {
    const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
    const today = new Date();

    const filteredIncidents = incidents.filter(inc => {
      const date = new Date(inc.timestamp);
      const diffDays = (today - date) / (1000 * 60 * 60 * 24);
      if (timeRange === "today") return diffDays < 1;
      if (timeRange === "weekly") return diffDays < 7;
      if (timeRange === "monthly") return diffDays < 30;
      return true;
    });

    const trends = days.map(day =>
      filteredIncidents.filter(inc => new Date(inc.timestamp).toLocaleDateString("en-US", { weekday: "short" }) === day).length
    );

    const criticalTrends = days.map(day =>
      filteredIncidents.filter(inc => {
        const incDay = new Date(inc.timestamp).toLocaleDateString("en-US", { weekday: "short" });
        return incDay === day && (inc.severity === "Critical" || inc.severity === "CRITICAL");
      }).length
    );

    const resolvedTrends = days.map(day =>
      filteredIncidents.filter(inc => {
        const incDay = new Date(inc.timestamp).toLocaleDateString("en-US", { weekday: "short" });
        return incDay === day && inc.status === "Resolved";
      }).length
    );

    const severityCounts = {
      Critical: filteredIncidents.filter(inc => inc.severity === "Critical" || inc.severity === "CRITICAL").length,
      High: filteredIncidents.filter(inc => inc.severity === "High").length,
      Moderate: filteredIncidents.filter(inc => inc.severity === "Moderate").length,
      Low: filteredIncidents.filter(inc => inc.severity === "Low").length,
    };

    const statusCounts = {
      Pending: filteredIncidents.filter(inc => inc.status === "Pending").length,
      "In Progress": filteredIncidents.filter(inc => inc.status === "In Progress" || inc.status === "Under Review").length,
      Resolved: filteredIncidents.filter(inc => inc.status === "Resolved").length,
    };

    const maxTrend = Math.max(...trends, 1);
    const severityTotal = Object.values(severityCounts).reduce((a, b) => a + b, 1);

    return { trends, criticalTrends, resolvedTrends, severityCounts, statusCounts, maxTrend, severityTotal };
  };

  const chartData = processChartData();

  const timeRangeSelector = (
    <select
      className="cursor-pointer rounded-xl border border-gray-300 bg-white py-2 pl-4 pr-10 text-sm font-semibold outline-none focus:ring-2 focus:ring-indigo-500"
      value={timeRange}
      onChange={(e) => setTimeRange(e.target.value)}
    >
      <option value="today">Today</option>
      <option value="weekly">Last 7 Days</option>
      <option value="monthly">Last 30 Days</option>
    </select>
  );

  return (
    <AdminLayout title="Reports & Analytics" headerRight={timeRangeSelector}>
      <div className="mx-auto w-full max-w-[1440px] space-y-6">

        <div>
          <h1 className="mb-2 text-3xl font-bold text-black">Reports & Analytics</h1>
          <p className="text-gray-500">Analyze disaster trends, response performance, and community impact.</p>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
          <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
            <p className="text-sm text-gray-500">Total Incidents</p>
            <p className="text-3xl font-bold">{incidents.length}</p>
          </div>
          <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
            <p className="text-sm text-gray-500">Critical Incidents</p>
            <p className="text-3xl font-bold text-red-600">
              {incidents.filter(i => i.severity === "Critical" || i.severity === "CRITICAL").length}
            </p>
          </div>
          <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
            <p className="text-sm text-gray-500">Resolution Rate</p>
            <p className="text-3xl font-bold text-green-600">
              {incidents.length > 0
                ? `${Math.round((incidents.filter(i => i.status === "Resolved").length / incidents.length) * 100)}%`
                : "0%"}
            </p>
          </div>
          <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
            <p className="text-sm text-gray-500">Active Incidents</p>
            <p className="text-3xl font-bold text-orange-500">
              {incidents.filter(i => i.status !== "Resolved").length}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* Line chart */}
          <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
            <h3 className="mb-4 text-lg font-semibold">Incident Trends</h3>
            <div className="relative h-[250px]">
              <svg className="h-full w-full" viewBox="0 0 100 100" preserveAspectRatio="none">
                <line x1="0" y1="20" x2="100" y2="20" stroke="#e5e7eb" strokeWidth="0.5" />
                <line x1="0" y1="40" x2="100" y2="40" stroke="#e5e7eb" strokeWidth="0.5" />
                <line x1="0" y1="60" x2="100" y2="60" stroke="#e5e7eb" strokeWidth="0.5" />
                <line x1="0" y1="80" x2="100" y2="80" stroke="#e5e7eb" strokeWidth="0.5" />

                <polyline
                  points={chartData.trends.map((value, index) => {
                    const x = (index / (chartData.trends.length - 1)) * 100;
                    const y = 100 - (value / chartData.maxTrend) * 80;
                    return `${index === 0 ? "M" : "L"} ${x},${y}`;
                  }).join(" ")}
                  fill="none" stroke="#4648d4" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                />
                <polyline
                  points={chartData.criticalTrends.map((value, index) => {
                    const x = (index / (chartData.criticalTrends.length - 1)) * 100;
                    const y = 100 - (value / chartData.maxTrend) * 80;
                    return `${index === 0 ? "M" : "L"} ${x},${y}`;
                  }).join(" ")}
                  fill="none" stroke="#FF5252" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                />
                <polyline
                  points={chartData.resolvedTrends.map((value, index) => {
                    const x = (index / (chartData.resolvedTrends.length - 1)) * 100;
                    const y = 100 - (value / chartData.maxTrend) * 80;
                    return `${index === 0 ? "M" : "L"} ${x},${y}`;
                  }).join(" ")}
                  fill="none" stroke="#22c55e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                />
              </svg>
              <div className="mt-1 flex justify-between text-xs text-gray-500">
                {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day, i) => (
                  <span key={i}>{day}</span>
                ))}
              </div>
            </div>
            <div className="mt-4 flex flex-wrap justify-center gap-4">
              <Legend color="#4648d4" label="Total" />
              <Legend color="#FF5252" label="Critical" />
              <Legend color="#22c55e" label="Resolved" />
            </div>
          </div>

          {/* Doughnut */}
          <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
            <h3 className="mb-4 text-lg font-semibold">Severity Distribution</h3>
            <div className="flex h-[250px] items-center justify-center">
              <div className="relative h-48 w-48">
                <svg className="h-full w-full -rotate-90" viewBox="0 0 36 36">
                  <circle cx="18" cy="18" r="15.9" fill="transparent" stroke="#FF5252" strokeWidth="3.5"
                    strokeDasharray={`${(chartData.severityCounts.Critical / chartData.severityTotal) * 100} ${100 - (chartData.severityCounts.Critical / chartData.severityTotal) * 100}`}
                    strokeDashoffset="0" />
                  <circle cx="18" cy="18" r="15.9" fill="transparent" stroke="#FF9800" strokeWidth="3.5"
                    strokeDasharray={`${(chartData.severityCounts.High / chartData.severityTotal) * 100} ${100 - (chartData.severityCounts.High / chartData.severityTotal) * 100}`}
                    strokeDashoffset={`-${(chartData.severityCounts.Critical / chartData.severityTotal) * 100}`} />
                  <circle cx="18" cy="18" r="15.9" fill="transparent" stroke="#FFC107" strokeWidth="3.5"
                    strokeDasharray={`${(chartData.severityCounts.Moderate / chartData.severityTotal) * 100} ${100 - (chartData.severityCounts.Moderate / chartData.severityTotal) * 100}`}
                    strokeDashoffset={`-${((chartData.severityCounts.Critical + chartData.severityCounts.High) / chartData.severityTotal) * 100}`} />
                  <circle cx="18" cy="18" r="15.9" fill="transparent" stroke="#4CAF50" strokeWidth="3.5"
                    strokeDasharray={`${(chartData.severityCounts.Low / chartData.severityTotal) * 100} ${100 - (chartData.severityCounts.Low / chartData.severityTotal) * 100}`}
                    strokeDashoffset={`-${((chartData.severityCounts.Critical + chartData.severityCounts.High + chartData.severityCounts.Moderate) / chartData.severityTotal) * 100}`} />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-2xl font-bold">{incidents.length}</span>
                  <span className="text-xs text-gray-500">Total</span>
                </div>
              </div>
            </div>
            <div className="mt-4 flex flex-wrap justify-center gap-3">
              <Legend color="#FF5252" label={`Critical (${chartData.severityCounts.Critical})`} />
              <Legend color="#FF9800" label={`High (${chartData.severityCounts.High})`} />
              <Legend color="#FFC107" label={`Moderate (${chartData.severityCounts.Moderate})`} />
              <Legend color="#4CAF50" label={`Low (${chartData.severityCounts.Low})`} />
            </div>
          </div>

          {/* Bar chart */}
          <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm lg:col-span-2">
            <h3 className="mb-4 text-lg font-semibold">Status Distribution</h3>
            <div className="flex h-[200px] items-end justify-around px-4">
              {["Pending", "In Progress", "Resolved"].map((status, index) => {
                const value =
                  status === "Pending" ? chartData.statusCounts.Pending :
                  status === "In Progress" ? chartData.statusCounts["In Progress"] :
                  chartData.statusCounts.Resolved;
                const maxVal = Math.max(
                  chartData.statusCounts.Pending,
                  chartData.statusCounts["In Progress"],
                  chartData.statusCounts.Resolved,
                  1
                );
                const height = (value / maxVal) * 100;
                const colors = ["#FF9800", "#4648d4", "#22c55e"];

                return (
                  <div key={status} className="flex w-24 flex-col items-center gap-2">
                    <div
                      className="w-12 rounded-t-lg transition-all"
                      style={{ height: `${Math.max(height, 5)}%`, backgroundColor: colors[index], minHeight: "20px" }}
                    />
                    <span className="text-sm font-bold">{value}</span>
                    <span className="text-xs text-gray-500">{status}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

const Legend = ({ color, label }) => (
  <div className="flex items-center gap-2">
    <div className="h-3 w-3 rounded-full" style={{ backgroundColor: color }} />
    <span className="text-xs font-medium">{label}</span>
  </div>
);

export default ReportsAnalytics;