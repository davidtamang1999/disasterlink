import { useState, useEffect } from "react";
import ResidentLayout from "../../layouts/ResidentLayout";
import { useDisaster } from "../../context/DisasterContext";

export default function ResidentNews() {
  const { incidents } = useDisaster();
  const [newsItems, setNewsItems] = useState([]);
  const [filteredNews, setFilteredNews] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    generateNews();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [incidents]);

  // ---------- Generate news ----------
  const generateNews = () => {
    const savedNews = JSON.parse(localStorage.getItem("residentNews") || "[]");

    if (savedNews.length > 0) {
      setNewsItems(savedNews);
      setFilteredNews(savedNews);
      return;
    }

    const generatedNews = incidents.map((inc, index) => {
      const categories = [
        "Emergency Alert",
        "Safety Update",
        "Weather Advisory",
        "Community Notice",
      ];
      const category =
        inc.severity === "Critical" || inc.severity === "CRITICAL"
          ? "Emergency Alert"
          : categories[index % categories.length];

      const colors = {
        "Emergency Alert": "bg-red-100 text-red-600 border-red-200",
        "Safety Update": "bg-blue-100 text-blue-600 border-blue-200",
        "Weather Advisory": "bg-yellow-100 text-yellow-600 border-yellow-200",
        "Community Notice": "bg-green-100 text-green-600 border-green-200",
      };

      return {
        id: `news-${Date.now()}-${index}`,
        title: inc.title || `Incident Update ${index + 1}`,
        summary: inc.description || "Stay informed about this incident.",
        category,
        color: colors[category] || "bg-gray-100 text-gray-600 border-gray-200",
        date: inc.timestamp
          ? new Date(inc.timestamp).toLocaleDateString()
          : new Date().toLocaleDateString(),
        time: inc.timestamp
          ? new Date(inc.timestamp).toLocaleTimeString()
          : "Just now",
        location: inc.location || "Unknown",
        severity: inc.severity || "Moderate",
        status: inc.status || "Active",
        isCritical: category === "Emergency Alert",
        image: null,
        content: `This is an update regarding ${inc.title || "the incident"} in ${
          inc.location || "the area"
        }. Please stay safe and follow official guidance.`,
      };
    });

    if (generatedNews.length === 0) {
      generatedNews.push(
        {
          id: "news-001",
          title: "Community Safety Tips",
          summary: "Important safety guidelines for all residents.",
          category: "Community Notice",
          color: "bg-green-100 text-green-600 border-green-200",
          date: new Date().toLocaleDateString(),
          time: "Just now",
          location: "All Areas",
          severity: "Info",
          status: "Active",
          isCritical: false,
          image: null,
          content:
            "Stay safe during emergencies. Follow official guidelines, keep emergency contacts ready, and stay informed through official channels.",
        },
        {
          id: "news-002",
          title: "Monsoon Safety Advisory",
          summary: "Be prepared for heavy rainfall and potential flooding.",
          category: "Weather Advisory",
          color: "bg-yellow-100 text-yellow-600 border-yellow-200",
          date: new Date().toLocaleDateString(),
          time: "2h ago",
          location: "Kathmandu Valley",
          severity: "Moderate",
          status: "Active",
          isCritical: false,
          image: null,
          content:
            "The monsoon season is active. Avoid flooded areas, keep emergency supplies ready, and follow evacuation orders if issued.",
        }
      );
    }

    localStorage.setItem("residentNews", JSON.stringify(generatedNews));
    setNewsItems(generatedNews);
    setFilteredNews(generatedNews);
  };

  // ---------- Filters ----------
  const applyFilters = (items, search, category) => {
    let filtered = items;

    if (search) {
      const q = search.toLowerCase();
      filtered = filtered.filter(
        (item) =>
          item.title.toLowerCase().includes(q) ||
          item.summary.toLowerCase().includes(q) ||
          item.location.toLowerCase().includes(q)
      );
    }

    if (category !== "all") {
      filtered = filtered.filter((item) => item.category === category);
    }

    setFilteredNews(filtered);
  };

  const handleSearch = (e) => {
    const v = e.target.value;
    setSearchTerm(v);
    applyFilters(newsItems, v, selectedCategory);
  };

  const handleCategoryFilter = (category) => {
    setSelectedCategory(category);
    applyFilters(newsItems, searchTerm, category);
  };

  const categories = [
    "all",
    "Emergency Alert",
    "Safety Update",
    "Weather Advisory",
    "Community Notice",
  ];

  // ---------- Header extras ----------
  const headerExtras = (
    <div className="relative hidden md:block">
      <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-500">
        search
      </span>
      <input
        type="text"
        placeholder="Search news..."
        className="w-64 rounded-full bg-slate-100 py-2 pl-10 pr-4 text-sm outline-none focus:ring-2 focus:ring-indigo-500"
        value={searchTerm}
        onChange={handleSearch}
      />
    </div>
  );

  return (
    <ResidentLayout title="News & Information" headerRight={headerExtras}>
      <div className="mx-auto max-w-[1440px]">

        {/* ================= PAGE HEADER ================= */}
        <div className="mb-6">
          <h2 className="mb-2 text-3xl font-bold">News & Information</h2>
          <p className="text-slate-500">
            Stay updated with the latest safety alerts, weather advisories, and community notices.
          </p>
        </div>

        {/* ================= STATS ================= */}
        <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-4">
          <StatTile label="Total Updates" value={newsItems.length} />
          <StatTile
            label="Emergency Alerts"
            value={newsItems.filter((n) => n.category === "Emergency Alert").length}
            valueClass="text-red-600"
          />
          <StatTile
            label="Safety Updates"
            value={newsItems.filter((n) => n.category === "Safety Update").length}
            valueClass="text-blue-600"
          />
          <StatTile
            label="Active Notices"
            value={newsItems.filter((n) => n.status === "Active").length}
            valueClass="text-green-600"
          />
        </div>

        {/* ================= CATEGORY FILTERS ================= */}
        <div className="mb-6 flex flex-wrap gap-2">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => handleCategoryFilter(category)}
              className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                selectedCategory === category
                  ? "bg-indigo-600 text-white"
                  : "bg-gray-200 text-gray-700 hover:bg-gray-300"
              }`}
            >
              {category === "all" ? "All" : category}
            </button>
          ))}
        </div>

        {/* ================= NEWS LIST ================= */}
        {filteredNews.length > 0 ? (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredNews.map((item) => (
              <NewsCard key={item.id} item={item} />
            ))}
          </div>
        ) : (
          <div className="rounded-xl border bg-white p-12 text-center shadow-sm">
            <span className="material-symbols-outlined mb-4 block text-6xl text-gray-300">
              newspaper
            </span>
            <h3 className="text-xl font-semibold text-gray-500">No News Found</h3>
            <p className="mt-2 text-gray-400">Try adjusting your filters</p>
          </div>
        )}
      </div>
    </ResidentLayout>
  );
}

/* ---------- Small helpers ---------- */

const StatTile = ({ label, value, valueClass = "" }) => (
  <div className="rounded-xl border bg-white p-4 shadow-sm">
    <p className="text-sm text-slate-500">{label}</p>
    <p className={`text-2xl font-bold ${valueClass}`}>{value}</p>
  </div>
);

const NewsCard = ({ item }) => (
  <div
    className={`rounded-xl border-l-4 bg-white p-6 shadow-sm transition hover:shadow-md ${
      item.isCritical ? "border-red-500" : "border-gray-300"
    }`}
  >
    <div className="mb-3 flex items-start justify-between">
      <span className={`rounded-full px-2 py-1 text-xs font-bold ${item.color}`}>
        {item.category}
      </span>
      {item.isCritical && (
        <span className="material-symbols-outlined text-red-500">warning</span>
      )}
    </div>

    <h3 className="mb-2 text-lg font-semibold">{item.title}</h3>
    <p className="text-sm text-slate-600">{item.summary}</p>

    <div className="mt-4 flex flex-wrap items-center gap-3 text-xs text-slate-500">
      <span className="flex items-center gap-1">
        <span className="material-symbols-outlined text-sm">location_on</span>
        {item.location}
      </span>
      <span className="flex items-center gap-1">
        <span className="material-symbols-outlined text-sm">schedule</span>
        {item.date}
      </span>
    </div>

    <button className="mt-4 text-sm font-semibold text-indigo-600 hover:underline">
      Read More →
    </button>
  </div>
);