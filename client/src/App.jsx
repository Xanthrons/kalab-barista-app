import { HashRouter, Navigate, Route, Routes } from "react-router-dom";
import CourseOverviewPage from "./pages/CourseOverviewPage";
import HomePage from "./pages/HomePage";
import ProfileManagementPage from "./pages/ProfileManagementPage";
import RegistrationPage from "./pages/RegistrationPage";
import StudentPortalPage from "./pages/StudentPortalPage";

function App() {
  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/courses" element={<CourseOverviewPage />} />
        <Route path="/register" element={<RegistrationPage />} />
        <Route path="/portal" element={<StudentPortalPage />} />
        <Route path="/profile" element={<ProfileManagementPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </HashRouter>
  );
}

export default App;
