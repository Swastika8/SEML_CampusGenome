import { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import {
  Search,
  SlidersHorizontal,
  Plus,
  Bookmark,
  ArrowLeft,
  ArrowRight,
  RefreshCw,
  MapPin,
  BookOpen,
} from 'lucide-react';
import DashboardLayout from '../components/layout/DashboardLayout';
import NodeCard from '../components/common/NodeCard';
import { api } from '../lib/api';
import { categoryMeta, channelMeta } from '../lib/content';
import { CAMPUS_DEPARTMENTS, CAMPUS_YEARS } from '../data/departments';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import { useContribution } from '../context/ContributionContext';
export default function ExplorePage({ category, saved = false }) {
  const [params, setParams] = useSearchParams();
  const { token, user } = useAuth();
  const { openWizard } = useContribution();
  const { buildings, courses } = useData();
  const q = params.get('q') || '';
  const department = params.get('department') || '';
  const year = params.get('year') || '';
  const sort = params.get('sort') || 'recent';
  const page = Math.max(1, Number(params.get('page')) || 1);
  const requestedCategory = params.get('category');
  const filter = Object.hasOwn(categoryMeta, requestedCategory) ? requestedCategory : 'All';
  const [result, setResult] = useState({ data: [], pagination: { total: 0, totalPages: 0 } });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [reload, setReload] = useState(0);
  useEffect(() => {
    if (saved && !user) {
      setLoading(false);
      return;
    }
    const controller = new AbortController();
    setLoading(true);
    const query = new URLSearchParams({ page, limit: 9, sort, search: q });
    if (department) query.set('department', department);
    if (year) query.set('year', year);
    if (category) query.set('category', category);
    else if (filter !== 'All') query.set('category', filter);
    if (saved) query.set('saved', 'true');
    const timer = setTimeout(
      () =>
        api('/nodes?' + query, { token, signal: controller.signal })
          .then((data) => {
            setResult(data);
            setError('');
          })
          .catch((e) => {
            if (e.name !== 'AbortError') setError(e.message);
          })
          .finally(() => {
            if (!controller.signal.aborted) setLoading(false);
          }),
      200,
    );
    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [category, saved, token, user, q, sort, page, filter, reload, department, year]);
  function update(key, value) {
    const next = new URLSearchParams(params);
    next.set(key, value);
    if (key !== 'page') next.delete('page');
    setParams(next, { replace: key === 'q' });
  }
  const activeCategory = category || (filter === 'All' ? null : filter);
  const meta = categoryMeta[activeCategory];
  const title = saved
    ? 'Your pocket universe.'
    : meta
      ? 'g/' + channelMeta[activeCategory].slug
      : 'Follow a different strand.';
  const description = saved
    ? 'A small universe of shortcuts, secrets, and stories you wanted to keep.'
    : meta?.description ||
      'Find student guides, new opportunities, and the best of life around campus.';
  const places =
    q && !category && !saved
      ? buildings.filter((b) =>
          (b.name + ' ' + b.description).toLowerCase().includes(q.toLowerCase()),
        )
      : [];
  const resources =
    q && !category && !saved
      ? courses.filter((c) => (c.name + ' ' + c.code).toLowerCase().includes(q.toLowerCase()))
      : [];
  return (
    <DashboardLayout>
      <div className="page-heading">
        <div className="eyebrow">{saved ? 'YOUR SPACE' : 'THE CAMPUS COLLECTIVE'}</div>
        <h1>{title}</h1>
        <p>{description}</p>
      </div>
      {saved && !user ? (
        <div className="empty-state panel">
          <Bookmark size={35} />
          <h2>A space for your favorites.</h2>
          <p>Sign in to save resources and build your own campus collection.</p>
          <Link className="button button-primary" to="/login">
            Sign in <ArrowRight size={16} />
          </Link>
        </div>
      ) : (
        <>
          <div className="explore-toolbar">
            <label className="inline-search">
              <Search size={17} />
              <input
                type="search"
                aria-label="Filter contributions"
                value={q}
                onChange={(e) => update('q', e.target.value)}
                placeholder={'Search ' + (category?.toLowerCase() || 'the collective') + '...'}
              />
            </label>
            <label className="sort-control">
              <SlidersHorizontal size={16} />
              <select
                aria-label="Sort contributions"
                value={sort}
                onChange={(e) => update('sort', e.target.value)}
              >
                <option value="recent">Recently added</option>
                <option value="trending">Trending</option>
                <option value="top_verified">Most verified</option>
                <option value="oldest">Oldest first</option>
              </select>
            </label>
          </div>
          {!category && (
            <div className="filter-chips" aria-label="Categories">
              {['All', ...Object.keys(categoryMeta)].map((item) => (
                <button
                  aria-pressed={filter === item}
                  key={item}
                  className={filter === item ? 'active' : ''}
                  onClick={() => {
                    update('category', item === 'All' ? '' : item);
                  }}
                >
                  {item === 'All' ? 'Everything' : item}
                </button>
              ))}
            </div>
          )}
          {(places.length > 0 || resources.length > 0) && (
            <div className="search-extras">
              {places.map((b) => (
                <Link to={'/map?building=' + b.id} key={b.id}>
                  <MapPin size={18} />
                  <div>
                    <strong>{b.name}</strong>
                    <small>Campus place</small>
                  </div>
                  <ArrowRight size={16} />
                </Link>
              ))}
              {resources.map((c) => (
                <div key={c.id}>
                  <BookOpen size={18} />
                  <div>
                    <strong>
                      {c.code} · {c.name}
                    </strong>
                    <small>{c.description}</small>
                  </div>
                </div>
              ))}
            </div>
          )}
          {activeCategory === 'Academics' && (
            <div className="academic-filters">
              <label>
                Department
                <select
                  aria-label="Filter by department"
                  value={department}
                  onChange={(e) => update('department', e.target.value)}
                >
                  <option value="">All departments</option>
                  {CAMPUS_DEPARTMENTS.map((d) => (
                    <option key={d.value} value={d.value}>
                      {d.label}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                Study year
                <select
                  aria-label="Filter by study year"
                  value={year}
                  onChange={(e) => update('year', e.target.value)}
                >
                  <option value="">All years</option>
                  {CAMPUS_YEARS.map((y) => (
                    <option key={y.value} value={y.value}>
                      {y.label}
                    </option>
                  ))}
                </select>
              </label>
            </div>
          )}
          <div className="results-summary">
            <span>
              {loading
                ? 'Finding campus knowledge...'
                : result.pagination.total +
                  ' ' +
                  (result.pagination.total === 1 ? 'contribution' : 'contributions') +
                  (q ? ' matching “' + q + '”' : ' to explore')}
            </span>
            {user && (
              <button
                className="text-link"
                onClick={() => openWizard({ type: category || 'Academics' })}
              >
                <Plus size={15} />
                Add a contribution
              </button>
            )}
          </div>
          {error ? (
            <div className="error-state panel">
              <h3>We couldn’t load the collective.</h3>
              <p>{error}</p>
              <button className="button button-outline" onClick={() => setReload((r) => r + 1)}>
                <RefreshCw size={16} />
                Try again
              </button>
            </div>
          ) : loading ? (
            <div className="explore-grid">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div className="skeleton-card" key={i} />
              ))}
            </div>
          ) : result.data.length ? (
            <div className="explore-grid">
              {result.data.map((node) => (
                <NodeCard
                  key={node.id}
                  node={node}
                  featured={['Events', 'Lifestyle'].includes(node.category)}
                  onChange={() => setReload((r) => r + 1)}
                />
              ))}
            </div>
          ) : (
            <div className="empty-state panel">
              <Search size={32} />
              <h2>{saved ? 'Your next great find belongs here.' : 'Nothing here just yet.'}</h2>
              <p>
                {saved
                  ? 'Tap the bookmark on any contribution to save it.'
                  : 'Try another search or be the first to share an insight.'}
              </p>
              <Link className="button button-outline" to="/explore">
                Explore the collective <ArrowRight size={16} />
              </Link>
            </div>
          )}
          {result.pagination.totalPages > 1 && (
            <nav className="pagination" aria-label="Results pagination">
              <button
                className="button button-outline"
                disabled={page <= 1}
                onClick={() => update('page', String(page - 1))}
              >
                <ArrowLeft size={15} />
                Previous
              </button>
              <span>
                Page {page} of {result.pagination.totalPages}
              </span>
              <button
                className="button button-outline"
                disabled={page >= result.pagination.totalPages}
                onClick={() => update('page', String(page + 1))}
              >
                Next
                <ArrowRight size={15} />
              </button>
            </nav>
          )}
        </>
      )}
    </DashboardLayout>
  );
}
