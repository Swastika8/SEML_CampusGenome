import { useState, useRef, useEffect } from 'react';
import { User, LogOut, ChevronDown, LogIn } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export default function UserDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

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

  if (!isAuthenticated) {
    return (
      <Link
        to="/login"
        className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-gold-500 hover:bg-gold-600 text-black font-bold text-xs shadow-md transition-all hover:scale-105"
      >
        <LogIn size={15} />
        <span>Sign In</span>
      </Link>
    );
  }

  const initial = user?.name ? user.name.charAt(0).toUpperCase() : 'U';

  return (
    <div className="relative" ref={dropdownRef}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 p-1 rounded-full hover:bg-white/50 dark:hover:bg-midnight-800/50 transition-colors focus:outline-none focus:ring-2 focus:ring-gold-500"
      >
        <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-gold-500 to-amber-400 flex items-center justify-center text-charcoal-900 font-bold shadow-sm">
          {initial}
        </div>
        <ChevronDown size={16} className={`text-charcoal-700 dark:text-gray-300 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* Dropdown Menu */}
      <div 
        className={`absolute right-0 mt-2 w-52 bg-white/95 dark:bg-midnight-800/95 backdrop-blur-md rounded-xl shadow-2xl border border-gray-100 dark:border-charcoal-700 overflow-hidden transition-all duration-200 origin-top-right z-50 ${isOpen ? 'opacity-100 scale-100' : 'opacity-0 scale-95 pointer-events-none'}`}
      >
        <div className="p-3.5 border-b border-gray-100 dark:border-charcoal-700 bg-gray-50/50 dark:bg-white/5">
          <div className="flex items-center justify-between mb-1">
            <p className="text-sm font-semibold text-charcoal-900 dark:text-gray-100 truncate">{user?.name || 'Student'}</p>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-gold-400/20 text-gold-600 dark:text-gold-400 border border-gold-400/30">
              {user?.rank || 'Helix'}
            </span>
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{user?.handle || '@student'}</p>
          <p className="text-[11px] text-gray-400 dark:text-gray-500 mt-0.5 truncate">{user?.department || 'General'}</p>
        </div>
        <div className="p-1.5">
          <Link 
            to="/profile"
            className="w-full flex items-center gap-3 px-3 py-2 text-sm text-charcoal-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-midnight-900/50 rounded-lg transition-colors"
            onClick={() => setIsOpen(false)}
          >
            <User size={16} />
            My Profile & Genome
          </Link>
          <button 
            className="w-full flex items-center gap-3 px-3 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors mt-1"
            onClick={() => {
              logout();
              setIsOpen(false);
              navigate('/login');
            }}
          >
            <LogOut size={16} />
            Log Out
          </button>
        </div>
      </div>
    </div>
  );
}
