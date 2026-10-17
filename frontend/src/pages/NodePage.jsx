import { useState, useEffect, useCallback } from 'react';
import { useParams, Link, useNavigate, useLocation } from 'react-router-dom';
import {
  ArrowLeft,
  Bookmark,
  BadgeCheck,
  MessageCircle,
  Send,
  MapPin,
  CalendarDays,
  Clock3,
  ArrowUpRight,
  Check,
  Share2,
  Trash2,
  AlertCircle,
} from 'lucide-react';
import DashboardLayout from '../components/layout/DashboardLayout';
import Modal from '../components/common/Modal';
import { api } from '../lib/api';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import { useToast } from '../context/ToastContext';
import { useReadingTrail } from '../context/ReadingTrailContext';
import { relativeTime, nodeImage, safeLink } from '../lib/content';
export default function NodePage() {
  const { id } = useParams();
  const { hash } = useLocation();
  const { user, token, refreshUser } = useAuth();
  const { refreshData } = useData();
  const notify = useToast();
  const { track, discard } = useReadingTrail();
  const navigate = useNavigate();
  const [node, setNode] = useState(null);
  const [comments, setComments] = useState([]);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [text, setText] = useState('');
  const [posting, setPosting] = useState(false);
  const [confirm, setConfirm] = useState(false);
  const load = useCallback(async () => {
    try {
      const [n, c] = await Promise.all([
        api('/nodes/' + id, { token }),
        api('/nodes/' + id + '/comments'),
      ]);
      setNode(n.data);
      setComments(c.data);
      setError('');
    } catch (e) {
      setError(e.message);
    }
  }, [id, token]);
  useEffect(() => {
    setNode(null);
    load();
  }, [load]);
  useEffect(() => {
    if (node?.id && hash === '#discussion') {
      document.getElementById('discussion')?.scrollIntoView({ block: 'start' });
    }
  }, [node?.id, hash]);
  useEffect(() => {
    if (node?.id) track({ id: node.id, title: node.title, category: node.category });
  }, [node?.id, node?.title, node?.category, track]);
  async function action(kind, method = 'POST') {
    if (!user) {
      navigate('/login');
      return;
    }
    setBusy(true);
    try {
      await api('/nodes/' + id + '/' + kind, { method });
      await Promise.all([load(), refreshData(), refreshUser()]);
    } catch (e) {
      notify(e.message, 'error');
    } finally {
      setBusy(false);
    }
  }
  async function postComment(e) {
    e.preventDefault();
    setPosting(true);
    try {
      await api('/nodes/' + id + '/comments', { method: 'POST', body: { text } });
      setText('');
      await Promise.all([load(), refreshData(), refreshUser()]);
      notify('Your comment is part of the conversation.');
    } catch (e) {
      notify(e.message, 'error');
    } finally {
      setPosting(false);
    }
  }
  async function remove() {
    setBusy(true);
    try {
      await api('/nodes/' + id, { method: 'DELETE' });
      discard(id);
      await refreshData();
      notify('Contribution removed.');
      navigate('/explore');
    } catch (e) {
      notify(e.message, 'error');
    } finally {
      setBusy(false);
      setConfirm(false);
    }
  }
  if (error)
    return (
      <DashboardLayout>
        <div className="empty-state panel">
          <AlertCircle />
          <h2>We couldn’t open this contribution.</h2>
          <p>{error}</p>
          <Link className="button button-primary" to="/explore">
            Back to the collective
          </Link>
        </div>
      </DashboardLayout>
    );
  if (!node)
    return (
      <DashboardLayout>
        <div className="skeleton-card detail-skeleton" aria-label="Loading contribution" />
      </DashboardLayout>
    );
  const event = node.event_details;
  const image = nodeImage(node);
  const application = safeLink(node.career_details?.apply_link);
  const canRemove =
    user && (node.user_id === user.id || ['admin', 'moderator'].includes(user.role));
  return (
    <DashboardLayout>
      <div className="article-container">
        <Link className="text-link" to={'/' + node.category.toLowerCase()}>
          <ArrowLeft size={15} />
          Back to {node.category === 'Lifestyle' ? 'campus life' : node.category.toLowerCase()}
        </Link>
        <article className="article panel">
          {image && (
            <div className="article-image">
              <img
                src={image}
                alt=""
                onError={(e) => {
                  e.currentTarget.src = '/background.jpg';
                }}
              />
            </div>
          )}
          <div className="article-content">
            <span className={'category-tag ' + node.category.toLowerCase()}>{node.category}</span>
            <h1>{node.title}</h1>
            <div className="article-byline">
              <span className="avatar">{node.author_name?.slice(0, 1) || 'S'}</span>
              <div>
                <strong>{node.author_name || 'Student contributor'}</strong>
                <small>
                  {node.author_handle} · {relativeTime(node.created_at)}
                </small>
              </div>
              <span className="byline-rank">{node.author_rank}</span>
            </div>
            {event && (
              <div className="event-facts">
                <span>
                  <CalendarDays size={17} />
                  {new Date(event.event_date).toLocaleDateString('en-IN', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                  })}
                </span>
                <span>
                  <Clock3 size={17} />
                  {event.event_time}
                </span>
                <span>
                  <MapPin size={17} />
                  {event.venue}
                </span>
              </div>
            )}
            {node.academic_details && (
              <div className="detail-tags">
                <span>{node.academic_details.department}</span>
                <span>{node.academic_details.year}</span>
                <span>{node.academic_details.subject}</span>
              </div>
            )}
            {node.lifestyle_details && (
              <div className="detail-tags">
                <span>
                  <MapPin size={14} />
                  {node.lifestyle_details.location}
                </span>
                {node.lifestyle_details.tags?.map((t) => (
                  <span key={t}>{t}</span>
                ))}
              </div>
            )}
            {node.career_details && (
              <div className="detail-tags">
                <span>{node.career_details.company}</span>
                <span>{node.career_details.role}</span>
                <span>{node.career_details.opportunity_type}</span>
              </div>
            )}
            {node.community_details && (
              <div className="detail-tags">
                <span>{node.community_details.category}</span>
                <span>{node.community_details.next_meeting}</span>
              </div>
            )}
            <p className="article-body">{node.description}</p>
            {node.lifestyle_details?.secret_tip &&
              node.lifestyle_details.secret_tip !== node.description && (
                <blockquote className="insider-tip">
                  <span className="eyebrow">THE INSIDER TIP</span>
                  <p>{node.lifestyle_details.secret_tip}</p>
                </blockquote>
              )}
            {application && (
              <a
                className="button button-primary"
                href={application}
                target="_blank"
                rel="noreferrer"
              >
                View opportunity
                <ArrowUpRight size={16} />
              </a>
            )}
            {event && (
              <div className="rsvp-box">
                <div>
                  <strong>
                    {node.is_attending
                      ? 'You’re on the list. See you there!'
                      : 'Make a little room for this.'}
                  </strong>
                  <p>
                    {node.attendee_count}{' '}
                    {node.attendee_count === 1 ? 'student has' : 'students have'} RSVPed.{' '}
                    {node.is_attending
                      ? 'Your RSVP is saved.'
                      : 'Save your spot in the campus conversation.'}
                  </p>
                </div>
                <button
                  disabled={busy}
                  className={'button ' + (node.is_attending ? 'button-outline' : 'button-primary')}
                  onClick={() => action('rsvp', node.is_attending ? 'DELETE' : 'PUT')}
                >
                  {node.is_attending ? (
                    <>
                      <Check size={16} />
                      Cancel RSVP
                    </>
                  ) : (
                    'Count me in'
                  )}
                  <ArrowRightIcon />
                </button>
              </div>
            )}
            <div className="article-actions">
              <button
                disabled={busy || node.user_id === user?.id}
                className={node.is_verified_by_me ? 'is-verified' : ''}
                onClick={() => action('verify')}
                title={
                  node.user_id === user?.id
                    ? 'Other students verify your contributions'
                    : 'Verify this contribution'
                }
              >
                <BadgeCheck size={18} />
                {node.is_verified_by_me ? 'Verified' : 'Verify'} · {node.verification_count}
              </button>
              <button
                disabled={busy}
                onClick={() => action('bookmark', node.is_saved ? 'DELETE' : 'PUT')}
              >
                <Bookmark size={18} fill={node.is_saved ? 'currentColor' : 'none'} />
                {node.is_saved ? 'Saved' : 'Save'}
              </button>
              <button
                onClick={async () => {
                  try {
                    await navigator.clipboard.writeText(location.href);
                    notify('Link copied. Pass it on.');
                  } catch {
                    notify(
                      'Unable to copy the link. You can copy it from the address bar.',
                      'error',
                    );
                  }
                }}
              >
                <Share2 size={17} />
                Share
              </button>
              {canRemove && (
                <button className="remove-action" onClick={() => setConfirm(true)}>
                  <Trash2 size={17} />
                  Remove
                </button>
              )}
            </div>
          </div>
        </article>
        <section className="discussion panel" id="discussion">
          <div className="section-heading">
            <h2>
              The conversation <span className="count-pill">{node.comment_count}</span>
            </h2>
            <MessageCircle size={20} />
          </div>
          {user ? (
            <form className="comment-form" onSubmit={postComment}>
              <label htmlFor="comment">Add your perspective</label>
              <textarea
                id="comment"
                value={text}
                onChange={(e) => setText(e.target.value)}
                minLength={1}
                maxLength={2000}
                rows={3}
                required
                placeholder="Ask a question, share an update, or say thanks..."
              />
              <div>
                <small>{text.length}/2000</small>
                <button
                  className="button button-primary compact"
                  disabled={posting || !text.trim()}
                >
                  {posting ? 'Posting...' : 'Post comment'}
                  <Send size={14} />
                </button>
              </div>
            </form>
          ) : (
            <div className="discussion-signin">
              <p>Good conversations start with you.</p>
              <Link to="/login" className="text-link">
                Sign in to join in
                <ArrowUpRight size={15} />
              </Link>
            </div>
          )}
          <div className="comments-list">
            {comments.length ? (
              comments.map((c) => (
                <article className="comment" key={c.id}>
                  <span className="avatar small">{c.author_name?.slice(0, 1)}</span>
                  <div>
                    <strong>
                      {c.author_name}
                      <small>{relativeTime(c.created_at)}</small>
                    </strong>
                    <p>{c.text}</p>
                  </div>
                </article>
              ))
            ) : (
              <p className="muted no-comments">
                No comments yet. There’s room for your perspective.
              </p>
            )}
          </div>
        </section>
      </div>
      {confirm && (
        <Modal title="Remove this contribution?" onClose={() => setConfirm(false)}>
          <p className="muted">
            It will no longer appear in the collective. Comments and verifications will be retained
            in the database.
          </p>
          <div className="dialog-actions">
            <button className="button button-outline" onClick={() => setConfirm(false)}>
              Keep it
            </button>
            <button className="button button-danger" disabled={busy} onClick={remove}>
              {busy ? 'Removing...' : 'Remove contribution'}
            </button>
          </div>
        </Modal>
      )}
    </DashboardLayout>
  );
}
function ArrowRightIcon() {
  return <ArrowUpRight size={15} />;
}
