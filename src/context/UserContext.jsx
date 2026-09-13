import React, { createContext, useContext, useState, useEffect, useMemo } from "react";
import { userService } from "../services/userService";

const UserContext = createContext();
const simulateDelay = (ms = 800) => new Promise((resolve) => setTimeout(resolve, ms));

// ---------- Helpers ----------
const getInitials = (name) => {
  if (!name) return "U";
  const parts = name.trim().split(" ");
  if (parts.length >= 2) {
    return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
  }
  return name.substring(0, 2).toUpperCase();
};

export const UserProvider = ({ children }) => {
  const useAWS = import.meta.env.VITE_USE_AWS === "true";

  const loadInitialData = () => {
    const saved = localStorage.getItem("usersData");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return [];
      }
    }
    return [
      {
        id: "volunteer-1",
        fullName: "Aarav Sharma",
        email: "aarav@disasterlink.com",
        phone: "9841234567",
        location: "Kathmandu",
        role: "volunteer",
        status: "Active",
        verification: "Verified",
        skills: ["First Aid", "Search & Rescue"],
        team: "Bagmati Rescue Squad",
        availability: "available",
      },
      {
        id: "resident-1",
        fullName: "Sita Thapa",
        email: "sita@disasterlink.com",
        phone: "9801234568",
        location: "Lalitpur",
        role: "resident",
        status: "Active",
        verification: "Verified",
        skills: [],
        team: "Unassigned",
        availability: "available",
      },
    ];
  };

  const [users, setUsers] = useState(useAWS ? [] : loadInitialData);
  const [loading, setLoading] = useState(false);

  // Fetch users from AWS on mount (only if useAWS is true)
  useEffect(() => {
    if (useAWS) {
      setLoading(true);
      userService
        .fetchUsers()
        .then((data) => setUsers(data))
        .catch(console.error)
        .finally(() => setLoading(false));
    }
  }, [useAWS]);

  const saveToLocalStorage = (data) => {
    localStorage.setItem("usersData", JSON.stringify(data));
  };

  // ============================================================
  //  MUTATIONS
  // ============================================================
  const addUser = async (userData) => {
    setLoading(true);
    try {
      if (useAWS) {
        const newRecord = await userService.createUser(userData);
        setUsers((prev) => [...prev, newRecord]);
        setLoading(false);
        return newRecord;
      } else {
        await simulateDelay(1000);
        const newRecord = {
          ...userData,
          id: userData.id || `usr-${Date.now()}`,
        };
        const updated = [...users, newRecord];
        setUsers(updated);
        saveToLocalStorage(updated);
        setLoading(false);
        return newRecord;
      }
    } catch (error) {
      console.error("addUser failed:", error);
      setLoading(false);
      return null;
    }
  };

  const updateUser = async (id, updatedFields) => {
    setLoading(true);
    try {
      if (useAWS) {
        const updatedRecord = await userService.updateUser(id, updatedFields);
        setUsers((prev) =>
          prev.map((u) => (u.id === id ? updatedRecord : u))
        );
      } else {
        await simulateDelay(800);
        const updated = users.map((u) =>
          u.id === id ? { ...u, ...updatedFields } : u
        );
        setUsers(updated);
        saveToLocalStorage(updated);
      }
    } catch (error) {
      console.error("updateUser failed:", error);
    } finally {
      setLoading(false);
    }
  };

  const deleteUser = async (id) => {
    setLoading(true);
    try {
      if (useAWS) {
        await userService.deleteUser(id);
        setUsers((prev) => prev.filter((u) => u.id !== id));
      } else {
        await simulateDelay(600);
        const updated = users.filter((u) => u.id !== id);
        setUsers(updated);
        saveToLocalStorage(updated);
      }
    } catch (error) {
      console.error("deleteUser failed:", error);
    } finally {
      setLoading(false);
    }
  };

  const toggleUserStatus = async (id) => {
    const user = users.find((u) => u.id === id);
    if (!user) return;
    const newStatus = user.status === "Active" ? "Suspended" : "Active";
    await updateUser(id, { status: newStatus });
  };

  // ============================================================
  //  DERIVED DATA (restored after AWS migration)
  // ============================================================

  // All users with role === "volunteer"
  const volunteers = useMemo(
    () => users.filter((u) => u.role === "volunteer"),
    [users]
  );

  // Users grouped by role
  const admins = useMemo(() => users.filter((u) => u.role === "admin"), [users]);
  const residents = useMemo(
    () => users.filter((u) => u.role === "resident"),
    [users]
  );

  // Summary stats used across admin pages
  const stats = useMemo(() => {
    const total = users.length;
    const active = users.filter((u) => u.status === "Active").length;
    const pending = users.filter((u) => u.status === "Pending").length;
    const suspended = users.filter((u) => u.status === "Suspended").length;
    const verified = users.filter((u) => u.verification === "Verified").length;

    const adminCount = users.filter((u) => u.role === "admin").length;
    const residentCount = users.filter((u) => u.role === "resident").length;
    const volunteerCount = users.filter((u) => u.role === "volunteer").length;

    const newThisMonth = users.filter((u) => {
      if (!u.createdAt) return false;
      const created = new Date(u.createdAt);
      const days = (Date.now() - created.getTime()) / (1000 * 60 * 60 * 24);
      return days <= 30;
    }).length;

    return {
      total,
      active,
      pending,
      suspended,
      verified,
      admins: adminCount,
      residents: residentCount,
      volunteers: volunteerCount,
      newThisMonth,
    };
  }, [users]);

  // Helper to look up a single user
  const getUserById = (id) => users.find((u) => u.id === id) || null;

  // ============================================================
  //  PROVIDER VALUE
  // ============================================================
  return (
    <UserContext.Provider
      value={{
        // Core state
        users,
        volunteers,
        admins,
        residents,
        stats,
        loading,

        // Helpers
        getInitials,
        getUserById,

        // Mutations
        addUser,
        updateUser,
        deleteUser,
        toggleUserStatus,
      }}
    >
      {children}
    </UserContext.Provider>
  );
};

export const useUsers = () => {
  const context = useContext(UserContext);
  if (!context) throw new Error("useUsers must be used within a UserProvider");
  return context;
};