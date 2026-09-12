import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import AdminLayout from "../../layouts/AdminLayout";
import { useDisaster } from "../../context/DisasterContext";
import { useAuth } from "../../context/AuthContext";
import { useUsers } from "../../context/UserContext";
import { useAudit } from "../../context/AuditContext";

function UserManagement() {
  const navigate = useNavigate();
  const { incidents } = useDisaster();
  const { currentUser } = useAuth();
  const { logAction } = useAudit();

  // ✅ All user data + actions come from context
  const {
    users,
    stats,
    loading,
    getUserById,
    getInitials,
    updateUser,
    deleteUser,
    toggleUserStatus,
  } = useUsers();

  // ---- UI state ----
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [verificationFilter, setVerificationFilter] = useState("all");
  const [selectedUser, setSelectedUser] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);
  const [editFormData, setEditFormData] = useState({
    role: "",
    status: "",
    verification: "",
    phone: "",
    location: "",
  });

  // Apply filters whenever users or filter values change
  useEffect(() => {
    applyFilters(users, searchTerm, roleFilter, statusFilter, verificationFilter);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [users, searchTerm, roleFilter, statusFilter, verificationFilter]);

  // ---- Filtering ----
  const applyFilters = (userList, search, role, status, verification) => {
    let filtered = userList;

    if (search) {
      const lowerSearch = search.toLowerCase();
      filtered = filtered.filter(
        u =>
          u.fullName?.toLowerCase().includes(lowerSearch) ||
          u.email?.toLowerCase().includes(lowerSearch) ||
          u.phone?.toLowerCase().includes(lowerSearch) ||
          u.id?.toString().includes(lowerSearch)
      );
    }
    if (role !== "all") filtered = filtered.filter(u => u.role === role);
    if (status !== "all") filtered = filtered.filter(u => u.status === status);
    if (verification !== "all") filtered = filtered.filter(u => u.verification === verification);

    setFilteredUsers(filtered);
  };

  const clearFilters = () => {
    setSearchTerm("");
    setRoleFilter("all");
    setStatusFilter("all");
    setVerificationFilter("all");
  };

  // ---- Report count ----
  const getUserReportCount = (userId) =>
    incidents.filter(inc => inc.userId === userId || inc.reportedBy === userId).length;

  // ---- View / Edit / Delete handlers ----
  const handleViewUser = (user) => {
    setSelectedUser(user);
    setShowDetailModal(true);
  };

  const handleEditUser = (user) => {
    setSelectedUser(user);
    setEditFormData({
      role: user.role || "resident",
      status: user.status || "Active",
      verification: user.verification || "Unverified",
      phone: user.phone || "",
      location: user.location || "",
    });
    setShowEditModal(true);
  };

  const handleSaveEdit = async () => {
    if (!selectedUser) return;

    logAction(
      "User Updated",
      `Updated user: ${selectedUser.fullName} (${selectedUser.email}) — Role: ${editFormData.role}, Status: ${editFormData.status}`
    );

    await updateUser(selectedUser.id, { ...editFormData });
    setShowEditModal(false);
    setSelectedUser(null);
  };

  const handleDeleteUser = (user) => {
    setUserToDelete(user);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!userToDelete) return;

    logAction(
      "User Deleted",
      `Deleted user: ${userToDelete.fullName} (${userToDelete.email}) — Role: ${userToDelete.role}`
    );

    await deleteUser(userToDelete.id);
    setShowDeleteModal(false);
    setUserToDelete(null);
  };

  const handleToggleStatus = async (user) => {
    const newStatus = user.status === "Active" ? "Suspended" : "Active";
    logAction(
      "User Status Changed",
      `Changed ${user.fullName} (${user.email}) status from ${user.status} to ${newStatus}`
    );
    await toggleUserStatus(user.id);
  };

  return (
    <AdminLayout title="User Management">
      <div className="mx-auto max-w-[1440px] space-y-6">

        {/* Page Header */}
        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
          <div>
            <h2 className="text-3xl font-bold text-[#0e1a39]">User Management</h2>
            <p className="mt-2 text-gray-500">
              Manage registered residents, account status, verification, and user activity.
            </p>
          </div>

          <div className="flex gap-3">
            <button className="flex items-center gap-2 rounded-lg border border-gray-300 px-4 py-2 hover:bg-gray-50">
              <span className="material-symbols-outlined text-[20px]">download</span>
              Export Users
            </button>

            <button
              onClick={() => navigate("/register")}
              className="flex items-center gap-2 rounded-lg bg-[#4648d4] px-4 py-2 text-white hover:bg-[#3d3fc4]"
            >
              <span className="material-symbols-outlined text-[20px]">add</span>
              Add User
            </button>
          </div>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-6">
          <KpiCard label="Total Users"     value={stats.total}      icon="groups"         />
          <KpiCard label="Active Users"    value={stats.active}     icon="person_check"   accent="green"  />
          <KpiCard label="New This Month"  value={stats.newThisMonth} icon="person_add"   accent="indigo" />
          <KpiCard label="Pending"         value={stats.pending}    icon="pending_actions" accent="orange" />
          <KpiCard label="Suspended"       value={stats.suspended}  icon="person_off"     accent="red"    />
          <KpiCard label="Verified"        value={stats.verified}   icon="verified"       accent="blue"   />
        </div>

        {/* Search + Filters */}
        <div className="rounded-2xl bg-white p-4 shadow-sm">
          <div className="flex flex-col gap-4 md:flex-row md:items-center">
            <div className="relative flex-1">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
                search
              </span>
              <input
                type="text"
                placeholder="Search by name, email, phone or user ID..."
                className="w-full rounded-lg bg-[#f5f7fb] py-2 pl-10 pr-4 outline-none focus:ring-2 focus:ring-[#4648d4]/30"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <span className="material-symbols-outlined text-gray-500">filter_list</span>

              <select
                className="rounded-lg bg-[#f5f7fb] px-3 py-2 text-sm outline-none"
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
              >
                <option value="all">All Roles</option>
                <option value="admin">Admin</option>
                <option value="volunteer">Volunteer</option>
                <option value="resident">Resident</option>
              </select>

              <select
                className="rounded-lg bg-[#f5f7fb] px-3 py-2 text-sm outline-none"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="all">All Status</option>
                <option value="Active">Active</option>
                <option value="Pending">Pending</option>
                <option value="Suspended">Suspended</option>
                <option value="Deactivated">Deactivated</option>
              </select>

              <select
                className="rounded-lg bg-[#f5f7fb] px-3 py-2 text-sm outline-none"
                value={verificationFilter}
                onChange={(e) => setVerificationFilter(e.target.value)}
              >
                <option value="all">All Verification</option>
                <option value="Verified">Verified</option>
                <option value="Unverified">Unverified</option>
              </select>

              {(searchTerm || roleFilter !== "all" || statusFilter !== "all" || verificationFilter !== "all") && (
                <button onClick={clearFilters} className="text-sm font-semibold text-[#4648d4] hover:underline">
                  Clear Filters
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-hidden rounded-2xl bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="border-b bg-gray-50">
                <tr className="text-xs uppercase text-gray-500">
                  <th className="p-4">User</th>
                  <th className="p-4">User ID</th>
                  <th className="p-4">Location</th>
                  <th className="p-4">Role</th>
                  <th className="p-4">Reports</th>
                  <th className="p-4">Verification</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.length > 0 ? (
                  filteredUsers.map((user) => {
                    const reportCount = getUserReportCount(user.id);
                    const isCurrentUser = currentUser?.id === user.id;

                    return (
                      <tr
                        key={user.id}
                        className={`border-b transition hover:bg-gray-50 ${isCurrentUser ? "bg-blue-50/50" : ""}`}
                      >
                        <td className="p-4">
                          <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#4648d4]/10 text-sm font-bold text-[#4648d4]">
                              {getInitials(user.fullName)}
                            </div>
                            <div>
                              <p className="font-semibold text-[#0e1a39]">
                                {user.fullName}
                                {isCurrentUser && (
                                  <span className="ml-2 rounded-full bg-[#4648d4]/10 px-2 py-0.5 text-[10px] text-[#4648d4]">
                                    You
                                  </span>
                                )}
                              </p>
                              <p className="text-sm text-gray-500">{user.email}</p>
                            </div>
                          </div>
                        </td>

                        <td className="p-4 text-sm text-gray-500">
                          {typeof user.id === "string" && user.id.startsWith("admin")
                            ? user.id
                            : `USR-${String(user.id).padStart(6, "0")}`}
                        </td>

                        <td className="p-4 text-sm text-gray-500">{user.location || "N/A"}</td>

                        <td className="p-4">
                          <span
                            className={`rounded-full px-3 py-1 text-xs font-bold ${
                              user.role === "admin"
                                ? "bg-[#0e1a39] text-white"
                                : user.role === "volunteer"
                                ? "bg-[#4648d4]/10 text-[#4648d4]"
                                : "bg-green-100 text-green-700"
                            }`}
                          >
                            {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                          </span>
                        </td>

                        <td className="p-4 text-sm text-gray-500">{reportCount}</td>

                        <td className="p-4">
                          {user.verification === "Verified" ? (
                            <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-3 py-1 text-xs text-green-600">
                              <span className="material-symbols-outlined text-[14px]">verified</span>
                              Verified
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-3 py-1 text-xs text-gray-500">
                              <span className="material-symbols-outlined text-[14px]">pending</span>
                              Unverified
                            </span>
                          )}
                        </td>

                        <td className="p-4">
                          <div className="flex items-center gap-2">
                            <span
                              className={`h-2 w-2 rounded-full ${
                                user.status === "Active"
                                  ? "bg-green-500"
                                  : user.status === "Pending"
                                  ? "bg-orange-500"
                                  : "bg-red-500"
                              }`}
                            />
                            <span className="text-sm">{user.status || "Active"}</span>
                          </div>
                        </td>

                        <td className="p-4">
                          <div className="flex justify-end gap-1">
                            <button
                              onClick={() => handleViewUser(user)}
                              className="rounded-lg p-2 hover:bg-gray-100"
                              title="View User"
                            >
                              <span className="material-symbols-outlined">visibility</span>
                            </button>

                            <button
                              onClick={() => handleEditUser(user)}
                              className="rounded-lg p-2 hover:bg-gray-100"
                              title="Edit User"
                            >
                              <span className="material-symbols-outlined">edit</span>
                            </button>

                            <button
                              onClick={() => handleToggleStatus(user)}
                              className={`rounded-lg p-2 hover:bg-gray-100 ${
                                user.status === "Active" ? "text-red-500" : "text-green-500"
                              }`}
                              title={user.status === "Active" ? "Suspend User" : "Activate User"}
                            >
                              <span className="material-symbols-outlined">
                                {user.status === "Active" ? "person_off" : "person_check"}
                              </span>
                            </button>

                            <button
                              onClick={() => handleDeleteUser(user)}
                              disabled={isCurrentUser}
                              className="rounded-lg p-2 text-red-500 hover:bg-red-50 disabled:opacity-40"
                              title="Delete User"
                            >
                              <span className="material-symbols-outlined">delete</span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan="8" className="p-8 text-center text-gray-500">
                      <span className="material-symbols-outlined mb-2 block text-4xl">person_search</span>
                      No users found matching your filters
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="flex flex-col items-center justify-between gap-4 p-4 md:flex-row">
            <p className="text-sm text-gray-500">
              Showing <b>{filteredUsers.length}</b> of <b>{users.length}</b> users
            </p>
            <div className="flex items-center gap-2">
              <button disabled className="rounded-lg border px-3 py-2 text-sm opacity-50">
                Previous
              </button>
              <button className="h-8 w-8 rounded-lg bg-[#4648d4] text-white">1</button>
              <button className="rounded-lg border px-3 py-2 text-sm">Next</button>
            </div>
          </div>
        </div>

      </div>

      {/* ---- Detail Modal ---- */}
      {showDetailModal && selectedUser && (
        <Modal onClose={() => setShowDetailModal(false)} title="User Details" size="lg">
          <div className="space-y-6">
            <div className="flex items-center gap-4">
              <div className="flex h-20 w-20 items-center justify-center rounded-full bg-[#4648d4] text-3xl font-bold text-white">
                {getInitials(selectedUser.fullName)}
              </div>
              <div>
                <h4 className="text-xl font-bold">{selectedUser.fullName}</h4>
                <p className="text-gray-500">{selectedUser.email}</p>
                <div className="mt-2 flex gap-2">
                  <span
                    className={`rounded-full px-2 py-1 text-xs font-bold ${
                      selectedUser.role === "admin"
                        ? "bg-[#0e1a39] text-white"
                        : selectedUser.role === "volunteer"
                        ? "bg-[#4648d4]/10 text-[#4648d4]"
                        : "bg-green-100 text-green-700"
                    }`}
                  >
                    {selectedUser.role.charAt(0).toUpperCase() + selectedUser.role.slice(1)}
                  </span>
                  <span
                    className={`rounded-full px-2 py-1 text-xs font-bold ${
                      selectedUser.status === "Active"
                        ? "bg-green-100 text-green-700"
                        : "bg-red-100 text-red-700"
                    }`}
                  >
                    {selectedUser.status}
                  </span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <InfoTile label="User ID" value={
                typeof selectedUser.id === "string" && selectedUser.id.startsWith("admin")
                  ? selectedUser.id
                  : `USR-${String(selectedUser.id).padStart(6, "0")}`
              } />
              <InfoTile label="Reports" value={getUserReportCount(selectedUser.id)} />
              <InfoTile label="Phone" value={selectedUser.phone || "N/A"} />
              <InfoTile label="Location" value={selectedUser.location || "N/A"} />
              <InfoTile
                label="Joined"
                value={
                  selectedUser.createdAt
                    ? new Date(selectedUser.createdAt).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })
                    : "N/A"
                }
                span={2}
              />
            </div>
          </div>
        </Modal>
      )}

      {/* ---- Edit Modal ---- */}
      {showEditModal && selectedUser && (
        <Modal onClose={() => setShowEditModal(false)} title="Edit User">
          <div className="space-y-4">
            <Field label="Role">
              <select
                value={editFormData.role}
                onChange={(e) => setEditFormData({ ...editFormData, role: e.target.value })}
                className="w-full rounded-lg bg-[#f5f7fb] px-4 py-2 outline-none focus:ring-2 focus:ring-[#4648d4]/30"
              >
                <option value="resident">Resident</option>
                <option value="volunteer">Volunteer</option>
                <option value="admin">Admin</option>
              </select>
            </Field>

            <Field label="Status">
              <select
                value={editFormData.status}
                onChange={(e) => setEditFormData({ ...editFormData, status: e.target.value })}
                className="w-full rounded-lg bg-[#f5f7fb] px-4 py-2 outline-none focus:ring-2 focus:ring-[#4648d4]/30"
              >
                <option value="Active">Active</option>
                <option value="Pending">Pending</option>
                <option value="Suspended">Suspended</option>
                <option value="Deactivated">Deactivated</option>
              </select>
            </Field>

            <Field label="Verification">
              <select
                value={editFormData.verification}
                onChange={(e) => setEditFormData({ ...editFormData, verification: e.target.value })}
                className="w-full rounded-lg bg-[#f5f7fb] px-4 py-2 outline-none focus:ring-2 focus:ring-[#4648d4]/30"
              >
                <option value="Verified">Verified</option>
                <option value="Unverified">Unverified</option>
              </select>
            </Field>

            <Field label="Phone">
              <input
                type="text"
                value={editFormData.phone}
                onChange={(e) => setEditFormData({ ...editFormData, phone: e.target.value })}
                className="w-full rounded-lg bg-[#f5f7fb] px-4 py-2 outline-none focus:ring-2 focus:ring-[#4648d4]/30"
              />
            </Field>

            <Field label="Location">
              <input
                type="text"
                value={editFormData.location}
                onChange={(e) => setEditFormData({ ...editFormData, location: e.target.value })}
                className="w-full rounded-lg bg-[#f5f7fb] px-4 py-2 outline-none focus:ring-2 focus:ring-[#4648d4]/30"
              />
            </Field>

            <div className="flex justify-end gap-3 pt-2">
              <button
                onClick={() => setShowEditModal(false)}
                className="rounded-lg border px-4 py-2 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveEdit}
                disabled={loading}
                className="rounded-lg bg-[#4648d4] px-4 py-2 text-white hover:bg-[#3d3fc4] disabled:opacity-50"
              >
                {loading ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* ---- Delete Modal ---- */}
      {showDeleteModal && userToDelete && (
        <Modal onClose={() => setShowDeleteModal(false)} title="Delete User" tone="danger">
          <p className="text-gray-700">
            Are you sure you want to delete <span className="font-bold">{userToDelete.fullName}</span>?
            This action cannot be undone.
          </p>
          {userToDelete.id === currentUser?.id && (
            <p className="mt-2 text-sm font-semibold text-red-500">
              ⚠️ Warning: You are deleting your own account!
            </p>
          )}

          <div className="mt-6 flex justify-end gap-3">
            <button
              onClick={() => setShowDeleteModal(false)}
              className="rounded-lg border px-4 py-2 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              onClick={confirmDelete}
              disabled={loading}
              className="rounded-lg bg-red-600 px-4 py-2 text-white hover:bg-red-700 disabled:opacity-50"
            >
              {loading ? "Deleting..." : "Delete User"}
            </button>
          </div>
        </Modal>
      )}
    </AdminLayout>
  );
}

/* ---------- Small inline helpers ---------- */

const KpiCard = ({ label, value, icon, accent = "" }) => {
  const colorMap = {
    green: "border-b-4 border-green-500 text-green-500",
    orange: "border-b-4 border-orange-500 text-orange-500",
    red: "border-b-4 border-red-500 text-red-500",
    blue: "border-b-4 border-blue-500 text-blue-500",
    indigo: "border-b-4 border-[#4648d4] text-[#4648d4]",
  };
  const accentClass = colorMap[accent] || "";

  return (
    <div className={`rounded-xl border border-gray-200 bg-white p-4 shadow-sm ${accentClass}`}>
      <div className="flex justify-between">
        <span className="text-xs font-bold uppercase text-gray-500">{label}</span>
        <span className={`material-symbols-outlined ${accent ? "" : "text-gray-400"}`}>{icon}</span>
      </div>
      <p className="mt-3 text-3xl font-bold text-[#0e1a39]">{value}</p>
    </div>
  );
};

const Modal = ({ children, onClose, title, tone = "default", size = "md" }) => {
  const width = size === "lg" ? "max-w-2xl" : "max-w-md";
  const titleColor = tone === "danger" ? "text-red-600" : "text-[#1b1b1e]";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className={`w-full ${width} rounded-2xl bg-white`}>
        <div className="flex items-center justify-between border-b border-gray-200 p-6">
          <h3 className={`text-2xl font-bold ${titleColor}`}>{title}</h3>
          <button onClick={onClose} className="rounded-lg p-2 hover:bg-gray-100">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>
        <div className="max-h-[70vh] overflow-y-auto p-6">{children}</div>
      </div>
    </div>
  );
};

const Field = ({ label, children }) => (
  <div className="space-y-2">
    <label className="text-sm font-semibold">{label}</label>
    {children}
  </div>
);

const InfoTile = ({ label, value, span = 1 }) => (
  <div className={`rounded-lg bg-gray-50 p-4 ${span === 2 ? "col-span-2" : ""}`}>
    <p className="text-xs text-gray-500">{label}</p>
    <p className="font-semibold">{value}</p>
  </div>
);

export default UserManagement;