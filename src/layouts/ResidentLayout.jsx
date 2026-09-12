import { useAuth } from "../context/AuthContext";
import ResidentSidebar from "../components/ResidentSidebar";

/**
 * ResidentLayout
 * Shared shell for every resident page.
 *
 * Props:
 *  - title       → label shown in top-left of header (default: "Resident Dashboard")
 *  - headerRight → optional JSX placed before help/bell/avatar
 */
export default function ResidentLayout({
  children,
  title = "Resident Dashboard",
  headerRight,
}) {
  const { user } = useAuth();

  const initial =
    user?.fullName?.charAt(0) ||
    user?.name?.charAt(0) ||
    "R";

  return (
    <div className="min-h-screen bg-[#f5f7fb] text-[#1b1b1e]">
      {/* Sidebar */}
      <ResidentSidebar />

      {/* Top header */}
      <header className="sticky top-0 z-40 flex h-[72px] items-center justify-between bg-white px-4 shadow-sm md:ml-[280px] md:px-6">
        <div>
          <span className="font-semibold text-[#1b1b1e]">{title}</span>
        </div>

        <div className="flex items-center gap-3 md:gap-4">
          {headerRight}

          <button className="rounded-full p-2 text-[#45464e] transition hover:bg-gray-100">
            <span className="material-symbols-outlined">help</span>
          </button>

          <button className="relative rounded-full p-2 text-[#45464e] transition hover:bg-gray-100">
            <span className="material-symbols-outlined">notifications</span>
            <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-[#FF5252]" />
          </button>

          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#4b41e1] font-bold text-white">
            {initial}
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="space-y-6 p-4 pb-10 md:ml-[280px] md:p-8">
        {children}
      </main>
    </div>
  );
}