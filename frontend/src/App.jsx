import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider } from './context/AuthContext';
import { DataProvider } from './context/DataContext';
import { ContributionProvider } from './context/ContributionContext';
import { ToastProvider } from './context/ToastContext';
import Dashboard from './pages/Dashboard';
import ExplorePage from './pages/ExplorePage';
import MapPage from './pages/MapPage';
import Profile from './pages/Profile';
import LoginPage from './pages/LoginPage';
import NodePage from './pages/NodePage';
import AcademicsPage from './pages/AcademicsPage';
import CareerPage from './pages/CareerPage';
import CommunitiesPage from './pages/CommunitiesPage';
import EventsPage from './pages/EventsPage';
import LifestylePage from './pages/LifestylePage';
import ContributionModal from './components/modules/ContributionModal';

export default function App() {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <AuthProvider>
          <ToastProvider>
            <DataProvider>
              <ContributionProvider>
                <ContributionModal />
                <Routes>
                  <Route path="/" element={<Dashboard />} />
                  <Route path="/login" element={<LoginPage />} />
                  <Route path="/explore" element={<ExplorePage />} />
                  <Route path="/saved" element={<ExplorePage saved />} />
                  <Route path="/map" element={<MapPage />} />
                  <Route path="/profile" element={<Profile />} />
                  <Route path="/nodes/:id" element={<NodePage />} />
                  <Route path="/events/:id" element={<NodePage />} />
                  {['Academics', 'Career', 'Communities', 'Events', 'Lifestyle'].map((category) => (
                    <Route
                      key={category}
                      path={'/' + category.toLowerCase()}
                      element={
                        category === 'Academics' ? (
                          <AcademicsPage />
                        ) : category === 'Career' ? (
                          <CareerPage />
                        ) : category === 'Communities' ? (
                          <CommunitiesPage />
                        ) : category === 'Events' ? (
                          <EventsPage />
                        ) : (
                          <LifestylePage />
                        )
                      }
                    />
                  ))}
                  <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
              </ContributionProvider>
            </DataProvider>
          </ToastProvider>
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
}
