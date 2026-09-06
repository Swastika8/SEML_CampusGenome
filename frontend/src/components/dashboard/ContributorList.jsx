import { useData } from '../../context/DataContext';

export default function ContributorList() {
  const { users } = useData();
  
  // Sort by reputation
  const topContributors = [...users].sort((a, b) => b.reputation - a.reputation);

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between mb-1">
        <h3 className="font-serif text-lg text-charcoal-900 dark:text-gray-100 font-bold">Featured Contributors</h3>
        <span className="text-[11px] font-semibold text-gold-600 dark:text-gold-400 uppercase tracking-wider">Top Verified</span>
      </div>
      <div className="flex flex-col gap-2.5">
        {topContributors.slice(0, 5).map((u, idx) => {
          const score = u.reputation ?? u.reputation_score ?? 0;
          const rankColor = 
            u.rank === 'Nucleus' 
              ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-300 border-amber-300 dark:border-amber-700/50'
              : u.rank === 'Chromosome'
              ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300 border-purple-300 dark:border-purple-700/50'
              : 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-800 dark:text-emerald-300 border-emerald-300 dark:border-emerald-700/50';

          return (
            <div 
              key={u.id || idx} 
              className="flex items-center justify-between gap-3 p-3 rounded-2xl bg-white/60 dark:bg-[#111827]/70 backdrop-blur-md border border-gray-200/80 dark:border-white/10 hover:bg-white/90 dark:hover:bg-[#111827] transition-all shadow-sm group"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-gold-500 to-amber-400 flex items-center justify-center text-charcoal-900 font-bold text-sm shadow-sm shrink-0">
                  {u.name ? u.name.charAt(0).toUpperCase() : 'U'}
                </div>
                <div className="flex flex-col min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-charcoal-900 dark:text-gray-100 truncate">{u.name}</span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${rankColor}`}>
                      {u.rank || 'Helix'}
                    </span>
                  </div>
                  <span className="text-xs text-charcoal-500 dark:text-gray-400 truncate">
                    {u.handle} {u.department ? `• ${u.department}` : ''}
                  </span>
                </div>
              </div>
              <div className="text-right shrink-0">
                <span className="text-xs font-mono font-bold text-gold-600 dark:text-gold-400 block">{score} pts</span>
                <span className="text-[10px] text-gray-400">Reputation</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
