import { Briefcase, Calendar, TrendingUp, ChevronRight } from 'lucide-react';
import DashboardLayout from '../components/layout/DashboardLayout';

const mockEvents = [
  {
    id: 1,
    title: 'Upcoming Tech Internships - Google',
    date: 'August 15, 2026',
    type: 'Placement Drive',
    stats: 'Average Package: 18 LPA',
    status: 'Upcoming'
  },
  {
    id: 2,
    title: 'Resume Review Workshop by Alumni',
    date: 'August 22, 2026',
    type: 'Workshop',
    stats: '150+ Resumes Reviewed',
    status: 'Registration Open'
  },
  {
    id: 3,
    title: 'Quant Trading Firms Mock Interviews',
    date: 'September 5, 2026',
    type: 'Preparation',
    stats: 'High Selectivity',
    status: 'Upcoming'
  }
];

export default function CareerPage() {
  return (
    <DashboardLayout>
      <div className="flex-1 flex flex-col min-w-0 relative h-full">
        <div className="w-full max-w-4xl mx-auto mt-8 mb-8 animate-fade-in-up flex flex-col gap-8">
          
          <div className="bg-white/40 dark:bg-[#111827]/60 backdrop-blur-xl border border-white/40 dark:border-white/10 shadow-2xl rounded-3xl p-8 flex flex-col">
            <div className="mb-8 flex items-center gap-4 border-b border-gray-400/20 pb-6">
              <div className="w-12 h-12 rounded-full bg-gold-400/20 dark:bg-gold-500/20 flex items-center justify-center text-gold-500">
                <Briefcase size={24} />
              </div>
              <div>
                <h1 className="font-serif text-3xl font-bold text-charcoal-900 dark:text-gray-100 tracking-tight">Career Connections</h1>
                <p className="text-charcoal-600 dark:text-gray-400">Track placement timelines, workshops, and career opportunities.</p>
              </div>
            </div>

            {/* Timeline View */}
            <div className="relative border-l-2 border-gray-300 dark:border-gray-700 ml-6 mt-4">
              {mockEvents.map((event, idx) => (
                <div key={event.id} className="mb-10 ml-8 relative group">
                  <div className="absolute -left-[41px] top-1 w-5 h-5 rounded-full bg-white dark:bg-midnight-800 border-2 border-gold-500 flex items-center justify-center">
                    <div className="w-2 h-2 rounded-full bg-gold-500"></div>
                  </div>
                  
                  <div className="bg-white/50 dark:bg-black/20 backdrop-blur-sm border border-gray-300/50 dark:border-white/10 rounded-2xl p-6 shadow-sm hover:shadow-md transition-all group-hover:-translate-y-1">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-bold text-lg text-charcoal-900 dark:text-gray-100">{event.title}</h3>
                      <span className="text-xs font-semibold px-2 py-1 rounded-full bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
                        {event.status}
                      </span>
                    </div>
                    
                    <div className="flex flex-col sm:flex-row sm:items-center gap-4 text-sm text-charcoal-600 dark:text-gray-400 mb-4">
                      <div className="flex items-center gap-1.5">
                        <Calendar size={16} className="text-gold-500" />
                        <span>{event.date}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <TrendingUp size={16} className="text-gold-500" />
                        <span>{event.stats}</span>
                      </div>
                    </div>
                    
                    <button className="flex items-center gap-1 text-sm font-medium text-gold-600 dark:text-gold-400 hover:text-gold-700 dark:hover:text-gold-300 transition-colors">
                      View Details <ChevronRight size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
