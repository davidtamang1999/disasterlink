import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const ResidentSidebar = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { logout } = useAuth();

    const navItems = [
        {
            label: "Dashboard",
            icon: "dashboard",
            path: "/resident",
        },
        {
            label: "Report Disaster",
            icon: "report",
            path: "/report-disaster",
        },
        {
            label: "My Reports",
            icon: "assignment",
            path: "/reports",
        },
        {
            label: "Live Disaster Map",
            icon: "map",
            path: "/resident/map",
        },
        {
            label: "Alerts & Notifications",
            icon: "notifications",
            path: "/resident/alerts",
        },
        {
            label: "Emergency Resources",
            icon: "inventory_2",
            path: "/resident/resources",
        },
        {
            label: "News & Information",
            icon: "newspaper",
            path: "/resident/news",
        },
    ];

    const isActive = (path) => {
        return location.pathname === path;
    };

    return (
        <aside className="fixed left-0 top-0 z-50 flex h-screen w-[280px] flex-col bg-[#192640] text-white overflow-y-auto">

            {/* ================= LOGO ================= */}
            <div className="flex items-center gap-3 px-6 py-8">

                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#4B41E1]">
                    <span className="material-symbols-outlined text-[24px]">
                        shield
                    </span>
                </div>

                <div>
                    <h1 className="text-xl font-bold tracking-tight">
                        DisasterLink
                    </h1>

                    <p className="mt-1 text-[10px] font-semibold uppercase tracking-wider text-gray-400">
                        Community Disaster Hub
                    </p>
                </div>

            </div>

            {/* ================= REPORT DISASTER BUTTON ================= */}
            <div className="px-5 pb-6">

                <button
                    onClick={() =>
                        navigate("/report-disaster", {
                            viewTransition: true,
                        })
                    }
                    className="flex w-full items-center justify-center gap-2 rounded-lg bg-[#4B41E1] px-4 py-3 font-semibold transition hover:bg-[#3f36c8]"
                >
                    <span className="material-symbols-outlined text-[20px]">
                        report
                    </span>

                    Report Disaster
                </button>

            </div>

            {/* ================= NAVIGATION ================= */}
            <nav className="flex-1 space-y-2 px-3">

                {navItems.map((item) => {

                    const active = isActive(item.path);

                    return (
                        <button
                            key={item.path}
                            onClick={() =>
                                navigate(item.path, {
                                    viewTransition: true,
                                })
                            }
                            className={`relative flex w-full items-center gap-4 rounded-lg px-4 py-3 text-left text-sm font-medium transition
                ${active
                                    ? "bg-[#3d4963] text-white"
                                    : "text-gray-300 hover:bg-[#26344f] hover:text-white"
                                }`}
                        >

                            {/* Active Indicator */}
                            {active && (
                                <span className="absolute left-0 top-0 h-full w-1 rounded-l-lg bg-[#5B4FE9]" />
                            )}

                            <span className="material-symbols-outlined text-[21px]">
                                {item.icon}
                            </span>

                            {item.label}

                        </button>
                    );
                })}

            </nav>

            {/* ================= BOTTOM SECTION ================= */}
            <div className="border-t border-white/10 px-3 py-5">

                <button
                    className="flex w-full items-center gap-4 rounded-lg px-4 py-3 text-left text-sm font-medium text-gray-300 transition hover:bg-[#26344f] hover:text-white"
                >
                    <span className="material-symbols-outlined text-[21px]">
                        settings
                    </span>

                    Settings
                </button>

                <button
                    className="flex w-full items-center gap-4 rounded-lg px-4 py-3 text-left text-sm font-medium text-gray-300 transition hover:bg-[#26344f] hover:text-white"
                >
                    <span className="material-symbols-outlined text-[21px]">
                        help
                    </span>

                    Help & Support
                </button>

                <button
                    onClick={() => {
                        logout();
                        navigate("/login", {
                            viewTransition: true,
                        });
                    }}
                    className="flex w-full items-center gap-4 rounded-lg px-4 py-3 text-left text-sm font-medium text-red-400 transition hover:bg-[#26344f] hover:text-red-300"
                >
                    <span className="material-symbols-outlined text-[21px]">
                        logout
                    </span>

                    Logout
                </button>

            </div>

        </aside>
    );
};

export default ResidentSidebar;