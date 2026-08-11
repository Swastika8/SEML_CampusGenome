import { useState } from 'react';
import { Joyride } from 'react-joyride';
import { HelpCircle } from 'lucide-react';
import DashboardLayout from '../components/layout/DashboardLayout';
import HeroMessage from '../components/dashboard/HeroMessage';
import Ticker from '../components/dashboard/Ticker';
import ContributorList from '../components/dashboard/ContributorList';
import ContributionWizard from '../components/modules/ContributionWizard';
import { useTheme } from '../context/ThemeContext';

export default function Dashboard() {
  const [runTour, setRunTour] = useState(false);
  const [activeTab, setActiveTab] = useState('insights');
  const { theme } = useTheme();

  const steps = [
    {
      target: '.tour-search',
      content: 'Start your journey here. Search for courses, professors, or hidden campus spots.',
      disableBeacon: true,
    },
    {
      target: '.tour-theme-toggle',
      content: 'Switch between light and dark modes for late-night study sessions.',
    }
  ];

  return (
    <DashboardLayout>
      <Joyride 
        steps={steps} 
        run={runTour}
        continuous 
        showSkipButton 
        styles={{
          options: {
            primaryColor: '#D4AF37',
            backgroundColor: theme === 'dark' ? '#0B1120' : '#ffffff',
            textColor: theme === 'dark' ? '#F3F4F6' : '#111827',
            arrowColor: theme === 'dark' ? '#0B1120' : '#ffffff',
          }
        }}
        callback={(data) => {
          if (data.status === 'finished' || data.status === 'skipped') {
            setRunTour(false);
          }
        }}
      />
      
      <div className="flex-1 flex flex-col min-w-0 relative h-full">
        <div className="flex-1 flex flex-col lg:flex-row gap-8 mt-4 mb-8">
          
          {/* Left Column (Hero & Contributors) */}
          <div className="flex-1 flex flex-col justify-between">
            <HeroMessage />
            <div className="hidden lg:block mt-auto pb-8">
              <ContributorList />
            </div>
          </div>

          {/* Right Column (Global Campus Overview Panel) */}
          <div className="flex-[1.2] relative flex items-start justify-center lg:justify-end animate-fade-in-up">
            <div className="w-full max-w-lg m-6 bg-white/40 dark:bg-[#111827]/60 backdrop-blur-xl border border-white/40 dark:border-white/10 shadow-2xl rounded-3xl p-6 flex flex-col">
              <div className="mb-6">
                <h2 className="font-serif text-3xl font-bold text-charcoal-900 dark:text-gray-100 mb-2 tracking-tight">Global Campus Overview</h2>
                <p className="text-sm text-charcoal-700 dark:text-gray-400">Discover insights and recent activity across the network.</p>
              </div>
              
              {/* Segmented Control Tabs */}
              <div className="flex bg-black/5 dark:bg-white/5 p-1 rounded-lg mb-6 w-fit">
                <button 
                  onClick={() => setActiveTab('insights')}
                  className={`px-4 py-1.5 text-sm font-medium rounded-md transition-all ${
                    activeTab === 'insights' 
                      ? 'bg-white dark:bg-midnight-800 shadow-sm text-charcoal-900 dark:text-gold-400' 
                      : 'text-charcoal-600 dark:text-gray-400 hover:text-charcoal-900 dark:hover:text-gray-200'
                  }`}
                >
                  Insights
                </button>
                <button 
                  onClick={() => setActiveTab('activity')}
                  className={`px-4 py-1.5 text-sm font-medium rounded-md transition-all ${
                    activeTab === 'activity' 
                      ? 'bg-white dark:bg-midnight-800 shadow-sm text-charcoal-900 dark:text-gold-400' 
                      : 'text-charcoal-600 dark:text-gray-400 hover:text-charcoal-900 dark:hover:text-gray-200'
                  }`}
                >
                  Activity
                </button>
              </div>

              {/* Data List */}
              <div className="flex flex-col">
                {activeTab === 'insights' ? (
                  <>
                    <div className="flex items-center justify-between py-3 border-b border-gray-400/20 last:border-0">
                      <span className="text-charcoal-600 dark:text-gray-300 font-medium">Active Nodes</span>
                      <div className="flex items-center">
                        <span className="font-bold text-charcoal-900 dark:text-gray-100 font-mono">1,245</span>
                        <span className="text-green-600 dark:text-green-400 text-xs font-bold ml-2 bg-green-500/10 px-1.5 py-0.5 rounded">↑ 12%</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between py-3 border-b border-gray-400/20 last:border-0">
                      <span className="text-charcoal-600 dark:text-gray-300 font-medium">Total Contributions</span>
                      <div className="flex items-center">
                        <span className="font-bold text-charcoal-900 dark:text-gray-100 font-mono">4,092</span>
                        <span className="text-green-600 dark:text-green-400 text-xs font-bold ml-2 bg-green-500/10 px-1.5 py-0.5 rounded">↑ 8%</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between py-3 border-b border-gray-400/20 last:border-0">
                      <span className="text-charcoal-600 dark:text-gray-300 font-medium">Verified Secrets</span>
                      <div className="flex items-center">
                        <span className="font-bold text-charcoal-900 dark:text-gray-100 font-mono">830</span>
                        <span className="text-green-600 dark:text-green-400 text-xs font-bold ml-2 bg-green-500/10 px-1.5 py-0.5 rounded">↑ 24%</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between py-3 border-b border-gray-400/20 last:border-0">
                      <span className="text-charcoal-600 dark:text-gray-300 font-medium">Network Health</span>
                      <div className="flex items-center">
                        <span className="font-bold text-charcoal-900 dark:text-gray-100 font-mono">99.8%</span>
                        <span className="text-gray-500 dark:text-gray-400 text-xs font-medium ml-2 bg-gray-500/10 px-1.5 py-0.5 rounded">Stable</span>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="text-center py-8 text-charcoal-500 dark:text-gray-400">
                    <p className="text-sm">Activity feed loading...</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="mt-auto">
          <Ticker />
        </div>
      </div>
      
      <ContributionWizard />

      {/* Walkthrough FAB */}
      <button 
        onClick={() => setRunTour(true)}
        className="fixed bottom-6 right-6 z-50 p-4 bg-gold-400 dark:bg-gold-500 text-midnight-900 rounded-full shadow-2xl hover:bg-gold-500 dark:hover:bg-gold-400 transition-transform transform hover:scale-110 flex items-center justify-center focus:outline-none focus:ring-4 focus:ring-gold-500/30"
      >
        <HelpCircle size={28} />
      </button>
    </DashboardLayout>
  );
}
