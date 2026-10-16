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
const categories = [
  ['Academics', BookOpen],
  ['Career', Briefcase],
  ['Communities', Users],
  ['Events', CalendarDays],
  ['Lifestyle', Coffee],
];
export default function ContributionModal() {
  const { isWizardOpen, closeWizard, wizardTarget } = useContribution();
  return isWizardOpen ? (
    <ContributionForm
      key={wizardTarget?.type || 'new'}
      initialCategory={wizardTarget?.type}
      onClose={closeWizard}
    />
  ) : null;
}
function ContributionForm({ initialCategory, onClose }) {
  const { user, refreshUser } = useAuth();
  const { refreshData } = useData();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    category: initialCategory || 'Academics',
    title: '',
    description: '',
    department: '',
    year: '',
    subject: '',
    eventDate: '',
    eventTime: '',
    eventLocation: '',
    location: '',
    company: '',
    companyRole: '',
    applyLink: '',
    imageUrl: '',
    nextMeeting: '',
  });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [fields, setFields] = useState({});
  const [success, setSuccess] = useState(null);
  const update = (e) => setForm({ ...form, [e.target.name]: e.target.value });
  async function submit(e) {
    e.preventDefault();
    setBusy(true);
    setError('');
    setFields({});
    try {
      const body = Object.fromEntries(Object.entries(form).filter(([, v]) => v.trim() !== ''));
      const data = await api('/nodes', { method: 'POST', body });
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
          value={form[name]}
          type={type}
          required={required}
          onChange={update}
          placeholder={placeholder}
          maxLength={type === 'url' ? 2048 : 255}
          aria-invalid={!!fields[name]}
        />
        {fields[name] && <small className="field-error">{fields[name].join(' ')}</small>}
      </label>
    );
  }
  return (
    <Modal
      title={success ? 'A little knowledge, passed on.' : 'What do you know?'}
      onClose={busy ? () => {} : onClose}
      wide
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
          <p className="muted">
            A practical guide, a hidden gem, or a lesson learned. Every perspective helps.
          </p>
          <div className="contribution-categories">
            {categories.map(([name, Icon]) => (
              <button
                type="button"
                key={name}
                aria-pressed={form.category === name}
                className={form.category === name ? 'active' : ''}
                onClick={() => setForm({ ...form, category: name })}
              >
                <Icon size={17} />
                {name}
              </button>
            ))}
          </div>
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
          {['Events', 'Lifestyle'].includes(form.category) &&
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
            <button className="button button-primary" disabled={busy}>
              {busy ? 'Publishing...' : 'Share with the collective'}
              <ArrowRight size={16} />
            </button>
          </div>
        </form>
      )}
    </Modal>
  );
}
