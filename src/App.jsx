import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { LoadingSpinner } from './components/UI';

// Layout Components
import Layout from './components/Layout/Layout';
import AuthLayout from './components/Layout/AuthLayout';

// Auth Pages
import Login from './pages/Auth/Login';
import Register from './pages/Auth/Register';
import AdminLogin from './pages/Admin/AdminLogin';
import Home from './pages/Home';

// Dashboard Pages
import Dashboard from './pages/Dashboard/Dashboard';
import HRDashboard from './pages/Dashboard/HRDashboard';
import Analytics from './pages/Dashboard/Analytics';
import CurrencyDemo from './pages/CurrencyDemo';

// Job Pages
import JobList from './pages/Jobs/JobList';
import JobCreate from './pages/Jobs/JobCreate';
import JobEdit from './pages/Jobs/JobEdit';
import JobDetail from './pages/Jobs/JobDetail';

// Resume Pages
import ResumeList from './pages/Resumes/ResumeList';
import ResumeUpload from './pages/Resumes/ResumeUpload';
import ResumeDetail from './pages/Resumes/ResumeDetail';
import ResumeEdit from './pages/Resumes/ResumeEdit';

// Match Pages
import MatchList from './pages/Matches/MatchList';
import MatchDetail from './pages/Matches/MatchDetail';
import MatchResults from './pages/Matches/MatchResults';

// Profile Pages
import Profile from './pages/Profile/Profile';

// User Pages
import UserDashboard from './pages/User/UserDashboard';
import UserResumeUpload from './pages/User/ResumeUpload';
import UserJobList from './pages/User/JobList';
import UserJobApply from './pages/User/JobApply';
import UserInterviews from './pages/User/UserInterviews';

// Settings Pages
import Settings from './pages/Settings/Settings';

// V2 Feature Pages
import ApplicationList from './pages/Applications/ApplicationList';
import ApplicationDetail from './pages/Applications/ApplicationDetail';
import InterviewList from './pages/Interviews/InterviewList';
import InterviewDetail from './pages/Interviews/InterviewDetail';
import AptitudeExam from './pages/Interviews/AptitudeExam';
import TechnicalExam from './pages/Interviews/TechnicalExam';
import HRInterviewPanel from './pages/Dashboard/HRInterviewPanel';
import PipelineBoard from './pages/Pipeline/PipelineBoard';
import AnalyticsV2 from './pages/Analytics/AnalyticsV2';
import AdminPanel from './pages/Admin/AdminPanel';
import NotificationList from './pages/Notifications/NotificationList';

// Component Showcase
import ComponentShowcase from './pages/ComponentShowcase';

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || '';

// Wrapper: only load GoogleOAuthProvider when a client ID is configured
const OptionalGoogleOAuth = ({ children }) => {
  if (GOOGLE_CLIENT_ID) {
    return <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>{children}</GoogleOAuthProvider>;
  }
  return <>{children}</>;
};

// Protected Route Component
const ProtectedRoute = ({ children, allowedRoles = [] }) => {
  const { isAuthenticated, loading, user } = useAuth();

  if (loading) return null;

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Check role if specified
  if (allowedRoles.length > 0 && !allowedRoles.includes(user?.role)) {
    // Redirect based on role
    if (user?.role === 'admin') return <Navigate to="/adminpanel" replace />;
    if (user?.role === 'hr') return <Navigate to="/app/hr/dashboard" replace />;
    return <Navigate to="/app/user/dashboard" replace />;
  }

  return children;
};

// Public Route Component (redirect if authenticated)
const PublicRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) return null;

  return !isAuthenticated ? children : <Navigate to="/app/dashboard" replace />;
};

function App() {
  return (
    <OptionalGoogleOAuth>
      <AuthProvider>
        <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
          <div className="App">
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<Home />} />
              <Route path="/showcase" element={<ComponentShowcase />} />
              <Route path="/login" element={<PublicRoute><AuthLayout><Login /></AuthLayout></PublicRoute>} />
              <Route path="/register" element={<PublicRoute><AuthLayout><Register /></AuthLayout></PublicRoute>} />
              <Route path="/admin" element={<Navigate to="/admin-gateway" replace />} />
              <Route path="/admin-gateway" element={<PublicRoute><AdminLogin /></PublicRoute>} />



              {/* Protected Routes */}
              <Route path="/app" element={
                <ProtectedRoute>
                  <Layout />
                </ProtectedRoute>
              }>
                {/* ... existing app routes ... */}
                <Route index element={<Navigate to="/app/dashboard" replace />} />
                <Route path="dashboard" element={
                  <ProtectedRoute allowedRoles={['admin']}>
                    <Dashboard />
                  </ProtectedRoute>
                } />
                <Route path="hr/dashboard" element={<HRDashboard />} />
                <Route path="analytics" element={<Analytics />} />
                <Route path="currency-demo" element={<CurrencyDemo />} />

                {/* Jobs */}
                <Route path="jobs" element={<JobList />} />
                <Route path="jobs/new" element={<JobCreate />} />
                <Route path="jobs/:id" element={<JobDetail />} />
                <Route path="jobs/:id/edit" element={<JobEdit />} />

                {/* Resumes */}
                <Route path="resumes" element={<ResumeList />} />
                <Route path="resumes/upload" element={<ResumeUpload />} />
                <Route path="resumes/:id" element={<ResumeDetail />} />
                <Route path="resumes/:id/edit" element={<ResumeEdit />} />

                {/* Matches */}
                <Route path="matches" element={<MatchList />} />
                <Route path="matches/:id" element={<MatchDetail />} />
                <Route path="jobs/:jobId/matches" element={<MatchResults />} />

                {/* Applications */}
                <Route path="applications" element={<ApplicationList />} />
                <Route path="applications/:id" element={<ApplicationDetail />} />

                {/* Interviews */}
                <Route path="interviews" element={<InterviewList />} />
                <Route path="interviews/:id" element={<InterviewDetail />} />
                <Route path="interviews/:id/aptitude" element={<AptitudeExam />} />
                <Route path="interviews/:id/technical" element={<TechnicalExam />} />

                {/* Pipeline */}
                <Route path="pipeline" element={<PipelineBoard />} />

                {/* Advanced Analytics */}
                <Route path="analytics-v2" element={<AnalyticsV2 />} />

                {/* Notifications */}
                <Route path="notifications" element={<NotificationList />} />

                {/* Profile & Settings */}
                <Route path="profile" element={<Profile />} />
                <Route path="settings" element={<Settings />} />

                {/* User Routes */}
                <Route path="user/dashboard" element={<UserDashboard />} />
                <Route path="user/resumes/upload" element={<UserResumeUpload />} />
                <Route path="user/jobs" element={<UserJobList />} />
                <Route path="user/apply/:jobId" element={<UserJobApply />} />
                <Route path="user/interviews" element={<UserInterviews />} />
                <Route path="hr/interviews" element={<HRInterviewPanel />} />
              </Route>

              {/* Admin Panel Route (Separate path as requested) */}
              <Route path="/adminpanel" element={
                <ProtectedRoute allowedRoles={['admin']}>
                   <Layout />
                </ProtectedRoute>
              }>
                <Route index element={<AdminPanel />} />
              </Route>

              {/* 404 Fallback - More specific */}
              <Route path="/app/*" element={<Navigate to="/app/dashboard" replace />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </div>
        </Router>
      </AuthProvider>
    </OptionalGoogleOAuth>
  );
}

export default App;
