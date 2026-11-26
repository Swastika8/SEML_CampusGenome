import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider } from './context/AuthContext';
import { DataProvider } from './context/DataContext';
import { ContributionProvider } from './context/ContributionContext';
import { ToastProvider } from './context/ToastContext';
import { ReadingTrailProvider } from './context/ReadingTrailContext';
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
import ForumLayout from './components/forum/ForumLayout';
import ForumPage from './pages/ForumPage';
import ForumDirectory from './pages/ForumDirectory';
import ForumModeration from './pages/ForumModeration';

const LabsPage = lazy(() => import('./pages/LabsPage'));
const Dashboard = lazy(() => import('./pages/Dashboard'));

export default function App() {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <AuthProvider>
          <ReadingTrailProvider>
            <ToastProvider>
              <DataProvider>
                <ContributionProvider>
                  <ContributionModal />
                  <Routes>
                    <Route element={<ForumLayout />}>
                      <Route path="/" element={<ForumPage />} />
                      <Route path="/c/:slug" element={<ForumPage mode="community" />} />
                      <Route path="/communities" element={<ForumDirectory />} />
                      <Route path="/explore" element={<ForumPage mode="search" />} />
                      <Route path="/saved" element={<ForumPage mode="saved" />} />
                      <Route path="/nodes/:id" element={<NodePage />} />
                      <Route path="/events/:id" element={<NodePage />} />
                      <Route path="/moderation" element={<ForumModeration />} />
                    </Route>
                    <Route
                      path="/commons"
                      element={
                        <Suspense
                          fallback={
                            <p role="status" className="p-8 text-sm">
                              Opening campus extras…
                            </p>
                          }
                        >
                          <Dashboard />
                        </Suspense>
                      }
                    />
                    <Route path="/clubs" element={<CommunitiesPage />} />
                    <Route path="/login" element={<LoginPage />} />
                    <Route path="/map" element={<MapPage />} />
                    <Route path="/profile" element={<Profile />} />
                    <Route
                      path="/labs"
                      element={
                        <Suspense
                          fallback={
                            <p role="status" className="p-8 text-sm">
                              Opening the lab…
                            </p>
                          }
                        >
                          <LabsPage />
                        </Suspense>
                      }
                    />
                    {['Academics', 'Career', 'Events', 'Lifestyle'].map((category) => (
                      <Route
                        key={category}
                        path={'/' + category.toLowerCase()}
                        element={
                          category === 'Academics' ? (
                            <AcademicsPage />
                          ) : category === 'Career' ? (
                            <CareerPage />
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
          </ReadingTrailProvider>
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
}
