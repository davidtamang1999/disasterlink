import React, { createContext, useContext, useState, useEffect } from "react";
import { useUsers } from "./UserContext";
import { authService } from "../services/authService";

const AuthContext = createContext();

// ✅ SIMULATE API DELAY (Used for LocalStorage fallbacks)
const simulateDelay = (ms = 800) => new Promise((resolve) => setTimeout(resolve, ms));

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const useAWS = import.meta.env.VITE_USE_AWS === "true";

  // ✅ Get the user list API from UserContext
  const { users, addUser } = useUsers();

  // Restore session on mount
  useEffect(() => {
    const storedUser = localStorage.getItem("currentUser");
    if (storedUser) {
      try {
        const parsed = JSON.parse(storedUser);
        setCurrentUser(parsed);
        console.log("✅ User restored from storage:", parsed);
      } catch (e) {
        console.error("Error parsing stored user:", e);
        localStorage.removeItem("currentUser");
        localStorage.removeItem("userToken");
        setCurrentUser(null);
      }
    }
    setLoading(false);
  }, []);

  // ✅ REGISTER — Handles dual environment execution seamlessly
  const register = async (userData) => {
    setLoading(true);
    try {
      if (useAWS) {
        // Direct Cognito + Lambda API Flow Execution
        const registeredProfile = await authService.registerUser(userData);
        
        const sessionUser = {
          id: registeredProfile.id,
          email: registeredProfile.email,
          role: registeredProfile.role,
          fullName: registeredProfile.fullName,
        };

        console.log("✅ AWS User registered successfully:", sessionUser);
        setLoading(false);
        return sessionUser;

      } else {
        // Fallback: Original Dev Mock Core Execution Path
        await simulateDelay(1200);
        const email = (userData.email || "").trim().toLowerCase();

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

        const sessionUser = {
          id: createdUser.id,
          email: createdUser.email,
          role: createdUser.role,
          fullName: createdUser.fullName,
        };

        localStorage.setItem("userToken", "mock-expo-token");
        localStorage.setItem("currentUser", JSON.stringify(sessionUser));
        setCurrentUser(sessionUser);

        console.log("✅ Local User registered:", sessionUser);
        setLoading(false);
        return sessionUser;
      }
    } catch (error) {
      console.error("❌ Registration execution error:", error);
      setLoading(false);
      return null;
    }
  };

  // ✅ LOGIN — Handles dual environment execution seamlessly
  const login = async (email, password) => {
    setLoading(true);
    try {
      if (useAWS) {
        // Secure production route through AWS Cognito
        const authData = await authService.loginUser(email, password);
        
        localStorage.setItem("userToken", authData.token);
        localStorage.setItem("currentUser", JSON.stringify(authData.user));
        setCurrentUser(authData.user);

        console.log("✅ AWS User logged in:", authData.user);
        setLoading(false);
        return authData.user;

      } else {
        // Fallback: Original Dev Mock Core Execution Path
        await simulateDelay(1000);
        const normalizedEmail = (email || "").trim().toLowerCase();

        const found = users.find(
          (u) => (u.email || "").trim().toLowerCase() === normalizedEmail
        );

        if (!found) {
          const isDemoAdmin = normalizedEmail === "admin@disasterlink.com";
          if (!isDemoAdmin) {
            console.warn("⚠️ Login failed: no user with that email");
            setLoading(false);
            return null;
          }
        }

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

        console.log("✅ Local User logged in:", sessionUser);
        setLoading(false);
        return sessionUser;
      }
    } catch (error) {
      console.error("❌ Login execution error:", error);
      setLoading(false);
      return null;
    }
  };

  const logout = () => {
    localStorage.removeItem("userToken");
    localStorage.removeItem("currentUser");
    setCurrentUser(null);
    console.log("🔒 Identity session invalidated cleanly.");
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
