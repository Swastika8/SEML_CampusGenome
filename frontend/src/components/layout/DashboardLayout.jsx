import { useState, useEffect } from 'react';
import Header from './Header';
import Sidebar from './Sidebar';

export default function DashboardLayout({ children }) {
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
    <div className="min-h-screen relative overflow-hidden bg-gray-50 dark:bg-midnight-900 transition-colors duration-300 flex">
      {/* Sidebar */}
      <Sidebar 
        isCollapsed={isSidebarCollapsed} 
        toggleSidebar={() => setIsSidebarCollapsed(!isSidebarCollapsed)} 
      />

      {/* Main Content Wrapper */}
      <div className={`flex-1 relative flex flex-col min-h-screen min-w-0 w-full overflow-x-hidden transition-all duration-300 ${isSidebarCollapsed ? 'ml-20' : 'ml-64'}`}>
        {/* Background Image with Overlay */}
        <div 
          className="fixed inset-0 z-0 bg-cover bg-center bg-no-repeat transition-opacity duration-700"
          style={{ backgroundImage: 'url(/background.jpg)' }}
        >
          {/* Light mode overlay: 50% white, Dark mode overlay: 70% midnight */}
          <div className="absolute inset-0 bg-white/50 dark:bg-midnight-900/70 backdrop-blur-sm transition-colors duration-300" />
        </div>

        <div className="relative z-10 flex flex-col min-h-screen">
          <Header />
          
          <main className="flex-1 w-full max-w-7xl mx-auto p-4 sm:p-6 lg:p-10 flex flex-col">
            {children}
          </main>

          {/* Graduation Contribution Banner */}
          <div className="w-full bg-gold-400 dark:bg-gold-500 text-charcoal-900 py-3 px-4 text-center shadow-lg transform transition-transform translate-y-0">
            <p className="font-medium text-sm sm:text-base">
              🎓 Graduating soon? <button className="underline font-bold hover:text-white transition-colors">Leave your DNA.</button> Contribute to the Genome before you leave.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
