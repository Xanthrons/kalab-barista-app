import { Navigate, Route, Routes } from "react-router-dom";
import ApplicantDetails from "./pages/ApplicantDetails";
import Applicants from "./pages/Applicants";
import Dashboard from "./pages/Dashboard";
import Schedules from "./pages/Schedules";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Dashboard />} />
      <Route path="/applicants" element={<Applicants />} />
      <Route path="/applicants/:applicantId" element={<ApplicantDetails />} />
      <Route path="/schedules" element={<Schedules />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
