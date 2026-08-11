import DashboardLayout from '../components/layout/DashboardLayout';
import { User, Medal, ArrowLeft, GitCommit, CheckCircle, MapPin } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Profile() {
  const contributions = [
    {
      id: 1,
      type: 'location',
      title: 'Added a quiet spot in the Central Library',
      date: '2 days ago',
      icon: MapPin,
      status: 'verified'
    },
    {
      id: 2,
      type: 'academic',
      title: 'Updated Prof. X\'s viva format for CS101',
      date: '1 week ago',
      icon: BookOpenIcon,
      status: 'pending'
    },
    {
      id: 3,
      type: 'community',
      title: 'Added new late-night coffee machine in Student Center',
      date: '3 weeks ago',
      icon: CheckCircle,
      status: 'verified'
    }
  ];

  return (
    <DashboardLayout>
      <div className="w-full max-w-4xl mx-auto flex flex-col gap-8 animate-fade-in-up">

        {/* Navigation */}
        <div className="flex items-center gap-2">
          <Link to="/" className="flex items-center gap-2 text-charcoal-600 dark:text-gray-400 hover:text-gold-500 dark:hover:text-gold-400 transition-colors">
            <ArrowLeft size={20} />
            <span className="font-medium">Back to Campus Map</span>
          </Link>
        </div>

        {/* Profile Header Panel */}
        <div className="bg-white/80 dark:bg-midnight-800/80 backdrop-blur-md border border-gray-200 dark:border-white/10 rounded-2xl p-8 shadow-xl flex flex-col md:flex-row items-center md:items-start gap-8">
          <div className="w-32 h-32 rounded-full bg-gradient-to-br from-gold-400 to-gold-600 p-1 shadow-lg shrink-0">
            <div className="w-full h-full rounded-full bg-white dark:bg-midnight-900 flex items-center justify-center text-4xl font-bold font-serif text-charcoal-900 dark:text-gray-100">
              S
            </div>
          </div>

          <div className="flex flex-col items-center md:items-start flex-1 text-center md:text-left">
            <h1 className="font-serif text-4xl font-bold text-charcoal-900 dark:text-gray-100 mb-2">Swastika Sinha</h1>
            <p className="text-lg text-charcoal-600 dark:text-gray-400 font-sans mb-6">Information Technology • Class of 2028</p>

            <div className="flex items-center gap-3 bg-gold-500/10 dark:bg-gold-400/10 border border-gold-500/30 px-4 py-2 rounded-lg">
              <Medal className="text-gold-500" size={24} />
              <div className="flex flex-col">
                <span className="text-xs text-gold-600 dark:text-gold-400 uppercase tracking-wider font-bold">Current Rank</span>
                <span className="text-lg font-serif font-bold text-charcoal-900 dark:text-gray-100">Nucleus Rank 87</span>
              </div>
            </div>
          </div>
        </div>

        {/* Contributions Genome */}
        <div className="bg-white/80 dark:bg-midnight-800/80 backdrop-blur-md border border-gray-200 dark:border-white/10 rounded-2xl p-8 shadow-xl">
          <h2 className="font-serif text-2xl font-bold text-charcoal-900 dark:text-gray-100 mb-6 flex items-center gap-3">
            <GitCommit className="text-gold-500" size={28} />
            Contributions Genome
          </h2>

          <div className="relative border-l-2 border-gray-200 dark:border-charcoal-700 ml-4 pl-8 flex flex-col gap-8">
            {contributions.map((contribution) => {
              const Icon = contribution.icon;
              return (
                <div key={contribution.id} className="relative">
                  {/* Timeline Dot */}
                  <div className="absolute -left-[41px] top-1 w-5 h-5 rounded-full bg-white dark:bg-midnight-800 border-2 border-gold-500 flex items-center justify-center">
                    <div className="w-2 h-2 rounded-full bg-gold-500"></div>
                  </div>

                  {/* Content */}
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-3">
                      <h3 className="font-medium text-lg text-charcoal-900 dark:text-gray-200">{contribution.title}</h3>
                      {contribution.status === 'verified' && (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 border border-green-200 dark:border-green-800">Verified</span>
                      )}
                      {contribution.status === 'pending' && (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-500 border border-yellow-200 dark:border-yellow-800">Pending Review</span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 text-sm text-charcoal-500 dark:text-gray-400">
                      <Icon size={14} />
                      <span>{contribution.date}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </div>
    </DashboardLayout>
  );
}

function BookOpenIcon(props) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
      <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
    </svg>
  );
}
