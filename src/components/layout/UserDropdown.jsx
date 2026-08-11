import { useState, useRef, useEffect } from 'react';
import { User, LogOut, ChevronDown } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function UserDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 p-1.5 rounded-full hover:bg-white/50 dark:hover:bg-midnight-800/50 transition-colors focus:outline-none focus:ring-2 focus:ring-gold-500"
      >
        <div className="w-9 h-9 rounded-full bg-gold-400 dark:bg-gold-500 flex items-center justify-center text-charcoal-900 font-bold shadow-sm">
          S
        </div>
        <ChevronDown size={16} className={`text-charcoal-700 dark:text-gray-300 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* Dropdown Menu */}
      <div 
        className={`absolute right-0 mt-2 w-48 bg-white/95 dark:bg-midnight-800/95 backdrop-blur-md rounded-xl shadow-lg border border-gray-100 dark:border-charcoal-700 overflow-hidden transition-all duration-200 origin-top-right z-50 ${isOpen ? 'opacity-100 scale-100' : 'opacity-0 scale-95 pointer-events-none'}`}
      >
        <div className="p-3 border-b border-gray-100 dark:border-charcoal-700">
          <p className="text-sm font-semibold text-charcoal-900 dark:text-gray-100">StudentJohn</p>
          <p className="text-xs text-gray-500 dark:text-gray-400">Computer Science</p>
        </div>
        <div className="p-1">
          <Link 
            to="/profile"
            className="w-full flex items-center gap-3 px-3 py-2 text-sm text-charcoal-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-midnight-900/50 rounded-lg transition-colors"
            onClick={() => setIsOpen(false)}
          >
            <User size={16} />
            My Profile
          </Link>
          <button 
            className="w-full flex items-center gap-3 px-3 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors mt-1"
            onClick={() => setIsOpen(false)}
          >
            <LogOut size={16} />
            Log Out
          </button>
        </div>
      </div>
    </div>
  );
}
