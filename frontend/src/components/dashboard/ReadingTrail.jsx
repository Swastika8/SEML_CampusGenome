import { Link } from 'react-router-dom';
import { History, ArrowUpRight, Trash2 } from 'lucide-react';
import { useReadingTrail } from '../../context/ReadingTrailContext';
import { channelMeta } from '../../lib/content';
export default function ReadingTrail() {
  const { entries, clear } = useReadingTrail();
  return (
    <section className="reading-trail" aria-label="Recent rabbit holes">
      <div className="rail-title">
        <h3>
          <History size={14} />
          Recent rabbit holes
        </h3>
        {entries.length > 0 && (
          <button
            onClick={clear}
            aria-label="Clear reading trail"
            title="Clear this browser's reading trail"
          >
            <Trash2 size={13} />
          </button>
        )}
      </div>
      {entries.length ? (
        <div className="reading-trail-list">
          {entries.slice(0, 4).map((item) => (
            <Link key={item.id} to={'/nodes/' + item.id}>
              <span>{channelMeta[item.category]?.mark || '✧'}</span>
              <div>
                <small>g/{channelMeta[item.category]?.slug || 'campus'}</small>
                <strong>{item.title}</strong>
              </div>
              <ArrowUpRight size={13} />
            </Link>
          ))}
        </div>
      ) : (
        <p>
          Follow a strand. We'll keep your last few discoveries here so you can find your way back.
        </p>
      )}
      <small className="reading-trail-privacy">
        Only in this browser · separate for each account
      </small>
    </section>
  );
}
