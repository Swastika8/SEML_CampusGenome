import { Activity } from 'lucide-react';
import VerificationChip from '../common/VerificationChip';

export default function Ticker() {
  const updates = [
    { id: 1, text: "Prof. Turing's CS101: Updated to focus on practical projects", verifiedCount: 12 },
    { id: 2, text: "Library Basement: New silent reading zone confirmed", verifiedCount: 35 },
    { id: 3, text: "CS Lab 102: Booking now required during peak hours", verifiedCount: 8 }
  ];

  return (
    <div className="flex items-center gap-4 py-3 border-y border-gray-200 dark:border-charcoal-700 w-full overflow-hidden bg-white/30 dark:bg-charcoal-800/30 backdrop-blur-sm">
      <div className="flex-shrink-0 flex items-center gap-2 text-gold-500 font-medium px-4 border-r border-gray-300 dark:border-charcoal-600">
        <Activity size={18} className="animate-pulse" />
        <span className="hidden sm:inline">What's Evolving</span>
      </div>
      
      <div className="flex-1 overflow-hidden relative">
        <div className="flex animate-[marquee_20s_linear_infinite] whitespace-nowrap gap-12">
          {updates.map((update, idx) => (
            <div key={`${update.id}-${idx}`} className="flex items-center gap-3">
              <span className="text-sm text-charcoal-800 dark:text-gray-300">{update.text}</span>
              <VerificationChip count={update.verifiedCount} />
            </div>
          ))}
          {/* Duplicate for seamless looping */}
          {updates.map((update, idx) => (
            <div key={`dup-${update.id}-${idx}`} className="flex items-center gap-3">
              <span className="text-sm text-charcoal-800 dark:text-gray-300">{update.text}</span>
              <VerificationChip count={update.verifiedCount} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
