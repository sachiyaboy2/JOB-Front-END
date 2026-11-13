import { Route, Routes } from "react-router-dom";

import AppLayout from "./components/layout/AppLayout.jsx";
import RoleLayout from "./components/layout/RoleLayout.jsx";
import ProtectedRoute from "./components/ui/ProtectedRoute.jsx";

import Home from "./pages/home/Home.jsx";
import Jobs from "./pages/jobs/Jobs.jsx";
import JobDetail from "./pages/jobs/JobDetail.jsx";
import Companies from "./pages/companies/Companies.jsx";
import CompanyDetail from "./pages/companies/CompanyDetail.jsx";
import About from "./pages/static/About.jsx";
import Contact from "./pages/static/Contact.jsx";
import Faq from "./pages/static/Faq.jsx";
import Login from "./pages/auth/Login.jsx";
import Register from "./pages/auth/Register.jsx";
import NotFound from "./pages/NotFound.jsx";

import SeekerDashboard from "./pages/seeker/Dashboard.jsx";
import SeekerProfile from "./pages/seeker/Profile.jsx";
import SeekerCv from "./pages/seeker/Cv.jsx";
import SeekerApplications from "./pages/seeker/Applications.jsx";
import SeekerSavedJobs from "./pages/seeker/SavedJobs.jsx";

import EmployerDashboard from "./pages/employer/Dashboard.jsx";
import EmployerJobs from "./pages/employer/Jobs.jsx";
import EmployerJobForm from "./pages/employer/JobForm.jsx";
import EmployerApplicants from "./pages/employer/Applicants.jsx";
import EmployerCompany from "./pages/employer/Company.jsx";

import AdminDashboard from "./pages/admin/Dashboard.jsx";
import AdminApprovals from "./pages/admin/Approvals.jsx";
import AdminJobs from "./pages/admin/Jobs.jsx";
import AdminEmployers from "./pages/admin/Employers.jsx";
import AdminUsers from "./pages/admin/Users.jsx";
import AdminCategories from "./pages/admin/Categories.jsx";

export default function App() {
  return (
    <Routes>
      <Route element={<AppLayout />}>
        {/* ---------------- Public ---------------- */}
        <Route path="/" element={<Home />} />
        <Route path="/jobs" element={<Jobs />} />
        <Route path="/jobs/:id" element={<JobDetail />} />
        <Route path="/companies" element={<Companies />} />
        <Route path="/companies/:id" element={<CompanyDetail />} />
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/faq" element={<Faq />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* ---------------- Job seeker ---------------- */}
        <Route
          path="/seeker"
          element={
            <ProtectedRoute roles={["seeker"]}>
              <RoleLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<SeekerDashboard />} />
          <Route path="dashboard" element={<SeekerDashboard />} />
          <Route path="profile" element={<SeekerProfile />} />
          <Route path="cv" element={<SeekerCv />} />
          <Route path="applications" element={<SeekerApplications />} />
          <Route path="saved-jobs" element={<SeekerSavedJobs />} />
        </Route>

        {/* ---------------- Employer ---------------- */}
        <Route
          path="/employer"
          element={
            <ProtectedRoute roles={["employer"]}>
              <RoleLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<EmployerDashboard />} />
          <Route path="dashboard" element={<EmployerDashboard />} />
          <Route path="jobs" element={<EmployerJobs />} />
          <Route path="jobs/new" element={<EmployerJobForm />} />
          <Route path="jobs/:id/edit" element={<EmployerJobForm />} />
          <Route path="applicants" element={<EmployerApplicants />} />
          <Route path="company" element={<EmployerCompany />} />
        </Route>

        {/* ---------------- Admin ---------------- */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute roles={["admin"]}>
              <RoleLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<AdminDashboard />} />
          <Route path="dashboard" element={<AdminDashboard />} />
          <Route path="approvals" element={<AdminApprovals />} />
          <Route path="jobs" element={<AdminJobs />} />
          <Route path="employers" element={<AdminEmployers />} />
          <Route path="users" element={<AdminUsers />} />
          <Route path="categories" element={<AdminCategories />} />
        </Route>

        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
}
