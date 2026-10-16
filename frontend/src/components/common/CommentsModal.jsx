import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { X, MessageSquare, Send, Heart, Sparkles, User, Clock, ShieldCheck } from 'lucide-react';
import { useData } from '../../context/DataContext';
import { useToast } from '../../context/ToastContext';
import { useNavigate } from 'react-router-dom';
import { api } from '../../lib/api';
import { useAuth } from '../../context/AuthContext';

export default function CommentsModal({
  isOpen,
  onClose,
  nodeId,
  title = 'Campus Discussion',
  category = 'Campus',
  onCommentAdded,
}) {
  const { user, token, refreshUser } = useAuth();
  const { refreshData } = useData();
  const notify = useToast();
  const navigate = useNavigate();
  const modalRef = useRef(null);
  const closeRef = useRef(onClose);
  closeRef.current = onClose;
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [newText, setNewText] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [likedCommentIds, setLikedCommentIds] = useState({});
  const [notification, setNotification] = useState('');
  const commentsEndRef = useRef(null);

  useEffect(() => {
    if (!isOpen) return;
    const controller = new AbortController();
    const previous = document.activeElement;
    const overflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    modalRef.current?.querySelector('button')?.focus();
    setLoading(true);
    setNotification('');
    setComments([]);
    if (nodeId && /^\d+$/.test(String(nodeId))) {
      api('/nodes/' + nodeId + '/comments', { signal: controller.signal })
        .then((json) => setComments(json.data))
        .catch((error) => {
          if (error.name !== 'AbortError') notify(error.message, 'error');
        })
        .finally(() => {
          if (!controller.signal.aborted) setLoading(false);
        });
    } else setLoading(false);
    const key = (e) => {
      if (e.key === 'Escape') closeRef.current();
      if (e.key === 'Tab') {
        const items = modalRef.current?.querySelectorAll(
          'button:not([disabled]),textarea:not([disabled])',
        );
        if (!items?.length) return;
        const first = items[0],
          last = items[items.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    document.addEventListener('keydown', key);
    return () => {
      controller.abort();
      document.body.style.overflow = overflow;
      document.removeEventListener('keydown', key);
      previous?.focus();
    };
  }, [isOpen, nodeId, notify]);
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) {
      closeRef.current();
      navigate('/login');
      return;
    }
    if (!newText.trim() || submitting) return;
    setSubmitting(true);
    try {
      const json = await api('/nodes/' + nodeId + '/comments', {
        method: 'POST',
        token,
        body: { text: newText.trim() },
      });
      setComments((current) => [...current, json.data]);
      setNewText('');
      setNotification('Your strand is in the conversation. +2 reputation points.');
      onCommentAdded?.(json.data);
      await Promise.all([refreshData(), refreshUser()]);
      commentsEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    } catch (error) {
      notify(error.message, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const toggleCommentLike = (commentId) => {
    setLikedCommentIds((prev) => {
      const isLiked = !!prev[commentId];
      const nextState = { ...prev, [commentId]: !isLiked };

      setComments((current) =>
        current.map((c) => {
          if (c.id === commentId) {
            const currentLikes = c.likes || 0;
            return { ...c, likes: isLiked ? Math.max(0, currentLikes - 1) : currentLikes + 1 };
          }
          return c;
        }),
      );

      return nextState;
    });
  };

  const getRankBadgeClass = (rank) => {
    switch (rank) {
      case 'Nucleus':
        return 'bg-gold-500/20 text-gold-400 border border-gold-500/30';
      case 'Chromosome':
        return 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30';
      case 'Helix':
      default:
        return 'bg-sky-500/20 text-sky-400 border border-sky-500/30';
    }
  };

  const formatTimeAgo = (dateString) => {
    if (!dateString) return 'recently';
    const date = new Date(dateString);
    const now = new Date();
    const diffSec = Math.floor((now - date) / 1000);

    if (diffSec < 60) return 'Just now';
    if (diffSec < 3600) return `${Math.floor(diffSec / 60)}m ago`;
    if (diffSec < 86400) return `${Math.floor(diffSec / 3600)}h ago`;
    if (diffSec < 604800) return `${Math.floor(diffSec / 86400)}d ago`;
    return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
  };

  if (!isOpen) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[1000] flex items-center justify-center p-4 sm:p-6 bg-black/75 backdrop-blur-md animate-fade-in"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title + ' discussion'}
        ref={modalRef}
        className="relative w-full max-w-2xl max-h-[90vh] flex flex-col bg-[#0B1120] text-gray-100 rounded-2xl border border-gold-500/30 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.8)] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-white/[0.02]">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-gold-500/10 border border-gold-500/30 flex items-center justify-center shrink-0">
              <MessageSquare className="w-5 h-5 text-gold-400" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-gold-400/20 text-gold-300">
                  {category || 'Discussion'}
                </span>
                <span className="text-xs text-gray-400">
                  {comments.length} {comments.length === 1 ? 'comment' : 'comments'}
                </span>
              </div>
              <h3 className="text-base font-semibold text-gray-100 truncate mt-0.5">{title}</h3>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-gray-400 hover:text-white hover:bg-white/10 transition-colors shrink-0 ml-2"
            title="Close (Esc)"
          >
            <X size={20} />
          </button>
        </div>

        {/* Success toast notification */}
        {notification && (
          <div className="bg-emerald-950/80 border-b border-emerald-500/30 px-6 py-2.5 text-xs text-emerald-300 flex items-center gap-2 animate-fade-in">
            <Sparkles size={14} className="text-emerald-400 shrink-0" />
            <span>{notification}</span>
          </div>
        )}

        {/* Comments Feed */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4 min-h-[220px]">
          {loading ? (
            <div className="flex flex-col items-center justify-center h-48 text-gray-400 gap-3">
              <div className="w-6 h-6 border-2 border-gold-400 border-t-transparent rounded-full animate-spin"></div>
              <span className="text-xs font-medium">Fetching verified discussions...</span>
            </div>
          ) : comments.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-48 text-center text-gray-400 gap-2">
              <MessageSquare size={32} className="text-gray-600 mb-1" />
              <p className="text-sm font-medium text-gray-300">No discussions yet</p>
              <p className="text-xs text-gray-500 max-w-sm">
                Be the first student or peer to share an insight, tip, or question!
              </p>
            </div>
          ) : (
            comments.map((comment) => {
              const isLiked = !!likedCommentIds[comment.id];
              const authorName = comment.author_name || 'Campus Student';
              const authorHandle = comment.author_handle || '@Student';
              const authorRank = comment.author_rank || 'Helix';

              return (
                <div
                  key={comment.id}
                  className="p-4 rounded-xl bg-white/[0.03] border border-white/5 hover:border-gold-500/20 transition-all flex flex-col gap-2.5"
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-gold-500 to-amber-600 text-midnight-950 font-bold text-xs flex items-center justify-center shrink-0 shadow-sm">
                        {authorName.charAt(0).toUpperCase()}
                      </div>
                      <div className="flex items-center gap-2 min-w-0 flex-wrap">
                        <span className="text-sm font-semibold text-gray-200 truncate">
                          {authorName}
                        </span>
                        <span className="text-xs text-gray-400 font-mono">{authorHandle}</span>
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${getRankBadgeClass(authorRank)}`}
                        >
                          {authorRank}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 text-[11px] text-gray-400 shrink-0">
                      <Clock size={12} />
                      <span>{formatTimeAgo(comment.created_at)}</span>
                    </div>
                  </div>

                  <p className="text-sm text-gray-300 leading-relaxed pl-10 whitespace-pre-line font-sans">
                    {comment.text}
                  </p>

                  <div className="flex items-center justify-end gap-3 pt-1 pl-10 text-xs">
                    <button
                      onClick={() => toggleCommentLike(comment.id)}
                      className={`flex items-center gap-1.5 py-1 px-2.5 rounded-lg transition-colors ${
                        isLiked
                          ? 'text-red-400 bg-red-500/10 font-medium'
                          : 'text-gray-400 hover:text-red-400 hover:bg-white/5'
                      }`}
                    >
                      <Heart size={13} className={isLiked ? 'fill-current' : ''} />
                      <span>{comment.likes || 0}</span>
                    </button>
                  </div>
                </div>
              );
            })
          )}
          <div ref={commentsEndRef} />
        </div>

        {/* Input Footer */}
        <form
          onSubmit={handleSubmit}
          className="p-4 sm:p-5 border-t border-white/10 bg-white/[0.02]"
        >
          <div className="flex items-center justify-between mb-2 text-xs text-gray-400">
            <span className="flex items-center gap-1.5 font-medium text-gray-300">
              <User size={13} className="text-gold-400" />
              Posting as <strong className="text-gold-400">
                {user?.name || 'Campus Student'}
              </strong>{' '}
              ({user?.handle || '@You'})
            </span>
            <span className="text-[11px] text-gold-400/80 flex items-center gap-1">
              <ShieldCheck size={12} /> +2 pts per verified comment
            </span>
          </div>

          <div className="relative flex items-center gap-2">
            <textarea
              aria-label="Add your perspective"
              maxLength={2000}
              value={newText}
              onChange={(e) => setNewText(e.target.value)}
              placeholder="Ask a question, share campus tips, or leave a thought..."
              rows={2}
              className="w-full bg-white/5 border border-white/15 focus:border-gold-400 rounded-xl p-3 pr-14 text-sm text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-gold-400/50 resize-none transition-all"
              onKeyDown={(e) => {
                if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
                  handleSubmit(e);
                }
              }}
            />

            <button
              type="submit"
              disabled={!newText.trim() || submitting}
              className="absolute right-3 bottom-3 p-2.5 rounded-lg bg-gradient-to-r from-gold-500 to-amber-500 text-midnight-950 font-bold hover:brightness-110 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-md flex items-center justify-center"
              aria-label="Post comment"
              title="Post Comment (Ctrl+Enter)"
            >
              {submitting ? (
                <div className="w-4 h-4 border-2 border-midnight-950 border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <Send size={15} className="translate-x-0.5" />
              )}
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body,
  );
}
