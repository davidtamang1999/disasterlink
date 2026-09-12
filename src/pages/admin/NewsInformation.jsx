import AdminLayout from "../../layouts/AdminLayout";
import { useDisaster } from "../../context/DisasterContext";
import { useAuth } from "../../context/AuthContext";

function AdminNewsInformation() {
  const { incidents } = useDisaster();
  const { user } = useAuth();

  const totalIncidents = incidents.length;
  const criticalIncidents = incidents.filter(i =>
    i.severity === "Critical" || i.severity === "CRITICAL"
  ).length;
  const uniqueLocations = [...new Set(incidents.map(i => i.location).filter(Boolean))];

  const generateArticles = () => {
    const articles = [];

    incidents
      .filter(i => i.severity === "Critical" || i.severity === "CRITICAL")
      .forEach((inc) => {
        articles.push({
          title: inc.title || `Critical: ${inc.incidentType || "Emergency"} at ${inc.location || "Unknown"}`,
          location: inc.location || "Unknown",
          category: inc.incidentType || "Emergency",
          priority: "Critical",
          priorityColor: "text-[#FF5252]",
          priorityDot: "bg-[#FF5252]",
          status: "Published",
          author: inc.reportedBy?.name || "EOC Admin",
          views: `${Math.floor(Math.random() * 5 + 1)}K`,
          timestamp: inc.timestamp,
        });
      });

    incidents
      .filter(i => i.severity === "High")
      .forEach((inc) => {
        articles.push({
          title: inc.title || `${inc.incidentType || "Alert"} at ${inc.location || "Unknown"}`,
          location: inc.location || "Unknown",
          category: inc.incidentType || "Safety Alert",
          priority: "High",
          priorityColor: "text-[#FF9800]",
          priorityDot: "bg-[#FF9800]",
          status: "Published",
          author: inc.reportedBy?.name || "Safety Team",
          views: `${Math.floor(Math.random() * 3 + 1)}K`,
          timestamp: inc.timestamp,
        });
      });

    incidents
      .filter(i => i.severity === "Moderate" || i.severity === "Low")
      .forEach((inc) => {
        articles.push({
          title: inc.title || `${inc.incidentType || "Update"} in ${inc.location || "Area"}`,
          location: inc.location || "Unknown",
          category: inc.incidentType || "General Update",
          priority: "Moderate",
          priorityColor: "text-[#FFC107]",
          priorityDot: "bg-[#FFC107]",
          status: "Published",
          author: inc.reportedBy?.name || "Relief Coord",
          views: `${Math.floor(Math.random() * 2 + 0.5)}K`,
          timestamp: inc.timestamp,
        });
      });

    return articles;
  };

  const articles = generateArticles();

  const stats = [
    { title: "Published", value: articles.filter(a => a.status === "Published").length, subtitle: "Currently visible", icon: "check_circle", borderColor: "border-[#4CAF50]", iconColor: "text-[#4CAF50]" },
    { title: "Drafts", value: articles.filter(a => a.status === "Draft").length, subtitle: "Not yet published", icon: "edit_document", borderColor: "border-[#c6c6cf]", iconColor: "text-[#76767f]" },
    { title: "Locations", value: uniqueLocations.length, subtitle: "Areas with incidents", icon: "location_on", borderColor: "border-[#4b41e1]", iconColor: "text-[#4b41e1]" },
    { title: "Emergency Updates", value: criticalIncidents, subtitle: "High-priority active", icon: "warning", borderColor: "border-[#FF5252]", iconColor: "text-[#FF5252]" },
    { title: "Total Incidents", value: totalIncidents, subtitle: "This month", icon: "monitoring", borderColor: "border-[#6063ee]", iconColor: "text-[#4b41e1]" },
  ];

  const featuredArticle = articles.find(a => a.priority === "Critical") || articles[0];

  return (
    <AdminLayout title="News & Information">
      <div className="space-y-8">

        {/* Page Header */}
        <section className="flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
          <div>
            <h1 className="font-['Space_Grotesk'] text-3xl font-bold text-[#1b1b1e]">News & Information</h1>
            <p className="mt-2 max-w-2xl text-[#45464e]">
              Publish verified disaster updates, safety guidance, announcements, and community information.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button className="flex items-center gap-2 rounded-xl border-2 border-[#4b41e1]/20 px-5 py-3 font-semibold text-[#4b41e1] transition hover:bg-[#4b41e1]/5">
              <span className="material-symbols-outlined">visibility</span>
              Preview Public Page
            </button>
            <button className="flex items-center gap-2 rounded-xl bg-[#4b41e1] px-5 py-3 font-semibold text-white shadow-sm transition hover:bg-[#645efb]">
              <span className="material-symbols-outlined">add</span>
              Create Article
            </button>
          </div>
        </section>

        {/* Stats */}
        <section className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-5">
          {stats.map((stat) => (
            <div
              key={stat.title}
              className={`min-h-[170px] rounded-xl border-t-4 ${stat.borderColor} bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-md`}
            >
              <div className="mb-5 flex items-center justify-between">
                <span className="text-sm font-bold uppercase text-[#45464e]">{stat.title}</span>
                <span className={`material-symbols-outlined ${stat.iconColor}`}>{stat.icon}</span>
              </div>
              <div className="font-['Space_Grotesk'] text-3xl font-bold text-[#1b1b1e]">{stat.value}</div>
              <p className="mt-2 text-xs font-semibold text-[#76767f]">{stat.subtitle}</p>
            </div>
          ))}
        </section>

        {/* Main grid */}
        <section className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Featured */}
          <div className="flex flex-col rounded-[20px] bg-white p-6 shadow-sm">
            <div className="mb-6 flex items-center justify-between border-b border-gray-100 pb-4">
              <h2 className="font-['Space_Grotesk'] text-xl font-bold">Featured Update</h2>
              {featuredArticle?.priority === "Critical" && (
                <span className="flex items-center gap-1 rounded-full bg-[#FF5252]/10 px-3 py-1 text-xs font-bold text-[#FF5252]">
                  <span className="h-2 w-2 rounded-full bg-[#FF5252]" />
                  High Priority
                </span>
              )}
            </div>

            {featuredArticle ? (
              <div className="flex flex-1 flex-col">
                <div className="relative mb-4 h-48 overflow-hidden rounded-xl bg-gradient-to-br from-[#dbeafe] to-[#dcfce7]">
                  <span className="absolute left-4 top-4 rounded-lg bg-[#4b41e1] px-3 py-1 text-xs font-bold text-white">
                    {featuredArticle.category || "Update"}
                  </span>
                </div>

                <h3 className="font-['Space_Grotesk'] text-2xl font-bold">{featuredArticle.title}</h3>

                <div className="mb-6 mt-5 space-y-3 text-sm text-[#45464e]">
                  <InfoRow label="Author" value={featuredArticle.author} />
                  <InfoRow
                    label="Published"
                    value={
                      featuredArticle.timestamp
                        ? new Date(featuredArticle.timestamp).toLocaleString()
                        : "Today"
                    }
                  />
                  <InfoRow label="Views" value={featuredArticle.views || "1.2K"} />
                  <div className="flex items-center justify-between border-t border-gray-100 pt-3">
                    <span>Status:</span>
                    <span className="flex items-center gap-1 font-semibold text-[#4CAF50]">
                      <span className="h-2 w-2 rounded-full bg-[#4CAF50]" />
                      {featuredArticle.status || "Published"}
                    </span>
                  </div>
                </div>

                <div className="mt-auto flex gap-2">
                  <button className="flex-1 rounded-lg bg-[#4b41e1] py-2.5 font-semibold text-white transition hover:bg-[#645efb]">
                    View Details
                  </button>
                  <button className="rounded-lg border border-gray-200 p-2.5 text-[#45464e] transition hover:bg-gray-50">
                    <span className="material-symbols-outlined">edit</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex flex-1 flex-col items-center justify-center text-center text-[#45464e]">
                <span className="material-symbols-outlined text-5xl text-gray-300">article</span>
                <p className="mt-4 font-semibold">No featured updates</p>
                <p className="text-sm">Incidents will appear here when reported</p>
              </div>
            )}
          </div>

          {/* Table */}
          <div className="flex flex-col overflow-hidden rounded-[20px] bg-white shadow-sm lg:col-span-2">
            <div className="border-b border-gray-100 p-6">
              <div className="flex flex-col gap-5">
                <div className="flex items-center justify-between">
                  <h2 className="font-['Space_Grotesk'] text-xl font-bold">Content Management</h2>
                  <button className="flex items-center gap-2 rounded-lg bg-[#4b41e1]/10 px-4 py-2 font-semibold text-[#4b41e1] transition hover:bg-[#4b41e1]/20">
                    <span className="material-symbols-outlined text-[20px]">download</span>
                    Export CSV
                  </button>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  <div className="relative min-w-[240px] flex-1">
                    <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[#76767f]">search</span>
                    <input
                      type="text"
                      placeholder="Search articles..."
                      className="w-full rounded-lg border border-gray-200 bg-[#f5f7fb] py-2 pl-10 pr-4 text-sm outline-none transition focus:border-[#4b41e1] focus:ring-2 focus:ring-[#4b41e1]/20"
                    />
                  </div>
                  <select className="rounded-lg border border-gray-200 bg-[#f5f7fb] px-3 py-2 text-sm font-semibold text-[#45464e] outline-none focus:border-[#4b41e1]">
                    <option>All Categories</option>
                    <option>Flood Updates</option>
                    <option>Safety Guidelines</option>
                  </select>
                  <select className="rounded-lg border border-gray-200 bg-[#f5f7fb] px-3 py-2 text-sm font-semibold text-[#45464e] outline-none focus:border-[#4b41e1]">
                    <option>All Status</option>
                    <option>Published</option>
                    <option>Draft</option>
                  </select>
                  <button className="rounded-lg border border-gray-200 p-2 text-[#45464e] transition hover:bg-gray-50">
                    <span className="material-symbols-outlined">filter_list</span>
                  </button>
                </div>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full min-w-[850px] border-collapse text-left">
                <thead className="border-b border-gray-100 bg-[#f5f7fb]">
                  <tr className="text-xs font-bold uppercase tracking-wider text-[#76767f]">
                    <th className="px-6 py-4">Article</th>
                    <th className="px-6 py-4">Category</th>
                    <th className="px-6 py-4">Priority</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4">Author</th>
                    <th className="px-6 py-4">Views</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {articles.length > 0 ? (
                    articles.slice(0, 5).map((article, index) => (
                      <tr key={index} className="transition hover:bg-[#f5f7fb]">
                        <td className="px-6 py-4">
                          <div className="font-semibold text-[#1b1b1e]">{article.title}</div>
                          <div className="mt-1 flex items-center gap-1 text-sm text-[#76767f]">
                            <span className="material-symbols-outlined text-[14px]">location_on</span>
                            {article.location}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="rounded bg-gray-100 px-2 py-1 text-xs font-semibold text-[#45464e]">
                            {article.category}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`flex items-center gap-1 text-xs font-bold ${article.priorityColor}`}>
                            <span className={`h-2 w-2 rounded-full ${article.priorityDot}`} />
                            {article.priority}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className="rounded bg-[#4CAF50]/10 px-2 py-1 text-xs font-bold text-[#4CAF50]">
                            {article.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-[#45464e]">{article.author}</td>
                        <td className="px-6 py-4 text-sm text-[#45464e]">{article.views}</td>
                        <td className="px-6 py-4">
                          <div className="flex items-center justify-end gap-2">
                            <button className="flex h-8 w-8 items-center justify-center rounded text-[#4b41e1] transition hover:bg-[#4b41e1]/10">
                              <span className="material-symbols-outlined text-[18px]">edit</span>
                            </button>
                            <button className="flex h-8 w-8 items-center justify-center rounded text-[#45464e] transition hover:bg-gray-100">
                              <span className="material-symbols-outlined text-[18px]">more_vert</span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="7" className="px-6 py-8 text-center text-[#45464e]">
                        No articles available. Submit incidents to generate content.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <div className="mt-auto flex justify-center border-t border-gray-100 bg-white p-4">
              <button className="font-semibold text-[#4b41e1] hover:underline">View All Content</button>
            </div>
          </div>
        </section>
      </div>
    </AdminLayout>
  );
}

const InfoRow = ({ label, value }) => (
  <div className="flex items-center justify-between">
    <span>{label}:</span>
    <span className="font-semibold text-[#1b1b1e]">{value}</span>
  </div>
);

export default AdminNewsInformation;