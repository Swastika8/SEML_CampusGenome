import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { Link, Outlet, useLocation, useMatch, useNavigate } from 'react-router-dom';
import {
  Beaker,
  BookOpen,
  Bookmark,
  CalendarDays,
  ChevronDown,
  Compass,
  Dna,
  Ellipsis,
  Home,
  LogOut,
  Map as MapIcon,
  Moon,
  Plus,
  Search,
  ShieldCheck,
  Sparkles,
  Sun,
  Users,
  UserRound,
  X,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { useContribution } from '../../context/ContributionContext';
import { useData } from '../../context/DataContext';
import { useToast } from '../../context/ToastContext';
import { CommunityAvatar, CreateCommunity } from './CommunityControls';
import { ForumContext, useForumRequest } from './forumData';

const feedLinks = [
  { path: '/', label: 'Home', icon: Home },
  { path: '/?feed=following', label: 'Following', icon: Users },
  { path: '/communities', label: 'Communities', icon: Compass },
  { path: '/saved', label: 'Saved posts', shortLabel: 'Saved', icon: Bookmark },
];
const campusLinks = [
  { path: '/map', label: 'Campus map', icon: MapIcon },
  { path: '/academics', label: 'Study guides', icon: BookOpen },
  { path: '/events', label: 'Campus events', icon: CalendarDays },
  { path: '/clubs', label: 'Club directory', icon: Users },
  { path: '/labs', label: 'Campus Labs', icon: Beaker },
];
const moderationLink = { path: '/moderation', label: 'Moderation', icon: ShieldCheck };
const commonRoom = {
  id: 'campus',
  slug: 'campus',
  name: 'The Common Room',
  default_category: 'Discussion',
};

function MenuLinks({ links, mobile = false, onNavigate }) {
  const location = useLocation();
  const following = new URLSearchParams(location.search).get('feed') === 'following';
  return links.map(({ path, label, shortLabel, icon: Icon }) => {
    const active =
      path === '/'
        ? location.pathname === '/' && !following
        : path === '/?feed=following'
          ? location.pathname === '/' && following
          : location.pathname === path;
    return (
      <Link
        className="forum-nav-link"
        aria-label={mobile && shortLabel ? label : undefined}
        aria-current={active ? 'page' : undefined}
        key={path}
        to={path}
        onClick={onNavigate}
      >
        <Icon size={19} aria-hidden="true" />
        <span>{mobile && shortLabel ? shortLabel : label}</span>
      </Link>
    );
  });
}

function MobileCampusTools({ canModerate }) {
  const menu = useRef(null);
  function close() {
    if (menu.current) menu.current.open = false;
  }
  return (
    <details
      className="forum-mobile-tools"
      ref={menu}
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) close();
      }}
      onKeyDown={(event) => {
        if (event.key === 'Escape' && menu.current.open) {
          close();
          menu.current.querySelector('summary').focus();
        }
      }}
    >
      <summary className="forum-nav-link" aria-label="Campus tools">
        <Ellipsis size={19} aria-hidden="true" />
        <span>Tools</span>
      </summary>
      <div className="forum-popover">
        <MenuLinks
          links={[
            ...campusLinks,
            { path: '/commons', label: 'Campus extras', icon: Sparkles },
            ...(canModerate ? [moderationLink] : []),
          ]}
          onNavigate={close}
        />
      </div>
    </details>
  );
}

function ForumSearch({ token, searchText }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { buildings } = useData();
  const [text, setText] = useState(searchText);
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const input = useRef(null);
  const area = useRef(null);
  const normalized = text.trim();
  useEffect(() => {
    const timer = setTimeout(() => setQuery(normalized), 220);
    return () => clearTimeout(timer);
  }, [normalized]);
  useEffect(() => {
    function shortcut(event) {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault();
        input.current?.focus();
        setOpen(true);
      }
      if (event.key === 'Escape') setOpen(false);
    }
    const outside = (event) => {
      if (!area.current?.contains(event.target)) setOpen(false);
    };
    document.addEventListener('keydown', shortcut);
    document.addEventListener('pointerdown', outside);
    return () => {
      document.removeEventListener('keydown', shortcut);
      document.removeEventListener('pointerdown', outside);
    };
  }, []);
  const searching = open && query.length >= 2;
  const posts = useForumRequest(
    searching ? '/nodes?' + new URLSearchParams({ search: query, limit: '4' }) : null,
    token,
  );
  const networks = useForumRequest(
    searching ? '/forum/communities?' + new URLSearchParams({ search: query, limit: '3' }) : null,
    token,
  );
  const places = searching
    ? buildings
        .filter((place) => place.name?.toLowerCase().includes(query.toLowerCase()))
        .slice(0, 2)
    : [];
  function submit(event) {
    event.preventDefault();
    setOpen(false);
    input.current?.blur();
    navigate('/explore' + (normalized ? '?' + new URLSearchParams({ q: normalized }) : ''));
  }
  return (
    <div className="forum-search" ref={area}>
      <form role="search" onSubmit={submit}>
        <Search size={19} aria-hidden="true" />
        <input
          ref={input}
          aria-label="Search campus knowledge"
          type="search"
          maxLength={100}
          value={text}
          onFocus={() => setOpen(true)}
          onChange={(event) => {
            setText(event.target.value);
            setOpen(true);
          }}
          placeholder="Search communities, posts, or campus spots"
        />
        {text ? (
          <button
            type="button"
            aria-label="Clear search"
            onClick={() => {
              setText('');
              input.current?.focus();
            }}
          >
            <X size={17} />
          </button>
        ) : (
          <kbd>Ctrl K</kbd>
        )}
      </form>
      {open && normalized.length >= 2 && (
        <div className="forum-search-results" aria-label="Campus search suggestions">
          {query !== normalized || posts.loading || networks.loading ? (
            <p role="status">Searching campus…</p>
          ) : (
            <>
              {(networks.result?.data || []).map((community) => (
                <Link to={'/c/' + community.slug} key={community.id} onClick={() => setOpen(false)}>
                  <CommunityAvatar community={community} size={15} />
                  <span>
                    <strong>g/{community.slug}</strong>
                    <small>{community.campus}</small>
                  </span>
                </Link>
              ))}
              {(posts.result?.data || []).map((post) => (
                <Link to={'/nodes/' + post.id} key={post.id} onClick={() => setOpen(false)}>
                  <BookOpen size={17} />
                  <span>
                    <strong>{post.title}</strong>
                    <small>g/{post.community_slug || 'campus'}</small>
                  </span>
                </Link>
              ))}
              {places.map((place) => (
                <Link
                  to={'/map?building=' + encodeURIComponent(place.id)}
                  key={place.id}
                  onClick={() => setOpen(false)}
                >
                  <MapIcon size={18} />
                  <span>
                    <strong>{place.name}</strong>
                    <small>Campus map</small>
                  </span>
                </Link>
              ))}
              {!posts.result?.data.length && !networks.result?.data.length && !places.length && (
                <p>{posts.error || networks.error || 'No suggestions. Try a different search.'}</p>
              )}
            </>
          )}
          <Link
            className="forum-search-all"
            to={'/explore?' + new URLSearchParams({ q: normalized })}
            onClick={() => setOpen(false)}
            aria-current={location.pathname === '/explore' ? 'page' : undefined}
          >
            <Search size={16} /> See all search results
          </Link>
        </div>
      )}
    </div>
  );
}

function AccountMenu({ signIn }) {
  const { user, logout, loading } = useAuth();
  const navigate = useNavigate();
  const menu = useRef(null);
  function close() {
    if (menu.current) menu.current.open = false;
  }
  useEffect(() => {
    const dismiss = (event) => {
      if (!menu.current?.contains(event.target)) close();
    };
    document.addEventListener('pointerdown', dismiss);
    return () => document.removeEventListener('pointerdown', dismiss);
  }, []);
  if (loading) return <span className="forum-account-placeholder" aria-hidden="true" />;
  if (!user)
    return (
      <button type="button" className="forum-button forum-signin" onClick={signIn}>
        Sign in
      </button>
    );
  return (
    <details
      ref={menu}
      className="forum-account"
      onKeyDown={(event) => {
        if (event.key === 'Escape' && menu.current.open) {
          close();
          menu.current.querySelector('summary').focus();
        }
      }}
    >
      <summary aria-label="Open account menu">
        <span className="forum-user-avatar">{user.name?.[0] || 'S'}</span>
        <ChevronDown size={14} aria-hidden="true" />
      </summary>
      <div className="forum-popover">
        <div className="forum-account-name">
          <strong>{user.name}</strong>
          <small>{user.handle}</small>
        </div>
        <Link onClick={close} to="/profile">
          <UserRound size={17} /> My profile
        </Link>
        <Link onClick={close} to="/labs">
          <Beaker size={17} /> Campus Labs
        </Link>
        <Link onClick={close} to="/map">
          <MapIcon size={17} /> Campus map
        </Link>
        <button
          type="button"
          onClick={() => {
            close();
            logout();
            navigate('/login');
          }}
        >
          <LogOut size={17} /> Log out
        </button>
      </div>
    </details>
  );
}

export default function ForumLayout() {
  const { user, token, loading: checkingSession } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { openWizard } = useContribution();
  const location = useLocation();
  const navigate = useNavigate();
  const notify = useToast();
  const slug = useMatch('/c/:slug')?.params.slug;
  const [revision, setRevision] = useState(0);
  const [createOpen, setCreateOpen] = useState(false);
  const refresh = () => setRevision((value) => value + 1);
  const popularQuery = useForumRequest('/forum/communities?limit=12', token, revision);
  const joinedQuery = useForumRequest(
    user ? '/forum/communities?joined=true&limit=50' : null,
    token,
    revision,
  );
  const activeQuery = useForumRequest(
    slug ? '/forum/communities/' + encodeURIComponent(slug) : null,
    token,
    revision,
  );
  const activeCommunity = activeQuery.result?.data;
  const popular = popularQuery.result?.data || [];
  const joined = joinedQuery.result?.data || [];
  const communities = [
    ...new Map(
      [commonRoom, ...popular, ...joined, ...(activeCommunity ? [activeCommunity] : [])].map(
        (item) => [item.slug, item],
      ),
    ).values(),
  ];
  const canModerate =
    ['admin', 'moderator'].includes(user?.role) ||
    activeCommunity?.is_owner ||
    joined.some((community) => community.is_owner);
  const requireSignIn = () => {
    if (checkingSession) return;
    navigate('/login', {
      state: { returnTo: location.pathname + location.search + location.hash },
    });
  };
  const startPost = (community = activeCommunity || commonRoom, preset = {}) => {
    if (checkingSession || (slug && !activeCommunity)) return;
    if (!user) return requireSignIn();
    openWizard({
      forum: true,
      communitySlug: community.slug,
      type: community.default_category || 'Discussion',
      communities,
      ...preset,
    });
  };
  const startCommunity = () => {
    if (checkingSession) return;
    if (user) setCreateOpen(true);
    else requireSignIn();
  };
  useLayoutEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);
  const searchText =
    location.pathname === '/explore' ? new URLSearchParams(location.search).get('q') || '' : '';
  return (
    <ForumContext.Provider
      value={{
        popular,
        joined,
        activeCommunity,
        activeQuery,
        revision,
        refresh,
        requireSignIn,
        startPost,
        startCommunity,
      }}
    >
      <div className="forum-shell">
        <a href="#main-content" className="skip-link">
          Skip to campus content
        </a>
        <header className="forum-topbar">
          <Link className="forum-brand" to="/" aria-label="Campus Genome home">
            <span className="forum-brand-mark">
              <Dna size={24} strokeWidth={2.25} aria-hidden="true" />
            </span>
            <span>
              Campus<span className="forum-brand-accent">Genome</span>
              <small>THE STUDENT FORUM</small>
            </span>
          </Link>
          <ForumSearch key={location.pathname + searchText} token={token} searchText={searchText} />
          <div className="forum-top-actions">
            <button
              type="button"
              className="forum-button forum-primary forum-header-create"
              onClick={() => startPost()}
              disabled={checkingSession || (!!slug && !activeCommunity)}
              aria-label="Create post"
            >
              <Plus size={19} /> <span>Create post</span>
            </button>
            <button
              type="button"
              className="forum-icon forum-theme"
              aria-label="Toggle Theme"
              onClick={toggleTheme}
              title={theme === 'dark' ? 'Use light theme' : 'Use dark theme'}
            >
              {theme === 'dark' ? <Sun size={19} /> : <Moon size={19} />}
            </button>
            <AccountMenu signIn={requireSignIn} />
          </div>
          <nav className="forum-mobile-nav" aria-label="Campus navigation">
            <MenuLinks links={feedLinks} mobile />
            <MobileCampusTools canModerate={canModerate} />
          </nav>
        </header>
        <div className="forum-frame">
          <aside className="forum-sidebar">
            <nav aria-label="Campus navigation">
              <MenuLinks links={feedLinks} />
              <div className="forum-nav-group">
                <h2>{joined.length ? 'YOUR COMMUNITIES' : 'STARTER COMMUNITIES'}</h2>
                {(joined.length ? joined.slice(0, 8) : popular.slice(0, 5)).map((community) => (
                  <Link
                    className="forum-nav-link forum-nav-community"
                    key={community.id}
                    to={'/c/' + community.slug}
                    aria-current={slug === community.slug ? 'page' : undefined}
                  >
                    <CommunityAvatar community={community} size={14} />
                    <span>g/{community.slug}</span>
                  </Link>
                ))}
                <button
                  type="button"
                  className="forum-nav-link forum-community-add"
                  disabled={checkingSession}
                  onClick={startCommunity}
                >
                  <Plus size={18} /> <span>Create community</span>
                </button>
              </div>
              <div className="forum-nav-group">
                <h2>CAMPUS TOOLS</h2>
                <MenuLinks links={campusLinks} />
                {canModerate && <MenuLinks links={[moderationLink]} />}
              </div>
            </nav>
            <Link to="/commons" className="forum-side-note">
              <strong>Campus extras</strong>
              <span>Daily polls and little discoveries</span>
            </Link>
          </aside>
          <main className="forum-main" id="main-content" tabIndex={-1}>
            <Outlet />
          </main>
        </div>
      </div>
      {user && createOpen && (
        <CreateCommunity
          onClose={() => setCreateOpen(false)}
          onCreate={() => {
            refresh();
            notify('Your community is ready.');
          }}
        />
      )}
    </ForumContext.Provider>
  );
}
