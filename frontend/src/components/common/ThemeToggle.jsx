import { Moon, Sun } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

export default function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className="p-2 rounded-full bg-white/20 dark:bg-charcoal-800/50 backdrop-blur-md text-charcoal-900 dark:text-gold-400 hover:bg-white/30 dark:hover:bg-charcoal-800 transition-colors tour-theme-toggle"
      aria-label="Toggle Theme"
    >
      {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
    </button>
  );
}
