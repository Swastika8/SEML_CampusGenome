import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { DataProvider } from './context/DataContext';
import { ContributionProvider } from './context/ContributionContext';
import Dashboard from './pages/Dashboard';
import MapPage from './pages/MapPage';
import Profile from './pages/Profile';
import AcademicsPage from './pages/AcademicsPage';
import CareerPage from './pages/CareerPage';
import CommunitiesPage from './pages/CommunitiesPage';
import EventsPage from './pages/EventsPage';
import ArticleDetailPage from './pages/ArticleDetailPage';
import LifestylePage from './pages/LifestylePage';
import LoginPage from './pages/LoginPage';
import ContributionModal from './components/modules/ContributionModal';

// Route guard: Redirect unauthenticated visitors directly to /login
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-gray-50 dark:bg-[#0B1120]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-gold-500 border-t-transparent rounded-full animate-spin" />
          <span className="text-xs font-mono tracking-wider text-charcoal-600 dark:text-gray-400">Loading Campus DNA...</span>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

// Route guard: Redirect already logged-in users away from /login to dashboard
const PublicOnlyRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) return null;
  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return children;
};

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <DataProvider>
          <ContributionProvider>
            <ContributionModal />
            <Router>
              <Routes>
                {/* Entry route: opens on LoginPage for visitors, Dashboard for logged-in students */}
                <Route path="/login" element={
                  <PublicOnlyRoute>
                    <LoginPage />
                  </PublicOnlyRoute>
                } />
                
                <Route path="/" element={
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                } />

                <Route path="/map" element={
                  <ProtectedRoute>
                    <MapPage />
                  </ProtectedRoute>
                } />

                <Route path="/profile" element={
                  <ProtectedRoute>
                    <Profile />
                  </ProtectedRoute>
                } />

                <Route path="/academics" element={
                  <ProtectedRoute>
                    <AcademicsPage />
                  </ProtectedRoute>
                } />

                <Route path="/career" element={
                  <ProtectedRoute>
                    <CareerPage />
                  </ProtectedRoute>
                } />

                <Route path="/communities" element={
                  <ProtectedRoute>
                    <CommunitiesPage />
                  </ProtectedRoute>
                } />

                <Route path="/events" element={
                  <ProtectedRoute>
                    <EventsPage />
                  </ProtectedRoute>
                } />

                <Route path="/events/:id" element={
                  <ProtectedRoute>
                    <ArticleDetailPage />
                  </ProtectedRoute>
                } />

                <Route path="/lifestyle" element={
                  <ProtectedRoute>
                    <LifestylePage />
                  </ProtectedRoute>
                } />

                {/* Catch-all fallback */}
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </Router>
          </ContributionProvider>
        </DataProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
