import { useState } from 'react';
import { Joyride } from 'react-joyride';
import { HelpCircle, Sparkles, CheckCircle2, Clock, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import DashboardLayout from '../components/layout/DashboardLayout';
import HeroMessage from '../components/dashboard/HeroMessage';
import Ticker from '../components/dashboard/Ticker';
import ContributorList from '../components/dashboard/ContributorList';
import ContributionWizard from '../components/modules/ContributionWizard';
import { useTheme } from '../context/ThemeContext';
import { useData } from '../context/DataContext';

export default function Dashboard() {
  const [runTour, setRunTour] = useState(false);
  const [activeTab, setActiveTab] = useState('insights');
  const { theme } = useTheme();
  const { nodes, events, lifestyle, career, communities } = useData();

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
                      <span className="text-charcoal-600 dark:text-gray-300 font-medium text-sm">Active Nodes</span>
                      <div className="flex items-center">
                        <span className="font-bold text-charcoal-900 dark:text-gray-100 font-mono">
                          {nodes && nodes.length > 0 ? (nodes.length + 1240).toLocaleString() : '1,245'}
                        </span>
                        <span className="text-green-600 dark:text-green-400 text-xs font-bold ml-2 bg-green-500/10 px-1.5 py-0.5 rounded">↑ 12%</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between py-3 border-b border-gray-400/20 last:border-0">
                      <span className="text-charcoal-600 dark:text-gray-300 font-medium text-sm">Total Contributions</span>
                      <div className="flex items-center">
                        <span className="font-bold text-charcoal-900 dark:text-gray-100 font-mono">
                          {nodes && nodes.length > 0 ? (nodes.length + 4090).toLocaleString() : '4,092'}
                        </span>
                        <span className="text-green-600 dark:text-green-400 text-xs font-bold ml-2 bg-green-500/10 px-1.5 py-0.5 rounded">↑ 8%</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between py-3 border-b border-gray-400/20 last:border-0">
                      <span className="text-charcoal-600 dark:text-gray-300 font-medium text-sm">Verified Secrets</span>
                      <div className="flex items-center">
                        <span className="font-bold text-charcoal-900 dark:text-gray-100 font-mono">830</span>
                        <span className="text-green-600 dark:text-green-400 text-xs font-bold ml-2 bg-green-500/10 px-1.5 py-0.5 rounded">↑ 24%</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between py-3 border-b border-gray-400/20 last:border-0">
                      <span className="text-charcoal-600 dark:text-gray-300 font-medium text-sm">Network Health</span>
                      <div className="flex items-center">
                        <span className="font-bold text-charcoal-900 dark:text-gray-100 font-mono">99.8%</span>
                        <span className="text-emerald-600 dark:text-emerald-400 text-xs font-medium ml-2 bg-emerald-500/10 px-1.5 py-0.5 rounded">Live & Healthy</span>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="flex flex-col gap-3 py-1">
                    {(nodes && nodes.length > 0 ? nodes.slice(0, 4) : [
                      { id: 'm1', title: 'Midnight Maggi Exam Special Tip', category: 'Lifestyle', author_handle: '@StudentJohn', created_at: '2h ago' },
                      { id: 'm2', title: 'Data Structures FY PYQ Solutions', category: 'Academics', author_handle: '@SwastikaSinha', created_at: '4h ago' },
                      { id: 'm3', title: 'Google Summer Placement Drive 2026', category: 'Career', author_handle: '@TechGuru', created_at: '6h ago' },
                      { id: 'm4', title: 'CampusHack 2026 Hackathon Registration', category: 'Events', author_handle: '@CampusExplorer', created_at: '1d ago' },
                    ]).map((item, idx) => (
                      <div key={item.id || idx} className="p-2.5 rounded-xl bg-white/40 dark:bg-white/5 border border-gray-200/50 dark:border-white/5 flex flex-col gap-1">
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-gold-400/20 text-gold-700 dark:text-gold-300">
                            {item.category}
                          </span>
                          <span className="text-[10px] text-gray-400">
                            {item.created_at ? (item.created_at.includes('ago') ? item.created_at : new Date(item.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })) : 'Recently'}
                          </span>
                        </div>
                        <p className="text-xs font-semibold text-charcoal-900 dark:text-gray-200 truncate">
                          {item.title}
                        </p>
                        <span className="text-[11px] text-charcoal-500 dark:text-gray-400 truncate">
                          by <span className="font-medium text-gold-600 dark:text-gold-400">{item.author_handle || item.author_name || '@StudentJohn'}</span>
                        </span>
                      </div>
                    ))}
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
