import { Routes, Route, Navigate } from "react-router-dom";

import LandingPage from "./pages/LandingPage";

// Student pages
import StudentLogin from "./pages/student/StudentLogin";
import StudentRegister from "./pages/student/StudentRegister";
import StudentDashboard from "./pages/student/StudentDashboard";
import StudentProfile from "./pages/student/StudentProfile";
import AdmissionApplication from "./pages/student/AdmissionApplication";
import StudentDocuments from "./pages/student/StudentDocuments";
import StudentStatus from "./pages/student/StudentStatus";
import SubmittedApplication from "./pages/student/SubmittedApplication";
import ChangePassword from "./pages/student/ChangePassword";
import StudentFees from "./pages/student/StudentFees";

// Admin pages
import AdminLogin from "./pages/admin/AdminLogin";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminApplications from "./pages/admin/AdminApplications";
import AdminApplicationDetails from "./pages/admin/AdminApplicationDetails";
import AdminDocuments from "./pages/admin/AdminDocuments";

export default function App() {
  return (
    <Routes>
      {/* Public */}
      <Route path="/" element={<LandingPage />} />

      {/* Student authentication */}
      <Route path="/student/login" element={<StudentLogin />} />
      <Route path="/student/register" element={<StudentRegister />} />

      {/* Student portal */}
      <Route path="/student/dashboard" element={<StudentDashboard />} />
      <Route path="/student/profile" element={<StudentProfile />} />

      <Route
        path="/student/application"
        element={<AdmissionApplication />}
      />

      <Route
        path="/student/application/view"
        element={<SubmittedApplication />}
      />

      <Route
        path="/student/documents"
        element={<StudentDocuments />}
      />

      <Route path="/student/status" element={<StudentStatus />} />

      <Route
        path="/student/change-password"
        element={<ChangePassword />}
      />

      {/* Dedicated Razorpay fee payment page */}
      <Route path="/student/fees" element={<StudentFees />} />

      {/* Admin portal */}
      <Route path="/admin/login" element={<AdminLogin />} />
      <Route path="/admin/dashboard" element={<AdminDashboard />} />

      <Route
        path="/admin/applications"
        element={<AdminApplications />}
      />

      <Route
        path="/admin/applications/:id"
        element={<AdminApplicationDetails />}
      />

      <Route
        path="/admin/documents"
        element={<AdminDocuments />}
      />

      {/* Unknown routes */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}