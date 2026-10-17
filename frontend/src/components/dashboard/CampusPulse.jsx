import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BarChart3, Check, RefreshCw } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { api } from '../../lib/api';
export default function CampusPulse() {
  const { user, token } = useAuth();
  const navigate = useNavigate();
  const notify = useToast();
  const [poll, setPoll] = useState(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [retry, setRetry] = useState(0);
  useEffect(() => {
    const controller = new AbortController();
    api('/pulse', { token, signal: controller.signal })
      .then((result) => {
        if (!controller.signal.aborted) {
          setPoll(result.data);
          setError('');
        }
      })
      .catch((error) => {
        if (error.name !== 'AbortError') setError(error.message);
      });
    return () => controller.abort();
  }, [token, retry]);
  async function vote(optionId) {
    if (!user) return navigate('/login');
    if (busy || !poll) return;
    setBusy(true);
    try {
      const result = await api('/pulse/vote', {
        method: optionId === null ? 'DELETE' : 'PUT',
        body: { pollDate: poll.date, ...(optionId === null ? {} : { optionId }) },
      });
      setPoll(result.data);
      notify(
        optionId === null
          ? 'Your vote is back in your pocket.'
          : 'One small vote. A little campus democracy.',
      );
    } catch (error) {
      notify(error.message, 'error');
      if (error.status === 409) setRetry((value) => value + 1);
    } finally {
      setBusy(false);
    }
  }
  return (
    <section className="campus-pulse" aria-label="Daily campus dilemma">
      <div className="rail-kicker">
        <BarChart3 size={14} />
        THE DAILY CAMPUS DILEMMA<span>✧</span>
      </div>
      {error ? (
        <div className="pulse-error">
          <p>{error}</p>
          <button onClick={() => setRetry((value) => value + 1)}>
            <RefreshCw size={13} />
            Try again
          </button>
        </div>
      ) : !poll ? (
        <p className="pulse-loading">Taking the campus temperature...</p>
      ) : (
        <>
          <h3>{poll.question}</h3>
          <div className="pulse-options" aria-label="Poll options">
            {poll.options.map((option) => {
              const percent = poll.totalVotes
                ? Math.round((option.votes / poll.totalVotes) * 100)
                : 0;
              return (
                <button
                  key={option.id}
                  onClick={() => vote(option.id)}
                  disabled={busy}
                  aria-pressed={poll.myVote === option.id}
                  aria-label={'Vote for ' + option.label}
                  style={{ '--vote-width': percent + '%' }}
                >
                  <span className="pulse-option-fill" aria-hidden="true" />
                  <span className="pulse-option-label">
                    {poll.myVote === option.id && <Check size={12} />}
                    {option.label}
                  </span>
                  <span className="pulse-percent">{percent}%</span>
                </button>
              );
            })}
          </div>
          <div className="pulse-totals" aria-live="polite">
            <span>
              {poll.totalVotes} {poll.totalVotes === 1 ? 'student has' : 'students have'} weighed in
            </span>
            {poll.myVote !== null && (
              <button disabled={busy} onClick={() => vote(null)}>
                Undo vote
              </button>
            )}
          </div>
          <p className="pulse-footnote">A new dilemma at midnight IST. Only totals are public.</p>
        </>
      )}
    </section>
  );
}
