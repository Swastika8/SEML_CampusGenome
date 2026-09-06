import { useState, useEffect } from 'react';
import { User, Medal, ArrowLeft, GitCommit, CheckCircle, MapPin, Sparkles, BookOpen, LogOut } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import DashboardLayout from '../components/layout/DashboardLayout';
import { useAuth } from '../context/AuthContext';

export default function Profile() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [profileData, setProfileData] = useState(null);
  const [contributions, setContributions] = useState([]);

  useEffect(() => {
    const handleOrId = user?.handle || user?.id || '@StudentJohn';
    fetch(`http://localhost:5000/api/users/${encodeURIComponent(handleOrId)}`)
      .then((res) => (res.ok ? res.json() : null))
      .then((res) => {
        if (res && res.data) {
          setProfileData(res.data);
          if (res.data.contributions) {
            setContributions(res.data.contributions);
          }
        }
      })
      .catch((err) => console.warn('Could not load user profile:', err));
  }, [user]);

  const activeUser = profileData || user || {
    name: 'Swastika Sinha',
    handle: '@SwastikaSinha',
    department: 'Information Technology',
    graduation_year: 2028,
    reputation_score: 320,
    rank: 'Nucleus'
  };

  const initial = activeUser.name ? activeUser.name.charAt(0).toUpperCase() : 'S';

  return (
    <DashboardLayout>
      <div className="w-full max-w-4xl mx-auto flex flex-col gap-8 animate-fade-in-up py-6 px-4">

        {/* Navigation */}
        <div className="flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 text-charcoal-600 dark:text-gray-400 hover:text-gold-500 dark:hover:text-gold-400 transition-colors font-medium text-sm">
            <ArrowLeft size={18} />
            <span>Back to Campus Map</span>
          </Link>

          {user ? (
            <button
              onClick={() => {
                logout();
                navigate('/login');
              }}
              className="flex items-center gap-2 px-4 py-2 rounded-full border border-red-200 dark:border-red-900/50 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 text-xs font-bold transition-all"
            >
              <LogOut size={14} />
              <span>Log Out</span>
            </button>
          ) : (
            <Link to="/login" className="text-xs font-bold text-gold-600 dark:text-gold-400 hover:underline">
              Sign In with an account →
            </Link>
          )}
        </div>

        {/* Profile Header Panel */}
        <div className="bg-white/80 dark:bg-midnight-800/80 backdrop-blur-md border border-gray-200 dark:border-white/10 rounded-3xl p-8 shadow-xl flex flex-col md:flex-row items-center md:items-start gap-8">
          <div className="w-32 h-32 rounded-full bg-gradient-to-br from-gold-400 to-amber-600 p-1 shadow-lg shrink-0">
            <div className="w-full h-full rounded-full bg-white dark:bg-midnight-900 flex items-center justify-center text-5xl font-bold font-serif text-charcoal-900 dark:text-gray-100">
              {initial}
            </div>
          </div>

          <div className="flex flex-col items-center md:items-start flex-1 text-center md:text-left">
            <div className="flex items-center gap-3">
              <h1 className="font-serif text-4xl font-bold text-charcoal-900 dark:text-gray-100">
                {activeUser.name}
              </h1>
              <span className="text-xs px-2.5 py-1 rounded-full bg-gold-400/20 text-gold-700 dark:text-gold-300 font-mono font-bold">
                {activeUser.handle}
              </span>
            </div>
            
            <p className="text-base text-charcoal-600 dark:text-gray-400 font-sans mt-1 mb-6">
              {activeUser.department} • Class of {activeUser.graduation_year || 2026}
            </p>

            <div className="flex flex-wrap items-center gap-4">
              <div className="flex items-center gap-3 bg-gold-500/10 dark:bg-gold-400/10 border border-gold-500/30 px-4 py-2.5 rounded-2xl">
                <Medal className="text-gold-500" size={24} />
                <div className="flex flex-col">
                  <span className="text-[10px] text-gold-600 dark:text-gold-400 uppercase tracking-wider font-bold">Rank & Tier</span>
                  <span className="text-base font-serif font-bold text-charcoal-900 dark:text-gray-100">
                    {activeUser.rank} Tier
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-3 bg-blue-500/10 dark:bg-blue-400/10 border border-blue-500/30 px-4 py-2.5 rounded-2xl">
                <Sparkles className="text-blue-500" size={24} />
                <div className="flex flex-col">
                  <span className="text-[10px] text-blue-600 dark:text-blue-400 uppercase tracking-wider font-bold">Reputation Score</span>
                  <span className="text-base font-serif font-bold text-charcoal-900 dark:text-gray-100">
                    {activeUser.reputation_score ?? 140} DNA Points
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Contributions Genome */}
        <div className="bg-white/80 dark:bg-midnight-800/80 backdrop-blur-md border border-gray-200 dark:border-white/10 rounded-3xl p-8 shadow-xl">
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-serif text-2xl font-bold text-charcoal-900 dark:text-gray-100 flex items-center gap-3">
              <GitCommit className="text-gold-500" size={28} />
              Contributions Genome
            </h2>
            <span className="text-xs font-semibold px-3 py-1 rounded-full bg-gray-100 dark:bg-charcoal-800 text-charcoal-600 dark:text-gray-300">
              {contributions.length} Verified Entries
            </span>
          </div>

          {contributions.length === 0 ? (
            <div className="text-center py-12 text-charcoal-500 dark:text-gray-400 italic">
              No campus contributions recorded yet. Use the "+ Contribute" button to publish your first knowledge node!
            </div>
          ) : (
            <div className="relative border-l-2 border-gray-200 dark:border-charcoal-700 ml-4 pl-8 flex flex-col gap-8">
              {contributions.map((contribution) => (
                <div key={contribution.id} className="relative group">
                  {/* Timeline Dot */}
                  <div className="absolute -left-[41px] top-1 w-5 h-5 rounded-full bg-white dark:bg-midnight-800 border-2 border-gold-500 flex items-center justify-center group-hover:scale-125 transition-transform">
                    <div className="w-2 h-2 rounded-full bg-gold-500"></div>
                  </div>

                  {/* Content */}
                  <div className="flex flex-col gap-1.5">
                    <div className="flex items-center gap-3 flex-wrap">
                      <span className="text-xs font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-gold-400/20 text-gold-700 dark:text-gold-300">
                        {contribution.category}
                      </span>
                      <h3 className="font-medium text-lg text-charcoal-900 dark:text-gray-200">
                        {contribution.title}
                      </h3>
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 border border-green-200 dark:border-green-800">
                        {contribution.status || 'Verified'}
                      </span>
                    </div>
                    <p className="text-sm text-charcoal-600 dark:text-gray-400">
                      {contribution.description}
                    </p>
                    <div className="flex items-center gap-4 text-xs text-charcoal-500 dark:text-gray-500 mt-1">
                      <span>Verified by {contribution.verification_count ?? 12} peers</span>
                      <span>•</span>
                      <span>{contribution.comment_count ?? 0} comments</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </DashboardLayout>
  );
}
