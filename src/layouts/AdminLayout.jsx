import { useAuth } from "../context/AuthContext";
import AdminSidebar from "../components/AdminSidebar";

/**
 * AdminLayout
 * Shared shell for every admin page.
 *
 * Provides:
 *  - Fixed AdminSidebar (280px)
 *  - Sticky top header (72px) with notifications + history + avatar
 *  - Main content area with consistent padding + margin
 *
 * Usage:
 *   <AdminLayout>
 *     ...page content...
 *   </AdminLayout>
 *
 * Optional props:
 *   title     – small label in the header (default: "DisasterLink Admin")
 *   headerRight – JSX to render on the right side of the header (before avatar)
 */
export default function AdminLayout({ children, title = "DisasterLink Admin", headerRight }) {
  const { user } = useAuth();

  const initial = user?.fullName?.charAt(0) || user?.name?.charAt(0) || "A";

  return (
    <div className="min-h-screen bg-[#f5f7fb] text-[#1b1b1e]">
      {/* Sidebar */}
      <AdminSidebar />

      {/* Top Header */}
      <header className="sticky top-0 z-40 flex h-[72px] items-center justify-between bg-white px-6 shadow-sm md:ml-[280px]">
        <div className="flex items-center gap-8">
          <span className="font-semibold text-[#1b1b1e]">{title}</span>
        </div>

        <div className="flex items-center gap-4">
          {headerRight}

          <button className="relative rounded-full p-2 text-[#45464e] transition hover:bg-gray-100">
            <span className="material-symbols-outlined">notifications</span>
            <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-[#FF5252]" />
          </button>

          <button className="rounded-full p-2 text-[#45464e] transition hover:bg-gray-100">
            <span className="material-symbols-outlined">history</span>
          </button>

          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#4b41e1] font-bold text-white">
            {initial}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="space-y-6 p-4 pb-10 md:ml-[280px] md:p-8">
        {children}
      </main>
    </div>
  );
}