import { useData } from '../../context/DataContext';

export default function ContributorList() {
  const { users } = useData();
  
  // Sort by reputation
  const topContributors = [...users].sort((a, b) => b.reputation - a.reputation);

  return (
    <div className="flex flex-col gap-3">
      <h3 className="font-serif text-lg text-charcoal-900 dark:text-gray-200 font-semibold mb-2">Featured Contributors</h3>
      <div className="flex flex-col gap-2">
        {topContributors.map(user => (
          <div key={user.id} className="flex items-center gap-3 p-3 rounded-lg bg-white/40 dark:bg-charcoal-800/40 backdrop-blur-sm border border-white/20 dark:border-charcoal-700/50 hover:bg-white/60 dark:hover:bg-charcoal-800/60 transition-colors">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-gold-400 to-gold-600 flex items-center justify-center text-white font-bold text-lg shadow-sm">
              {user.name.charAt(0)}
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-semibold text-charcoal-900 dark:text-gray-100">{user.handle}</span>
              <span className="text-xs text-charcoal-700 dark:text-gray-400 font-medium">
                {user.rank} Rank {user.reputation}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
