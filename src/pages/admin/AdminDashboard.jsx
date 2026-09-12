import { Link } from "react-router-dom";
import AdminLayout from "../../layouts/AdminLayout";
import { useDisaster } from "../../context/DisasterContext";
import { useAuth } from "../../context/AuthContext";
import { useResources } from "../../context/ResourceContext";
import DisasterSituationScore from "../../components/DisasterSituationScore";

function AdminDashboard() {
  const { incidents } = useDisaster();
  const { user } = useAuth();
  const { getResourceSummary, getShortageAlerts } = useResources();
  const { getDisasterSituationScore } = useDisaster();
  const situationScore = getDisasterSituationScore();

  const resourceSummary = getResourceSummary();
  const shortages = getShortageAlerts();

  const totalIncidents = incidents.length;
  const activeIncidents = incidents.filter(inc => inc.status !== 'Resolved').length;
  const criticalIncidents = incidents.filter(inc =>
    inc.severity === 'Critical' || inc.severity === 'CRITICAL'
  ).length;
  const pendingReports = incidents.filter(inc =>
    inc.status === 'Pending' || inc.status === 'Under Review' || inc.status === 'Submitted'
  ).length;
  const resolvedIncidents = incidents.filter(inc => inc.status === 'Resolved').length;
  const inProgressIncidents = incidents.filter(inc =>
    inc.status === 'In Progress' || inc.status === 'Responding'
  ).length;
  const unassignedIncidents = incidents.filter(inc => !inc.assignedTo).length;

  const totalAffected = incidents.reduce((sum, inc) =>
    sum + (parseInt(inc.peopleAffected) || 0), 0
  );

  const formatAffected = (num) => {
    if (num >= 1000) return (num / 1000).toFixed(1) + 'k';
    return num.toLocaleString();
  };

  const recentIncidents = [...incidents]
    .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
    .slice(0, 3);

  const resourceData = [
    {
      name: 'Critical',
      value: criticalIncidents.toString(),
      status: criticalIncidents > 0 ? 'Action Required' : 'Stable',
      icon: 'warning',
      statusColor: criticalIncidents > 0 ? 'text-[#FF5252]' : 'text-[#4CAF50]',
      iconColor: criticalIncidents > 0 ? 'text-[#FF5252]' : 'text-[#4b41e1]',
      shortage: criticalIncidents > 0,
    },
    {
      name: 'Pending',
      value: pendingReports.toString(),
      status: pendingReports > 0 ? 'Needs Review' : 'All Reviewed',
      icon: 'pending_actions',
      statusColor: pendingReports > 0 ? 'text-[#FF9800]' : 'text-[#4CAF50]',
      iconColor: pendingReports > 0 ? 'text-[#FF9800]' : 'text-[#4b41e1]',
      shortage: pendingReports > 0,
    },
    {
      name: 'In Progress',
      value: inProgressIncidents.toString(),
      status: inProgressIncidents > 0 ? 'Active Response' : 'No Active',
      icon: 'radio_button_checked',
      statusColor: inProgressIncidents > 0 ? 'text-[#4b41e1]' : 'text-[#45464e]',
      iconColor: inProgressIncidents > 0 ? 'text-[#4b41e1]' : 'text-[#45464e]',
    },
    {
      name: 'Resolved',
      value: resolvedIncidents.toString(),
      status: resolvedIncidents > 0 ? 'Completed' : 'None Yet',
      icon: 'check_circle',
      statusColor: 'text-[#4CAF50]',
      iconColor: 'text-[#4CAF50]',
    },
  ];

  const stats = [
    {
      title: 'Active Incidents',
      value: activeIncidents.toString(),
      subtitle: `${totalIncidents > 0 ? `${Math.round((activeIncidents / totalIncidents) * 100)}% of total` : 'No incidents'}`,
      icon: 'emergency',
      valueColor: 'text-[#1b1b1e]',
      subtitleColor: 'text-[#4CAF50]',
    },
    {
      title: 'Critical Incidents',
      value: criticalIncidents.toString(),
      subtitle: criticalIncidents > 0 ? 'Requires immediate attention' : 'No critical incidents',
      icon: 'warning',
      valueColor: criticalIncidents > 0 ? 'text-[#FF5252]' : 'text-[#1b1b1e]',
      subtitleColor: criticalIncidents > 0 ? 'text-[#FF5252]' : 'text-[#45464e]',
      critical: criticalIncidents > 0,
    },
    {
      title: 'People Affected',
      value: formatAffected(totalAffected),
      subtitle: 'Across active disaster zones',
      icon: 'groups',
      valueColor: 'text-[#1b1b1e]',
      subtitleColor: 'text-[#45464e]',
    },
    {
      title: 'Pending Reports',
      value: pendingReports.toString(),
      subtitle: pendingReports > 0 ? 'Awaiting review' : 'All reviewed',
      icon: 'pending_actions',
      valueColor: pendingReports > 0 ? 'text-[#FF9800]' : 'text-[#1b1b1e]',
      subtitleColor: pendingReports > 0 ? 'text-[#FF9800]' : 'text-[#45464e]',
    },
  ];

  return (
    <AdminLayout title="DisasterLink Admin">
      {/* Welcome Section */}
      <section>
        <div className="flex flex-col gap-2">
          <h2 className="font-['Space_Grotesk'] text-3xl font-bold text-[#1b1b1e]">
            Good morning, {user?.name || 'Administrator'}
          </h2>

          <div className="flex items-center gap-2">
            <span className={`h-2 w-2 rounded-full ${criticalIncidents > 0 ? 'bg-[#FF5252]' : 'bg-[#4CAF50]'}`} />
            <span className={`text-xs font-bold uppercase tracking-wider ${criticalIncidents > 0 ? 'text-[#FF5252]' : 'text-[#4CAF50]'}`}>
              {criticalIncidents > 0 ? '⚠ Critical Incidents Active' : 'System Operational'}
            </span>
          </div>

          <p className="mt-2 max-w-3xl text-[#45464e]">
            {totalIncidents > 0
              ? `Monitor ${activeIncidents} active incidents, ${criticalIncidents} critical alerts requiring attention.`
              : 'No incidents reported. System monitoring active.'}
          </p>
        </div>
      </section>

      {/* Emergency Banner */}
      {criticalIncidents > 0 && (
        <section className="flex flex-col justify-between gap-6 overflow-hidden rounded-[20px] border border-[#FF5252]/20 bg-[#fff0ee] p-6 xl:flex-row xl:items-center">
          <div className="flex items-start gap-4">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#FF5252]">
              <span className="material-symbols-outlined text-white">warning</span>
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-3">
                <h3 className="font-['Space_Grotesk'] text-xl font-bold text-[#93000a]">
                  {criticalIncidents} CRITICAL INCIDENT{criticalIncidents > 1 ? 'S' : ''}
                </h3>
                <span className="text-xs font-bold text-[#FF5252]">● Live Monitoring</span>
              </div>
              <p className="mt-1 font-semibold text-[#FF5252]">Immediate attention required</p>
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            <div className="rounded-xl bg-white/70 px-5 py-3 text-center">
              <p className="text-[10px] font-bold uppercase text-[#45464e]">Total Incidents</p>
              <p className="font-['Space_Grotesk'] text-xl font-bold text-[#FF5252]">{totalIncidents}</p>
            </div>
            <div className="rounded-xl bg-white/70 px-5 py-3 text-center">
              <p className="text-[10px] font-bold uppercase text-[#45464e]">Critical</p>
              <p className="font-['Space_Grotesk'] text-xl font-bold text-[#FF5252]">{criticalIncidents}</p>
            </div>
          </div>

          <div className="flex gap-3">
            <button className="rounded-xl bg-[#FF5252] px-5 py-2 font-semibold text-white transition hover:bg-[#e64646]">
              Manage
            </button>
            <button className="rounded-xl border border-gray-200 bg-white px-5 py-2 font-semibold text-[#1b1b1e] transition hover:bg-gray-50">
              Map
            </button>
          </div>
        </section>
      )}

      {/* Resource Shortage Banner */}
      {resourceSummary.criticalShortages > 0 && (
        <section className="flex flex-col justify-between gap-4 overflow-hidden rounded-[20px] border border-red-200 bg-red-50 p-6 xl:flex-row xl:items-center">
          <div className="flex items-start gap-4">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-red-600">
              <span className="material-symbols-outlined text-white">inventory_2</span>
            </div>
            <div>
              <h3 className="font-['Space_Grotesk'] text-xl font-bold text-red-600">
                {resourceSummary.criticalShortages} Critical Resource Shortage{resourceSummary.criticalShortages > 1 ? 's' : ''}
              </h3>
              <p className="mt-1 text-sm text-red-600/80">
                {resourceSummary.totalShortageItems} total shortage{resourceSummary.totalShortageItems > 1 ? 's' : ''} detected
              </p>
            </div>
          </div>
          <div className="flex flex-wrap gap-3">
            {shortages.slice(0, 2).map((s) => (
              <div key={s.id} className="rounded-xl bg-white/70 px-4 py-2 text-center">
                <p className="text-xs font-bold text-red-600">{s.name}</p>
                <p className="text-sm font-semibold">-{s.shortage} {s.unit}</p>
              </div>
            ))}
            {shortages.length > 2 && (
              <div className="rounded-xl bg-white/70 px-4 py-2 text-center">
                <p className="text-xs font-bold text-gray-600">+{shortages.length - 2} more</p>
              </div>
            )}
          </div>
        </section>
      )}

      {/* Situation Score */}
      <section className="mb-6">
        <DisasterSituationScore
          score={situationScore.score}
          level={situationScore.level}
          details={situationScore.details}
          summary={situationScore.summary}
        />
      </section>

      {/* Main Grid */}
      <section className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <div className="space-y-6 xl:col-span-2">
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            {stats.map((stat) => (
              <div
                key={stat.title}
                className={`min-h-[180px] rounded-[20px] bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-md ${
                  stat.critical ? 'border-l-4 border-[#FF5252]' : ''
                }`}
              >
                <div className="mb-5 flex items-start justify-between">
                  <span className={`material-symbols-outlined rounded-lg p-2 ${
                    stat.critical ? 'bg-[#FF5252]/10 text-[#FF5252]' : 'bg-[#4b41e1]/10 text-[#4b41e1]'
                  }`}>
                    {stat.icon}
                  </span>

                  {stat.title === 'Active Incidents' && activeIncidents > 0 && (
                    <span className="rounded-full bg-[#FF5252]/10 px-2 py-1 text-xs font-bold text-[#FF5252]">
                      +{activeIncidents}
                    </span>
                  )}
                </div>

                <div className={`text-3xl font-bold ${stat.valueColor}`}>{stat.value}</div>
                <p className="mt-2 text-sm font-semibold text-[#45464e]">{stat.title}</p>
                <p className={`mt-1 text-xs ${stat.subtitleColor}`}>{stat.subtitle}</p>
              </div>
            ))}
          </div>

          <div className="flex min-h-[500px] flex-col overflow-hidden rounded-[20px] bg-white shadow-sm">
            <div className="flex items-center justify-between border-b border-gray-100 p-6">
              <h3 className="font-['Space_Grotesk'] text-xl font-bold">Live Disaster Overview</h3>
              <div className="flex gap-2">
                <button className="rounded-lg border border-gray-200 p-2 text-[#45464e] hover:bg-gray-50">
                  <span className="material-symbols-outlined">search</span>
                </button>
                <button className="rounded-lg border border-gray-200 p-2 text-[#45464e] hover:bg-gray-50">
                  <span className="material-symbols-outlined">filter_list</span>
                </button>
                <button className="rounded-lg border border-gray-200 p-2 text-[#45464e] hover:bg-gray-50">
                  <span className="material-symbols-outlined">layers</span>
                </button>
              </div>
            </div>

            <div className="relative flex min-h-[390px] flex-1 items-center justify-center overflow-hidden bg-gradient-to-br from-[#dbeafe] via-[#e0f2fe] to-[#dcfce7]">
              <div className="text-center">
                <span className="material-symbols-outlined text-6xl text-[#4b41e1]">map</span>
                <p className="mt-3 font-semibold text-[#45464e]">Kathmandu Valley Disaster Overview</p>
                <p className="mt-1 text-sm text-[#76767f]">{totalIncidents} incidents reported</p>
              </div>

              {criticalIncidents > 0 && (
                <div className="absolute left-[42%] top-[38%]">
                  <div className="h-5 w-5 rounded-full border-2 border-white bg-[#FF5252] shadow-lg" />
                </div>
              )}
              {criticalIncidents > 1 && (
                <div className="absolute left-[57%] top-[52%]">
                  <div className="h-5 w-5 rounded-full border-2 border-white bg-[#FF5252] shadow-lg" />
                </div>
              )}
              {totalIncidents > 0 && (
                <div className="absolute left-[48%] top-[65%]">
                  <div className="h-5 w-5 rounded-full border-2 border-white bg-[#FF9800] shadow-lg" />
                </div>
              )}

              <div className="absolute left-[30%] top-[58%] flex h-9 w-9 items-center justify-center rounded-full border-2 border-white bg-[#4b41e1] text-white shadow-lg">
                <span className="material-symbols-outlined text-[18px]">home</span>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-4 border-t border-gray-100 px-6 py-4">
              <div className="flex items-center gap-5 text-xs">
                {criticalIncidents > 0 && (
                  <div className="flex items-center gap-2">
                    <span className="h-3 w-3 rounded-full bg-[#FF5252]" />
                    Critical ({criticalIncidents})
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <span className="h-3 w-3 rounded-full bg-[#FF9800]" />
                  Active ({activeIncidents})
                </div>
                <div className="flex items-center gap-2">
                  <span className="h-3 w-3 rounded-full bg-[#4b41e1]" />
                  Shelter
                </div>
              </div>
              <span className="text-xs text-[#76767f]">Last updated: Just now</span>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="rounded-[20px] bg-white p-6 shadow-sm">
            <div className="mb-5 flex items-center justify-between">
              <h3 className="font-['Space_Grotesk'] text-xl font-bold">Critical Incidents</h3>
              <span className={`rounded-full px-3 py-1 text-xs font-bold ${
                criticalIncidents > 0 ? 'bg-[#FF5252]/10 text-[#FF5252]' : 'bg-gray-100 text-gray-500'
              }`}>
                {criticalIncidents} Active
              </span>
            </div>

            {criticalIncidents > 0 ? (
              incidents
                .filter(inc => inc.severity === 'Critical' || inc.severity === 'CRITICAL')
                .slice(0, 3)
                .map((inc, index) => (
                  <div
                    key={inc.id}
                    className={`rounded-xl border border-[#FF5252]/20 border-l-4 border-l-[#FF5252] bg-[#FF5252]/5 p-4 ${index > 0 ? 'mt-3' : ''}`}
                  >
                    <h4 className="font-semibold">{inc.title || 'Critical Incident'}</h4>
                    <p className="mt-2 text-sm leading-relaxed text-[#45464e]">
                      {inc.description || `${inc.location || 'Unknown location'} - ${inc.severity} severity`}
                    </p>
                    <div className="mt-4 flex items-center justify-between">
                      <div className="flex gap-4 text-xs font-semibold">
                        <div className="flex items-center gap-1 text-[#FF9800]">
                          <span className="material-symbols-outlined text-[16px]">group</span>
                          {inc.peopleAffected || 0}
                        </div>
                      </div>
                      <Link
                        to="/incident-management"
                        className="text-xs font-bold text-[#4b41e1] hover:underline"
                      >
                        View Incident
                      </Link>
                    </div>
                  </div>
                ))
            ) : (
              <div className="rounded-xl border border-gray-200 p-4 text-center text-[#45464e]">
                No critical incidents at this time.
              </div>
            )}
          </div>

          <div className="rounded-[20px] bg-white p-6 shadow-sm">
            <h3 className="mb-5 font-['Space_Grotesk'] text-xl font-bold">Incident Summary</h3>
            <div className="grid grid-cols-2 gap-3">
              {resourceData.map((item) => (
                <div
                  key={item.name}
                  className={`rounded-xl border p-4 ${
                    item.shortage
                      ? 'border-[#FF5252]/30 bg-[#FF5252]/5'
                      : 'border-gray-100 bg-[#f5f7fb]'
                  }`}
                >
                  <div className="mb-3 flex items-center gap-2">
                    <span className={`material-symbols-outlined ${item.iconColor}`}>{item.icon}</span>
                    <span className="text-sm font-semibold text-[#45464e]">{item.name}</span>
                  </div>

                  <div className="flex flex-col gap-1">
                    <span className={`font-['Space_Grotesk'] text-2xl font-bold ${
                      item.shortage ? 'text-[#FF5252]' : 'text-[#1b1b1e]'
                    }`}>
                      {item.value}
                    </span>
                    <span className={`text-xs font-semibold ${item.statusColor}`}>{item.status}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Bottom */}
      <section className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <div className="rounded-[20px] bg-white p-6 shadow-sm xl:col-span-2">
          <h3 className="mb-6 font-['Space_Grotesk'] text-xl font-bold">Recent Activity</h3>

          {recentIncidents.length > 0 ? (
            <div className="space-y-5">
              {recentIncidents.map((inc, index) => {
                const statusColors = {
                  Critical: 'bg-[#FF5252]',
                  High: 'bg-[#FF9800]',
                  Moderate: 'bg-[#FFC107]',
                  Low: 'bg-[#4CAF50]',
                };
                const color = statusColors[inc.severity] || 'bg-[#4b41e1]';

                return (
                  <div
                    key={inc.id}
                    className={`flex gap-4 ${index < recentIncidents.length - 1 ? 'border-b border-gray-100 pb-5' : ''}`}
                  >
                    <span className={`mt-2 h-2 w-2 shrink-0 rounded-full ${color}`} />
                    <div>
                      <p className="text-sm font-medium">
                        {inc.title || 'Incident reported'} — {inc.location || 'Unknown location'}
                      </p>
                      <span className="mt-1 block text-xs text-[#76767f]">
                        {inc.timestamp ? new Date(inc.timestamp).toLocaleString() : 'Just now'} · {inc.status || 'Pending'} · {inc.severity || 'Unknown'} severity
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="py-8 text-center text-[#45464e]">
              No recent activity. Incidents will appear here when reported.
            </div>
          )}
        </div>

        <div className="flex flex-col rounded-[20px] bg-white p-6 shadow-sm">
          <h3 className="mb-6 font-['Space_Grotesk'] text-xl font-bold">Incident Status</h3>

          <div className="grid grid-cols-2 gap-4">
            <div className="rounded-xl border border-gray-100 bg-[#f5f7fb] p-4 text-center">
              <p className="text-2xl font-bold">{activeIncidents}</p>
              <p className="mt-1 text-[10px] font-bold uppercase text-[#76767f]">Active</p>
            </div>
            <div className="rounded-xl border border-gray-100 bg-[#f5f7fb] p-4 text-center">
              <p className="text-2xl font-bold text-[#4CAF50]">{resolvedIncidents}</p>
              <p className="mt-1 text-[10px] font-bold uppercase text-[#76767f]">Resolved</p>
            </div>
            <div className="rounded-xl border border-gray-100 bg-[#f5f7fb] p-4 text-center">
              <p className="text-2xl font-bold text-[#FF9800]">{pendingReports}</p>
              <p className="mt-1 text-[10px] font-bold uppercase text-[#76767f]">Pending</p>
            </div>
            <div className="rounded-xl border border-gray-100 bg-[#f5f7fb] p-4 text-center">
              <p className="text-2xl font-bold text-[#4b41e1]">{criticalIncidents}</p>
              <p className="mt-1 text-[10px] font-bold uppercase text-[#76767f]">Critical</p>
            </div>
          </div>

          <Link
            to="/incident-management"
            className="mt-6 flex items-center justify-center gap-2 font-semibold text-[#4b41e1] hover:underline"
          >
            View All Incidents
            <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
          </Link>
        </div>
      </section>
    </AdminLayout>
  );
}

export default AdminDashboard;