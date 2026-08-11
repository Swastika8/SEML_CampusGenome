import DashboardLayout from '../components/layout/DashboardLayout';
import { Search } from 'lucide-react';

export default function PlaceholderPage({ title }) {
  return (
    <DashboardLayout>
      <div className="flex-1 flex flex-col items-center justify-center h-full min-h-[60vh]">
        <div className="bg-white/80 dark:bg-midnight-800/80 backdrop-blur-md border border-gray-200 dark:border-white/10 rounded-2xl p-12 shadow-2xl flex flex-col items-center gap-6 max-w-xl text-center animate-fade-in-up">
          <div className="w-16 h-16 rounded-full bg-gold-400/20 dark:bg-gold-500/20 flex items-center justify-center text-gold-500 mb-2">
            <Search size={32} />
          </div>
          <h1 className="font-serif text-4xl font-bold text-charcoal-900 dark:text-gray-100">
            {title}
          </h1>
          <p className="text-charcoal-600 dark:text-gray-400 font-sans text-lg">
            This module is currently indexing the campus environment. Check back soon for deeper insights and connections.
          </p>
        </div>
      </div>
    </DashboardLayout>
  );
}
