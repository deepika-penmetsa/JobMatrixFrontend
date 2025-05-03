import { useState, useEffect } from 'react'; 
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LandingPage from './components/SharedPages/LandingPage';
import LoginPage from './components/SharedPages/LoginPage';
import SignupPage from './components/SharedPages/SignupPage';
import RegisterCompanyPage from './components/SharedPages/RegisterCompanyPage';
import ProtectedRoute from './components/SharedPages/ProtectedRoute';
import ApplicantDashboard from './components/Applicants/ApplicantDashboard';
import RecruiterDashboard from './components/Recruiters/RecruiterDashboard';
import AdminLayout from "./components/Admins/AdminLayout";
import AdminDashboard from "./components/Admins/AdminDashboard";
import AdminUsers from "./components/Admins/AdminUsers";
import AdminCompanies from "./components/Admins/AdminCompanies";
import AdminSettings from "./components/Admins/AdminSettings";
import ForgotPassword from './components/SharedPages/ForgotPassword';
import ChangePassword from './components/SharedPages/ChangePassword';
import { initResponsiveUtils } from './services/responsiveUtils';
import './App.css';
import './styles/responsive.css';

function App() {
  const [formData, setFormData] = useState({
    user_first_name: "",
    user_last_name: "",
    user_email: "",
    user_password: "",
    confirm_password: "",
    user_role: "",
    user_profile_photo: null,
    applicant_resume: null,
    admin_secret_key: "",
  });
  
  // Initialize responsive utilities
  useEffect(() => {
    const cleanup = initResponsiveUtils();
    return cleanup; // Handle cleanup of event listeners
  }, []);

  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/signup" element={<SignupPage formData={formData} setFormData={setFormData} />} />
        <Route path="/register-company" element={<RegisterCompanyPage formData={formData} setFormData={setFormData}/>} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/change-password" 
          element={
            <ProtectedRoute allowedRoles={["APPLICANT", "RECRUITER", "ADMIN"]}>
              <ChangePassword />
            </ProtectedRoute>
          } 
        /> 
        
        {/* Applicant and Recruiter Routes */}
        <Route path="/applicant/*" 
          element={
            <ProtectedRoute allowedRoles={["APPLICANT"]}>
              <ApplicantDashboard />
            </ProtectedRoute> 
          } 
        />
        
        <Route path="/recruiter/*" 
          element={
            <ProtectedRoute allowedRoles={["RECRUITER"]}>
              <RecruiterDashboard/>
            </ProtectedRoute> 
          } 
        />
        
        {/* Admin Routes */}
        <Route path="/admin/*" 
            element={
              <ProtectedRoute allowedRoles={["ADMIN"]}>
                <AdminLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard" element={<AdminDashboard />} />
            <Route path="users" element={<AdminUsers />} />
            <Route path="companies" element={<AdminCompanies />} />
            <Route path="settings" element={<AdminSettings />} />
          </Route>
      </Routes>
    </Router>
  );
}

export default App;