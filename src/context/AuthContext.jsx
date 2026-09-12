import React, { createContext, useContext, useState, useEffect } from "react";
import { useUsers } from "./UserContext";

const AuthContext = createContext();

// ✅ SIMULATE API DELAY
const simulateDelay = (ms = 800) => new Promise((resolve) => setTimeout(resolve, ms));

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // ✅ Get the user list API from UserContext
  const { users, addUser } = useUsers();

  // Restore session on mount
  useEffect(() => {
    const storedUser = localStorage.getItem("currentUser");
    if (storedUser) {
      try {
        const parsed = JSON.parse(storedUser);
        setCurrentUser(parsed);
        console.log("✅ User restored from localStorage:", parsed);
      } catch (e) {
        console.error("Error parsing stored user:", e);
        localStorage.removeItem("currentUser");
        setCurrentUser(null);
      }
    }
    setLoading(false);
  }, []);

  // ✅ REGISTER — now persists into the shared users list
  const register = async (userData) => {
    setLoading(true);
    try {
      await simulateDelay(1200);

      const email = (userData.email || "").trim().toLowerCase();

      // Prevent duplicates
      const existing = users.find(
        (u) => (u.email || "").trim().toLowerCase() === email
      );
      if (existing) {
        console.warn("⚠️ Registration failed: email already exists");
        setLoading(false);
        return null;
      }

      const role = userData.accountType || "resident";
      const fullName = userData.fullName || "New User";

      // Add the user to the shared users list (via UserContext)
      const createdUser = await addUser({
        fullName,
        email,
        phone: userData.phone || "",
        location: userData.district || "",
        role,
        status: role === "volunteer" ? "Pending" : "Active",
        verification: "Unverified",
        password: userData.password || "",
        skills: userData.skills || [],
        team: "Unassigned",
        availability: userData.availability || "available",
      });

      if (!createdUser) {
        console.error("❌ addUser returned null");
        setLoading(false);
        return null;
      }

      // Set the session (so the user lands "logged in" — but we'll route them to /login anyway)
      const sessionUser = {
        id: createdUser.id,
        email: createdUser.email,
        role: createdUser.role,
        fullName: createdUser.fullName,
      };

      localStorage.setItem("userToken", "mock-expo-token");
      localStorage.setItem("currentUser", JSON.stringify(sessionUser));
      setCurrentUser(sessionUser);

      console.log("✅ User registered:", sessionUser);
      setLoading(false);
      return sessionUser;
    } catch (error) {
      console.error("❌ Registration error:", error);
      setLoading(false);
      return null;
    }
  };

  // ✅ LOGIN — matches against the shared users list
  const login = async (email, password) => {
    setLoading(true);
    try {
      await simulateDelay(1000);

      const normalizedEmail = (email || "").trim().toLowerCase();

      // Find the registered user
      const found = users.find(
        (u) => (u.email || "").trim().toLowerCase() === normalizedEmail
      );

      // Fallback: if no users exist yet (fresh install), allow the demo bypass
      if (!found) {
        // Optional: allow admin@disasterlink.com with any password for demo
        const isDemoAdmin = normalizedEmail === "admin@disasterlink.com";
        if (!isDemoAdmin) {
          console.warn("⚠️ Login failed: no user with that email");
          setLoading(false);
          return null;
        }
      }

      // Optional password check (skipped if password not stored)
      if (found && found.password && password && found.password !== password) {
        console.warn("⚠️ Login failed: wrong password");
        setLoading(false);
        return null;
      }

      const sessionUser = found
        ? {
            id: found.id,
            email: found.email,
            role: found.role,
            fullName: found.fullName,
          }
        : {
            id: "admin-001",
            email: "admin@disasterlink.com",
            role: "admin",
            fullName: "System Administrator",
          };

      localStorage.setItem("userToken", "mock-expo-token");
      localStorage.setItem("currentUser", JSON.stringify(sessionUser));
      setCurrentUser(sessionUser);

      console.log("✅ User logged in:", sessionUser);
      setLoading(false);
      return sessionUser;
    } catch (error) {
      console.error("❌ Login error:", error);
      setLoading(false);
      return null;
    }
  };

  const logout = () => {
    localStorage.removeItem("userToken");
    localStorage.removeItem("currentUser");
    setCurrentUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        loading,
        register,
        login,
        logout,
        user: currentUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export { AuthContext };