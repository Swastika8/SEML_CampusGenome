import { useState } from 'react';
import { Link } from 'react-router-dom';
import { X, Wifi, VolumeX, ChevronDown, Feather, Pin, ArrowUpRight } from 'lucide-react';
import { useData } from '../../context/DataContext';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { api } from '../../lib/api';

export default function InfoSidePanel({ buildingId, onClose }) {
  const { buildings, refreshData } = useData();
  const { user } = useAuth();
  const notify = useToast();
  const [activeTab, setActiveTab] = useState('lowdown');
  const [expanded, setExpanded] = useState('wifi');
  const [note, setNote] = useState('');
  const [busy, setBusy] = useState(false);
  const building = buildings.find((b) => b.id === buildingId);
  if (!building)
    return (
      <section className="place-panel">
        <h2>Uncharted territory.</h2>
        <p>Choose one of the marked campus places.</p>
        <button onClick={onClose}>Back to the map</button>
      </section>
    );
  const history = Array.isArray(building.details?.history) ? building.details.history : [];
  async function pinNote(e) {
    e.preventDefault();
    if (!note.trim() || busy) return;
    setBusy(true);
    try {
      await api('/buildings/' + building.id + '/history', {
        method: 'POST',
        body: { change: note.trim() },
      });
      setNote('');
      await refreshData();
      notify('Local lore, pinned for the next person.');
    } catch (error) {
      notify(error.message, 'error');
    } finally {
      setBusy(false);
    }
  }
  return (
    <section className="place-panel" aria-label={building.name + ' details'}>
      <header className="place-panel-header">
        <span className="place-eyebrow">CAMPUS INTEL / {building.category}</span>
        <button aria-label="Close place details" onClick={onClose}>
          <X size={18} />
        </button>
        <h2>{building.name}</h2>
        <p>{building.description}</p>
      </header>
      <div className="place-tabs" role="tablist" aria-label="Place information">
        <button
          id="lowdown-tab"
          role="tab"
          aria-selected={activeTab === 'lowdown'}
          aria-controls="place-info"
          onClick={() => setActiveTab('lowdown')}
        >
          The lowdown
        </button>
        <button
          id="notes-tab"
          role="tab"
          aria-selected={activeTab === 'notes'}
          aria-controls="place-info"
          onClick={() => setActiveTab('notes')}
        >
          Field notes <span>{history.length}</span>
        </button>
      </div>
      <div
        id="place-info"
        role="tabpanel"
        aria-labelledby={activeTab === 'lowdown' ? 'lowdown-tab' : 'notes-tab'}
        className="place-panel-body"
      >
        {activeTab === 'lowdown' ? (
          <>
            {[
              ['wifi', 'Wi-Fi worth finding', Wifi, building.details?.wifi],
              ['quiet', 'A little peace & quiet', VolumeX, building.details?.quietSpots],
            ].map(([id, title, Icon, text]) => (
              <div className="place-accordion" key={id}>
                <button
                  aria-expanded={expanded === id}
                  onClick={() => setExpanded(expanded === id ? null : id)}
                >
                  <Icon size={17} />
                  <span>{title}</span>
                  <ChevronDown size={16} className={expanded === id ? 'turned' : ''} />
                </button>
                {expanded === id && (
                  <div>
                    <p>{text || 'Still waiting for a student to share the intel.'}</p>
                    <small>From the campus field guide</small>
                  </div>
                )}
              </div>
            ))}
            <div className="place-lore-invite">
              <span>✧</span>
              <h3>
                Know this place
                <br />a little too well?
              </h3>
              <p>The tiny details are the good stuff. Leave one for the next person.</p>
              <button onClick={() => setActiveTab('notes')}>
                Add your local lore <ArrowUpRight size={14} />
              </button>
            </div>
          </>
        ) : (
          <>
            <p className="field-notes-intro">Little observations. Long-term campus memory.</p>
            {user ? (
              <form className="field-note-form" onSubmit={pinNote}>
                <label htmlFor="field-note">
                  <Feather size={14} />
                  Leave a field note
                </label>
                <textarea
                  id="field-note"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  maxLength={2000}
                  required
                  placeholder="A shortcut, an update, a tiny discovery..."
                />
                <div>
                  <span>{note.length}/2000</span>
                  <button disabled={busy || !note.trim()} type="submit">
                    <Pin size={13} />
                    {busy ? 'Pinning...' : 'Pin a field note'}
                  </button>
                </div>
              </form>
            ) : (
              <Link className="field-note-signin" to="/login">
                Sign in to leave some local lore <ArrowUpRight size={14} />
              </Link>
            )}
            <div className="field-notes-list">
              {history.length ? (
                [...history].reverse().map((entry, index) => (
                  <article key={index}>
                    <span className="field-note-dot" />
                    <div>
                      <p>{entry.change}</p>
                      <small>
                        {entry.author || 'Campus contributor'} · {entry.date || 'Earlier on campus'}
                      </small>
                    </div>
                  </article>
                ))
              ) : (
                <div className="field-notes-empty">This corner has room for its first story.</div>
              )}
            </div>
          </>
        )}
      </div>
    </section>
  );
}
