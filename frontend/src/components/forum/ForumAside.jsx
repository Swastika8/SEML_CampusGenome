import { Link } from 'react-router-dom';
import { ArrowUpRight, Dna, Map, ShieldCheck, Users } from 'lucide-react';
import { CommunityAvatar } from './CommunityControls';
import { useForum } from './forumData';

export function ForumAside({ community }) {
  const { popular } = useForum();
  return (
    <aside className="forum-aside" aria-label="Community information">
      {community ? (
        <section className="forum-aside-card forum-about">
          <div className="forum-aside-heading">
            <Users size={17} />
            <h2>About this community</h2>
          </div>
          <p>{community.description}</p>
          <dl className="forum-community-stats">
            <div>
              <dt>{community.member_count}</dt>
              <dd>Members</dd>
            </div>
            <div>
              <dt>{community.post_count ?? 0}</dt>
              <dd>Posts</dd>
            </div>
          </dl>
          {community.is_owner && (
            <Link className="forum-aside-link" to="/moderation">
              <ShieldCheck size={16} /> Review reported posts
            </Link>
          )}
        </section>
      ) : (
        <section className="forum-aside-card forum-about">
          <div className="forum-aside-heading">
            <Dna size={18} />
            <h2>About Campus Genome</h2>
          </div>
          <p>
            Student-run conversations about classes, clubs, and campus life. Find your people or
            start a community for your university.
          </p>
          <Link className="forum-aside-link" to="/communities">
            Explore communities <ArrowUpRight size={15} />
          </Link>
        </section>
      )}
      {!community && popular.length > 0 && (
        <section className="forum-aside-card">
          <div className="forum-aside-heading">
            <Users size={17} />
            <h2>Campus communities</h2>
          </div>
          <div className="forum-popular-list">
            {popular.slice(0, 4).map((group) => (
              <Link to={'/c/' + group.slug} key={group.id}>
                <CommunityAvatar community={group} />
                <span>
                  <strong>g/{group.slug}</strong>
                  <small>
                    {group.member_count} {group.member_count === 1 ? 'member' : 'members'}
                  </small>
                </span>
                <ArrowUpRight size={15} />
              </Link>
            ))}
          </div>
          <Link className="forum-aside-link" to="/communities">
            Browse all communities
          </Link>
        </section>
      )}
      <section className="forum-aside-card forum-rules">
        <div className="forum-aside-heading">
          <ShieldCheck size={18} />
          <h2>Community rules</h2>
        </div>
        <ul>
          <li>Respect the person behind the handle.</li>
          <li>Keep private information out of posts.</li>
          <li>Credit your sources and flag spam.</li>
        </ul>
      </section>
      <Link className="forum-aside-card forum-map-link" to="/map">
        <Map size={21} />
        <span>
          <strong>Find your way around</strong>
          <small>Open the PCCOE campus map</small>
        </span>
        <ArrowUpRight size={17} />
      </Link>
    </aside>
  );
}
