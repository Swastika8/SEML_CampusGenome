import { CheckCircle2, ShieldAlert } from 'lucide-react';
import { cn } from './Button';

export default function VerificationChip({ count, isVerified, className }) {
  if (isVerified === false) {
    return (
      <div className={cn("inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 border border-red-200 dark:border-red-800", className)}>
        <ShieldAlert size={14} />
        <span>Unverified</span>
      </div>
    );
  }

  return (
    <div className={cn("inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] uppercase tracking-wider font-bold bg-green-100/50 text-green-700 dark:bg-green-900/30 dark:text-green-400 border border-green-200/50 dark:border-green-800/50 tour-verification shadow-sm backdrop-blur-sm", className)}>
      <CheckCircle2 size={12} strokeWidth={2.5} />
      <span>Verified {count ? `by ${count}` : ''}</span>
    </div>
  );
}
