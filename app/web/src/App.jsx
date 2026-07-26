import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import './App.css'
import Home from './pages/home/Home'
import Auth from './pages/auth/Auth.jsx';
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { muiTheme } from './theme/muiTheme.js'
import { ThemeProvider, CssBaseline } from '@mui/material'
import VerifyOtp from './pages/auth/VerifyOtp.jsx';
import ProfileSetup from './pages/auth/SetProfile.jsx';
import ForgotPassword from './pages/auth/ForgotPassword.jsx';
import ResetPassword from './pages/auth/ResetPassword.jsx';
import ProfilePage from './profile/ProfilePage.jsx';
import Jobs from './pages/jobs/Jobs.jsx';
import Feed from './pages/feed/Feed.jsx';
import { ProtectedRoute } from './components/layout/ProtectedRoute';
import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { fetchCurrentUser } from "./store/slices/authSlice.js";
import RecruiterDashboard from './pages/recruiter/RecruiterDashboard.jsx';
import PostJobPage from './pages/recruiter/PostJobPage.jsx';

import JobApplicationsPage from './pages/recruiter/JobApplicationsPage.jsx';

const queryClient = new QueryClient();

function App() {
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(fetchCurrentUser());
  }, [dispatch]);

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider theme={muiTheme}>
        <CssBaseline />
        <BrowserRouter>
          <Routes>
            <Route path="/auth/*" element={<Auth />} />
            <Route path="/auth/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path='/auth/verify' element={<VerifyOtp />} />

            {/* Protected Routes */}
            {/* Protected Routes - General */}
            <Route element={<ProtectedRoute />}>
              <Route path="/" element={<Home />} />
              <Route path="/profile-setup" element={<ProfileSetup />} />
              <Route path="/profile/me" element={<ProfilePage />} />
              <Route path="/jobs" element={<Jobs />} />
              <Route path="/feed" element={<Feed />} />
            </Route>

            {/* Recruiter Routes */}
            <Route element={<ProtectedRoute allowedRoles={['RECRUITER']} />}>
              <Route path="/recruiter/dashboard" element={<RecruiterDashboard />} />
              <Route path="/recruiter/post-job" element={<PostJobPage />} />
              <Route path="/recruiter/job/:jobId/applications" element={<JobApplicationsPage />} />
            </Route>

          </Routes>
        </BrowserRouter>
      </ThemeProvider>
    </QueryClientProvider>
  )
}

export default App
