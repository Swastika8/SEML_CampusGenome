import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Joyride } from 'react-joyride';
import {
  HelpCircle,
  ArrowUpRight,
  Sparkles,
  Feather,
  Coffee,
  CalendarDays,
  Pin,
  Dna,
} from 'lucide-react';
import DashboardLayout from '../components/layout/DashboardLayout';
import CampusCapsule from '../components/dashboard/CampusCapsule';
import CampusFeed from '../components/dashboard/CampusFeed';
import Ticker from '../components/dashboard/Ticker';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import { useContribution } from '../context/ContributionContext';

export default function Dashboard() {
  const [runTour, setRunTour] = useState(false);
  const { theme } = useTheme();
  const { user } = useAuth();
  const { stats, users, health } = useData();
  const { openWizard } = useContribution();
  const navigate = useNavigate();
  const top = [...users]
    .sort(
      (a, b) =>
        (b.reputation_score ?? b.reputation ?? 0) - (a.reputation_score ?? a.reputation ?? 0),
    )
    .slice(0, 3);
  function compose(type = 'Academics') {
    if (user) openWizard({ type });
    else navigate('/login');
  }
  return (
    <DashboardLayout>
      <Joyride
        steps={[
          {
            target: '.tour-search',
            content:
              'Start your journey here. Search for courses, professors, or hidden campus spots.',
            skipBeacon: true,
          },
          {
            target: '.tour-theme-toggle',
            content: 'Switch between light and dark modes for late-night study sessions.',
          },
        ]}
        run={runTour}
        continuous
        options={{
          buttons: ['back', 'close', 'primary', 'skip'],
          primaryColor: '#D4AF37',
          backgroundColor: theme === 'dark' ? '#0B1120' : '#fff',
          textColor: theme === 'dark' ? '#F3F4F6' : '#111827',
          arrowColor: theme === 'dark' ? '#0B1120' : '#fff',
        }}
        onEvent={(data) => {
          if (['finished', 'skipped'].includes(data.status)) setRunTour(false);
        }}
      />
      <section className="common-room-hero">
        <div className="hero-stamp">
          <span />
          UNOFFICIAL. UNFILTERED. UNMISTAKABLY CAMPUS.
        </div>
        <div className="hero-copy">
          <h2>
            Every college has
            <br />
            hidden knowledge.
          </h2>
          <p>
            We're building its DNA. <span>You bring the lore.</span>
          </p>
          <div className="hero-footnote">
            <span>✦</span> The shortcuts, the chai spots, the “wish someone told me” stuff.
          </div>
        </div>
        <div className="hero-doodle" aria-hidden="true">
          <div className="doodle-orbit" />
          <span className="doodle-star star-one">✳</span>
          <span className="doodle-star star-two">✧</span>
          <div className="doodle-note">
            the syllabus
            <br />
            didn't cover
            <br />
            <em>this.</em>
            <svg viewBox="0 0 140 20">
              <path d="M4 12Q62 1 135 13M20 17Q79 8 118 16" />
            </svg>
          </div>
          <div className="doodle-seal">
            <Dna size={21} />
            <span>
              100%
              <br />
              STUDENT DNA
            </span>
          </div>
        </div>
      </section>
      <div className="common-room-grid">
        <div className="feed-column">
          <section className="post-composer" aria-label="Share campus lore">
            <span className="composer-avatar">
              {user?.name?.slice(0, 1) || <Feather size={19} />}
            </span>
            <button className="composer-prompt" onClick={() => compose()}>
              Know something the campus should?
            </button>
            <button
              className="composer-plus"
              onClick={() => compose()}
              aria-label="Create a campus post"
            >
              +
            </button>
            <div className="composer-options">
              <button onClick={() => compose('Academics')}>
                <Feather size={14} />
                Share a shortcut
              </button>
              <button onClick={() => compose('Events')}>
                <CalendarDays size={14} />
                Drop an event
              </button>
              <button onClick={() => compose('Lifestyle')}>
                <Coffee size={14} />
                Found a spot?
              </button>
            </div>
          </section>
          <CampusFeed />
        </div>
        <div className="campus-rail">
          <section className="rail-about">
            <div className="rail-cover">
              <span>g/campus</span>
              <Sparkles size={32} strokeWidth={1.2} />
            </div>
            <div className="rail-about-body">
              <div className="rail-kicker">
                <span className="status-dot" /> THE COMMON ROOM
              </div>
              <h3>
                For the plot.
                <br />
                <em>And the people.</em>
              </h3>
              <p>Your campus, as told by the people actually surviving it. Pull up a chair.</p>
              <div className="rail-stats">
                <span>
                  <strong>{stats.students ?? 0}</strong>campus humans
                </span>
                <span>
                  <strong>{stats.contributions ?? 0}</strong>bits of lore
                </span>
              </div>
              <small className="rail-status">
                {health?.mode === 'demo'
                  ? 'Sample campus · real interactions'
                  : 'Made by students, for students'}
              </small>
              <button className="button button-primary full-width" onClick={() => compose()}>
                Leave a little lore <ArrowUpRight size={15} />
              </button>
            </div>
          </section>
          <section className="rail-pinboard">
            <Pin size={19} />
            <span>PINNED BY THE COLLECTIVE</span>
            <h3>
              The good kind
              <br />
              of campus chaos.
            </h3>
            <ol>
              <li>Help a junior. Credit a senior.</li>
              <li>Check the intel before you pass it on.</li>
              <li>Keep the people behind the handles safe.</li>
            </ol>
            <div className="pinboard-scribble">kindness is a campus flex ↗</div>
          </section>
          <section className="rail-regulars">
            <div className="rail-title">
              <h3>Common room regulars</h3>
              <span>✦</span>
            </div>
            {top.map((person, index) => (
              <div className="regular-row" key={person.id}>
                <span className="regular-number">0{index + 1}</span>
                <span className="regular-avatar">{person.name?.slice(0, 1)}</span>
                <div>
                  <strong>{person.name}</strong>
                  <small>{person.handle}</small>
                </div>
                <span className="regular-score">
                  {person.reputation_score ?? person.reputation ?? 0}
                  <small>karma</small>
                </span>
              </div>
            ))}
            <p>Earned by sharing useful things.</p>
          </section>
          <Link to="/map" className="rail-map">
            <span>↝</span>
            <div>
              <small>TAKE THE SCENIC ROUTE</small>
              <strong>Get lost. Find a new spot.</strong>
            </div>
            <ArrowUpRight size={19} />
          </Link>
          <button
            className="tour-link"
            aria-label="Take a campus tour"
            onClick={() => setRunTour(true)}
          >
            <HelpCircle size={15} />
            New here? Take the two-stop tour.
          </button>
        </div>
      </div>
      <div className="curiosity-divider">
        <span>✳</span>
        <p>A rabbit hole, just for you.</p>
        <small>Curiosity looks good on you.</small>
      </div>
      <CampusCapsule />
      <div className="common-room-ticker">
        <Ticker />
      </div>
    </DashboardLayout>
  );
}
