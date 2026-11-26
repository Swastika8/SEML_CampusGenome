import { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Compass, Plus, Search, Users } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { CommunityAvatar, JoinCommunity } from '../components/forum/CommunityControls';
import { ForumAside } from '../components/forum/ForumAside';
import { useForum, useForumRequest } from '../components/forum/forumData';
import { ForumNotice } from './ForumPage';

function DirectorySearch({ search, campus, onSearch }) {
  const [form, setForm] = useState({ search, campus });
  return (
    <form
      className="forum-directory-search"
      onSubmit={(event) => {
        event.preventDefault();
        onSearch(form);
      }}
    >
      <label className="forum-field">
        <span>Find a community</span>
        <input
          type="search"
          value={form.search}
          maxLength={100}
          placeholder="Name or topic"
          onChange={(event) => setForm({ ...form, search: event.target.value })}
        />
      </label>
      <label className="forum-field">
        <span>University or campus</span>
        <input
          value={form.campus}
          maxLength={100}
          placeholder="Any university"
          onChange={(event) => setForm({ ...form, campus: event.target.value })}
        />
      </label>
      <button className="forum-button" type="submit">
        <Search size={17} />
        Search
      </button>
    </form>
  );
}

export default function ForumDirectory() {
  const [params, setParams] = useSearchParams();
  const [retry, setRetry] = useState(0);
  const { user, token, loading: checkingSession } = useAuth();
  const { revision, startCommunity, requireSignIn } = useForum();
  const joined = params.get('joined') === 'true';
  const search = (params.get('q') || '').trim().slice(0, 100);
  const campus = (params.get('campus') || '').trim().slice(0, 100);
  const requested = Number(params.get('page'));
  const page = Number.isInteger(requested) && requested > 0 ? Math.min(10000, requested) : 1;
  const query = new URLSearchParams({
    search,
    campus,
    page: String(page),
    limit: '12',
    joined: String(joined),
  });
  const directory = useForumRequest(
    !checkingSession && (!joined || user) ? '/forum/communities?' + query : null,
    token,
    revision + retry,
  );
  const groups = directory.result?.data || [];

  function filter(values) {
    const next = new URLSearchParams(params);
    if (!Object.hasOwn(values, 'page')) next.delete('page');
    for (const [key, value] of Object.entries(values)) {
      if (value) next.set(key, String(value).trim());
      else next.delete(key);
    }
    setParams(next);
  }
  return (
    <div className="forum-columns">
      <div className="forum-stream">
        <div className="forum-simple-heading forum-directory-heading">
          <Compass size={25} />
          <h1>Communities</h1>
          <p>Find a space for your university, your club, or your latest obsession.</p>
          <button
            className="forum-button forum-primary"
            onClick={startCommunity}
            disabled={checkingSession}
          >
            <Plus size={17} /> Create community
          </button>
        </div>
        <DirectorySearch
          key={search + ':' + campus}
          search={search}
          campus={campus}
          onSearch={(value) => filter({ q: value.search, campus: value.campus })}
        />
        <div className="forum-feed-tabs" aria-label="Community filters">
          <button type="button" aria-pressed={!joined} onClick={() => filter({ joined: '' })}>
            All communities
          </button>
          <button type="button" aria-pressed={joined} onClick={() => filter({ joined: 'true' })}>
            Joined
          </button>
        </div>
        {checkingSession || (directory.loading && !directory.result) ? (
          <p className="forum-single-loading" role="status">
            Loading communities…
          </p>
        ) : joined && !user ? (
          <ForumNotice title="Find your people">
            <p>Sign in to see the communities you’ve joined.</p>
            <button className="forum-button forum-primary" onClick={requireSignIn}>
              Sign in
            </button>
          </ForumNotice>
        ) : directory.error ? (
          <ForumNotice title="Communities unavailable">
            <p role="alert">{directory.error}</p>
            <button className="forum-button" onClick={() => setRetry((count) => count + 1)}>
              Try again
            </button>
          </ForumNotice>
        ) : groups.length ? (
          <div className="forum-directory-list" aria-busy={directory.loading}>
            {groups.map((group) => (
              <article key={group.id} className="forum-directory-card">
                <CommunityAvatar community={group} size={22} />
                <div>
                  <h2>
                    <Link to={'/c/' + group.slug}>{group.name}</Link>
                  </h2>
                  <p className="forum-directory-slug">
                    g/{group.slug} · {group.campus}
                  </p>
                  <p>{group.description}</p>
                  <span>
                    <Users size={15} /> {group.member_count}{' '}
                    {group.member_count === 1 ? 'member' : 'members'}
                  </span>
                </div>
                <JoinCommunity community={group} />
              </article>
            ))}
          </div>
        ) : (
          <ForumNotice title={joined ? 'No joined communities here' : 'No matching communities'}>
            <p>
              {joined
                ? 'Browse the directory, then join a community to follow its posts.'
                : 'Try a different name or university, or start a new community.'}
            </p>
            <button
              className="forum-button"
              onClick={() => filter({ q: '', campus: '', joined: '' })}
            >
              Browse all
            </button>
          </ForumNotice>
        )}
        {(page > 1 || directory.result?.hasMore) && (
          <nav className="forum-pagination" aria-label="Community pages">
            <button
              className="forum-button"
              disabled={page === 1}
              onClick={() => filter({ page: page - 1 })}
            >
              <ArrowLeft size={15} /> Previous
            </button>
            <span>Page {page}</span>
            <button
              className="forum-button"
              disabled={!directory.result?.hasMore}
              onClick={() => filter({ page: page + 1 })}
            >
              Next <ArrowRight size={15} />
            </button>
          </nav>
        )}
      </div>
      <ForumAside />
    </div>
  );
}
