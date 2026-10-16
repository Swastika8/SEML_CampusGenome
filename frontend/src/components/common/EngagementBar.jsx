import React, { useState, useEffect } from 'react';
import { BadgeCheck, MessageSquare, Repeat, Heart, Check, Bookmark } from 'lucide-react';
import { cn } from './Button';
import CommentsModal from './CommentsModal';
import { useData } from '../../context/DataContext';
import { useToast } from '../../context/ToastContext';
import { useNavigate } from 'react-router-dom';
import { api } from '../../lib/api';
import { useAuth } from '../../context/AuthContext';

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
  onCountChange,
}) {
  const { token, user, refreshUser } = useAuth();
  const { nodes, refreshData } = useData();
  const notify = useToast();
  const navigate = useNavigate();
  const serverNode = nodes.find((n) => String(n.id) === String(nodeId));

  // Likes / Verifications State
  const [isVerified, setIsVerified] = useState(false);

  const [currentVerifyCount, setCurrentVerifyCount] = useState(verifyCount);
  const [currentCommentCount, setCurrentCommentCount] = useState(commentCount);
  const [currentRepostCount] = useState(repostCount);
  const [isLiking, setIsLiking] = useState(false);

  // Comments Modal State
  const [isCommentsModalOpen, setIsCommentsModalOpen] = useState(false);

  // Share Feedback State
  const [isCopied, setIsCopied] = useState(false);

  useEffect(() => {
    setIsVerified(!!serverNode?.is_verified_by_me);
    setCurrentVerifyCount(serverNode?.verification_count ?? verifyCount);
    setCurrentCommentCount(serverNode?.comment_count ?? commentCount);
  }, [serverNode, verifyCount, commentCount]);
  const handleToggleLike = async (e) => {
    e.stopPropagation();
    e.preventDefault();
    if (!user) {
      navigate('/login');
      return;
    }
    if (!nodeId || !/^\d+$/.test(String(nodeId))) {
      notify('Share a contribution about this place to start its story.', 'error');
      return;
    }
    if (isLiking) return;
    setIsLiking(true);
    try {
      const json = await api('/nodes/' + nodeId + '/verify', { method: 'POST', token });
      setIsVerified(json.data.isVerified);
      setCurrentVerifyCount(json.data.verificationCount);
      await Promise.all([refreshData(), refreshUser()]);
      onCountChange?.({
        verifyCount: json.data.verificationCount,
        isVerified: json.data.isVerified,
      });
      if (json.data.isVerified) notify('Another strand of campus DNA, peer checked.');
    } catch (error) {
      notify(error.message, 'error');
    } finally {
      setIsLiking(false);
    }
  };
  const handlePocket = async (e) => {
    e.stopPropagation();
    e.preventDefault();
    if (!user) {
      navigate('/login');
      return;
    }
    if (!serverNode) {
      notify('Open a campus contribution to pocket it.', 'error');
      return;
    }
    if (isLiking) return;
    setIsLiking(true);
    try {
      await api('/nodes/' + nodeId + '/bookmark', {
        method: serverNode.is_saved ? 'DELETE' : 'PUT',
        token,
      });
      await Promise.all([refreshData(), refreshUser()]);
      notify(
        serverNode.is_saved ? 'Back into the wild.' : 'A little wisdom, tucked in your pocket.',
      );
    } catch (error) {
      notify(error.message, 'error');
    } finally {
      setIsLiking(false);
    }
  };

  // Handle Share / Copy Link
  const handleShare = async (e) => {
    e.stopPropagation();
    e.preventDefault();
    try {
      const shareUrl = `${window.location.origin}/nodes/${encodeURIComponent(nodeId)}`;
      await navigator.clipboard.writeText(shareUrl);
      setIsCopied(true);

      setTimeout(() => setIsCopied(false), 2500);
    } catch (err) {
      console.warn('Clipboard write error:', err);
    }
  };

  // Handle Open Comments
  const handleOpenComments = (e) => {
    e.stopPropagation();
    e.preventDefault();
    setIsCommentsModalOpen(true);
  };

  const handleCommentAdded = () => {
    setCurrentCommentCount((c) => c + 1);
    if (onCountChange) {
      onCountChange({ commentCount: currentCommentCount + 1 });
    }
  };

  return (
    <>
      <div
        className={cn(
          'flex flex-wrap items-center gap-3 sm:gap-4 mt-3 pt-3 border-t border-gray-500/20',
          className,
        )}
      >
        {/* Verify / Like Action Button */}
        {variant === 'like' ? (
          <button
            type="button"
            disabled={isLiking}
            onClick={handleToggleLike}
            className={cn(
              'flex items-center gap-1.5 text-xs sm:text-sm font-medium rounded-lg px-2.5 py-1.5 transition-all duration-200 cursor-pointer active:scale-90',
              isVerified
                ? 'bg-red-500/15 text-red-500 dark:text-red-400 font-semibold shadow-sm'
                : 'text-charcoal-700 dark:text-gray-300 hover:bg-red-500/10 hover:text-red-500 dark:hover:text-red-400',
            )}
            title={isVerified ? 'Unlike' : 'Like'}
          >
            <Heart
              size={16}
              className={cn(
                'transition-transform duration-200',
                isVerified ? 'fill-red-500 text-red-500 scale-110' : '',
                isLiking ? 'scale-125' : '',
              )}
            />
            <span>
              {currentVerifyCount} {currentVerifyCount === 1 ? 'Like' : 'Likes'}
            </span>
          </button>
        ) : (
          <button
            type="button"
            disabled={isLiking}
            onClick={handleToggleLike}
            className={cn(
              'flex items-center gap-1.5 text-xs sm:text-sm font-medium rounded-lg px-2.5 py-1.5 transition-all duration-200 cursor-pointer active:scale-90',
              isVerified
                ? 'bg-green-500/15 text-green-600 dark:text-green-400 font-semibold shadow-sm'
                : 'text-charcoal-700 dark:text-gray-300 hover:bg-green-500/10 hover:text-green-600 dark:hover:text-green-400',
            )}
            title={isVerified ? 'Remove Verification' : 'Verify Insight'}
          >
            <BadgeCheck
              size={16}
              className={cn(
                'transition-transform duration-200',
                isVerified
                  ? 'fill-green-500/20 text-green-500 dark:text-green-400 scale-110'
                  : 'text-green-600 dark:text-green-400',
                isLiking ? 'scale-125' : '',
              )}
            />
            <span>
              {isVerified ? 'Verified' : '+ Verify'} ({currentVerifyCount})
            </span>
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
          <span>
            {currentCommentCount} {currentCommentCount === 1 ? 'Comment' : 'Comments'}
          </span>
        </button>

        {/* Repost / Share Action Button */}
        {!hideRepost && (
          <button
            type="button"
            onClick={handleShare}
            className={cn(
              'relative flex items-center gap-1.5 text-xs sm:text-sm rounded-lg px-2.5 py-1.5 transition-all cursor-pointer active:scale-95',
              isCopied
                ? 'text-gold-400 bg-gold-400/10 font-semibold'
                : 'text-gray-500 hover:text-charcoal-900 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-white/5',
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
        {serverNode && (
          <button
            type="button"
            onClick={handlePocket}
            disabled={isLiking}
            aria-label={(serverNode.is_saved ? 'Unpocket ' : 'Pocket ') + itemTitle}
            className="flex items-center gap-1.5 text-xs font-medium text-gold-600 dark:text-gold-400 px-2.5 py-1.5 rounded-lg hover:bg-gold-400/10 transition-colors"
          >
            <Bookmark size={15} fill={serverNode.is_saved ? 'currentColor' : 'none'} />
            <span>{serverNode.is_saved ? 'Pocketed' : 'Pocket'}</span>
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
