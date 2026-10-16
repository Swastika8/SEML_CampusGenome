import { useEffect, useState } from 'react';
import { Flame, Clock3, ArrowUp, ArrowDown, RefreshCw, Sparkles } from 'lucide-react';
import { api } from '../../lib/api';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import ThreadCard from '../common/ThreadCard';
import { channelMeta } from '../../lib/content';

const sorts = [
  ['trending', 'Buzzing', Flame],
  ['recent', 'Fresh', Clock3],
  ['top_verified', 'Most helpful', ArrowUp],
];
export default function CampusFeed() {
  const { token } = useAuth();
  const { nodes } = useData();
  const [sort, setSort] = useState('trending');
  const [category, setCategory] = useState('');
  const [page, setPage] = useState(1);
  const [result, setResult] = useState({ data: [], pagination: { total: 0, totalPages: 0 } });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [retry, setRetry] = useState(0);
  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    const query = new URLSearchParams({ sort, page, limit: 8 });
    if (category) query.set('category', category);
    api('/nodes?' + query, { token, signal: controller.signal })
      .then((data) => {
        if (controller.signal.aborted) return;
        setResult(data);
        setError('');
      })
      .catch((error) => {
        if (error.name !== 'AbortError') setError(error.message);
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });
    return () => controller.abort();
  }, [sort, category, page, token, nodes, retry]);
  return (
    <section className="campus-feed" aria-label="Campus conversation feed">
      <div className="feed-section-label">
        <span>
          <Sparkles size={14} /> THE CAMPUS COMMON ROOM
        </span>
        <small>{result.pagination.total} strands of student lore</small>
      </div>
      <div className="feed-channels" aria-label="Feed channels">
        <button
          className={!category ? 'active' : ''}
          aria-pressed={!category}
          onClick={() => {
            setCategory('');
            setPage(1);
          }}
        >
          All campus
        </button>
        {Object.entries(channelMeta).map(([name, channel]) => (
          <button
            key={name}
            aria-pressed={category === name}
            className={category === name ? 'active' : ''}
            onClick={() => {
              setCategory(name);
              setPage(1);
            }}
          >
            <span aria-hidden="true">{channel.mark}</span>
            {channel.feedLabel}
          </button>
        ))}
      </div>
      <div className="feed-sort" aria-label="Sort campus feed">
        {sorts.map(([value, label, Icon]) => (
          <button
            key={value}
            aria-pressed={sort === value}
            className={sort === value ? 'active' : ''}
            onClick={() => {
              setSort(value);
              setPage(1);
            }}
          >
            <Icon size={15} />
            {label}
          </button>
        ))}
        <span>Good intel travels.</span>
      </div>
      {error ? (
        <div className="feed-empty">
          <h3>The common room went quiet.</h3>
          <p>{error}</p>
          <button className="button button-outline" onClick={() => setRetry((r) => r + 1)}>
            <RefreshCw size={15} />
            Try again
          </button>
        </div>
      ) : (
        <div className="thread-list" aria-busy={loading}>
          {loading && !result.data.length
            ? [1, 2, 3].map((n) => <div className="thread-skeleton" key={n} />)
            : result.data.map((node) => <ThreadCard key={node.id} node={node} />)}
          {!loading && !result.data.length && (
            <div className="feed-empty">
              <Sparkles size={26} />
              <h3>First one here gets the good seat.</h3>
              <p>Share the first bit of lore in this channel.</p>
            </div>
          )}
        </div>
      )}
      {result.pagination.totalPages > 1 && (
        <nav className="feed-pagination" aria-label="Feed pagination">
          <button disabled={page <= 1 || loading} onClick={() => setPage((p) => p - 1)}>
            Previous
          </button>
          <span>
            Page {page} of {result.pagination.totalPages}
          </span>
          <button
            disabled={page >= result.pagination.totalPages || loading}
            onClick={() => setPage((p) => p + 1)}
          >
            More campus lore <ArrowDown size={14} />
          </button>
        </nav>
      )}
    </section>
  );
}
