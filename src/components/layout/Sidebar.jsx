import { useState } from 'react';
import {
  BookOpen,
  Map as MapIcon,
  Briefcase,
  Users,
  Calendar,
  Coffee,
  ChevronLeft,
  ChevronRight,
  LayoutGrid,
  Compass,
  User
} from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import ThemeToggle from '../common/ThemeToggle';

export default function Sidebar({ isCollapsed, toggleSidebar }) {
  const location = useLocation();
  const currentPath = location.pathname;

  const navItems = [
    { name: 'Dashboard', icon: LayoutGrid, path: '/' },
    { name: 'Academics', icon: BookOpen, path: '/academics' },
    { name: 'Campus Map', icon: MapIcon, path: '/map' },
    { name: 'Career', icon: Briefcase, path: '/career' },
    { name: 'Communities', icon: Users, path: '/communities' },
    { name: 'Events & News', icon: Calendar, path: '/events' },
    { name: 'Lifestyle', icon: Coffee, path: '/lifestyle' },
  ];

  return (
    <aside
      className={`fixed top-0 left-0 h-screen z-[60] bg-white/80 dark:bg-midnight-900 backdrop-blur-xl border-r border-gray-200 dark:border-white/10 transition-all duration-300 flex flex-col ${isCollapsed ? 'w-20' : 'w-64'
        }`}
    >
      {/* Toggle Button */}
      <button
        onClick={toggleSidebar}
        className="absolute -right-3 top-8 w-6 h-6 rounded-full bg-charcoal-900 dark:bg-gold-500 text-white dark:text-midnight-900 flex items-center justify-center shadow-md hover:scale-110 transition-transform focus:outline-none"
      >
        {isCollapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
      </button>

      {/* Top Logo */}
      <div className={`flex items-center gap-2 p-6 ${isCollapsed ? 'justify-center px-0' : ''}`}>
        <Compass className="text-charcoal-900 dark:text-gold-400 shrink-0" size={32} />
        <h1 className={`font-serif text-xl font-bold text-charcoal-900 dark:text-gray-100 tracking-tight whitespace-nowrap overflow-hidden transition-all duration-300 ${isCollapsed ? 'w-0 opacity-0' : 'w-auto opacity-100'}`}>
          Campus Genome
        </h1>
      </div>

      {/* Main Navigation */}
      <nav className="flex-1 px-4 py-4 flex flex-col gap-2 overflow-y-auto">
        {navItems.map((item) => {
          const isActive = currentPath === item.path;
          const Icon = item.icon;

          return (
            <Link
              key={item.name}
              to={item.path}
              className={`flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-200 group relative ${isActive
                  ? 'bg-blue-50/50 dark:bg-white/10 text-blue-700 dark:text-gold-400'
                  : 'text-charcoal-700 dark:text-gray-400 hover:bg-gray-100/50 dark:hover:bg-midnight-800/50 hover:text-charcoal-900 dark:hover:text-gray-200'
                } ${isCollapsed ? 'justify-center' : ''}`}
            >
              {isActive && (
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-blue-600 dark:bg-gold-400 rounded-r-full" />
              )}
              <Icon size={20} className="shrink-0" />
              <span className={`font-medium whitespace-nowrap overflow-hidden transition-all duration-300 ${isCollapsed ? 'w-0 opacity-0 hidden' : 'w-auto opacity-100 block'}`}>
                {item.name}
              </span>
            </Link>
          );
        })}
      </nav>

      {/* Bottom Section */}
      <div className="p-4 flex flex-col gap-2 border-t border-gray-200 dark:border-white/10">
        <div className={`flex items-center ${isCollapsed ? 'justify-center' : 'justify-between px-2'} mb-2`}>
          <span className={`text-sm font-medium text-charcoal-700 dark:text-gray-400 ${isCollapsed ? 'hidden' : 'block'}`}>Theme</span>
          <ThemeToggle />
        </div>

        <Link
          to="/profile"
          className={`flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-200 group relative ${currentPath === '/profile'
              ? 'bg-blue-50/50 dark:bg-white/10 text-blue-700 dark:text-gold-400'
              : 'text-charcoal-700 dark:text-gray-400 hover:bg-gray-100/50 dark:hover:bg-midnight-800/50 hover:text-charcoal-900 dark:hover:text-gray-200'
            } ${isCollapsed ? 'justify-center' : ''}`}
        >
          {currentPath === '/profile' && (
            <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-blue-600 dark:bg-gold-400 rounded-r-full" />
          )}
          <div className="w-6 h-6 rounded-full bg-gold-400 dark:bg-gold-500 flex items-center justify-center shrink-0">
            <User size={14} className="text-charcoal-900" />
          </div>
          <div className={`flex flex-col whitespace-nowrap overflow-hidden transition-all duration-300 ${isCollapsed ? 'w-0 opacity-0 hidden' : 'w-auto opacity-100 block'}`}>
            <span className="font-medium text-sm text-charcoal-900 dark:text-gray-200">Swastika Sinha</span>
            <span className="text-xs opacity-80">Rank 87</span>
          </div>
        </Link>
      </div>
    </aside>
  );
}
