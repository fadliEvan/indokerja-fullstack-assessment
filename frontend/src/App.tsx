import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { Navbar } from './components/common/Navbar';
import { Footer } from './components/common/Footer';
import { ProtectedRoute, GuestRoute } from './components/auth/ProtectedRoute';

// Public Pages
import { HomePage } from './pages/HomePage';
import { JobsPage } from './pages/jobs/JobsPage';
import { JobDetailPage } from './pages/jobs/JobDetailPage';
import { LoginPage } from './pages/auth/LoginPage';
import { RegisterPage } from './pages/auth/RegisterPage';
import { NotFoundPage } from './pages/NotFoundPage';

// Job Seeker Pages
import { ApplicationsPage } from './pages/seeker/ApplicationsPage';
import { ApplicationDetailPage } from './pages/seeker/ApplicationDetailPage';

// Company Pages
import { CompanyJobsPage } from './pages/company/CompanyJobsPage';
import { CreateJobPage } from './pages/company/CreateJobPage';
import { CandidatesPage } from './pages/company/CandidatesPage';

export const App: React.FC = () => {
  return (
    <BrowserRouter>
      <AuthProvider>
        <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
          <Navbar />

          <main style={{ flex: 1 }}>
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<HomePage />} />
              <Route path="/jobs" element={<JobsPage />} />
              <Route path="/jobs/:id" element={<JobDetailPage />} />

              {/* Guest Auth Routes (Redirects to dashboard if already authenticated) */}
              <Route
                path="/login"
                element={
                  <GuestRoute>
                    <LoginPage />
                  </GuestRoute>
                }
              />
              <Route
                path="/register"
                element={
                  <GuestRoute>
                    <RegisterPage />
                  </GuestRoute>
                }
              />

              {/* Job Seeker Protected Routes */}
              <Route
                path="/applications"
                element={
                  <ProtectedRoute allowedRoles={['JOB_SEEKER']}>
                    <ApplicationsPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/applications/:id"
                element={
                  <ProtectedRoute allowedRoles={['JOB_SEEKER']}>
                    <ApplicationDetailPage />
                  </ProtectedRoute>
                }
              />

              {/* Company Protected Routes */}
              <Route
                path="/company"
                element={<Navigate to="/company/jobs" replace />}
              />
              <Route
                path="/company/jobs"
                element={
                  <ProtectedRoute allowedRoles={['COMPANY']}>
                    <CompanyJobsPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/company/jobs/new"
                element={
                  <ProtectedRoute allowedRoles={['COMPANY']}>
                    <CreateJobPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/company/jobs/:jobId/candidates"
                element={
                  <ProtectedRoute allowedRoles={['COMPANY']}>
                    <CandidatesPage />
                  </ProtectedRoute>
                }
              />

              {/* 404 Fallback */}
              <Route path="*" element={<NotFoundPage />} />
            </Routes>
          </main>

          <Footer />
        </div>
      </AuthProvider>
    </BrowserRouter>
  );
};

export default App;
