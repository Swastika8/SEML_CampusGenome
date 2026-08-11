import { Search } from 'lucide-react';
import { useLocation } from 'react-router-dom';
import LiveClock from '../common/LiveClock';
import { useContribution } from '../../context/ContributionContext';

export default function Header() {
  const location = useLocation();
  const { openWizard } = useContribution();
  
  const getPageTitle = (path) => {
    switch (path) {
      case '/': return 'Overview';
      case '/map': return 'Interactive Map';
      case '/academics': return 'Academics Repository';
      case '/career': return 'Career Connections';
      case '/communities': return 'Campus Communities';
      case '/events': return 'Events & News';
      case '/lifestyle': return 'Lifestyle & Recreation';
      case '/profile': return 'User Profile';
      default: return 'Overview';
    }
  };

  return (
    <header className="relative z-40 flex flex-col w-full max-w-7xl mx-auto pt-6 px-8 gap-6">
      {/* Top Bar: Title & Clock */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between w-full gap-4">
        <h1 className="font-serif text-3xl md:text-5xl font-bold text-charcoal-700/80 dark:text-gray-300/80 tracking-tight">
          {getPageTitle(location.pathname)}
        </h1>
        <div className="flex items-center gap-6">
          <LiveClock />
          <button 
            onClick={() => openWizard()}
            className="bg-charcoal-900 text-white dark:bg-gold-500 dark:text-midnight-900 font-bold rounded-full px-6 py-2 shadow-lg hover:scale-105 transition-transform"
          >
            + Contribute
          </button>
        </div>
      </div>

      {/* Centered Search Bar */}
      <div className="flex justify-center w-full pb-6 mt-4 md:mt-8">
        <div className="w-full max-w-2xl tour-search mx-4 md:mx-0">
          <div className="relative group">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400 group-focus-within:text-gold-500 transition-colors" />
            </div>
            <input
              type="text"
              className="block w-full pl-11 pr-4 py-3 border border-gray-200 dark:border-charcoal-700 rounded-full leading-5 bg-white/80 dark:bg-charcoal-800/80 backdrop-blur-md text-gray-900 dark:text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-gold-500 focus:border-gold-500 sm:text-sm transition-all shadow-sm hover:shadow-md"
              placeholder="Search for courses, quiet study spots, professors..."
            />
          </div>
        </div>
      </div>
    </header>
  );
}
