import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from './contexts/ThemeContext';
import { LanguageProvider } from './contexts/LanguageContext';
import { AuthProvider } from './contexts/AuthContext';
import Layout from './components/Layout/Layout';
import ProtectedRoute from './components/Auth/ProtectedRoute';
import HomePage from './pages/HomePage';
import ThreatCheckPage from './pages/ThreatCheckPage';
import EnhancedThreatCheckPage from './pages/EnhancedThreatCheckPage';
import AlertsDashboard from './pages/AlertsDashboard';
import WomenSafetyHub from './pages/WomenSafetyHub';
import AdultSafety from './pages/AdultSafety';
import EvidenceVault from './pages/EvidenceVault';
import CommunityIntel from './pages/CommunityIntel';
import CyberRiskHeatmap from './pages/CyberRiskHeatmap';
import AdvancedDashboard from './pages/AdvancedDashboard';
import SignInPage from './pages/Auth/SignInPage';
import SignUpPage from './pages/Auth/SignUpPage';
import ForgotPasswordPage from './pages/Auth/ForgotPasswordPage';
import DashboardPage from './pages/Dashboard/DashboardPage';
import NotFoundPage from './pages/NotFoundPage';

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
                <Route path="/threat-check-enhanced" element={<EnhancedThreatCheckPage />} />
                <Route path="/advanced-dashboard" element={<AdvancedDashboard />} />
                <Route path="/alerts" element={<AlertsDashboard />} />
                <Route path="/women-safety" element={<WomenSafetyHub />} />
                <Route path="/adult-safety" element={<AdultSafety />} />
                <Route path="/community" element={<CommunityIntel />} />
                <Route path="/heatmap" element={<CyberRiskHeatmap />} />
                
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

                {/* Catch-all for unknown routes */}
                <Route path="*" element={<NotFoundPage />} />
              </Routes>
            </Layout>
          </Router>
        </AuthProvider>
      </LanguageProvider>
    </ThemeProvider>
  );
}

export default App;