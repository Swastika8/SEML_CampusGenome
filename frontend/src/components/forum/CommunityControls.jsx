import { useState } from 'react';
import {
  BookOpen,
  BriefcaseBusiness,
  CalendarDays,
  Check,
  Coffee,
  Dna,
  Plus,
  Users,
  MessageCircle,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { api } from '../../lib/api';
import Modal from '../common/Modal';
import { communityTone, useForum } from './forumData';

const symbols = {
  Academics: BookOpen,
  Career: BriefcaseBusiness,
  Communities: Users,
  Discussion: Dna,
  Events: CalendarDays,
  Lifestyle: Coffee,
};

export function CommunityAvatar({ community, size = 18 }) {
  const Icon = symbols[community?.default_category] || MessageCircle;
  return (
    <span className={'forum-avatar tone-' + communityTone(community)} aria-hidden="true">
      <Icon size={size} strokeWidth={2} />
    </span>
  );
}

export function JoinCommunity({ community, onChange }) {
  const { user, token, loading } = useAuth();
  const { requireSignIn, refresh } = useForum();
  const notify = useToast();
  const [busy, setBusy] = useState(false);
  async function toggle() {
    if (!user) return requireSignIn();
    setBusy(true);
    try {
      const { data } = await api('/forum/communities/' + community.slug + '/membership', {
        method: community.is_joined ? 'DELETE' : 'PUT',
        token,
      });
      onChange?.(data);
      refresh();
      notify(data.is_joined ? `Joined g/${data.slug}.` : `Left g/${data.slug}.`);
    } catch (error) {
      notify(error.message, 'error');
    } finally {
      setBusy(false);
    }
  }
  return (
    <button
      type="button"
      className={'forum-button forum-join' + (community.is_joined ? ' joined' : '')}
      aria-label={(community.is_joined ? 'Leave ' : 'Join ') + 'g/' + community.slug}
      aria-pressed={community.is_joined}
      disabled={loading || busy}
      onClick={toggle}
    >
      {community.is_joined ? (
        <>
          <Check size={15} />
          Joined
        </>
      ) : (
        <>
          <Plus size={15} />
          Join
        </>
      )}
    </button>
  );
}

const slugFrom = (value) =>
  value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 40)
    .replace(/-$/, '');

export function CreateCommunity({ onClose, onCreate }) {
  const { token } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', slug: '', campus: '', description: '' });
  const [customSlug, setCustomSlug] = useState(false);
  const [fields, setFields] = useState({});
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const change = (event) => {
    const { name, value } = event.target;
    if (name === 'slug') setCustomSlug(true);
    setForm((current) => ({
      ...current,
      [name]: value,
      ...(name === 'name' && !customSlug ? { slug: slugFrom(value) } : {}),
    }));
  };
  async function submit(event) {
    event.preventDefault();
    setBusy(true);
    setError('');
    setFields({});
    try {
      const { data } = await api('/forum/communities', { method: 'POST', body: form, token });
      onCreate(data);
      onClose();
      navigate('/c/' + data.slug);
    } catch (err) {
      setError(err.message);
      setFields(err.fields || {});
    } finally {
      setBusy(false);
    }
  }
  function field(name, label, options) {
    return (
      <label className="forum-field" key={name}>
        <span>{label}</span>
        <input
          name={name}
          value={form[name]}
          onChange={change}
          required
          disabled={busy}
          aria-invalid={!!fields[name]}
          {...options}
        />
        {fields[name] && <small>{fields[name].join(' ')}</small>}
      </label>
    );
  }
  return (
    <Modal
      title="Create a community"
      onClose={() => {
        if (!busy) onClose();
      }}
      className="forum-dialog"
    >
      <form className="forum-form" onSubmit={submit}>
        <p>
          Start a public space for your university, a club, or a topic. You’ll moderate posts in
          this community.
        </p>
        {field('name', 'Community name', {
          minLength: 3,
          maxLength: 60,
          placeholder: 'Robotics Club',
        })}
        {field('slug', 'Community address', {
          minLength: 3,
          maxLength: 40,
          pattern: '[a-z0-9]+(?:\\x2D[a-z0-9]+)*',
          placeholder: 'pccoe-robotics',
        })}
        <p className="forum-address">
          {form.slug ? 'g/' + form.slug : 'Use lowercase letters, numbers, and hyphens.'}
        </p>
        {field('campus', 'University or campus', {
          minLength: 2,
          maxLength: 100,
          placeholder: 'PCCOE',
        })}
        <label className="forum-field">
          <span>Description</span>
          <textarea
            name="description"
            rows={3}
            required
            minLength={12}
            maxLength={500}
            value={form.description}
            onChange={change}
            disabled={busy}
            aria-invalid={!!fields.description}
          />
          {fields.description && <small>{fields.description.join(' ')}</small>}
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
          <button className="forum-button forum-primary" disabled={busy}>
            {busy ? 'Creating…' : 'Create community'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
