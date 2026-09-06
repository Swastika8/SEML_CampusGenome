import { useState, useEffect } from 'react';
import { Briefcase, Calendar, TrendingUp, ChevronRight, ArrowUpRight } from 'lucide-react';
import DashboardLayout from '../components/layout/DashboardLayout';
import EngagementBar from '../components/common/EngagementBar';

const mockOpportunities = [
  {
    id: 1,
    title: 'Upcoming Tech Internships - Google',
    date: 'August 15, 2026',
    type: 'Placement Drive',
    stats: 'Average Package: 18 LPA',
    status: 'Upcoming',
    description: 'Join the world\'s leading technology company for an immersive summer internship focusing on core infrastructure and AI research.',
    verifyCount: 342,
    commentCount: 89,
  },
  {
    id: 2,
    title: 'Resume Review Workshop by Alumni',
    date: 'August 22, 2026',
    type: 'Workshop',
    stats: '150+ Resumes Reviewed',
    status: 'Registration Open',
    description: 'Get your resume battle-tested by alumni currently working at top-tier firms like McKinsey, Goldman Sachs, and Meta.',
    verifyCount: 156,
    commentCount: 42,
  },
  {
    id: 3,
    title: 'Quant Trading Firms Mock Interviews',
    date: 'September 5, 2026',
    type: 'Preparation',
    stats: 'High Selectivity',
    status: 'Upcoming',
    description: 'Exclusive 1-on-1 mock interview sessions with recruiters from Jane Street, Optiver, and Tower Research. Limited slots available.',
    verifyCount: 289,
    commentCount: 112,
  },
  {
    id: 4,
    title: 'Consulting Case Prep Cohort Launch',
    date: 'September 10, 2026',
    type: 'Mentorship',
    stats: 'Cohort Size: 40',
    status: 'Applications Open',
    description: 'A rigorous 6-week program designed to master case interviews. Mentorship provided by recent MBB associates.',
    verifyCount: 198,
    commentCount: 67,
  }
];

export default function CareerPage() {
  const [opportunities, setOpportunities] = useState(mockOpportunities);

  useEffect(() => {
    fetch('http://localhost:5000/api/career')
      .then((res) => (res.ok ? res.json() : null))
      .then((res) => {
        if (res && res.data && res.data.length > 0) {
          setOpportunities(res.data);
        }
      })
      .catch((err) => console.warn('Career fallback:', err));
  }, []);
  return (
    <DashboardLayout>
      <div className="flex-1 flex flex-col min-w-0 relative h-full">
        <div className="w-full max-w-6xl mx-auto mt-6 mb-12 animate-fade-in-up flex flex-col gap-10 px-4 md:px-8">
          
          {/* Editorial Hero Section */}
          <div className="flex flex-col gap-8">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-gray-200 dark:border-white/10 pb-6">
              <div className="max-w-xl">
                <h1 className="font-serif text-4xl md:text-6xl font-bold text-charcoal-900 dark:text-gray-100 tracking-tight leading-tight">
                  Career Connections
                </h1>
              </div>
              <div className="max-w-md">
                <p className="text-charcoal-600 dark:text-gray-400 font-medium leading-relaxed">
                  Track placement timelines, exclusive alumni workshops, and verified career opportunities curated for the campus genome.
                </p>
              </div>
            </div>

            {/* Feature Image Container */}
            <div className="w-full aspect-[21/9] rounded-3xl overflow-hidden relative border border-gray-300 dark:border-white/10 shadow-xl bg-white/20 dark:bg-white/5 backdrop-blur-xl">
              <div 
                className="absolute inset-0 bg-cover bg-center"
                style={{ backgroundImage: 'url(https://images.unsplash.com/photo-1522071820081-009f0129c71c?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80)' }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
              <div className="absolute bottom-6 left-8 right-8 flex justify-between items-end">
                 <div className="text-white">
                   <span className="px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-xs font-bold uppercase tracking-widest border border-white/30 mb-3 inline-block">Featured</span>
                   <h2 className="font-serif text-3xl font-bold drop-shadow-md">The 2026 Fall Placement Drive</h2>
                 </div>
                 <button className="hidden md:flex items-center gap-2 bg-white text-black px-5 py-2.5 rounded-full font-bold hover:bg-gray-100 transition-colors shadow-lg">
                   Explore Timeline <ChevronRight size={18} />
                 </button>
              </div>
            </div>
          </div>

          {/* Opportunities Grid */}
          <div className="flex flex-col gap-6">
            <h2 className="font-serif text-2xl md:text-3xl font-bold text-charcoal-900 dark:text-gray-100 tracking-tight">
              Active Opportunities & Insights
            </h2>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {opportunities.map((opp) => (
                <div 
                  key={opp.id} 
                  className="bg-white/60 dark:bg-[#111827]/60 backdrop-blur-xl border border-gray-300 dark:border-white/10 rounded-2xl p-6 relative group cursor-pointer hover:-translate-y-1 transition-all duration-300 hover:shadow-2xl flex flex-col h-full shadow-lg"
                >
                  {/* Top Left: Status Pill */}
                  <div className="flex justify-between items-start mb-4">
                    <span className="text-xs font-bold px-3 py-1.5 rounded-full bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 border border-blue-200 dark:border-blue-800/50 uppercase tracking-wider">
                      {opp.status}
                    </span>
                    
                    {/* Top Right: Arrow Button */}
                    <div className="w-10 h-10 rounded-full border border-gray-300 dark:border-white/20 flex items-center justify-center text-charcoal-500 dark:text-gray-400 group-hover:bg-[#D4AF37] group-hover:text-black group-hover:border-[#D4AF37] transition-colors duration-300">
                      <ArrowUpRight size={20} />
                    </div>
                  </div>
                  
                  {/* Content */}
                  <div className="flex-1 flex flex-col mb-4">
                    <h3 className="font-serif text-2xl font-bold text-charcoal-900 dark:text-gray-100 mb-2 leading-snug group-hover:text-[#D4AF37] transition-colors">
                      {opp.title}
                    </h3>
                    <p className="text-sm text-charcoal-600 dark:text-gray-400 line-clamp-2 leading-relaxed">
                      {opp.description}
                    </p>
                  </div>
                  
                  {/* Footer Meta Data */}
                  <div className="flex flex-col sm:flex-row sm:items-center gap-4 text-sm text-charcoal-500 dark:text-gray-500 mb-5">
                    <div className="flex items-center gap-2">
                      <Calendar size={16} className="text-gray-400 dark:text-gray-500" />
                      <span className="font-medium">{opp.date}</span>
                    </div>
                    <div className="hidden sm:block w-1 h-1 rounded-full bg-gray-300 dark:bg-gray-600"></div>
                    <div className="flex items-center gap-2">
                      <TrendingUp size={16} className="text-gray-400 dark:text-gray-500" />
                      <span className="font-medium">{opp.stats}</span>
                    </div>
                  </div>
                  
                  {/* Engagement UI Tucked at Bottom */}
                  <div className="mt-auto pt-4 border-t border-gray-200 dark:border-white/10">
                    <EngagementBar 
                      verifyCount={opp.verifyCount} 
                      commentCount={opp.commentCount} 
                      variant="like" 
                      hideRepost={true} 
                    />
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
