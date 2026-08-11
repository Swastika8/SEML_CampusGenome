import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
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
import ContributionModal from './components/modules/ContributionModal';

function App() {
  return (
    <ThemeProvider>
      <DataProvider>
        <ContributionProvider>
          <ContributionModal />
          <Router>
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/map" element={<MapPage />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/academics" element={<AcademicsPage />} />
              <Route path="/career" element={<CareerPage />} />
              <Route path="/communities" element={<CommunitiesPage />} />
              <Route path="/events" element={<EventsPage />} />
              <Route path="/events/:id" element={<ArticleDetailPage />} />
              <Route path="/lifestyle" element={<LifestylePage />} />
            </Routes>
          </Router>
        </ContributionProvider>
      </DataProvider>
    </ThemeProvider>
  );
}

export default App;
