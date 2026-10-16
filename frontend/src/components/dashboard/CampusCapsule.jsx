import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Dna,
  Sparkles,
  Shuffle,
  ArrowUpRight,
  Bookmark,
  Check,
  CalendarDays,
  Feather,
  WandSparkles,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import { useToast } from '../../context/ToastContext';
import { api } from '../../lib/api';

export default function CampusCapsule() {
  const { nodes, loading, refreshData } = useData();
  const { user, refreshUser } = useAuth();
  const notify = useToast();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [offset, setOffset] = useState(0);
  const [burst, setBurst] = useState(0);
  const [busy, setBusy] = useState(false);
  useEffect(() => {
    if (user?.id) refreshUser();
  }, [user?.id, refreshUser]);
  const day = new Date().toLocaleDateString('en-CA');
  const seed = [...day].reduce((total, char) => total + char.charCodeAt(0), 0);
  const find = nodes.length ? nodes[(seed + offset) % nodes.length] : null;
  const quests = [
    {
      icon: Bookmark,
      title: 'Pocket a little wisdom',
      detail: 'Save a find for your future self.',
      done: (user?.saved_count || 0) > 0,
      path: '/explore',
    },
    {
      icon: CalendarDays,
      title: 'Say yes to a campus adventure',
      detail: 'RSVP to something outside the timetable.',
      done: (user?.rsvp_count || 0) > 0,
      path: '/events',
    },
    {
      icon: Feather,
      title: 'Leave a strand of your DNA',
      detail: 'Pass on something only you know.',
      done: (user?.contribution_count || 0) > 0,
      path: '/profile',
    },
  ];
  const completed = quests.filter((quest) => quest.done).length;
  function shuffle() {
    if (open && nodes.length > 1)
      setOffset((value) => value + 1 + Math.floor(Math.random() * (nodes.length - 1)));
    setOpen(true);
    setBurst((value) => value + 1);
  }
  async function pocket() {
    if (!user) {
      navigate('/login');
      return;
    }
    if (!find || busy) return;
    setBusy(true);
    try {
      await api('/nodes/' + find.id + '/bookmark', { method: find.is_saved ? 'DELETE' : 'PUT' });
      await Promise.all([refreshData(), refreshUser()]);
      if (!find.is_saved) setBurst((value) => value + 1);
      notify(
        find.is_saved
          ? 'This strand is back in the wild.'
          : 'A little wisdom, safely tucked in your pocket.',
      );
    } catch (error) {
      notify(error.message, 'error');
    } finally {
      setBusy(false);
    }
  }
  return (
    <section className="capsule-zone" aria-label="Campus curiosity lab">
      <div className="capsule-grid">
        <article className="dna-capsule">
          <Dna className="capsule-mark" size={104} strokeWidth={1} aria-hidden="true" />
          <div className="capsule-kicker">
            <WandSparkles size={15} /> A SMALL DOSE OF SERENDIPITY
          </div>
          <h2 className="capsule-title">What will your campus DNA reveal?</h2>
          <p className="capsule-intro">
            A hidden spot. A senior's shortcut. Your next tiny obsession.
            <br />
            There is a different strand waiting every day.
          </p>
          <div className="capsule-controls">
            <button
              className="button button-primary"
              disabled={loading || !find}
              onClick={shuffle}
              aria-expanded={open}
            >
              <Sparkles size={15} />
              {open ? 'Shuffle the DNA' : "Crack today's capsule"}
              {open && <Shuffle size={14} />}
            </button>
            <Link to="/saved" className="pocket-link">
              <Bookmark size={14} />
              My pocket
            </Link>
          </div>
          {open && find && (
            <div key={'find-' + find.id} className="capsule-reveal" aria-live="polite">
              <span className="capsule-label">A STRAND OF {find.category}</span>
              <h3>{find.title}</h3>
              <p>
                {find.description.length > 180
                  ? find.description.slice(0, 177) + '...'
                  : find.description}
              </p>
              <footer>
                <Link className="text-link" to={'/nodes/' + find.id}>
                  Follow this strand <ArrowUpRight size={15} />
                </Link>
                <button
                  className="pocket-link"
                  disabled={busy}
                  aria-label={(find.is_saved ? 'Unpocket ' : 'Pocket ') + find.title}
                  onClick={pocket}
                >
                  <Bookmark size={14} fill={find.is_saved ? 'currentColor' : 'none'} />
                  {busy ? 'One moment...' : find.is_saved ? 'In your pocket' : 'Pocket this find'}
                </button>
              </footer>
            </div>
          )}
          {burst > 0 && (
            <div key={'burst-' + burst} className="capsule-confetti" aria-hidden="true">
              {Array.from({ length: 18 }, (_, i) => (
                <i
                  key={i}
                  style={{
                    '--confetti-x': (i - 9) * 23 + 'px',
                    '--confetti-rotation': (i % 2 ? 1 : -1) * (180 + i * 32) + 'deg',
                    '--confetti-color': ['#d4af37', '#f8e6a2', '#a78bfa', '#7dd3fc'][i % 4],
                    animationDelay: (i % 4) * 0.035 + 's',
                  }}
                />
              ))}
            </div>
          )}
        </article>
        <article className="quest-card">
          <div className="capsule-kicker">
            <Dna size={15} /> OPTIONAL SIDE QUESTS
          </div>
          <h2 className="capsule-title">Main character. Campus edition.</h2>
          <p className="capsule-intro">
            No deadlines. No grades. Just a few good ways to leave your mark.
          </p>
          <div className="quest-list">
            {quests.map(({ icon: Icon, ...quest }) => (
              <Link
                key={quest.title}
                to={user ? quest.path : '/login'}
                className={'quest-row ' + (quest.done ? 'complete' : '')}
              >
                <span>{quest.done ? <Check size={16} /> : <Icon size={16} />}</span>
                <span>
                  <strong>{quest.title}</strong>
                  <small>{quest.detail}</small>
                </span>
                <ArrowUpRight size={13} />
              </Link>
            ))}
          </div>
          <div
            className="quest-progress"
            role="progressbar"
            aria-label="Completed campus side quests"
            aria-valuemin={0}
            aria-valuemax={3}
            aria-valuenow={completed}
          >
            <span style={{ width: (completed / 3) * 100 + '%' }} />
          </div>
          <div className="quest-footer">
            <span>{completed}/3 strands collected</span>
            <span>
              {completed === 3
                ? 'Your campus DNA is glowing.'
                : user
                  ? 'A little curiosity goes a long way.'
                  : 'Sign in to start collecting.'}
            </span>
          </div>
        </article>
      </div>
    </section>
  );
}
