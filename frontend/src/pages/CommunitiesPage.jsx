import { useState, useEffect } from 'react';
import { Users, Calendar, ArrowRight } from 'lucide-react';
import DashboardLayout from '../components/layout/DashboardLayout';

const mockClubs = [
  {
    id: 1,
    name: 'Quantum Computing Society',
    description: 'Exploring the frontiers of quantum algorithms and hardware. Open to all majors.',
    members: 142,
    nextMeeting: 'Every Tuesday, 6 PM',
    status: 'Recruiting',
    category: 'Technology'
  },
  {
    id: 2,
    name: 'Campus Hackers',
    description: 'Building, breaking, and securing things. We host the annual CampusHack hackathon.',
    members: 350,
    nextMeeting: 'Bi-weekly Friday, 5 PM',
    status: 'Open',
    category: 'Technology'
  },
  {
    id: 3,
    name: 'Debate & Literary Club',
    description: 'Fostering critical thinking through parliamentary debates and poetry slams.',
    members: 85,
    nextMeeting: 'Wednesdays, 4 PM',
    status: 'Closed',
    category: 'Arts & Culture'
  },
  {
    id: 4,
    name: 'Mountaineering Expedition Group',
    description: 'Planning weekend treks and annual Himalayan expeditions.',
    members: 210,
    nextMeeting: 'First Monday of Month',
    status: 'Open',
    category: 'Sports & Outdoors'
  }
];

export default function CommunitiesPage() {
  const [clubs, setClubs] = useState(mockClubs);

  useEffect(() => {
    fetch('http://localhost:5000/api/communities')
      .then((res) => (res.ok ? res.json() : null))
      .then((res) => {
        if (res && res.data && res.data.length > 0) {
          setClubs(res.data);
        }
      })
      .catch((err) => console.warn('Communities fallback:', err));
  }, []);

  return (
    <DashboardLayout>
      <div className="flex-1 flex flex-col min-w-0 relative h-full">
        <div className="w-full max-w-5xl mx-auto mt-8 mb-8 animate-fade-in-up flex flex-col gap-8">
          
          <div className="bg-white/40 dark:bg-[#111827]/60 backdrop-blur-xl border border-white/40 dark:border-white/10 shadow-2xl rounded-3xl p-8 flex flex-col">
            <div className="mb-8 flex items-center gap-4 border-b border-gray-400/20 pb-6">
              <div className="w-12 h-12 rounded-full bg-gold-400/20 dark:bg-gold-500/20 flex items-center justify-center text-gold-500">
                <Users size={24} />
              </div>
              <div>
                <h1 className="font-serif text-3xl font-bold text-charcoal-900 dark:text-gray-100 tracking-tight">Campus Communities</h1>
                <p className="text-charcoal-600 dark:text-gray-400">Discover clubs, societies, and student groups across campus.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {clubs.map(club => (
                <div key={club.id} className="group bg-white/50 dark:bg-black/20 backdrop-blur-sm border border-gray-300/50 dark:border-white/10 rounded-2xl p-6 flex flex-col h-full transition-all hover:shadow-lg hover:border-gold-500/50">
                  <div className="flex justify-between items-start mb-3">
                    <h3 className="font-bold text-xl text-charcoal-900 dark:text-gray-100 font-serif leading-tight">{club.name}</h3>
                    <span className={`text-xs font-semibold px-2 py-1 rounded-md shrink-0 ${
                      club.status === 'Recruiting' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                      club.status === 'Open' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' :
                      'bg-gray-200 text-gray-700 dark:bg-gray-800 dark:text-gray-400'
                    }`}>
                      {club.status}
                    </span>
                  </div>

                  {club.image && (
                    <div className="w-full h-36 rounded-xl overflow-hidden mb-4 bg-charcoal-900 shrink-0">
                      <img src={club.image} alt={club.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                    </div>
                  )}
                  
                  <p className="text-sm text-charcoal-600 dark:text-gray-400 mb-6 flex-1 line-clamp-3">
                    {club.description}
                  </p>
                  
                  <div className="flex flex-col gap-3 mt-auto">
                    <div className="flex items-center gap-2 text-sm text-charcoal-700 dark:text-gray-300">
                      <Users size={16} className="text-gold-500" />
                      <span className="font-medium">{club.members} Active Members</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-charcoal-700 dark:text-gray-300">
                      <Calendar size={16} className="text-gold-500" />
                      <span>{club.nextMeeting}</span>
                    </div>
                  </div>
                  
                  <button className="mt-6 w-full py-2.5 bg-gray-100 dark:bg-white/5 text-charcoal-900 dark:text-gray-100 font-medium rounded-xl flex items-center justify-center gap-2 group-hover:bg-gold-500 group-hover:text-midnight-900 transition-colors">
                    Join Community <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                  </button>
                </div>
              ))}
            </div>
            
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
