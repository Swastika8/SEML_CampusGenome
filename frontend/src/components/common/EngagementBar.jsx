import React, { useState, useEffect } from 'react';
import { BadgeCheck, MessageSquare, Repeat, Heart, Check } from 'lucide-react';
import { cn } from './Button';
import CommentsModal from './CommentsModal';
import { useAuth } from '../../context/AuthContext';

const API_BASE = 'http://localhost:5000/api';

export default function EngagementBar({ 
  nodeId,
  itemTitle = 'Campus Insight',
  category = 'Campus',
  verifyCount = 0, 
  commentCount = 0, 
  repostCount = 0, 
  className,
  variant = 'verify',
  hideRepost = false,
  onCountChange
}) {
  const { token } = useAuth();
  const storageId = nodeId || itemTitle.replace(/\s+/g, '_').toLowerCase();
  
  // Likes / Verifications State
  const [isVerified, setIsVerified] = useState(() => {
    try {
      return localStorage.getItem(`cg_liked_${storageId}`) === 'true';
    } catch {
      return false;
    }
  });

  const [currentVerifyCount, setCurrentVerifyCount] = useState(verifyCount);
  const [currentCommentCount, setCurrentCommentCount] = useState(commentCount);
  const [currentRepostCount, setCurrentRepostCount] = useState(repostCount);
  const [isLiking, setIsLiking] = useState(false);

  // Comments Modal State
  const [isCommentsModalOpen, setIsCommentsModalOpen] = useState(false);

  // Share Feedback State
  const [isCopied, setIsCopied] = useState(false);

  // Sync if prop updates from backend
  useEffect(() => {
    if (typeof verifyCount === 'number' && !isVerified) {
      setCurrentVerifyCount(verifyCount);
    }
  }, [verifyCount, isVerified]);

  useEffect(() => {
    if (typeof commentCount === 'number') {
      setCurrentCommentCount(commentCount);
    }
  }, [commentCount]);

  // Handle Like / Verify Toggle
  const handleToggleLike = async (e) => {
    e.stopPropagation();
    if (isLiking) return;
    setIsLiking(true);

    const nextVerified = !isVerified;
    const nextCount = Math.max(0, currentVerifyCount + (nextVerified ? 1 : -1));

    // 1. Optimistic UI update
    setIsVerified(nextVerified);
    setCurrentVerifyCount(nextCount);

    try {
      localStorage.setItem(`cg_liked_${storageId}`, nextVerified ? 'true' : 'false');
    } catch {}

    // 2. Call backend if node ID is numeric
    const isNumericNodeId = nodeId && !isNaN(Number(nodeId));
    if (isNumericNodeId) {
      try {
        const headers = { 'Content-Type': 'application/json' };
        if (token) headers['Authorization'] = `Bearer ${token}`;

        const res = await fetch(`${API_BASE}/nodes/${nodeId}/verify`, {
          method: 'POST',
          headers,
        });

        if (res.ok) {
          const json = await res.json();
          if (json.success && json.data) {
            if (typeof json.data.verificationCount === 'number') {
              setCurrentVerifyCount(json.data.verificationCount);
            }
            if (typeof json.data.isVerified === 'boolean') {
              setIsVerified(json.data.isVerified);
            }
          }
        }
      } catch (err) {
        console.warn('Like toggle sync with server failed, keeping local state:', err);
      }
    }

    if (onCountChange) {
      onCountChange({ verifyCount: nextCount, isVerified: nextVerified });
    }

    setTimeout(() => setIsLiking(false), 250);
  };

  // Handle Share / Copy Link
  const handleShare = async (e) => {
    e.stopPropagation();
    try {
      const shareUrl = `${window.location.origin}${window.location.pathname}?highlight=${encodeURIComponent(storageId)}`;
      await navigator.clipboard.writeText(shareUrl);
      setIsCopied(true);
      setCurrentRepostCount(c => c + 1);
      setTimeout(() => setIsCopied(false), 2500);
    } catch (err) {
      console.warn('Clipboard write error:', err);
    }
  };

  // Handle Open Comments
  const handleOpenComments = (e) => {
    e.stopPropagation();
    setIsCommentsModalOpen(true);
  };

  const handleCommentAdded = (newComment) => {
    setCurrentCommentCount(c => c + 1);
    if (onCountChange) {
      onCountChange({ commentCount: currentCommentCount + 1 });
    }
  };

  return (
    <>
      <div className={cn("flex items-center gap-3 sm:gap-4 mt-3 pt-3 border-t border-gray-500/20", className)}>
        {/* Verify / Like Action Button */}
        {variant === 'like' ? (
          <button 
            type="button"
            onClick={handleToggleLike}
            className={cn(
              "flex items-center gap-1.5 text-xs sm:text-sm font-medium rounded-lg px-2.5 py-1.5 transition-all duration-200 cursor-pointer active:scale-90",
              isVerified 
                ? "bg-red-500/15 text-red-500 dark:text-red-400 font-semibold shadow-sm" 
                : "text-charcoal-700 dark:text-gray-300 hover:bg-red-500/10 hover:text-red-500 dark:hover:text-red-400"
            )}
            title={isVerified ? "Unlike" : "Like"}
          >
            <Heart 
              size={16} 
              className={cn(
                "transition-transform duration-200", 
                isVerified ? "fill-red-500 text-red-500 scale-110" : "",
                isLiking ? "scale-125" : ""
              )} 
            />
            <span>{currentVerifyCount} {currentVerifyCount === 1 ? 'Like' : 'Likes'}</span>
          </button>
        ) : (
          <button 
            type="button"
            onClick={handleToggleLike}
            className={cn(
              "flex items-center gap-1.5 text-xs sm:text-sm font-medium rounded-lg px-2.5 py-1.5 transition-all duration-200 cursor-pointer active:scale-90",
              isVerified 
                ? "bg-green-500/15 text-green-600 dark:text-green-400 font-semibold shadow-sm" 
                : "text-charcoal-700 dark:text-gray-300 hover:bg-green-500/10 hover:text-green-600 dark:hover:text-green-400"
            )}
            title={isVerified ? "Remove Verification" : "Verify Insight"}
          >
            <BadgeCheck 
              size={16} 
              className={cn(
                "transition-transform duration-200", 
                isVerified ? "fill-green-500/20 text-green-500 dark:text-green-400 scale-110" : "text-green-600 dark:text-green-400",
                isLiking ? "scale-125" : ""
              )} 
            />
            <span>{isVerified ? 'Verified' : '+ Verify'} ({currentVerifyCount})</span>
          </button>
        )}

        {/* Comment Action Button */}
        <button 
          type="button"
          onClick={handleOpenComments}
          className="flex items-center gap-1.5 text-xs sm:text-sm text-gray-500 hover:text-charcoal-900 dark:text-gray-400 dark:hover:text-gold-300 hover:bg-white/5 transition-all rounded-lg px-2.5 py-1.5 cursor-pointer active:scale-95"
          title="Open discussion & comments"
        >
          <MessageSquare size={15} className="text-gray-400 group-hover:text-gold-400" />
          <span>{currentCommentCount} {currentCommentCount === 1 ? 'Comment' : 'Comments'}</span>
        </button>

        {/* Repost / Share Action Button */}
        {!hideRepost && (
          <button 
            type="button"
            onClick={handleShare}
            className={cn(
              "relative flex items-center gap-1.5 text-xs sm:text-sm rounded-lg px-2.5 py-1.5 transition-all cursor-pointer active:scale-95",
              isCopied 
                ? "text-gold-400 bg-gold-400/10 font-semibold" 
                : "text-gray-500 hover:text-charcoal-900 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-white/5"
            )}
            title="Copy share link"
          >
            {isCopied ? (
              <>
                <Check size={14} className="text-gold-400" />
                <span>Copied!</span>
              </>
            ) : (
              <>
                <Repeat size={14} />
                <span>{currentRepostCount} Shares</span>
              </>
            )}
          </button>
        )}
      </div>

      {/* Interactive Comments Dialog */}
      <CommentsModal 
        isOpen={isCommentsModalOpen}
        onClose={() => setIsCommentsModalOpen(false)}
        nodeId={nodeId}
        title={itemTitle}
        category={category}
        onCommentAdded={handleCommentAdded}
      />
    </>
  );
}
