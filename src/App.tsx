import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from './contexts/ThemeContext';
import { LanguageProvider } from './contexts/LanguageContext';
import { AuthProvider } from './contexts/AuthContext';
import Layout from './components/Layout/Layout';
import ProtectedRoute from './components/Auth/ProtectedRoute';
import HomePage from './pages/HomePage';
import ThreatCheckPage from './pages/ThreatCheckPage';
import AlertsDashboard from './pages/AlertsDashboard';
import WomenSafetyHub from './pages/WomenSafetyHub';
import AdultSafety from './pages/AdultSafety';
import EvidenceVault from './pages/EvidenceVault';
import CommunityIntel from './pages/CommunityIntel';
import SignInPage from './pages/Auth/SignInPage';
import SignUpPage from './pages/Auth/SignUpPage';
import ForgotPasswordPage from './pages/Auth/ForgotPasswordPage';
import DashboardPage from './pages/Dashboard/DashboardPage';

function App() {
  return (
    <ThemeProvider>
      <LanguageProvider>
        <AuthProvider>
          <Router>
            <Layout>
              <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/threat-check" element={<ThreatCheckPage />} />
                <Route path="/alerts" element={<AlertsDashboard />} />
                <Route path="/women-safety" element={<WomenSafetyHub />} />
                <Route path="/adult-safety" element={<AdultSafety />} />
                <Route path="/community" element={<CommunityIntel />} />
                
                {/* Auth Routes */}
                <Route path="/auth/signin" element={
                  <ProtectedRoute requireAuth={false}>
                    <SignInPage />
                  </ProtectedRoute>
                } />
                <Route path="/auth/signup" element={
                  <ProtectedRoute requireAuth={false}>
                    <SignUpPage />
                  </ProtectedRoute>
                } />
                <Route path="/auth/forgot-password" element={
                  <ProtectedRoute requireAuth={false}>
                    <ForgotPasswordPage />
                  </ProtectedRoute>
                } />
                
                {/* Protected Routes */}
                <Route path="/dashboard" element={
                  <ProtectedRoute>
                    <DashboardPage />
                  </ProtectedRoute>
                } />
                <Route path="/evidence-vault" element={
                  <ProtectedRoute>
                    <EvidenceVault />
                  </ProtectedRoute>
                } />
              </Routes>
            </Layout>
          </Router>
        </AuthProvider>
      </LanguageProvider>
    </ThemeProvider>
  );
}

export default App;