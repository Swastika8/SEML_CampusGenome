import { useEffect, useRef, useState } from 'react';
import '../campus-labs.css';
import { Link } from 'react-router-dom';
import {
  ArrowLeft,
  ArrowUpRight,
  Beaker,
  CalendarDays,
  Check,
  Download,
  Feather,
  LockKeyhole,
  Pause,
  Play,
  RotateCcw,
  Sparkles,
  Timer,
  Trash2,
} from 'lucide-react';
import DashboardLayout from '../components/layout/DashboardLayout';
import { useAuth } from '../context/AuthContext';
import { useContribution } from '../context/ContributionContext';
import { useDraftRescue } from '../hooks/useDraftRescue';
import { api } from '../lib/api';
import { getCalendarExport, pocketMarkdown, saveLabDownload } from '../lib/labExports';
import {
  focusStorageKey,
  formatFocusTime,
  loadFocusTimer,
  newFocusTimer,
  pauseFocusTimer,
  persistFocusTimer,
  remainingFocusMs,
  startFocusTimer,
} from '../lib/focusTimer';

function FocusNook({ owner }) {
  const [initial] = useState(() => loadFocusTimer(owner));
  const [timer, setTimer] = useState(initial.timer);
  const [now, setNow] = useState(Date.now);
  const [storageError, setStorageError] = useState(initial.error);
  useEffect(() => {
    const tick = () => {
      const time = Date.now();
      setNow(time);
      setTimer((current) =>
        current.status === 'running' && current.endAt <= time
          ? { ...current, status: 'complete', endAt: null, remainingMs: 0 }
          : current,
      );
    };
    const id = window.setInterval(tick, 1000);
    window.addEventListener('focus', tick);
    const synchronize = (event) => {
      if (event.key === focusStorageKey(owner) || event.key === null) {
        const stored = loadFocusTimer(owner);
        setTimer(stored.timer);
        setStorageError(stored.error);
        setNow(Date.now());
      }
    };
    window.addEventListener('storage', synchronize);
    return () => {
      clearInterval(id);
      window.removeEventListener('focus', tick);
      window.removeEventListener('storage', synchronize);
    };
  }, [owner]);
  useEffect(() => {
    setStorageError(persistFocusTimer(owner, timer));
  }, [owner, timer]);

  const remaining = remainingFocusMs(timer, now);
  const progress = Math.round((1 - remaining / (timer.durationMinutes * 60000)) * 100);
  const status =
    timer.status === 'running'
      ? 'Focus is running.'
      : timer.status === 'paused'
        ? 'Focus is paused.'
        : timer.status === 'complete'
          ? 'One small thing, done.'
          : 'One task. A little space to think.';
  return (
    <section className="labs-card labs-focus" aria-labelledby="focus-title">
      <div className="labs-card-top">
        <span className="labs-specimen">01 / THE QUIET EXPERIMENT</span>
        <Timer size={22} aria-hidden="true" />
      </div>
      <h2 id="focus-title">A little focus nook.</h2>
      <p>Pick one tiny task. Let the rest of the campus wait.</p>
      <label className="labs-goal">
        What are you working on?
        <input
          value={timer.goal}
          maxLength={120}
          placeholder="One chapter. One sketch. One small win."
          onChange={(event) => {
            const goal = event.target.value;
            setTimer((current) => ({ ...current, goal }));
          }}
        />
      </label>
      <div className="labs-presets" role="group" aria-label="Focus length">
        {[5, 25, 50].map((minutes) => (
          <button
            key={minutes}
            type="button"
            aria-pressed={timer.durationMinutes === minutes}
            disabled={timer.status === 'running'}
            onClick={() => setTimer(newFocusTimer(minutes, timer.goal))}
          >
            {minutes} min
          </button>
        ))}
      </div>
      <div className="labs-timer-wrap">
        <div className="labs-timer" style={{ '--focus-progress': `${progress}%` }}>
          <output role="timer" aria-label="Focus time remaining" aria-live="off">
            {formatFocusTime(remaining)}
          </output>
          <span>{timer.status === 'complete' ? 'a small victory' : 'a little breathing room'}</span>
        </div>
        <p className="labs-focus-status" role="status">
          {status}
        </p>
      </div>
      <div className="labs-actions">
        {timer.status === 'running' ? (
          <button
            type="button"
            className="button button-primary"
            onClick={() => {
              setNow(Date.now());
              setTimer(pauseFocusTimer(timer));
            }}
          >
            <Pause size={16} aria-hidden="true" />
            Pause focus
          </button>
        ) : (
          <button
            type="button"
            className="button button-primary"
            onClick={() => {
              const time = Date.now();
              setNow(time);
              setTimer(startFocusTimer(timer, time));
            }}
          >
            <Play size={16} aria-hidden="true" />
            {timer.status === 'paused'
              ? 'Resume focus'
              : timer.status === 'complete'
                ? 'Start another focus'
                : 'Start focus'}
          </button>
        )}
        <button
          type="button"
          className="button button-outline"
          onClick={() => {
            setNow(Date.now());
            setTimer(newFocusTimer(timer.durationMinutes, timer.goal));
          }}
        >
          <RotateCcw size={15} aria-hidden="true" />
          Reset focus
        </button>
      </div>
      {storageError && (
        <p role="alert" className="labs-error">
          {storageError}
        </p>
      )}
      <small className="labs-fine-print">
        Your session stays on this device, even after a reload. No points. No leaderboard. Just you,
        doing your thing.
      </small>
    </section>
  );
}

function DraftRescue({ user }) {
  const { openWizard } = useContribution();
  const { enabled, draft, hasDraft, updatedAt, storageError, toggleEnabled, clear } =
    useDraftRescue(user?.id ?? null);
  return (
    <section className="labs-card labs-drafts" aria-labelledby="draft-title">
      <div className="labs-card-top">
        <span className="labs-specimen">02 / SAVE THE SHOWER THOUGHT</span>
        <Feather size={22} aria-hidden="true" />
      </div>
      <h2 id="draft-title">Good thoughts wander.</h2>
      <p>Give unfinished contributions a soft place to land.</p>
      <label className="labs-toggle" htmlFor="draft-rescue">
        <span>
          <strong>Draft rescue</strong>
          <small>
            {enabled
              ? 'On. An unfinished contribution can stay in this browser.'
              : 'Off by default. Your contribution form works as usual.'}
          </small>
        </span>
        <input
          id="draft-rescue"
          type="checkbox"
          checked={enabled}
          disabled={!user}
          onChange={(event) => toggleEnabled(event.target.checked)}
        />
      </label>
      {!user && (
        <p className="labs-fine-print">Sign in to keep your drafts separate from other accounts.</p>
      )}
      {enabled && (
        <div className="labs-draft-preview">
          <span className="labs-dot-label">
            <span />
            {hasDraft ? 'A thought is waiting here' : 'Ready for your next idea'}
          </span>
          <h3>
            {hasDraft
              ? draft?.form?.title || 'An untitled little idea'
              : 'Nothing unfinished. Nice.'}
          </h3>
          {hasDraft && (
            <p>
              {draft?.form?.category}
              {updatedAt ? ` · Saved ${new Date(updatedAt).toLocaleString()}` : ''}
            </p>
          )}
          <div className="labs-actions">
            <button
              className="button button-primary"
              type="button"
              onClick={() => openWizard(hasDraft ? { type: draft?.form?.category } : undefined)}
            >
              {hasDraft ? 'Continue draft' : 'Start a contribution'}
              <ArrowUpRight size={16} aria-hidden="true" />
            </button>
            {hasDraft && (
              <button type="button" className="button button-outline" onClick={clear}>
                <Trash2 size={15} aria-hidden="true" />
                Delete draft
              </button>
            )}
          </div>
        </div>
      )}
      {storageError && (
        <p role="alert" className="labs-error">
          {storageError}
        </p>
      )}
      {user && storageError && !hasDraft && (
        <button type="button" className="button button-outline" onClick={clear}>
          <Trash2 size={15} aria-hidden="true" />
          Clear local draft data
        </button>
      )}
      <small className="labs-fine-print">
        Only saved on this device; never published automatically. Switching rescue off deletes its
        local draft. Avoid sensitive details on shared computers.
      </small>
    </section>
  );
}

function TakeawayDesk({ user, token }) {
  const [pending, setPending] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const controller = useRef(null);
  useEffect(
    () => () => {
      const active = controller.current;
      controller.current = null;
      active?.abort();
    },
    [],
  );
  async function download(kind) {
    if (!user || !token || pending) return;
    const request = new AbortController();
    controller.current = request;
    const timeout = window.setTimeout(() => request.abort(), 15000);
    setPending(kind);
    setMessage('');
    setError('');
    try {
      if (kind === 'calendar') {
        const result = await getCalendarExport(token, request.signal);
        if (request.signal.aborted) return;
        saveLabDownload(result.blob, 'campus-genome-rsvps.ics');
        setMessage(
          result.skipped
            ? `Calendar packed. ${result.skipped} RSVP${result.skipped === 1 ? '' : 's'} with unreadable dates could not be included.`
            : 'Your calendar is packed. Import the file in your calendar app.',
        );
      } else {
        const { data } = await api('/labs/pocket', { token, signal: request.signal });
        if (request.signal.aborted) return;
        if (!Array.isArray(data?.items) || typeof data.generatedAt !== 'string')
          throw new Error('Your pocket could not be packed. Please try again.');
        const json = kind === 'json';
        const body = json
          ? JSON.stringify(data, null, 2)
          : pocketMarkdown(data, window.location.origin);
        const blob = new Blob([body], {
          type: json ? 'application/json;charset=utf-8' : 'text/markdown;charset=utf-8',
        });
        saveLabDownload(blob, `campus-genome-pocket.${json ? 'json' : 'md'}`);
        setMessage(
          `Packed ${data.items.length} saved ${data.items.length === 1 ? 'find' : 'finds'}. Your download is ready.`,
        );
      }
    } catch (err) {
      if (!request.signal.aborted)
        setError(err.message || 'The download could not reach campus. Please try again.');
      else if (controller.current === request) setError('Packing took too long. Please try again.');
    } finally {
      clearTimeout(timeout);
      if (controller.current === request) {
        controller.current = null;
        setPending('');
      }
    }
  }
  return (
    <section className="labs-card labs-takeaway" aria-labelledby="takeaway-title">
      <div className="labs-card-top">
        <span className="labs-specimen">03 / FOR THE ROAD</span>
        <Download size={22} aria-hidden="true" />
      </div>
      <h2 id="takeaway-title">Pack a little campus.</h2>
      <p>Useful finds should travel with you. Download a private snapshot when you need one.</p>
      <div className="labs-download-row">
        <div>
          <h3>Your Pocket, to go</h3>
          <p>Readable Markdown notes or a JSON copy of your currently visible saved posts.</p>
        </div>
        <div className="labs-actions">
          <button
            type="button"
            className="button button-outline"
            disabled={!user || !!pending}
            onClick={() => download('markdown')}
          >
            {pending === 'markdown' ? 'Packing…' : 'Download Pocket notes'}
          </button>
          <button
            type="button"
            className="button button-outline"
            disabled={!user || !!pending}
            onClick={() => download('json')}
          >
            {pending === 'json' ? 'Packing…' : 'Download Pocket JSON'}
          </button>
        </div>
      </div>
      <div className="labs-download-row">
        <div>
          <h3>
            <CalendarDays size={17} aria-hidden="true" />
            Outside the timetable
          </h3>
          <p>
            All-day calendar entries for your visible RSVPs, past and future. Check each event for
            its confirmed time.
          </p>
        </div>
        <button
          type="button"
          className="button button-primary"
          disabled={!user || !!pending}
          onClick={() => download('calendar')}
        >
          <Download size={15} aria-hidden="true" />
          {pending === 'calendar' ? 'Packing…' : 'Download RSVP calendar'}
        </button>
      </div>
      {!user && (
        <Link to="/login" className="labs-sign-in">
          <LockKeyhole size={15} aria-hidden="true" />
          Sign in to try the Labs
          <ArrowUpRight size={16} aria-hidden="true" />
        </Link>
      )}
      {message && (
        <p role="status" className="labs-download-status">
          <Check size={17} aria-hidden="true" />
          {message}
        </p>
      )}
      {error && (
        <p role="alert" className="labs-error">
          {error}
        </p>
      )}
      <small className="labs-fine-print">
        Downloads are snapshots, not a live sync. Remove or update imported calendar entries when
        plans change. Files can contain personal notes; keep them somewhere safe.
      </small>
    </section>
  );
}

export default function LabsPage() {
  const { user, token, loading } = useAuth();
  const owner = user?.id ?? 'guest';
  return (
    <DashboardLayout>
      <div className="campus-labs">
        <Link to="/" className="labs-back">
          <ArrowLeft size={15} aria-hidden="true" />
          Back to the common room
        </Link>
        <header className="labs-hero">
          <div>
            <span className="labs-eyebrow">
              <Beaker size={15} aria-hidden="true" />
              CAMPUS LABS<span className="labs-beta">BETA</span>
            </span>
            <h1>
              Curiosity looks
              <br />
              good on you.
            </h1>
            <p>
              A few small experiments from the back of the notebook. Try what feels useful. Keep
              your campus, your way.
            </p>
          </div>
          <aside className="labs-sticky" aria-label="A note from the lab">
            <Sparkles size={23} aria-hidden="true" />
            <span>
              tiny tools.
              <br />
              big <em>“oh, nice.”</em>
            </span>
            <small>made for the in-between</small>
          </aside>
        </header>
        {loading ? (
          <p role="status" className="labs-loading">
            Finding your corner of the lab…
          </p>
        ) : (
          <div className="labs-grid" key={owner}>
            <FocusNook owner={owner} />
            <DraftRescue user={user} />
            <TakeawayDesk user={user} token={token} />
          </div>
        )}
        <p className="labs-colophon">
          <span>✳</span>Small experiments. No extra sign-up. Your usual campus pages are right where
          you left them.
        </p>
      </div>
    </DashboardLayout>
  );
}
