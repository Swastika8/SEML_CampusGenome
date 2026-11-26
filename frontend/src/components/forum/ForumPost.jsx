import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowDown,
  ArrowUp,
  Bookmark,
  Ellipsis,
  ExternalLink,
  Flag,
  MessageCircle,
  Share2,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { api } from '../../lib/api';
import { nodeImage, relativeTime, safeLink } from '../../lib/content';
import Modal from '../common/Modal';
import { CommunityAvatar } from './CommunityControls';
import { reportReasons, useForum } from './forumData';

export function PostVotes({ post, onUpdate }) {
  const { user, token, loading } = useAuth();
  const { requireSignIn } = useForum();
  const notify = useToast();
  const [busy, setBusy] = useState(false);
  const myVote = post.my_vote || 0;
  const owned = !!user && post.user_id === user.id;
  async function send(value) {
    if (!user) return requireSignIn();
    setBusy(true);
    try {
      const { data } = await api('/nodes/' + post.id + '/vote', {
        token,
        method: 'PUT',
        body: { value: myVote === value ? 0 : value },
      });
      onUpdate({
        score: data.score,
        my_vote: data.value,
        is_verified_by_me: data.isVerified,
        verification_count: data.verificationCount,
      });
    } catch (error) {
      notify(error.message, 'error');
    } finally {
      setBusy(false);
    }
  }
  return (
    <div
      className={'forum-votes' + (myVote === 1 ? ' voted-up' : myVote === -1 ? ' voted-down' : '')}
      role="group"
      aria-label="Post voting"
      title={owned ? 'Other students vote on your post' : undefined}
    >
      <button
        type="button"
        disabled={owned || loading || busy}
        aria-label="Upvote"
        aria-pressed={myVote === 1}
        onClick={() => send(1)}
      >
        <ArrowUp size={19} />
      </button>
      <output aria-label="Post score" aria-live="polite">
        {post.score ?? post.verification_count ?? 0}
      </output>
      <button
        type="button"
        disabled={owned || loading || busy}
        aria-label="Downvote"
        aria-pressed={myVote === -1}
        onClick={() => send(-1)}
      >
        <ArrowDown size={19} />
      </button>
    </div>
  );
}

function ReportDialog({ post, token, onClose }) {
  const [reason, setReason] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const notify = useToast();
  async function submit(event) {
    event.preventDefault();
    setBusy(true);
    setError('');
    try {
      await api('/nodes/' + post.id + '/report', { method: 'PUT', token, body: { reason } });
      notify('Report sent for review.');
      onClose(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }
  return (
    <Modal
      title="Report post"
      onClose={() => {
        if (!busy) onClose();
      }}
      className="forum-dialog"
    >
      <form onSubmit={submit} className="forum-form">
        <p className="forum-report-title">{post.title}</p>
        <p>A moderator will review the post. Your account name is kept out of the review queue.</p>
        <label className="forum-field">
          <span>Reason</span>
          <select
            required
            value={reason}
            onChange={(event) => setReason(event.target.value)}
            disabled={busy}
          >
            <option value="">Choose a reason</option>
            {Object.entries(reportReasons).map(([value, label]) => (
              <option value={value} key={value}>
                {label}
              </option>
            ))}
          </select>
        </label>
        {error && (
          <p className="forum-error" role="alert">
            {error}
          </p>
        )}
        <div className="dialog-actions">
          <button type="button" className="forum-button" onClick={onClose} disabled={busy}>
            Cancel
          </button>
          <button className="forum-button forum-primary" disabled={busy || !reason}>
            {busy ? 'Sending…' : 'Send report'}
          </button>
        </div>
      </form>
    </Modal>
  );
}

export function PostTools({ post, onUpdate, detail = false }) {
  const { user, token, loading } = useAuth();
  const { requireSignIn } = useForum();
  const notify = useToast();
  const [busy, setBusy] = useState(false);
  const [report, setReport] = useState(false);
  const menu = useRef(null);
  useEffect(() => {
    const closeOutside = (event) => {
      if (menu.current && !menu.current.contains(event.target)) menu.current.open = false;
    };
    document.addEventListener('pointerdown', closeOutside);
    return () => document.removeEventListener('pointerdown', closeOutside);
  }, []);
  async function save() {
    if (!user) return requireSignIn();
    setBusy(true);
    try {
      const { data } = await api('/nodes/' + post.id + '/bookmark', {
        token,
        method: post.is_saved ? 'DELETE' : 'PUT',
      });
      onUpdate(data);
      notify(data.is_saved ? 'Post saved to your Pocket.' : 'Post removed from your Pocket.');
    } catch (error) {
      notify(error.message, 'error');
    } finally {
      setBusy(false);
    }
  }
  async function share() {
    try {
      await navigator.clipboard.writeText(
        new URL('/nodes/' + post.id, window.location.origin).href,
      );
      notify('Discussion link copied.');
    } catch {
      notify('Couldn’t copy the link. Open the discussion and copy its address.', 'error');
    }
  }
  function openReport() {
    menu.current.open = false;
    if (!user) return requireSignIn();
    setReport(true);
  }
  return (
    <div className="forum-post-tools">
      {!detail && (
        <Link
          to={'/nodes/' + post.id + '#discussion'}
          className="forum-action"
          aria-label={`${post.comment_count || 0} ${(post.comment_count || 0) === 1 ? 'comment' : 'comments'}`}
        >
          <MessageCircle size={16} /> {post.comment_count || 0}{' '}
          <span>{post.comment_count === 1 ? 'comment' : 'comments'}</span>
        </Link>
      )}
      <button type="button" className="forum-action" onClick={share} aria-label="Share post">
        <Share2 size={16} />
        <span>Share</span>
      </button>
      <button
        type="button"
        className="forum-action"
        disabled={loading || busy}
        aria-pressed={!!post.is_saved}
        onClick={save}
        aria-label={
          detail
            ? post.is_saved
              ? 'Saved'
              : 'Save'
            : (post.is_saved ? 'Unsave ' : 'Save ') + post.title
        }
      >
        <Bookmark size={16} fill={post.is_saved ? 'currentColor' : 'none'} />
        <span>{post.is_saved ? 'Saved' : 'Save'}</span>
      </button>
      {(!user || post.user_id !== user.id) && (
        <details
          className="forum-post-menu"
          ref={menu}
          onKeyDown={(event) => {
            if (event.key === 'Escape' && menu.current.open) {
              menu.current.open = false;
              menu.current.querySelector('summary').focus();
            }
          }}
        >
          <summary className="forum-action" aria-label="Post options">
            <Ellipsis size={19} />
          </summary>
          <div className="forum-popover">
            <button type="button" onClick={openReport} disabled={post.has_reported || loading}>
              <Flag size={16} /> {post.has_reported ? 'Reported' : 'Report post'}
            </button>
          </div>
        </details>
      )}
      {report && (
        <ReportDialog
          post={post}
          token={token}
          onClose={(sent) => {
            setReport(false);
            if (sent) onUpdate({ has_reported: true });
          }}
        />
      )}
    </div>
  );
}

export function PostMeta({ post, showCampus = false }) {
  const slug = post.community_slug || 'campus';
  return (
    <div className="forum-post-meta">
      <Link to={'/c/' + slug} className="forum-post-community">
        <CommunityAvatar
          community={{ default_category: post.community_category || post.category }}
          size={13}
        />
        g/{slug}
      </Link>
      <span className="forum-post-author">
        {post.author_handle || post.author_name || 'Campus contributor'}
      </span>
      <time dateTime={post.created_at}>{relativeTime(post.created_at)}</time>
      {showCampus && post.community_campus && (
        <span className="forum-post-campus">{post.community_campus}</span>
      )}
    </div>
  );
}

export function PostKind({ kind }) {
  const tone =
    { Question: 'purple', Guide: 'green', Event: 'pink', Link: 'blue' }[kind] || 'yellow';
  return <span className={'forum-kind tone-' + tone}>{kind || 'Discussion'}</span>;
}

export default function ForumPost({ post, onUpdate }) {
  const url = '/nodes/' + post.id;
  const image = safeLink(nodeImage(post));
  const external = safeLink(post.link_url);
  return (
    <article className="forum-post" aria-labelledby={'post-title-' + post.id}>
      <div className="forum-post-content">
        <PostMeta post={post} showCampus />
        <div className="forum-post-preview">
          <div>
            <h2 id={'post-title-' + post.id}>
              <Link to={url}>{post.title}</Link>
            </h2>
            <PostKind kind={post.forum_post_kind} />
            <p>{post.description}</p>
            {external && (
              <a
                href={external}
                className="forum-external"
                target="_blank"
                rel="noopener noreferrer ugc"
              >
                <ExternalLink size={15} /> {new URL(external).hostname}
              </a>
            )}
          </div>
          {image && (
            <Link to={url} tabIndex={-1} aria-hidden="true" className="forum-thumb">
              <img
                src={image}
                loading="lazy"
                width="112"
                height="84"
                alt=""
                referrerPolicy="no-referrer"
                onError={(event) => {
                  event.currentTarget.hidden = true;
                  event.currentTarget.parentElement.hidden = true;
                }}
              />
            </Link>
          )}
        </div>
        <div className="forum-post-actions">
          <PostVotes post={post} onUpdate={onUpdate} />
          <PostTools post={post} onUpdate={onUpdate} />
        </div>
      </div>
    </article>
  );
}
