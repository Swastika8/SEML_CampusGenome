import { BadgeCheck, MessageSquare, Repeat, Heart } from 'lucide-react';
import { cn } from './Button';

export default function EngagementBar({ 
  verifyCount = 0, 
  commentCount = 0, 
  repostCount = 0, 
  className,
  variant = 'verify',
  hideRepost = false
}) {
  return (
    <div className={cn("flex items-center gap-4 mt-3 pt-3 border-t border-gray-500/20", className)}>
      {/* Verify/Like Action */}
      {variant === 'like' ? (
        <button className="flex items-center gap-1.5 text-xs sm:text-sm text-charcoal-700 dark:text-gray-300 font-medium hover:bg-red-500/10 hover:text-red-600 dark:hover:text-red-400 transition-colors rounded-md px-2 py-1 cursor-pointer">
          <Heart size={16} className="text-red-600 dark:text-red-400" />
          <span>{verifyCount} Likes</span>
        </button>
      ) : (
        <button className="flex items-center gap-1.5 text-xs sm:text-sm text-charcoal-700 dark:text-gray-300 font-medium hover:bg-green-500/10 hover:text-green-600 dark:hover:text-green-400 transition-colors rounded-md px-2 py-1 cursor-pointer">
          <BadgeCheck size={16} className="text-green-600 dark:text-green-400" />
          <span>+ {verifyCount} Verified</span>
        </button>
      )}

      {/* Comment Action */}
      <button className="flex items-center gap-1.5 text-xs sm:text-sm text-gray-500 hover:text-charcoal-900 dark:hover:text-gray-200 transition-colors rounded-md px-2 py-1 cursor-pointer">
        <MessageSquare size={14} />
        <span>{commentCount} Comments</span>
      </button>

      {/* Repost Action */}
      {!hideRepost && (
        <button className="flex items-center gap-1.5 text-xs sm:text-sm text-gray-500 hover:text-charcoal-900 dark:hover:text-gray-200 transition-colors rounded-md px-2 py-1 cursor-pointer">
          <Repeat size={14} />
          <span>{repostCount} Shares</span>
        </button>
      )}
    </div>
  );
}
