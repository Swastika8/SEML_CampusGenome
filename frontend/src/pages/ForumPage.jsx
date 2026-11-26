import { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import {
  ArrowLeft,
  ArrowRight,
  Bookmark,
  ChevronDown,
  Clock3,
  Dna,
  Flame,
  Image,
  Link2,
  MessageSquare,
  Plus,
  Search,
  TrendingUp,
  Users,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import { CommunityAvatar, JoinCommunity } from '../components/forum/CommunityControls';
import ForumPost from '../components/forum/ForumPost';
import { ForumAside } from '../components/forum/ForumAside';
import { communityTone, useForum, useForumRequest } from '../components/forum/forumData';

const sorts = [
  ['hot', 'Hot', Flame],
  ['recent', 'New', Clock3],
  ['top', 'Top', TrendingUp],
];
const categories = ['Academics', 'Career', 'Communities', 'Discussion', 'Events', 'Lifestyle'];
const validSorts = ['hot', 'recent', 'top', 'trending', 'top_verified', 'oldest'];

function StarterBanner({ demo }) {
  return (
    <section className="forum-welcome">
      <div className="forum-welcome-copy">
        <span className="forum-welcome-kicker">
          <span />
          {demo ? 'DEMO CAMPUS · SAMPLE POSTS' : 'THE UNOFFICIAL STUDENT FORUM'}
        </span>
        <h1>
          The Common Room<span>.</span>
        </h1>
        <p>Ask what you’re wondering. Share what you wish you knew sooner.</p>
      </div>
      <div className="forum-welcome-graphic" aria-hidden="true">
        <span className="welcome-orbit" />
        <span className="welcome-spark">✦</span>
        <span className="welcome-spark small">✧</span>
        <div className="welcome-sticker">
          <MessageSquare size={48} strokeWidth={1.65} />
          <span>
            <Dna size={22} strokeWidth={2.1} />
          </span>
        </div>
      </div>
    </section>
  );
}

function CommunityBanner({ community }) {
  const { startPost } = useForum();
  const { loading } = useAuth();
  return (
    <section className={'forum-community-heading tone-' + communityTone(community)}>
      <div className="forum-community-cover" aria-hidden="true">
        <span />
        <span />
        <span />
      </div>
      <div className="forum-community-title">
        <CommunityAvatar community={community} size={31} />
        <div>
          <p>
            g/{community.slug} ·{' '}
            <Link to={'/explore?' + new URLSearchParams({ campus: community.campus })}>
              {community.campus}
            </Link>
          </p>
          <h1>{community.name}</h1>
        </div>
        <div className="forum-community-buttons">
          <JoinCommunity community={community} />
          <button
            type="button"
            className="forum-button forum-primary"
            disabled={loading}
            onClick={() => startPost(community)}
          >
            <Plus size={17} />
            Create post
          </button>
        </div>
      </div>
      <p className="forum-community-blurb">{community.description}</p>
    </section>
  );
}

function ComposerPrompt({ community }) {
  const { startPost } = useForum();
  const { user, loading } = useAuth();
  return (
    <div className="forum-compose">
      <span className="forum-user-avatar" aria-hidden="true">
        {user?.name?.[0] || <Dna size={19} />}
      </span>
      <button
        type="button"
        className="forum-compose-field"
        disabled={loading}
        onClick={() => startPost(community)}
      >
        What’s on your mind?
      </button>
      <button
        type="button"
        className="forum-icon"
        disabled={loading}
        aria-label="Add an image by URL"
        onClick={() => startPost(community, { image: true })}
      >
        <Image size={19} />
      </button>
      <button
        type="button"
        className="forum-icon"
        disabled={loading}
        aria-label="Create a link post"
        onClick={() => startPost(community, { kind: 'Link' })}
      >
        <Link2 size={19} />
      </button>
    </div>
  );
}

function FeedPosts({ posts, saved, onRemoveSaved }) {
  const [updates, setUpdates] = useState({});
  return posts.map((post) => {
    const current = { ...post, ...updates[post.id] };
    if (saved && !current.is_saved) return null;
    return (
      <ForumPost
        key={post.id}
        post={current}
        onUpdate={(patch) => {
          setUpdates((previous) => ({
            ...previous,
            [post.id]: { ...previous[post.id], ...patch },
          }));
          if (saved && patch.is_saved === false) onRemoveSaved();
        }}
      />
    );
  });
}

function SearchMatches({ q, token }) {
  const { buildings } = useData();
  const communities = useForumRequest(
    q.length >= 2 ? '/forum/communities?' + new URLSearchParams({ search: q, limit: '4' }) : null,
    token,
  );
  const places =
    q.length >= 2
      ? buildings.filter((place) => place.name?.toLowerCase().includes(q.toLowerCase())).slice(0, 3)
      : [];
  const groups = communities.result?.data || [];
  if (!groups.length && !places.length) return null;
  return (
    <section className="forum-matches">
      <h2>Communities and places</h2>
      <div>
        {groups.map((community) => (
          <Link to={'/c/' + community.slug} key={community.id}>
            <CommunityAvatar community={community} size={15} />
            <span>
              g/{community.slug}
              <small>{community.campus}</small>
            </span>
          </Link>
        ))}
        {places.map((place) => (
          <Link to={'/map?building=' + encodeURIComponent(place.id)} key={place.id}>
            <Search size={16} />
            <span>
              {place.name}
              <small>Campus map</small>
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}

export function ForumNotice({ title, children }) {
  return (
    <div className="forum-notice">
      <div className="forum-notice-icon">
        <MessageSquare size={23} />
      </div>
      <h2>{title}</h2>
      {children}
    </div>
  );
}

export default function ForumPage({ mode = 'home' }) {
  const [params, setParams] = useSearchParams();
  const { user, token, loading: checkingSession } = useAuth();
  const { health } = useData();
  const { activeCommunity, activeQuery, revision, refresh, requireSignIn, startPost } = useForum();
  const [refreshIndex, setRefreshIndex] = useState(0);
  const following = mode === 'home' && params.get('feed') === 'following';
  const saved = mode === 'saved';
  const searching = mode === 'search';
  const community = mode === 'community' ? activeCommunity : null;
  const requiresAccount = saved || following;
  const q = searching ? (params.get('q') || '').trim().slice(0, 100) : '';
  const campus = searching ? (params.get('campus') || '').trim().slice(0, 100) : '';
  const category = categories.includes(params.get('category')) ? params.get('category') : '';
  const sort = validSorts.includes(params.get('sort'))
    ? params.get('sort')
    : saved || searching
      ? 'recent'
      : 'hot';
  const window = ['week', 'month'].includes(params.get('window')) ? params.get('window') : 'all';
  const number = Number(params.get('page'));
  const page = Number.isInteger(number) && number > 0 ? Math.min(number, 10000) : 1;
  const query = new URLSearchParams({ page: String(page), limit: '15', sort });
  if (community) query.set('community', community.slug);
  if (following) query.set('scope', 'following');
  if (saved) query.set('saved', 'true');
  if (q) query.set('search', q);
  if (campus) query.set('campus', campus);
  if (searching && category) query.set('category', category);
  if (searching && params.get('department'))
    query.set('department', params.get('department').slice(0, 100));
  if (searching && params.get('year')) query.set('year', params.get('year').slice(0, 50));
  if (sort === 'top' && window !== 'all') query.set('window', window);
  const requestPath =
    !checkingSession && (!requiresAccount || user) && (mode !== 'community' || community)
      ? '/nodes?' + query
      : null;
  const feed = useForumRequest(requestPath, token, revision + refreshIndex);
  const posts = feed.result?.data || [];
  const pages = feed.result?.pagination.totalPages || 0;

  function update(values) {
    const next = new URLSearchParams(params);
    if (!('page' in values)) next.delete('page');
    for (const [key, value] of Object.entries(values)) {
      if (!value) next.delete(key);
      else next.set(key, String(value));
    }
    setParams(next);
  }
  function step(next) {
    update({ page: next });
    document.getElementById('forum-feed-top')?.scrollIntoView({ block: 'start' });
  }

  if (mode === 'community' && !community) {
    if (activeQuery.loading)
      return (
        <div className="forum-single-loading" role="status">
          Opening community…
        </div>
      );
    return (
      <ForumNotice title="Community unavailable">
        <p>{activeQuery.error || 'This community could not be loaded.'}</p>
        <button className="forum-button" onClick={refresh}>
          Try again
        </button>
        <Link className="forum-button" to="/communities">
          Browse communities
        </Link>
      </ForumNotice>
    );
  }
  const title = saved
    ? 'Saved posts'
    : searching
      ? q
        ? 'Search results'
        : 'Explore posts'
      : following
        ? 'Following'
        : '';
  return (
    <div className="forum-columns">
      <div className="forum-stream">
        {mode === 'home' && !following && <StarterBanner demo={health?.mode === 'demo'} />}
        {community && <CommunityBanner community={community} />}
        {title && (
          <div className="forum-simple-heading">
            {saved ? (
              <Bookmark size={24} />
            ) : searching ? (
              <Search size={24} />
            ) : (
              <Users size={24} />
            )}
            <h1>{title}</h1>
            {q && <p>Posts matching “{q}”</p>}
            {campus && <p>University: {campus}</p>}
          </div>
        )}
        {mode === 'home' && (
          <nav className="forum-feed-tabs" aria-label="Feed selection">
            <Link aria-current={!following ? 'page' : undefined} to="/">
              All posts
            </Link>
            <Link aria-current={following ? 'page' : undefined} to="/?feed=following">
              Following
            </Link>
          </nav>
        )}
        {!saved && !searching && (!following || user) && (
          <ComposerPrompt community={community || undefined} />
        )}
        {searching && <SearchMatches q={q} token={token} />}
        <section className="forum-feed" id="forum-feed-top" aria-label="Campus conversation feed">
          {(!requiresAccount || user) && (
            <div className="forum-sort-row">
              <div className="forum-sort" role="group" aria-label="Sort posts">
                {sorts.map(([value, label, Icon]) => (
                  <button
                    type="button"
                    key={value}
                    aria-pressed={sort === value}
                    onClick={() => update({ sort: value, window: '' })}
                  >
                    <Icon size={17} />
                    {label}
                  </button>
                ))}
              </div>
              {sort === 'top' && (
                <label className="forum-inline-select">
                  <select
                    aria-label="Top post period"
                    value={window}
                    onChange={(event) => update({ window: event.target.value })}
                  >
                    <option value="all">All time</option>
                    <option value="week">Past week</option>
                    <option value="month">Past month</option>
                  </select>
                  <ChevronDown size={14} aria-hidden="true" />
                </label>
              )}
              {searching && (
                <label className="forum-inline-select">
                  <select
                    aria-label="Filter by topic"
                    value={category}
                    onChange={(event) => update({ category: event.target.value })}
                  >
                    <option value="">All topics</option>
                    {categories.map((value) => (
                      <option value={value} key={value}>
                        {value}
                      </option>
                    ))}
                  </select>
                  <ChevronDown size={14} aria-hidden="true" />
                </label>
              )}
            </div>
          )}
          {checkingSession ? (
            <div className="forum-feed-loading" role="status">
              Loading your feed…
            </div>
          ) : requiresAccount && !user ? (
            <ForumNotice title={saved ? 'Keep the good stuff' : 'Build your own feed'}>
              <p>
                Sign in to{' '}
                {saved ? 'see your saved posts' : 'follow conversations from communities you join'}.
              </p>
              <button className="forum-button forum-primary" onClick={requireSignIn}>
                Sign in
              </button>
            </ForumNotice>
          ) : feed.error ? (
            <ForumNotice title="Couldn’t load posts">
              <p role="alert">{feed.error}</p>
              <button
                className="forum-button"
                onClick={() => setRefreshIndex((current) => current + 1)}
              >
                Try again
              </button>
            </ForumNotice>
          ) : feed.loading && !feed.result ? (
            <div className="forum-feed-loading" role="status">
              Loading posts…
              <div className="forum-skeleton" />
              <div className="forum-skeleton" />
            </div>
          ) : !posts.length ? (
            <ForumNotice
              title={
                following
                  ? 'Your feed starts with a community'
                  : saved
                    ? 'No saved posts yet'
                    : q
                      ? 'No matching posts'
                      : 'No posts here yet'
              }
            >
              <p>
                {following
                  ? 'Join a few communities to see their conversations here.'
                  : saved
                    ? 'Save a post to find it again later.'
                    : q
                      ? 'Try a different search or choose another topic.'
                      : 'Start the conversation with a question or a useful tip.'}
              </p>
              {following ? (
                <Link className="forum-button forum-primary" to="/communities">
                  Find communities
                </Link>
              ) : saved ? (
                <Link className="forum-button" to="/">
                  Browse posts
                </Link>
              ) : (
                !q && (
                  <button
                    className="forum-button forum-primary"
                    onClick={() => startPost(community || undefined)}
                  >
                    Create first post
                  </button>
                )
              )}
              {page > 1 && (
                <button className="forum-button" onClick={() => step(page - 1)}>
                  Previous page
                </button>
              )}
            </ForumNotice>
          ) : (
            <>
              <div className="forum-posts" aria-busy={feed.loading}>
                <FeedPosts
                  key={
                    requestPath + ':' + (user?.id || 'guest') + ':' + revision + ':' + refreshIndex
                  }
                  posts={posts}
                  saved={saved}
                  onRemoveSaved={() => setRefreshIndex((current) => current + 1)}
                />
              </div>
              {(page > 1 || pages > 1) && (
                <nav className="forum-pagination" aria-label="Post pages">
                  <button
                    className="forum-button"
                    disabled={page === 1}
                    onClick={() => step(page - 1)}
                  >
                    <ArrowLeft size={15} /> Previous
                  </button>
                  <span>
                    Page {page} of {Math.max(page, pages)}
                  </span>
                  <button
                    className="forum-button"
                    disabled={page >= pages}
                    onClick={() => step(page + 1)}
                  >
                    Next <ArrowRight size={15} />
                  </button>
                </nav>
              )}
            </>
          )}
        </section>
      </div>
      <ForumAside community={community} />
    </div>
  );
}
