import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowRight,
  CheckCircle2,
  BookOpen,
  CalendarDays,
  Coffee,
  Briefcase,
  Users,
  Info,
} from 'lucide-react';
import Modal from '../common/Modal';
import { useContribution } from '../../context/ContributionContext';
import { useData } from '../../context/DataContext';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../lib/api';
import { emptyContributionForm } from '../../lib/draftRescue';
import { useDraftRescue } from '../../hooks/useDraftRescue';
import { channelMeta } from '../../lib/content';
const categories = [
  ['Academics', BookOpen],
  ['Career', Briefcase],
  ['Communities', Users],
  ['Events', CalendarDays],
  ['Lifestyle', Coffee],
];
export default function ContributionModal() {
  const { isWizardOpen, closeWizard, wizardTarget } = useContribution();
  const { user, loading } = useAuth();
  const resolvedAccountId = loading ? null : (user?.id ?? null);
  return isWizardOpen ? (
    <ContributionForm
      key={`${resolvedAccountId ?? 'guest'}:${wizardTarget?.communitySlug || wizardTarget?.type || 'new'}`}
      accountId={resolvedAccountId}
      initialCategory={wizardTarget?.type}
      target={wizardTarget}
      onClose={closeWizard}
    />
  ) : null;
}
function ContributionForm({ initialCategory, accountId, target, onClose }) {
  const { user, refreshUser } = useAuth();
  const { refreshData } = useData();
  const navigate = useNavigate();
  const rescue = useDraftRescue(accountId);
  const blankForm = () => ({
    ...emptyContributionForm(initialCategory),
    communitySlug: target?.communitySlug || '',
    postKind: target?.kind || '',
  });
  const [form, setForm] = useState(blankForm);
  const [draftChoice, setDraftChoice] = useState(() => (rescue.draft ? 'pending' : 'ready'));
  const [draftMessage, setDraftMessage] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [fields, setFields] = useState({});
  const [success, setSuccess] = useState(null);
  const [newerDraftWaiting, setNewerDraftWaiting] = useState(false);
  const [draftCleanupFailed, setDraftCleanupFailed] = useState(false);
  const forumPost = !!(target?.forum || form.communitySlug);
  const groups = target?.communities || [];
  const draftPending = rescue.enabled && draftChoice === 'pending' && rescue.hasDraft;
  const draftEditingBlocked = draftPending || (rescue.enabled && busy);
  function changeForm(next) {
    if (draftEditingBlocked) return;
    setForm(next);
    if (rescue.enabled && rescue.save(next)) setDraftMessage('Draft kept on this device.');
  }
  const update = (e) => changeForm({ ...form, [e.target.name]: e.target.value });
  function restoreDraft() {
    if (!rescue.draft) return;
    const restored = { ...rescue.draft.form };
    if (target?.forum && !restored.communitySlug) {
      const fallback = channelMeta[restored.category]?.slug;
      restored.communitySlug =
        restored.category === 'Events' ? 'whats-happening' : fallback || 'campus';
    }
    setForm(restored);
    setDraftChoice('restored');
    setDraftMessage('Draft restored. Changes stay on this device.');
  }
  function discardDraft() {
    if (!rescue.clear()) return;
    setForm(blankForm());
    setDraftChoice('ready');
    setDraftMessage('');
    setError('');
    setFields({});
  }
  async function submit(e) {
    e.preventDefault();
    if (draftPending || busy) return;
    setBusy(true);
    setError('');
    setFields({});
    try {
      const body = Object.fromEntries(
        Object.entries(form).filter(
          ([key, value]) => value.trim() && (key !== 'linkUrl' || form.postKind === 'Link'),
        ),
      );
      const submittedDraft = rescue.draft;
      const data = await api('/nodes', { method: 'POST', body });
      // Publication has succeeded even if a later feed/profile refresh fails.
      // Clear now, so a refresh error cannot resurrect an already published draft.
      if (rescue.enabled) {
        const cleanup = rescue.clearIfUnchanged(submittedDraft);
        setNewerDraftWaiting(cleanup === 'changed');
        setDraftCleanupFailed(cleanup === 'failed');
      }
      setSuccess(data.data);
      await Promise.all([refreshData(), refreshUser()]);
    } catch (err) {
      setError(err.message);
      setFields(err.fields || {});
    } finally {
      setBusy(false);
    }
  }
  function field(name, label, type = 'text', required = false, placeholder = '') {
    return (
      <label className="form-field" key={name}>
        <span>
          {label}
          {required ? ' *' : ''}
        </span>
        <input
          name={name}
          value={form[name] || ''}
          type={type}
          required={required}
          disabled={draftEditingBlocked}
          onChange={update}
          placeholder={placeholder}
          maxLength={type === 'url' ? 2048 : 255}
          aria-invalid={!!fields[name]}
          autoFocus={name === 'imageUrl' && !!target?.image && !draftPending}
        />
        {fields[name] && <small className="field-error">{fields[name].join(' ')}</small>}
      </label>
    );
  }
  return (
    <Modal
      title={
        success
          ? 'A little knowledge, passed on.'
          : forumPost
            ? 'Create a post'
            : 'What do you know?'
      }
      onClose={busy ? () => {} : onClose}
      wide
      className={forumPost ? 'forum-dialog' : ''}
    >
      {!user ? (
        <div className="empty-state">
          <h3>Join the conversation.</h3>
          <p>Sign in to share a contribution with your campus.</p>
          <button
            className="button button-primary"
            onClick={() => {
              onClose();
              navigate('/login');
            }}
          >
            Sign in
            <ArrowRight size={16} />
          </button>
        </div>
      ) : success ? (
        <div className="contribution-success">
          <span>
            <CheckCircle2 size={40} />
          </span>
          <h3>Your insight is part of the collective.</h3>
          <p>
            Thanks for sharing what you know. You earned <strong>10 reputation points.</strong>
          </p>
          {newerDraftWaiting && <p role="status">A newer draft is still waiting in Campus Labs.</p>}
          {draftCleanupFailed && (
            <p role="status">
              Published successfully, but this device could not remove its saved draft. Clear it
              from Campus Labs when storage is available.
            </p>
          )}
          <button
            className="button button-primary"
            onClick={() => {
              onClose();
              navigate('/nodes/' + success.id);
            }}
          >
            View your contribution
            <ArrowRight size={16} />
          </button>
        </div>
      ) : (
        <form onSubmit={submit} className="contribution-form">
          {!forumPost && (
            <p className="muted">
              A practical guide, a hidden gem, or a lesson learned. Every perspective helps.
            </p>
          )}
          {rescue.enabled && (
            <div className="form-info" style={{ display: 'block' }} role="status">
              <p style={{ margin: 0 }}>
                {rescue.storageError ||
                  (draftPending
                    ? 'A draft is waiting on this device. Restore or discard it to continue.'
                    : rescue.hasDraft
                      ? draftMessage || 'Draft kept on this device.'
                      : 'Draft rescue is on. Your next edit stays on this device.')}
              </p>
              {rescue.hasDraft && (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 8 }}>
                  {draftPending && (
                    <button
                      type="button"
                      className="button button-outline"
                      disabled={busy}
                      onClick={restoreDraft}
                    >
                      Restore draft
                    </button>
                  )}
                  <button
                    type="button"
                    className="button button-outline"
                    disabled={busy}
                    onClick={discardDraft}
                  >
                    Discard draft
                  </button>
                </div>
              )}
            </div>
          )}
          {forumPost ? (
            <div className="form-grid contribution-forum-fields">
              <label className="form-field">
                <span>Post in</span>
                <select
                  value={form.communitySlug || 'campus'}
                  disabled={draftEditingBlocked || !groups.length}
                  onChange={(event) => {
                    const group = groups.find((item) => item.slug === event.target.value);
                    if (group)
                      changeForm({
                        ...form,
                        communitySlug: group.slug,
                        category: group.default_category || 'Discussion',
                      });
                  }}
                >
                  {!groups.some((group) => group.slug === (form.communitySlug || 'campus')) && (
                    <option value={form.communitySlug || 'campus'}>
                      g/{form.communitySlug || 'campus'}
                    </option>
                  )}
                  {groups.map((group) => (
                    <option key={group.slug} value={group.slug}>
                      g/{group.slug}
                    </option>
                  ))}
                </select>
              </label>
              <label className="form-field">
                <span>Post type</span>
                <select
                  name="postKind"
                  value={form.postKind}
                  disabled={draftEditingBlocked}
                  onChange={update}
                >
                  <option value="">
                    {form.category === 'Events'
                      ? 'Event'
                      : form.category === 'Academics'
                        ? 'Guide'
                        : 'Discussion'}
                  </option>
                  <option value="Question">Question</option>
                  {form.category !== 'Academics' && <option value="Guide">Guide</option>}
                  {['Events', 'Academics'].includes(form.category) && (
                    <option value="Discussion">Discussion</option>
                  )}
                  <option value="Link">Link</option>
                </select>
              </label>
            </div>
          ) : (
            <div className="contribution-categories">
              {categories.map(([name, Icon]) => (
                <button
                  type="button"
                  key={name}
                  disabled={draftEditingBlocked}
                  aria-pressed={form.category === name}
                  className={form.category === name ? 'active' : ''}
                  onClick={() => changeForm({ ...form, category: name })}
                >
                  <Icon size={17} />
                  {name}
                </button>
              ))}
            </div>
          )}
          {field(
            'title',
            'Give it a clear title',
            'text',
            true,
            'Something useful, in a few words',
          )}
          <label className="form-field">
            <span>Share the details *</span>
            <textarea
              name="description"
              value={form.description}
              onChange={update}
              disabled={draftEditingBlocked}
              rows={5}
              minLength={15}
              maxLength={10000}
              required
              placeholder="What would you have liked to know? Include the details that make this useful."
              aria-invalid={!!fields.description}
            />
            <small className={fields.description ? 'field-error' : 'muted'}>
              {fields.description?.join(' ') ||
                form.description.length + ' / 10,000 characters · At least 15 characters'}
            </small>
          </label>
          {form.category === 'Academics' && (
            <div className="form-grid">
              {field('department', 'Department', 'text', false, 'CS, IT, Mechanical...')}
              {field('year', 'Study year', 'text', false, 'FY, SY, TY, Final Year')}
              {field('subject', 'Subject')}
            </div>
          )}
          {form.category === 'Events' && (
            <div className="form-grid">
              {field('eventDate', 'Event date', 'date', true)}
              {field('eventTime', 'Time', 'text', false, 'e.g. 4:00 PM')}
              {field('eventLocation', 'Venue')}
            </div>
          )}
          {form.category === 'Lifestyle' &&
            field(
              'location',
              'Where is it?',
              'text',
              false,
              'Building, floor, or nearest landmark',
            )}
          {form.category === 'Career' && (
            <>
              <div className="form-grid">
                {field('company', 'Organization')}
                {field('companyRole', 'Role or opportunity')}
              </div>
              {field('applyLink', 'Application URL', 'url', false, 'https://...')}
            </>
          )}
          {form.category === 'Communities' &&
            field(
              'nextMeeting',
              'When do you meet?',
              'text',
              false,
              'e.g. Fridays, 5 PM at the Student Center',
            )}
          {forumPost &&
            form.postKind === 'Link' &&
            field('linkUrl', 'Link URL', 'url', true, 'https://...')}
          {(forumPost || ['Events', 'Lifestyle'].includes(form.category)) &&
            field('imageUrl', 'Image URL (optional)', 'url', false, 'https://...')}
          <div className="form-info">
            <Info size={17} />
            <p>
              Published as <strong>{user.handle}</strong>. Share accurate details and respect
              others’ privacy. Students can verify your contribution.
            </p>
          </div>
          {error && (
            <div className="form-error" role="alert">
              {error}
              {fields.title && <p>{fields.title.join(' ')}</p>}
            </div>
          )}
          <div className="dialog-actions">
            <button
              type="button"
              className="button button-outline"
              disabled={busy}
              onClick={onClose}
            >
              Cancel
            </button>
            <button className="button button-primary" disabled={busy || draftPending}>
              {busy ? 'Publishing...' : forumPost ? 'Publish post' : 'Share with the collective'}
              <ArrowRight size={16} />
            </button>
          </div>
        </form>
      )}
    </Modal>
  );
}
