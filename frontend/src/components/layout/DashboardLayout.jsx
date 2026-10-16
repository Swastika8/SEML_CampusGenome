import { useState, useEffect } from 'react';
import Header from './Header';
import Sidebar from './Sidebar';
import { useData } from '../../context/DataContext';
import { useContribution } from '../../context/ContributionContext';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function DashboardLayout({ children }) {
  const { openWizard } = useContribution();
  const { error, refreshData } = useData();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 1024) {
        setIsSidebarCollapsed(true);
      } else {
        setIsSidebarCollapsed(false);
      }
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div
      className={
        'campus-shell min-h-screen relative bg-gray-50 dark:bg-midnight-900 transition-colors duration-300 flex ' +
        (isSidebarCollapsed ? 'nav-collapsed' : '')
      }
    >
      <a href="#main-content" className="skip-link">
        Skip to campus content
      </a>
      {/* Sidebar */}
      <Sidebar
        isCollapsed={isSidebarCollapsed}
        toggleSidebar={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
      />

      {/* Main Content Wrapper */}
      <div className="campus-workspace relative flex flex-col min-h-screen min-w-0 transition-all duration-300">
        {/* Background Image with Overlay */}
        <div
          className="campus-backdrop fixed inset-0 z-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: 'url(/background.jpg)' }}
        >
          {/* Light mode overlay: 50% white, Dark mode overlay: 70% midnight */}
          <div className="absolute inset-0 bg-white/50 dark:bg-midnight-900/70 backdrop-blur-sm transition-colors duration-300" />
        </div>

        <div className="relative z-10 flex flex-col min-h-screen">
          <Header />

          <main
            id="main-content"
            className="campus-main flex-1 w-full mx-auto flex flex-col"
            tabIndex={-1}
          >
            {error && (
              <div
                role="alert"
                className="mb-5 p-4 rounded-2xl border border-gold-400/30 bg-white/60 dark:bg-midnight-800/70 backdrop-blur-xl text-sm text-charcoal-700 dark:text-gray-300"
              >
                <p>{error}</p>
                <button
                  className="mt-2 text-gold-600 dark:text-gold-400 underline"
                  onClick={refreshData}
                >
                  Reconnect the strands
                </button>
              </div>
            )}
            {children}
          </main>

          {/* Graduation Contribution Banner */}
          <div className="campus-footer">
            <p className="font-medium text-sm sm:text-base">
              🎓 Graduating soon?{' '}
              <button
                onClick={() => (user ? openWizard() : navigate('/login'))}
                className="underline font-bold hover:text-white transition-colors"
              >
                Leave your DNA.
              </button>{' '}
              Contribute to the Genome before you leave.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
