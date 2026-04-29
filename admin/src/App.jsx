import { Navigate, Route, Routes } from "react-router-dom";
import ProtectedRoute from "./components/ProtectedRoute";
import AuthProvider from "./context/AuthContext";
import AdminUsers from "./pages/AdminUsers";
import ApplicantDetails from "./pages/ApplicantDetails";
import Applicants from "./pages/Applicants";
import Dashboard from "./pages/Dashboard";
import LoginPage from "./pages/Login";
import Schedules from "./pages/Schedules";
import Settings from "./pages/Settings";
import AuditLogs from "./pages/AuditLogs";
import Financials from "./pages/Financials";

function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/applicants" element={<ProtectedRoute><Applicants /></ProtectedRoute>} />
        <Route path="/applicants/:applicantId" element={<ProtectedRoute><ApplicantDetails /></ProtectedRoute>} />
        <Route path="/schedules" element={<ProtectedRoute><Schedules /></ProtectedRoute>} />
        <Route path="/financials" element={<ProtectedRoute roles={["super_admin"]}><Financials /></ProtectedRoute>} />
        <Route path="/admins" element={<ProtectedRoute roles={["super_admin"]}><AdminUsers /></ProtectedRoute>} />
        <Route path="/settings" element={<ProtectedRoute roles={["super_admin"]}><Settings /></ProtectedRoute>} />
        <Route path="/audit-logs" element={<ProtectedRoute roles={["super_admin"]}><AuditLogs /></ProtectedRoute>} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AuthProvider>
  );
}

export default App;
