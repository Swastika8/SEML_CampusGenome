import { useEffect, useLayoutEffect, useMemo, useState } from 'react';
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  ArrowUpRight,
  CalendarDays,
  Check,
  Clock3,
  MapPin,
  MessageCircle,
  Minus,
  Plus,
  Trash2,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { useReadingTrail } from '../context/ReadingTrailContext';
import { useData } from '../context/DataContext';
import { api } from '../lib/api';
import { nodeImage, relativeTime, safeLink } from '../lib/content';
import Modal from '../components/common/Modal';
import { ForumAside } from '../components/forum/ForumAside';
import { PostKind, PostMeta, PostTools, PostVotes } from '../components/forum/ForumPost';
import { useForum, useForumRequest } from '../components/forum/forumData';
import { ForumNotice } from './ForumPage';

function CommentForm({ onSend, reply = false, onCancel }) {
  const [text, setText] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  async function submit(event) {
    event.preventDefault();
    if (busy || !text.trim()) return;
    setBusy(true);
    setError('');
    try {
      await onSend(text.trim());
      setText('');
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }
  return (
    <form onSubmit={submit} className={'forum-comment-form' + (reply ? ' forum-reply-form' : '')}>
      <label>
        {reply ? 'Write a reply' : 'Add your perspective'}
        <textarea
          value={text}
          onChange={(event) => setText(event.target.value)}
          required
          maxLength={2000}
          rows={reply ? 2 : 3}
          disabled={busy}
          placeholder={reply ? 'Reply to this comment…' : 'What would you add to the conversation?'}
        />
      </label>
      {error && (
        <p className="forum-error" role="alert">
          {error}
        </p>
      )}
      <div>
        {onCancel && (
          <button type="button" className="forum-button" onClick={onCancel} disabled={busy}>
            Cancel reply
          </button>
        )}
        <button className="forum-button forum-primary" disabled={busy || !text.trim()}>
          {busy ? 'Posting…' : reply ? 'Post reply' : 'Post comment'}
        </button>
      </div>
    </form>
  );
}

function CommentBranch({ comment, onSend, replyId, setReplyId, authenticated, onSignIn }) {
  const [collapsed, setCollapsed] = useState(false);
  const author = comment.author_handle || comment.author_name || 'Campus contributor';
  return (
    <div className="forum-comment-branch">
      <article className="forum-comment" id={'comment-' + comment.id}>
        <div className="forum-comment-head">
          <span className="forum-comment-avatar" aria-hidden="true">
            {(comment.author_name || 'S').slice(0, 1)}
          </span>
          <strong>{author}</strong>
          <time dateTime={comment.created_at}>{relativeTime(comment.created_at)}</time>
        </div>
        <p>{comment.text}</p>
        <div className="forum-comment-actions">
          {comment.depth < 6 && (
            <button
              type="button"
              className="forum-action"
              onClick={() => {
                if (!authenticated) return onSignIn();
                setReplyId(replyId === comment.id ? null : comment.id);
              }}
            >
              <MessageCircle size={15} /> Reply
            </button>
          )}
          {!!comment.children.length && (
            <button
              type="button"
              className="forum-action"
              aria-expanded={!collapsed}
              onClick={() => setCollapsed((value) => !value)}
            >
              {collapsed ? <Plus size={15} /> : <Minus size={15} />}{' '}
              {collapsed ? 'Show replies' : 'Hide replies'}
            </button>
          )}
        </div>
        {replyId === comment.id && (
          <CommentForm
            reply
            onCancel={() => setReplyId(null)}
            onSend={async (text) => {
              await onSend(text, comment.id);
              setCollapsed(false);
              setReplyId(null);
            }}
          />
        )}
      </article>
      {!collapsed && !!comment.children.length && (
        <div className="forum-replies">
          {comment.children.map((child) => (
            <CommentBranch
              key={child.id}
              comment={child}
              onSend={onSend}
              replyId={replyId}
              setReplyId={setReplyId}
              authenticated={authenticated}
              onSignIn={onSignIn}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function Discussion({ node, token, user, onComment }) {
  const { requireSignIn } = useForum();
  const notify = useToast();
  const path = '/nodes/' + node.id + '/comments';
  const [retry, setRetry] = useState(0);
  const initial = useForumRequest(path + '?limit=60', token, retry);
  const [extra, setExtra] = useState({ comments: [], next: undefined });
  const [local, setLocal] = useState([]);
  const [moreBusy, setMoreBusy] = useState(false);
  const [replyId, setReplyId] = useState(null);
  const [sort, setSort] = useState('old');
  const cursor = extra.next === undefined ? initial.result?.nextCursor : extra.next;
  const roots = useMemo(() => {
    const unique = new Map(
      [...(initial.result?.data || []), ...extra.comments, ...local].map((comment) => [
        comment.id,
        { ...comment, children: [] },
      ]),
    );
    const top = [];
    for (const comment of [...unique.values()].sort((a, b) => a.id - b.id)) {
      const parent = unique.get(comment.parent_id);
      if (parent && parent.id < comment.id) parent.children.push(comment);
      else top.push(comment);
    }
    return sort === 'new' ? top.reverse() : top;
  }, [initial.result, extra.comments, local, sort]);
  async function send(text, parentId) {
    const { data } = await api(path, { method: 'POST', body: { text, parentId }, token });
    setLocal((previous) => [...previous, data]);
    onComment();
  }
  async function loadMore() {
    setMoreBusy(true);
    try {
      const response = await api(
        path + '?' + new URLSearchParams({ after: String(cursor), limit: '60' }),
        { token },
      );
      setExtra((previous) => ({
        comments: [...previous.comments, ...response.data],
        next: response.nextCursor,
      }));
    } catch (error) {
      notify(error.message, 'error');
    } finally {
      setMoreBusy(false);
    }
  }
  return (
    <section className="forum-discussion" id="discussion" aria-labelledby="forum-discussion-title">
      <div className="forum-discussion-heading">
        <h2 id="forum-discussion-title">
          Discussion <span>{node.comment_count || 0}</span>
        </h2>
        {roots.length > 1 && (
          <label className="forum-inline-select">
            <select
              aria-label="Sort comments"
              value={sort}
              onChange={(event) => setSort(event.target.value)}
            >
              <option value="old">Oldest first</option>
              <option value="new">Newest first</option>
            </select>
          </label>
        )}
      </div>
      {user ? (
        <CommentForm onSend={send} />
      ) : (
        <div className="forum-discussion-signin">
          <span>Sign in to join the discussion.</span>
          <button className="forum-button" onClick={requireSignIn}>
            Sign in
          </button>
        </div>
      )}
      {initial.error && (
        <div className="forum-notice">
          <p role="alert">{initial.error}</p>
          <button className="forum-button" onClick={() => setRetry((value) => value + 1)}>
            Try comments again
          </button>
        </div>
      )}
      {initial.loading && (
        <p className="forum-loading-label" role="status">
          Loading comments…
        </p>
      )}
      <div className="comments-list forum-comment-list">
        {roots.map((comment) => (
          <CommentBranch
            key={comment.id}
            comment={comment}
            onSend={send}
            replyId={replyId}
            setReplyId={setReplyId}
            authenticated={!!user}
            onSignIn={requireSignIn}
          />
        ))}
        {!initial.loading && !initial.error && !roots.length && (
          <p className="forum-loading-label">No comments yet. Start the conversation.</p>
        )}
      </div>
      {cursor && (
        <button className="forum-button" onClick={loadMore} disabled={moreBusy}>
          {moreBusy ? 'Loading…' : 'Load more comments'}
        </button>
      )}
    </section>
  );
}

function EventDetails({ node, onRsvp, busy }) {
  const details = node.event_details;
  const date = new Date(details.event_date);
  const dateLabel = Number.isNaN(date.getTime())
    ? 'Date to be announced'
    : date.toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
        ...(details.event_date?.match(/^\d{4}-\d{2}-\d{2}$/) ? { timeZone: 'UTC' } : {}),
      });
  return (
    <div className="forum-event">
      <div className="forum-event-facts">
        <span>
          <CalendarDays size={16} />
          {dateLabel}
        </span>
        <span>
          <Clock3 size={16} />
          {details.event_time || 'Time to be announced'}
        </span>
        <span>
          <MapPin size={16} />
          {details.venue || 'Campus'}
        </span>
      </div>
      <div className="rsvp-box forum-rsvp">
        <div>
          <strong>
            {node.is_attending ? 'You’re on the list. See you there!' : 'Going to this event?'}
          </strong>
          <p>
            {node.attendee_count} {node.attendee_count === 1 ? 'student has' : 'students have'}{' '}
            RSVPed.
          </p>
        </div>
        <button
          disabled={busy}
          className={'forum-button ' + (node.is_attending ? '' : 'forum-primary')}
          onClick={onRsvp}
        >
          {node.is_attending ? (
            <>
              <Check size={16} />
              Cancel RSVP
            </>
          ) : (
            'Count me in'
          )}
        </button>
      </div>
    </div>
  );
}

function NodeThread({ id }) {
  const { user, token, loading: checkingSession } = useAuth();
  const { track, discard } = useReadingTrail();
  const { refreshData } = useData();
  const { requireSignIn } = useForum();
  const { hash } = useLocation();
  const navigate = useNavigate();
  const notify = useToast();
  const [retry, setRetry] = useState(0);
  const [patch, setPatch] = useState({});
  const [busy, setBusy] = useState(false);
  const [confirm, setConfirm] = useState(false);
  const query = useForumRequest(
    !checkingSession ? '/nodes/' + encodeURIComponent(id) : null,
    token,
    retry,
  );
  const result = query.result?.data;
  const community = useForumRequest(
    result?.community_slug ? '/forum/communities/' + result.community_slug : null,
    token,
  );
  useLayoutEffect(() => {
    if (result) track({ id: result.id, title: result.title, category: result.category });
  }, [result, track]);
  useEffect(() => {
    if (result && hash === '#discussion')
      document.getElementById('discussion')?.scrollIntoView({ block: 'start' });
  }, [result, hash]);
  if (checkingSession || (query.loading && !result))
    return (
      <p className="forum-single-loading" role="status">
        Loading post…
      </p>
    );
  if (query.error || !result)
    return (
      <ForumNotice title="Post unavailable">
        <p role="alert">{query.error || 'This post may have been removed.'}</p>
        <button className="forum-button" onClick={() => setRetry((count) => count + 1)}>
          Try again
        </button>
        <Link className="forum-button" to="/">
          Back to the feed
        </Link>
      </ForumNotice>
    );
  const node = { ...result, ...patch };
  const image = safeLink(nodeImage(node));
  const application = safeLink(node.career_details?.apply_link);
  const external = safeLink(node.link_url);
  const canRemove =
    user &&
    (node.user_id === user.id ||
      node.community_owner_id === user.id ||
      ['admin', 'moderator'].includes(user.role));
  const onUpdate = (changes) => setPatch((state) => ({ ...state, ...changes }));

  async function rsvp() {
    if (!user) return requireSignIn();
    setBusy(true);
    try {
      const { data } = await api('/nodes/' + id + '/rsvp', {
        token,
        method: node.is_attending ? 'DELETE' : 'PUT',
      });
      onUpdate({
        is_attending: data.is_attending,
        attendee_count: Math.max(
          0,
          (node.attendee_count || 0) + Number(data.is_attending) - Number(node.is_attending),
        ),
      });
    } catch (error) {
      notify(error.message, 'error');
    } finally {
      setBusy(false);
    }
  }
  async function remove() {
    setBusy(true);
    try {
      await api('/nodes/' + id, { token, method: 'DELETE' });
      discard(id);
      void refreshData();
      navigate('/c/' + (node.community_slug || 'campus'));
      notify('Post removed.');
    } catch (error) {
      notify(error.message, 'error');
    } finally {
      setBusy(false);
      setConfirm(false);
    }
  }
  const tags = [
    node.academic_details?.department,
    node.academic_details?.year,
    node.academic_details?.subject,
    node.lifestyle_details?.location,
    ...(node.lifestyle_details?.tags || []),
    node.career_details?.company,
    node.career_details?.role,
    node.community_details?.next_meeting,
  ].filter(Boolean);
  return (
    <div className="forum-columns forum-node">
      <div className="forum-stream">
        <Link className="forum-back-link" to={'/c/' + (node.community_slug || 'campus')}>
          <ArrowLeft size={17} /> Back to g/{node.community_slug || 'campus'}
        </Link>
        <article className="article forum-thread">
          <PostMeta post={node} showCampus />
          <h1>{node.title}</h1>
          <PostKind kind={node.forum_post_kind} />
          <p className="forum-thread-body">{node.description}</p>
          {image && (
            <img
              className="forum-thread-image"
              src={image}
              alt=""
              referrerPolicy="no-referrer"
              onError={(event) => {
                event.currentTarget.hidden = true;
              }}
            />
          )}
          {!!tags.length && (
            <div className="forum-thread-tags">
              {[...new Set(tags)].map((tag) => (
                <span key={tag}>{tag}</span>
              ))}
            </div>
          )}
          {node.lifestyle_details?.secret_tip &&
            node.lifestyle_details.secret_tip !== node.description && (
              <blockquote className="forum-spot-tip">
                <strong>Student tip</strong>
                <p>{node.lifestyle_details.secret_tip}</p>
              </blockquote>
            )}
          {(external || application) && (
            <div className="forum-thread-links">
              {external && (
                <a
                  className="forum-button"
                  href={external}
                  target="_blank"
                  rel="noopener noreferrer ugc"
                >
                  {new URL(external).hostname}
                  <ArrowUpRight size={16} />
                </a>
              )}
              {application && (
                <a
                  className="forum-button"
                  href={application}
                  target="_blank"
                  rel="noopener noreferrer ugc"
                >
                  View opportunity <ArrowUpRight size={16} />
                </a>
              )}
            </div>
          )}
          {node.event_details && <EventDetails node={node} onRsvp={rsvp} busy={busy} />}
          <div className="forum-post-actions">
            <PostVotes post={node} onUpdate={onUpdate} />
            <PostTools post={node} onUpdate={onUpdate} detail />
            {canRemove && (
              <button
                type="button"
                className="forum-action forum-remove"
                onClick={() => setConfirm(true)}
              >
                <Trash2 size={16} />
                Remove
              </button>
            )}
          </div>
        </article>
        <Discussion
          node={node}
          token={token}
          user={user}
          onComment={() =>
            setPatch((value) => ({
              ...value,
              comment_count: (value.comment_count ?? result.comment_count ?? 0) + 1,
            }))
          }
        />
      </div>
      <ForumAside community={community.result?.data} />
      {confirm && (
        <Modal
          className="forum-dialog"
          title="Remove this contribution?"
          onClose={() => {
            if (!busy) setConfirm(false);
          }}
        >
          <p>The post and its discussion will disappear from public view.</p>
          <div className="dialog-actions">
            <button className="forum-button" disabled={busy} onClick={() => setConfirm(false)}>
              Keep it
            </button>
            <button className="forum-button forum-danger" disabled={busy} onClick={remove}>
              {busy ? 'Removing…' : 'Remove contribution'}
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
}

export default function NodePage() {
  const { id } = useParams();
  const { user } = useAuth();
  return <NodeThread key={id + ':' + (user?.id || 'guest')} id={id} />;
}
