import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowUp, Bookmark, MessageCircle, Share2, Check, MapPin } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import { useToast } from '../../context/ToastContext';
import { api } from '../../lib/api';
import { relativeTime, nodeImage, channelMeta } from '../../lib/content';

export default function ThreadCard({ node, onChange, compact = false }) {
  const { user, refreshUser } = useAuth();
  const { refreshData } = useData();
  const navigate = useNavigate();
  const notify = useToast();
  const [busy, setBusy] = useState(false);
  const [copied, setCopied] = useState(false);
  const channel = channelMeta[node.category] || channelMeta.Academics;
  const image = nodeImage(node);
  async function act(kind) {
    if (!user) return navigate('/login');
    if (busy) return;
    setBusy(true);
    try {
      await api('/nodes/' + node.id + '/' + kind, {
        method: kind === 'bookmark' ? (node.is_saved ? 'DELETE' : 'PUT') : 'POST',
      });
      await Promise.all([refreshData(), refreshUser()]);
      onChange?.();
      if (kind === 'bookmark')
        notify(node.is_saved ? 'Back into the wild.' : 'Tucked into your pocket.');
    } catch (error) {
      notify(error.message, 'error');
    } finally {
      setBusy(false);
    }
  }
  async function share() {
    try {
      await navigator.clipboard.writeText(window.location.origin + '/nodes/' + node.id);
      setCopied(true);
      notify('Link copied. Pass the lore on.');
    } catch {
      notify('Open the post to copy its link from the address bar.', 'error');
    }
  }
  return (
    <article className={'thread-card node-card ' + (compact ? 'thread-compact' : '')}>
      <div className={'thread-vote ' + (node.is_verified_by_me ? 'voted' : '')}>
        <button
          onClick={() => act('verify')}
          disabled={busy || user?.id === node.user_id}
          aria-label={
            (node.is_verified_by_me ? 'Undo helpful vote for ' : 'Mark helpful: ') + node.title
          }
          aria-pressed={node.is_verified_by_me}
          title={
            user?.id === node.user_id
              ? 'Your own little contribution to campus lore'
              : 'This helped me'
          }
        >
          <ArrowUp size={21} strokeWidth={2.4} />
        </button>
        <strong>{node.verification_count || 0}</strong>
        <small>helpful</small>
      </div>
      <div className="thread-main">
        <div className="thread-meta">
          <Link
            className={'channel-avatar channel-' + node.category.toLowerCase()}
            to={'/explore?category=' + node.category}
          >
            {channel.mark}
          </Link>
          <Link className="thread-channel" to={'/explore?category=' + node.category}>
            g/{channel.slug}
          </Link>
          <span className="thread-dot">·</span>
          <span className="thread-handle">
            u/{(node.author_handle || 'campus-explorer').replace(/^@/, '')}
          </span>
          <span className="thread-dot">·</span>
          <time dateTime={node.created_at}>{relativeTime(node.created_at)}</time>
        </div>
        <div className="thread-content">
          <div className="thread-copy">
            <span className={'thread-flair flair-' + node.category.toLowerCase()}>
              {channel.flair}
            </span>
            <Link className="thread-title" to={'/nodes/' + node.id}>
              <h2>{node.title}</h2>
            </Link>
            <p>{node.description}</p>
            {node.lifestyle_details?.location && (
              <span className="thread-place">
                <MapPin size={12} />
                {node.lifestyle_details.location}
              </span>
            )}
          </div>
          {image && !compact && (
            <Link
              to={'/nodes/' + node.id}
              className="thread-thumb"
              aria-label={'Open ' + node.title}
            >
              <img
                src={image}
                alt=""
                loading="lazy"
                onError={(e) => {
                  e.currentTarget.onerror = null;
                  e.currentTarget.src = '/background.jpg';
                }}
              />
            </Link>
          )}
        </div>
        <div className="thread-actions">
          <Link to={'/nodes/' + node.id + '#discussion'}>
            <MessageCircle size={16} />
            <span>{node.comment_count || 0} replies</span>
          </Link>
          <button
            onClick={() => act('bookmark')}
            disabled={busy}
            className={node.is_saved ? 'is-pocketed' : ''}
            aria-label={(node.is_saved ? 'Unsave ' : 'Save ') + node.title}
            aria-pressed={node.is_saved}
          >
            <Bookmark size={15} fill={node.is_saved ? 'currentColor' : 'none'} />
            <span>{node.is_saved ? 'Pocketed' : 'Pocket'}</span>
          </button>
          <button onClick={share} aria-label={'Share ' + node.title}>
            {copied ? <Check size={15} /> : <Share2 size={15} />}
            <span>{copied ? 'Copied' : 'Pass it on'}</span>
          </button>
        </div>
      </div>
    </article>
  );
}
