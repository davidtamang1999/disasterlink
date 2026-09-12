import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { AnimatePresence } from 'framer-motion';
import { AuthProvider } from "./context/AuthContext";
import { DisasterProvider } from "./context/DisasterContext";
import { ResourceProvider } from "./context/ResourceContext";
import { ShelterProvider } from "./context/ShelterContext";
import { AlertProvider } from "./context/AlertContext";   // ✅ NEW
import { UserProvider } from "./context/UserContext";
import ProtectedRoute from "./components/ProtectedRoute";
import ForgotPassword from "./pages/auth/ForgotPassword";
import ResetPassword from "./pages/auth/ResetPassword";
import { AuditProvider } from "./context/AuditContext";
import TestMap from "./pages/TestMap";
import { ToastProvider } from "./components/shared";
import { SettingsProvider } from "./context/SettingsContext";

// Landing Page
import LandingPage from "./pages/LandingPage";

// Authentication Pages
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";

// ================= RESIDENT PAGES =================
import ResidentDashboard from "./pages/resident/ResidentDashboard";
import ReportDisaster from "./pages/resident/ReportDisaster";
import MyReports from "./pages/resident/MyReports";
import ResidentLiveDisasterMap from "./pages/resident/LiveDisasterMap";
import AlertsNotifications from "./pages/resident/AlertsNotifications";
import EmergencyResources from "./pages/resident/EmergencyResources";
import ResidentNews from "./pages/resident/ResidentNews";

// ================= VOLUNTEER PAGES =================
import VolunteerDashboard from "./pages/volunteer/VolunteerDashboard";
import MyTasks from "./pages/volunteer/MyTasks";
import IncidentMap from "./pages/volunteer/IncidentMap";
import ResourceRequests from "./pages/volunteer/ResourceRequests";
import ResponseTeam from "./pages/volunteer/ResponseTeam";
import ResponseUpdates from "./pages/volunteer/ResponseUpdates";
import Profile from "./pages/volunteer/Profile";

// ================= ADMIN PAGES =================
import AdminDashboard from "./pages/admin/AdminDashboard";
import IncidentManagement from "./pages/admin/IncidentManagement";
import ReportsAnalytics from "./pages/admin/ReportsAnalytics";
import UserManagement from "./pages/admin/UserManagement";
import VolunteerManagement from "./pages/admin/VolunteerManagement";
import ResourceManagement from "./pages/admin/ResourceManagement";
import ShelterManagement from "./pages/admin/ShelterManagement";
import AdminAlertsNotifications from "./pages/admin/AlertsNotifications";
import DonationsAid from "./pages/admin/DonationsAid";
import NewsInformation from "./pages/admin/NewsInformation";
import SystemSettings from "./pages/admin/SystemSettings";
import AuditLogs from "./pages/admin/AuditLogs";
import AdminLiveDisasterMap from "./pages/admin/LiveDisasterMap";

function AppRoutes() {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        {/* ================= PUBLIC ROUTES ================= */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/test-map" element={<TestMap />} />

        {/* ================= RESIDENT ROUTES (Protected) ================= */}
        <Route element={<ProtectedRoute allowedRoles={['resident']} />}>
          <Route path="/resident" element={<ResidentDashboard />} />
          <Route path="/report-disaster" element={<ReportDisaster />} />
          <Route path="/reports" element={<MyReports />} />
          <Route path="/resident/map" element={<ResidentLiveDisasterMap />} />
          <Route path="/resident/alerts" element={<AlertsNotifications />} />
          <Route path="/resident/resources" element={<EmergencyResources />} />
          <Route path="/resident/news" element={<ResidentNews />} />
        </Route>

        {/* ================= VOLUNTEER ROUTES (Protected) ================= */}
        <Route element={<ProtectedRoute allowedRoles={['volunteer']} />}>
          <Route path="/volunteer" element={<VolunteerDashboard />} />
          <Route path="/volunteer/tasks" element={<MyTasks />} />
          <Route path="/volunteer/incident-map" element={<IncidentMap />} />
          <Route path="/volunteer/resources" element={<ResourceRequests />} />
          <Route path="/volunteer/team" element={<ResponseTeam />} />
          <Route path="/volunteer/updates" element={<ResponseUpdates />} />
          <Route path="/volunteer/profile" element={<Profile />} />
        </Route>

        {/* ================= ADMIN ROUTES (Protected) ================= */}
        <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/incident-management" element={<IncidentManagement />} />
          <Route path="/admin/map" element={<AdminLiveDisasterMap />} />
          <Route path="/admin/reports" element={<ReportsAnalytics />} />
          <Route path="/admin/users" element={<UserManagement />} />
          <Route path="/admin/volunteers" element={<VolunteerManagement />} />
          <Route path="/admin/resources" element={<ResourceManagement />} />
          <Route path="/admin/shelters" element={<ShelterManagement />} />
          <Route path="/admin/alerts" element={<AdminAlertsNotifications />} />
          <Route path="/admin/news" element={<NewsInformation />} />
          <Route path="/admin/donations" element={<DonationsAid />} />
          <Route path="/admin/settings" element={<SystemSettings />} />
          <Route path="/admin/audit-logs" element={<AuditLogs />} />
        </Route>

        {/* ================= CATCH ALL ================= */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AnimatePresence>
  );
}

function App() {
  return (
    <BrowserRouter>
      <UserProvider>
        <AuthProvider>
          <DisasterProvider>
            <ResourceProvider>
              <ShelterProvider>
                <AuditProvider>
                  <AlertProvider>
                    <SettingsProvider>
                      <ToastProvider>
                        <AppRoutes />
                      </ToastProvider>
                    </SettingsProvider>
                  </AlertProvider>
                </AuditProvider>
              </ShelterProvider>
            </ResourceProvider>
          </DisasterProvider>
        </AuthProvider>
      </UserProvider>
    </BrowserRouter>
  );
}

export default App;