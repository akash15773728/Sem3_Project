import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { DashboardLayout } from './layouts/DashboardLayout';

// Public Pages
import { LandingPage } from './pages/LandingPage';
import { AboutPage } from './pages/AboutPage';
import { LoginPage } from './pages/LoginPage';
import { PrivacyPolicyPage } from './pages/PrivacyPolicyPage';
import { TermsOfUsePage } from './pages/TermsOfUsePage';
import { CookiePolicyPage } from './pages/CookiePolicyPage';

// Authenticated Pages
import { DashboardPage } from './pages/DashboardPage';
import { ReferralsPage } from './pages/ReferralsPage';
import { NewReferralPage } from './pages/NewReferralPage';
import { ReferralDetailPage } from './pages/ReferralDetailPage';
import { UploadReferralsPage } from './pages/UploadReferralsPage';
import { CapacityPage } from './pages/CapacityPage';
import { GapAnalysisPage } from './pages/GapAnalysisPage';
import { AlertsPage } from './pages/AlertsPage';
import { AnalyticsPage } from './pages/AnalyticsPage';
import { HospitalAnalysisPage } from './pages/HospitalAnalysisPage';
import { DistrictAnalysisPage } from './pages/DistrictAnalysisPage';
import { StateAnalysisPage } from './pages/StateAnalysisPage';
import { FacilitiesPage } from './pages/FacilitiesPage';
import { ServicesPage } from './pages/ServicesPage';
import { StorageFilesPage } from './pages/StorageFilesPage';
import { ActivityLogsPage } from './pages/ActivityLogsPage';
import { UsersPage } from './pages/UsersPage';

export function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/privacy-policy" element={<PrivacyPolicyPage />} />
          <Route path="/terms-of-use" element={<TermsOfUsePage />} />
          <Route path="/cookie-policy" element={<CookiePolicyPage />} />

          {/* Authenticated Dashboard Routes */}
          <Route element={<DashboardLayout />}>
            <Route path="/dashboard" element={<DashboardPage />} />
            
            {/* Operational Referral Management (Hospital Users) */}
            <Route path="/referrals" element={<ReferralsPage />} />
            <Route path="/referrals/new" element={<NewReferralPage />} />
            <Route path="/referrals/upload" element={<UploadReferralsPage />} />
            <Route path="/referrals/:id" element={<ReferralDetailPage />} />

            {/* Hierarchical Analytical & Monitoring Interfaces (Authorities) */}
            <Route path="/hospital-analysis" element={<HospitalAnalysisPage />} />
            <Route path="/district-analysis" element={<DistrictAnalysisPage />} />
            <Route path="/state-analysis" element={<StateAnalysisPage />} />
            <Route path="/gap-analysis" element={<GapAnalysisPage />} />
            <Route path="/analytics/gaps" element={<GapAnalysisPage />} />
            <Route path="/alerts" element={<AlertsPage />} />
            <Route path="/analytics" element={<AnalyticsPage />} />

            {/* Directory, Capacity & System Administration */}
            <Route path="/capacity" element={<CapacityPage />} />
            <Route path="/facilities" element={<FacilitiesPage />} />
            <Route path="/services" element={<ServicesPage />} />
            <Route path="/storage-files" element={<StorageFilesPage />} />
            <Route path="/activity-logs" element={<ActivityLogsPage />} />
            <Route path="/users" element={<UsersPage />} />
          </Route>

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
