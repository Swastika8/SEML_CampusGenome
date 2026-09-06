import { useState, useRef, useEffect } from 'react';
import { Search, MapPin, BookOpen, Calendar, Coffee, X, ArrowRight } from 'lucide-react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import LiveClock from '../common/LiveClock';
import UserDropdown from './UserDropdown';
import { useContribution } from '../../context/ContributionContext';
import { useData } from '../../context/DataContext';

export default function Header() {
  const location = useLocation();
  const navigate = useNavigate();
  const { openWizard } = useContribution();
  const { nodes, buildings, courses, events } = useData();

  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const searchRef = useRef(null);
  
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

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Compute live search results
  const results = query.trim().length > 1 ? [
    ...(buildings || [])
      .filter(b => b.name?.toLowerCase().includes(query.toLowerCase()) || b.description?.toLowerCase().includes(query.toLowerCase()))
      .slice(0, 2)
      .map(b => ({ title: b.name, subtitle: 'Campus Building & Silent Spots', type: 'map', path: '/map', icon: MapPin })),
    ...(courses || [])
      .filter(c => c.title?.toLowerCase().includes(query.toLowerCase()) || c.code?.toLowerCase().includes(query.toLowerCase()))
      .slice(0, 2)
      .map(c => ({ title: `${c.code} - ${c.title}`, subtitle: `${c.department || 'Academics'} • Prof. ${c.professor || 'Faculty'}`, type: 'academics', path: '/academics', icon: BookOpen })),
    ...(nodes || [])
      .filter(n => n.title?.toLowerCase().includes(query.toLowerCase()) || n.description?.toLowerCase().includes(query.toLowerCase()))
      .slice(0, 3)
      .map(n => ({
        title: n.title,
        subtitle: `${n.category} • by ${n.author_handle || '@StudentJohn'}`,
        type: n.category?.toLowerCase() || 'lifestyle',
        path: n.category === 'Academics' ? '/academics' : n.category === 'Events' ? '/events' : n.category === 'Career' ? '/career' : '/lifestyle',
        icon: n.category === 'Events' ? Calendar : Coffee
      })),
  ] : [];

  return (
    <header className="relative z-40 flex flex-col w-full max-w-7xl mx-auto pt-6 px-8 gap-6">
      {/* Top Bar: Title, Clock, Actions, User Dropdown */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between w-full gap-4">
        <h1 className="font-serif text-3xl md:text-5xl font-bold text-charcoal-700/80 dark:text-gray-300/80 tracking-tight">
          {getPageTitle(location.pathname)}
        </h1>
        <div className="flex items-center gap-4 sm:gap-6 flex-wrap justify-end">
          <LiveClock />
          <button 
            onClick={() => openWizard()}
            className="bg-charcoal-900 text-white dark:bg-gold-500 dark:text-midnight-900 font-bold rounded-full px-5 py-2 shadow-lg hover:scale-105 transition-transform text-sm cursor-pointer"
          >
            + Contribute
          </button>
          <UserDropdown />
        </div>
      </div>

      {/* Centered Search Bar */}
      <div className="flex justify-center w-full pb-6 mt-4 md:mt-8" ref={searchRef}>
        <div className="w-full max-w-2xl tour-search mx-4 md:mx-0 relative">
          <div className="relative group">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400 group-focus-within:text-gold-500 transition-colors" />
            </div>
            <input
              type="text"
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setIsOpen(true);
              }}
              onFocus={() => setIsOpen(true)}
              className="block w-full pl-11 pr-10 py-3 border border-gray-200 dark:border-charcoal-700 rounded-full leading-5 bg-white/80 dark:bg-charcoal-800/80 backdrop-blur-md text-gray-900 dark:text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-gold-500 focus:border-gold-500 sm:text-sm transition-all shadow-sm hover:shadow-md"
              placeholder="Search for courses, quiet study spots, professors, secret tips..."
            />
            {query && (
              <button
                type="button"
                onClick={() => setQuery('')}
                className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
              >
                <X size={16} />
              </button>
            )}
          </div>

          {/* Live Search Preview Dropdown */}
          {isOpen && query.trim().length > 1 && (
            <div className="absolute left-0 right-0 mt-2 bg-white/95 dark:bg-midnight-800/95 backdrop-blur-2xl rounded-2xl shadow-2xl border border-gray-200 dark:border-white/10 overflow-hidden z-50 animate-fade-in-up">
              <div className="p-2 border-b border-gray-100 dark:border-white/5 flex items-center justify-between text-xs text-gray-400 px-3">
                <span>Campus Search Results</span>
                <span className="font-mono">{results.length} found</span>
              </div>
              {results.length > 0 ? (
                <div className="divide-y divide-gray-100 dark:divide-white/5 max-h-80 overflow-y-auto">
                  {results.map((item, idx) => {
                    const Icon = item.icon;
                    return (
                      <button
                        key={idx}
                        onClick={() => {
                          navigate(item.path);
                          setIsOpen(false);
                          setQuery('');
                        }}
                        className="w-full text-left p-3.5 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors flex items-center justify-between gap-3 group"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-8 h-8 rounded-lg bg-gold-400/10 text-gold-600 dark:text-gold-400 flex items-center justify-center shrink-0">
                            <Icon size={16} />
                          </div>
                          <div className="flex flex-col min-w-0">
                            <span className="text-sm font-semibold text-charcoal-900 dark:text-gray-100 truncate group-hover:text-gold-600 dark:group-hover:text-gold-400 transition-colors">
                              {item.title}
                            </span>
                            <span className="text-xs text-gray-500 dark:text-gray-400 truncate">
                              {item.subtitle}
                            </span>
                          </div>
                        </div>
                        <ArrowRight size={14} className="text-gray-400 group-hover:translate-x-1 transition-transform shrink-0" />
                      </button>
                    );
                  })}
                </div>
              ) : (
                <div className="p-6 text-center text-xs text-gray-500 dark:text-gray-400">
                  No verified campus records match "{query}". Try searching "CS", "Library", or "Maggi".
                </div>
              )}
            </div>
          )}

        </div>
      </div>
    </header>
  );
}
