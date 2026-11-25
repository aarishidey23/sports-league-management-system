import React, { useEffect, useRef, useState } from 'react';
import {
  DEFAULT_ACTIVITIES,
  DEFAULT_EVENTS,
  DEFAULT_PLAYERS,
  DEFAULT_SPORTS,
  DEMO_USER,
} from './data.js';

const VIEW_LABELS = {
  dashboard: 'Dashboard',
  sports: 'Sports catalog',
  events: 'Tournaments',
  myevents: 'My registrations',
  players: 'Player roster',
  profile: 'My profile',
};

const NAV_ITEMS = [
  { id: 'dashboard', label: 'Dashboard', icon: 'grid' },
  { id: 'sports', label: 'Sports Catalog', icon: 'trophy', badge: 'sports' },
  { id: 'events', label: 'Tournaments', icon: 'calendar' },
  { id: 'myevents', label: 'My Registrations', icon: 'ticket', badge: 'registrations' },
  { id: 'players', label: 'Player Roster', icon: 'players' },
  { id: 'profile', label: 'My Profile', icon: 'user' },
];

const COURT_IMAGES = import.meta.glob('../courts/*.svg', {
  eager: true,
  query: '?url',
  import: 'default',
});

const ICON_PATHS = {
  grid: ['M3 3h7v7H3z', 'M14 3h7v7h-7z', 'M3 14h7v7H3z', 'M14 14h7v7h-7z'],
  trophy: [
    'M7 3h10v5a5 5 0 0 1-10 0z',
    'M7 5H3v2a4 4 0 0 0 5 4',
    'M17 5h4v2a4 4 0 0 1-5 4',
    'M12 13v6',
    'M7 21h10',
  ],
  calendar: ['M3 6h18v15H3z', 'M3 10h18', 'M7 3v5', 'M17 3v5'],
  ticket: ['M4 4h16v17l-4-3-4 3-4-3-4 3z', 'M8 9h8', 'M8 13h6'],
  players: ['M15 8a4 4 0 1 1-8 0a4 4 0 0 1 8 0', 'M3 21v-2a8 8 0 0 1 16 0v2', 'M18 5q5 3 1 7'],
  user: ['M16 7a4 4 0 1 1-8 0a4 4 0 0 1 8 0', 'M4 21v-2a8 8 0 0 1 16 0v2z'],
  guide: ['M3 4q5-2 9 1 4-3 9-1v15q-5-1-9 2-4-3-9-2z', 'M12 5v16'],
  search: ['M10 4a6 6 0 1 0 0 12a6 6 0 0 0 0-12', 'm15 15 5 5'],
  bell: ['M5 16c2-2 2-4 2-7a5 5 0 0 1 10 0c0 3 0 5 2 7v1H5z', 'M10 20h4'],
  moon: ['M20.8 14A9 9 0 0 1 10 3.2 9 9 0 1 0 20.8 14Z'],
  close: ['M6 6l12 12', 'M18 6 6 18'],
};

function Icon({ name, size = 20 }) {
  return (
    <svg
      aria-hidden="true"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {ICON_PATHS[name].map((path) => (
        <path key={path} d={path} />
      ))}
    </svg>
  );
}

function initializeAppData() {
  const loadOrSeed = (key, value) => {
    const stored = localStorage.getItem(key);
    if (stored !== null) return JSON.parse(stored);
    localStorage.setItem(key, JSON.stringify(value));
    return value;
  };

  const users = loadOrSeed('ss_users', [DEMO_USER]);
  const events = loadOrSeed('ss_events', DEFAULT_EVENTS);
  const players = loadOrSeed('ss_players', DEFAULT_PLAYERS);
  const activities = loadOrSeed('ss_activities', DEFAULT_ACTIVITIES);

  if (!localStorage.getItem('ss_session_initialized')) {
    localStorage.setItem('ss_session_initialized', '1');
    localStorage.setItem('ss_active_user', JSON.stringify(DEMO_USER));
  }

  const activeUserValue =
    sessionStorage.getItem('ss_active_user') || localStorage.getItem('ss_active_user');

  return {
    users,
    events,
    players,
    activities,
    activeUser: activeUserValue ? JSON.parse(activeUserValue) : null,
  };
}

function kickoff(event) {
  return new Date(event.date.replace(/\s*•\s*/, ' '));
}

function registrationStatus(event, now = new Date()) {
  const deadline = new Date(event.deadline);
  deadline.setHours(23, 59, 59, 999);
  if (
    event.status?.toLowerCase() === 'closed' ||
    kickoff(event) <= now ||
    deadline < now
  ) {
    return 'Closed';
  }
  return event.registeredSlots >= event.totalSlots || event.status?.toLowerCase() === 'full'
    ? 'Full'
    : 'Open';
}

function spotsLabel(event) {
  const count = Math.max(0, event.totalSlots - event.registeredSlots);
  return `${count} ${count === 1 ? 'spot' : 'spots'} left`;
}

function courtImage(sportId) {
  return COURT_IMAGES[`../courts/${sportId}.svg`];
}

function StatusBadge({ event }) {
  const status = registrationStatus(event);
  return <span className={`fixture-status ${status.toLowerCase()}`}>{status}</span>;
}

function FixtureRow({ event, registered, catalog = false, onOpen, onRegister, onCancel }) {
  const date = kickoff(event);
  const status = registrationStatus(event);

  return (
    <article className="fixture-row">
      <time className="fixture-date" dateTime={date.toISOString()}>
        <span>{date.toLocaleString('en-US', { month: 'short' })}</span>
        <strong>{date.getDate()}</strong>
      </time>
      <div className="fixture-info">
        <span className="discipline">{event.sportName}</span>
        <h4>{event.title}</h4>
        <p>
          {event.venue} · {date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}
        </p>
        <p>
          Register by {event.deadline} · {spotsLabel(event)}
        </p>
        {catalog && (
          <progress
            value={event.registeredSlots}
            max={event.totalSlots}
            aria-label="Occupied slots"
          />
        )}
      </div>
      <div className="row-controls">
        <StatusBadge event={event} />
        <button className="btn btn-outline" onClick={() => onOpen(event.id)}>
          {registered ? 'My entry' : 'Details'}
        </button>
        {catalog && registered && (
          <button className="text-action" onClick={() => onCancel(event.id)}>
            Withdraw
          </button>
        )}
        {catalog && !registered && status === 'Open' && (
          <button className="btn btn-primary" onClick={() => onRegister(event.id)}>
            Register
          </button>
        )}
      </div>
    </article>
  );
}

function SectionHeading({ title, children, bottom = 12 }) {
  return (
    <div className="panel-header" style={{ border: 'none', marginBottom: bottom }}>
      <div>
        <h2>{title}</h2>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>{children}</p>
      </div>
    </div>
  );
}

function DashboardView({ user, events, players, activities, onNavigate, onOpen, onRegister, onCancel }) {
  const now = new Date();
  const upcoming = events
    .filter((event) => kickoff(event) >= now)
    .sort((a, b) => kickoff(a) - kickoff(b));
  const [nextEvent, ...remainingEvents] = upcoming;
  const registrations = user?.registeredEvents || [];

  return (
    <section id="view-dashboard" className="view-section active">
      <header className="dashboard-heading">
        <h1>Matchday dashboard</h1>
        <span>
          {now.toLocaleDateString('en-US', {
            weekday: 'short',
            month: 'short',
            day: 'numeric',
            year: 'numeric',
          })}
        </span>
      </header>

      <article className="fixture-hero" aria-label="Next fixture">
        {nextEvent ? (
          <>
            <div className="hero-content">
              <div className="fixture-kicker">
                NEXT FIXTURE <span /> {nextEvent.sportName}
              </div>
              <h2>{nextEvent.title}</h2>
              <div className="hero-meta">{nextEvent.venue}</div>
              <div className="mobile-match-date">
                {kickoff(nextEvent).toLocaleDateString('en-US', { weekday: 'long', month: 'short' })}{' '}
                {kickoff(nextEvent).getDate()} ·{' '}
                {kickoff(nextEvent).toLocaleTimeString('en-US', {
                  hour: 'numeric',
                  minute: '2-digit',
                })}
              </div>
              <div className="registration-line">
                <StatusBadge event={nextEvent} />
                <span>
                  Register by {nextEvent.deadline} · {spotsLabel(nextEvent)}
                </span>
              </div>
              <button className="btn btn-primary" onClick={() => onOpen(nextEvent.id)}>
                {registrations.includes(nextEvent.id)
                  ? 'View my registration'
                  : registrationStatus(nextEvent) === 'Open'
                    ? 'Details & register'
                    : 'Fixture details'}
              </button>
            </div>
            <div className="pitch-art" aria-hidden="true">
              <img src={courtImage(nextEvent.sportId)} alt="" />
            </div>
            <div className="ticket-date">
              <span>{kickoff(nextEvent).toLocaleDateString('en-US', { weekday: 'long' })}</span>
              <strong>{String(kickoff(nextEvent).getDate()).padStart(2, '0')}</strong>
              <b>
                {kickoff(nextEvent).toLocaleDateString('en-US', { month: 'short' })}{' '}
                {kickoff(nextEvent).getFullYear()}
              </b>
              <time>
                {kickoff(nextEvent).toLocaleTimeString('en-US', {
                  hour: 'numeric',
                  minute: '2-digit',
                })}
              </time>
            </div>
          </>
        ) : (
          <div className="hero-content">
            <div className="fixture-kicker">NEXT FIXTURE</div>
            <h2>No upcoming fixtures</h2>
            <p>The next scheduled event will appear here.</p>
            <button className="btn btn-primary" onClick={() => onNavigate('events')}>
              Browse tournaments
            </button>
          </div>
        )}
      </article>

      <div className="section-title">
        <h3>Club overview</h3>
      </div>
      <div className="stats-grid">
        <StatCard icon="trophy" tone="blue" value={DEFAULT_SPORTS.length} label="Sports disciplines" />
        <StatCard icon="calendar" tone="green" value={events.length} label="Active tournaments" />
        <StatCard
          icon="players"
          tone="purple"
          value={players.filter((player) => player.role === 'Player').length}
          label="Campus athletes"
        />
        <StatCard
          icon="ticket"
          tone="amber"
          value={registrations.length}
          label="My registrations"
        />
      </div>

      <div className="dash-columns">
        <div className="panel-card">
          <div className="panel-header">
            <h3>Upcoming fixtures</h3>
            <button className="btn btn-outline btn-sm" onClick={() => onNavigate('events')}>
              View all
            </button>
          </div>
          {remainingEvents.length ? (
            remainingEvents.map((event) => (
              <FixtureRow
                key={event.id}
                event={event}
                registered={registrations.includes(event.id)}
                onOpen={onOpen}
                onRegister={onRegister}
                onCancel={onCancel}
              />
            ))
          ) : (
            <p className="fixture-empty">No additional fixtures scheduled.</p>
          )}
        </div>

        <div>
          <div className="panel-card">
            <div className="panel-header">
              <h3>Quick actions</h3>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <button className="btn btn-outline" onClick={() => onNavigate('events')}>
                <Icon name="calendar" /> Browse tournaments
              </button>
              <button className="btn btn-outline" onClick={() => onNavigate('players')}>
                <Icon name="players" /> View player roster
              </button>
              <button className="btn btn-outline" onClick={() => onNavigate('profile')}>
                <Icon name="user" /> Edit sports interests
              </button>
            </div>
          </div>
          <div className="panel-card">
            <div className="panel-header">
              <h3>Club activity</h3>
            </div>
            <div className="activity-feed">
              {activities.slice(0, 4).map((activity, index) => (
                <div className="activity-item" key={`${activity.text}-${index}`}>
                  <div className="activity-dot" />
                  <div className="activity-content">
                    <p>{activity.text}</p>
                    <div className="activity-time">{activity.time}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function StatCard({ icon, tone, value, label }) {
  return (
    <div className="stat-card">
      <div className={`stat-icon ${tone}`}>
        <Icon name={icon} />
      </div>
      <div className="stat-info">
        <div className="stat-value">{value}</div>
        <div className="stat-label">{label}</div>
      </div>
    </div>
  );
}

function SportsView({ events, category, setCategory, search, setSearch, onFilterEvents }) {
  const categories = [
    ['all', 'All Disciplines'],
    ['Team', 'Team Sports'],
    ['Individual', 'Individual / Dual'],
    ['Outdoor', 'Outdoor'],
    ['Indoor', 'Indoor'],
  ];
  const filtered = DEFAULT_SPORTS.filter((sport) => {
    const matchesCategory =
      category === 'all' ||
      sport.category.toLowerCase() === category.toLowerCase() ||
      (category === 'Indoor' && sport.courtType.includes('Indoor')) ||
      (category === 'Outdoor' && sport.courtType.includes('Outdoor'));
    return matchesCategory && sport.name.toLowerCase().includes(search.trim().toLowerCase());
  });

  return (
    <section id="view-sports" className="view-section active">
      <SectionHeading title="Sports catalog">
        Browse our 6 flagship college sports disciplines, squad sizes, and active tournaments.
      </SectionHeading>
      <input
        className="form-input"
        id="sportSearch"
        type="search"
        placeholder="Search disciplines"
        aria-label="Search disciplines"
        value={search}
        onChange={(event) => setSearch(event.target.value)}
      />
      <div className="filter-bar">
        {categories.map(([value, label]) => (
          <button
            key={value}
            className={`filter-chip ${category === value ? 'active' : ''}`}
            onClick={() => setCategory(value)}
          >
            {label}
          </button>
        ))}
      </div>
      <div className="sports-grid">
        {filtered.map((sport) => (
          <article className="sport-card" key={sport.id}>
            <div className="sport-card-banner">
              <img src={courtImage(sport.id)} alt={`${sport.name} court`} />
            </div>
            <div className="sport-card-content">
              <h4>{sport.name}</h4>
              <span
                className="badge-pill"
                style={{
                  alignSelf: 'flex-start',
                  marginBottom: 8,
                  background: 'rgba(0,102,255,0.1)',
                  color: 'var(--electric-blue)',
                }}
              >
                {sport.category} Discipline
              </span>
              <p>{sport.description}</p>
              <div className="sport-meta-row">
                <span>
                  <strong>Team Size:</strong> {sport.playersPerTeam}
                </span>
                <span>
                  <strong>Venue:</strong> {sport.courtType}
                </span>
              </div>
              <button
                className="btn btn-outline btn-sm"
                style={{ marginTop: 14, width: '100%' }}
                onClick={() => onFilterEvents(sport.id)}
              >
                View tournaments ({events.filter((event) => event.sportId === sport.id).length})
              </button>
            </div>
          </article>
        ))}
      </div>
      {filtered.length === 0 && (
        <div className="empty-state">
          <div className="empty-icon">🏟️</div>
          <h3>No sports found</h3>
          <p>Try a different search or discipline filter.</p>
        </div>
      )}
    </section>
  );
}

function EventsView({ events, user, filter, setFilter, onOpen, onRegister, onCancel }) {
  const filteredEvents =
    filter === 'all' ? events : events.filter((event) => event.sportId === filter);
  const sortedEvents = [...filteredEvents].sort((a, b) => kickoff(a) - kickoff(b));

  return (
    <section id="view-events" className="view-section active">
      <SectionHeading title="Tournaments">
        Explore upcoming championships, view remaining participant slots, and reserve your place.
      </SectionHeading>
      <div className="filter-bar">
        <button
          className={`filter-chip ${filter === 'all' ? 'active' : ''}`}
          onClick={() => setFilter('all')}
        >
          All Events ({events.length})
        </button>
        {DEFAULT_SPORTS.map((sport) => (
          <button
            key={sport.id}
            className={`filter-chip ${filter === sport.id ? 'active' : ''}`}
            onClick={() => setFilter(sport.id)}
          >
            {sport.icon} {sport.name}
          </button>
        ))}
      </div>
      <div className="events-grid" id="eventsGridContainer">
        {sortedEvents.length ? (
          sortedEvents.map((event) => (
            <FixtureRow
              key={event.id}
              event={event}
              registered={(user?.registeredEvents || []).includes(event.id)}
              catalog
              onOpen={onOpen}
              onRegister={onRegister}
              onCancel={onCancel}
            />
          ))
        ) : (
          <div className="empty-state" style={{ gridColumn: '1 / -1' }}>
            <div className="empty-icon">🏆</div>
            <h3>No events found for this category</h3>
            <p>Check back soon or explore other sports disciplines.</p>
          </div>
        )}
      </div>
    </section>
  );
}

function RegistrationsView({ events, user, onNavigate, onOpen, onRegister, onCancel }) {
  const registeredIds = user?.registeredEvents || [];
  const registeredEvents = events
    .filter((event) => registeredIds.includes(event.id))
    .sort((a, b) => kickoff(a) - kickoff(b));

  return (
    <section id="view-myevents" className="view-section active">
      <SectionHeading title="My registrations" bottom={16}>
        Review your fixtures or withdraw from a tournament.
      </SectionHeading>
      {registeredEvents.length ? (
        <div className="registration-list">
          {registeredEvents.map((event) => (
            <FixtureRow
              key={event.id}
              event={event}
              registered
              catalog
              onOpen={onOpen}
              onRegister={onRegister}
              onCancel={onCancel}
            />
          ))}
        </div>
      ) : (
        <div className="panel-card empty-state">
          <div className="empty-icon">🎟️</div>
          <h3>No registrations yet</h3>
          <p style={{ maxWidth: 400, margin: '8px auto 16px' }}>
            You haven’t reserved a slot in any upcoming sports competitions yet.
          </p>
          <button className="btn btn-primary" onClick={() => onNavigate('events')}>
            Browse tournaments
          </button>
        </div>
      )}
    </section>
  );
}

function PlayersView({ players }) {
  const [query, setQuery] = useState('');
  const normalizedQuery = query.trim().toLowerCase();
  const visiblePlayers = players.filter(
    (player) =>
      player.name.toLowerCase().includes(normalizedQuery) ||
      player.email.toLowerCase().includes(normalizedQuery) ||
      (player.sports || []).some((sport) => sport.toLowerCase().includes(normalizedQuery)),
  );

  return (
    <section id="view-players" className="view-section active">
      <SectionHeading title="Player roster">
        Find players and coaches by name or sport.
      </SectionHeading>
      <div className="panel-card">
        <div
          style={{
            marginBottom: 16,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: 10,
          }}
        >
          <input
            type="search"
            placeholder="Filter players by name or sport..."
            className="form-control"
            style={{ maxWidth: 300 }}
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
          <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            Showing {visiblePlayers.length} athlete(s)
          </span>
        </div>
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Player Name</th>
                <th>Role</th>
                <th>Selected Sports</th>
                <th>Registered Events</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {visiblePlayers.map((player) => (
                <tr key={player.email}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div className="user-avatar" style={{ width: 32, height: 32, fontSize: '0.8rem' }}>
                        {player.name.charAt(0)}
                      </div>
                      <div>
                        <strong>{player.name}</strong>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                          {player.email}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <span
                      className="badge-pill"
                      style={{ background: 'rgba(0,102,255,0.1)', color: 'var(--electric-blue)' }}
                    >
                      {player.role}
                    </span>
                  </td>
                  <td>
                    {(player.sports || []).map((sport) => (
                      <span className="badge-pill" style={{ marginRight: 4 }} key={sport}>
                        {sport}
                      </span>
                    ))}
                  </td>
                  <td>
                    <strong>{player.eventsCount || 0}</strong> Tournaments
                  </td>
                  <td>
                    <span style={{ color: 'var(--accent-neon)', fontWeight: 600 }}>
                      ● {player.status || 'Active'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {visiblePlayers.length === 0 && <p className="fixture-empty">No players match your search.</p>}
        </div>
      </div>
    </section>
  );
}

function Sidebar({
  activeView,
  user,
  registrationCount,
  collapsed,
  mobileOpen,
  onNavigate,
  onGuide,
  onLogout,
}) {
  const sidebarClass = `sidebar${collapsed ? ' collapsed' : ''}${mobileOpen ? ' open-mobile' : ''}`;
  const initial = user?.name?.charAt(0).toUpperCase() || 'U';

  return (
    <aside className={sidebarClass} id="sidebar">
      <div className="sidebar-header">
        <div className="logo-icon">ϟ</div>
        <div className="logo-text">
          Sport<span>Sphere</span>
        </div>
      </div>
      <nav aria-label="Main navigation">
        <div className="side-label">Club workspace</div>
        <ul className="nav-list">
          {NAV_ITEMS.map((item) => {
            const badge =
              item.badge === 'sports'
                ? DEFAULT_SPORTS.length
                : item.badge === 'registrations'
                  ? registrationCount
                  : null;
            return (
              <li className="nav-item" key={item.id}>
                <button
                  className={`nav-link ${activeView === item.id ? 'active' : ''}`}
                  aria-label={item.label}
                  aria-current={activeView === item.id ? 'page' : undefined}
                  onClick={() => onNavigate(item.id)}
                >
                  <span className="nav-icon">
                    <Icon name={item.icon} />
                  </span>
                  <span className="nav-label">{item.label}</span>
                  {badge !== null && <span className="nav-badge">{badge}</span>}
                </button>
              </li>
            );
          })}
          <li
            className="nav-item"
            style={{
              marginTop: 15,
              borderTop: '1px solid rgba(255,255,255,0.08)',
              paddingTop: 10,
            }}
          >
            <button className="nav-link" aria-label="Project guide" onClick={onGuide}>
              <span className="nav-icon">
                <Icon name="guide" />
              </span>
              <span className="nav-label">Project guide</span>
            </button>
          </li>
        </ul>
      </nav>
      <div className="sidebar-footer">
        <div className="user-compact">
          <div className="user-avatar">{initial}</div>
          <div className="user-info-text">
            <div className="user-name-text">{user?.name || 'Guest'}</div>
            <div className="user-role-text">{user?.role || 'Visitor'}</div>
          </div>
        </div>
        <button
          className="btn btn-outline btn-sm"
          style={{ color: '#ef4444', borderColor: 'rgba(239, 68, 68, 0.3)' }}
          aria-label="Log out"
          onClick={onLogout}
        >
          <span className="sidebar-logout-icon" aria-hidden="true">
            ↪
          </span>
          <span className="sidebar-logout-label">Log out</span>
        </button>
      </div>
    </aside>
  );
}

function Topbar({
  user,
  activeView,
  theme,
  notificationsCount,
  search,
  setSearch,
  onToggleSidebar,
  onToggleTheme,
  onToggleNotifications,
  onNavigate,
  onSearchKeyDown,
}) {
  const firstName = user?.name?.split(' ')[0] || 'Guest';
  const initial = user?.name?.charAt(0).toUpperCase() || 'U';

  return (
    <header className="topbar">
      <div className="topbar-left">
        <button className="btn-icon" title="Toggle Sidebar" onClick={onToggleSidebar}>
          ☰
        </button>
        <strong id="screenTitle">{VIEW_LABELS[activeView]}</strong>
        <div className="search-box">
          <span className="search-icon">
            <Icon name="search" size={16} />
          </span>
          <input
            type="search"
            placeholder="Search sports or events..."
            aria-label="Search sports or events"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            onKeyDown={onSearchKeyDown}
          />
        </div>
      </div>
      <div className="topbar-right">
        <span className="demo-label">Academic demo · Simulated sign-in</span>
        <button
          className="btn-icon"
          title="Switch Theme"
          aria-label="Switch theme"
          aria-pressed={theme === 'dark'}
          onClick={onToggleTheme}
        >
          <Icon name="moon" size={19} />
        </button>
        <div className="notification-btn">
          <button
            className="btn-icon"
            aria-label="Notifications"
            onClick={onToggleNotifications}
          >
            <Icon name="bell" />
          </button>
          <span className="notif-badge">{notificationsCount}</span>
        </div>
        <button className="account-link" aria-label="Open my profile" onClick={() => onNavigate('profile')}>
          <div className="user-avatar">{initial}</div>
          <span style={{ fontWeight: 600, fontSize: '0.88rem' }}>{firstName}</span>
        </button>
      </div>
    </header>
  );
}

function ProfileView({
  user,
  draft,
  setDraft,
  onSaveProfile,
  onChangePassword,
  onResetData,
  onExportData,
}) {
  if (!user) return null;

  const updateDraft = (key, value) => setDraft((current) => ({ ...current, [key]: value }));
  const toggleSport = (sportName) => {
    const sports = draft.sports.includes(sportName)
      ? draft.sports.filter((name) => name !== sportName)
      : [...draft.sports, sportName];
    updateDraft('sports', sports);
  };

  return (
    <section id="view-profile" className="view-section active">
      <SectionHeading title="User Profile & Preferences" bottom={16}>
        Manage your athlete identity, password, and sports interests saved in your browser.
      </SectionHeading>
      <div className="profile-columns" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
        <div className="panel-card">
          <div className="panel-header">
            <h3>Personal information</h3>
          </div>
          <form onSubmit={onSaveProfile}>
            <div className="form-group">
              <label htmlFor="profName">Full Name</label>
              <input
                type="text"
                id="profName"
                className="form-control"
                value={draft.name}
                onChange={(event) => updateDraft('name', event.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="profEmail">Email Address</label>
              <input
                type="email"
                id="profEmail"
                className="form-control"
                value={user.email}
                disabled
                style={{ opacity: 0.7 }}
              />
              <small style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>
                Email serves as the unique account key.
              </small>
            </div>
            <div className="form-group">
              <label htmlFor="profPhone">Phone Number</label>
              <input
                type="tel"
                id="profPhone"
                className="form-control"
                placeholder="+1 (555) 019-2834"
                value={draft.phone}
                onChange={(event) => updateDraft('phone', event.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="profRole">Role</label>
              <select
                id="profRole"
                className="form-control"
                value={draft.role}
                onChange={(event) => updateDraft('role', event.target.value)}
              >
                <option value="Player">Player</option>
                <option value="Coach">Coach</option>
              </select>
            </div>
            <div className="form-group">
              <label>Sports Interests (Select all that apply)</label>
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: 8,
                  marginTop: 6,
                }}
              >
                {DEFAULT_SPORTS.map((sport) => (
                  <label
                    key={sport.id}
                    style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.85rem' }}
                  >
                    <input
                      type="checkbox"
                      checked={draft.sports.includes(sport.name)}
                      onChange={() => toggleSport(sport.name)}
                    />
                    {sport.icon} {sport.name}
                  </label>
                ))}
              </div>
            </div>
            <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>
              Save Changes
            </button>
          </form>
        </div>

        <div>
          <div className="panel-card">
            <div className="panel-header">
              <h3>🔒 Change Password</h3>
            </div>
            <form onSubmit={onChangePassword}>
              <div className="form-group">
                <label htmlFor="currentPassword">Current Password</label>
                <input type="password" id="currentPassword" name="current" className="form-control" required />
              </div>
              <div className="form-group">
                <label htmlFor="newPassword">New Password</label>
                <input
                  type="password"
                  id="newPassword"
                  name="password"
                  className="form-control"
                  minLength={6}
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="confirmNewPassword">Confirm New Password</label>
                <input
                  type="password"
                  id="confirmNewPassword"
                  name="confirm"
                  className="form-control"
                  minLength={6}
                  required
                />
              </div>
              <button type="submit" className="btn btn-outline" style={{ width: '100%' }}>
                Update Password
              </button>
            </form>
          </div>
          <div className="panel-card" style={{ borderColor: 'rgba(245, 158, 11, 0.4)' }}>
            <div className="panel-header">
              <h3 style={{ color: 'var(--accent-amber)' }}>🛠️ Demo Data Tools</h3>
            </div>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: 14 }}>
              Restore the sample dataset or inspect your current browser-stored app data.
            </p>
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
              <button type="button" className="btn btn-sm btn-outline" onClick={onResetData}>
                ↺ Reset Sample Data
              </button>
              <button type="button" className="btn btn-sm btn-outline" onClick={onExportData}>
                View saved data
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function AuthOverlay({ open, onLogin, onRegister, onForgot, onAutofill }) {
  const [tab, setTab] = useState('login');
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [passwordVisible, setPasswordVisible] = useState({});

  useEffect(() => {
    if (open) setTab('login');
  }, [open]);

  const togglePassword = (field) =>
    setPasswordVisible((visible) => ({ ...visible, [field]: !visible[field] }));

  const handleLogin = (event) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    onLogin({
      email: formData.get('email').trim(),
      password: formData.get('password'),
      remember: formData.get('remember') === 'on',
    });
  };

  const handleRegister = (event) => {
    event.preventDefault();
    const values = Object.fromEntries(new FormData(event.currentTarget));
    const sports = new FormData(event.currentTarget).getAll('sports');
    onRegister({ ...values, sports });
  };

  const handleForgot = (event) => {
    event.preventDefault();
    const values = Object.fromEntries(new FormData(event.currentTarget));
    if (onForgot(values.email.trim(), values.password)) {
      setTab('login');
      setLoginEmail(values.email.trim());
      setLoginPassword(values.password);
    }
  };

  const autofill = () => {
    setLoginEmail(DEMO_USER.email);
    setLoginPassword(DEMO_USER.password);
    onAutofill();
  };

  return (
    <div className={`auth-overlay ${open ? '' : 'hidden'}`} id="authOverlay">
      <div className="auth-card">
        <div className="auth-brand">
          <div className="logo-icon">ϟ</div>
          <h2 style={{ fontSize: '1.6rem', color: 'var(--text-main)' }}>
            Sport<span style={{ color: 'var(--electric-blue)' }}>Sphere</span>
          </h2>
        </div>
        <div className="demo-credentials-box">
          <strong>Demo sign-in</strong>
          <br />
          Email: <code>{DEMO_USER.email}</code>
          <br />
          Password: <code>{DEMO_USER.password}</code>
          <br />
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            Use Autofill Demo for a one-click sign-in.
          </span>
        </div>
        <div className="auth-toggle-tabs" role="tablist" aria-label="Account options">
          {[
            ['login', 'Sign In'],
            ['register', 'Register'],
            ['forgot', 'Reset'],
          ].map(([value, label]) => (
            <button
              type="button"
              role="tab"
              aria-selected={tab === value}
              className={`auth-tab ${tab === value ? 'active' : ''}`}
              key={value}
              onClick={() => setTab(value)}
            >
              {label}
            </button>
          ))}
        </div>

        {tab === 'login' && (
          <form onSubmit={handleLogin}>
            <div className="form-group">
              <label htmlFor="loginEmail">College Email</label>
              <input
                type="email"
                id="loginEmail"
                name="email"
                className="form-control"
                placeholder="name@sportsphere.edu"
                value={loginEmail}
                onChange={(event) => setLoginEmail(event.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="loginPassword">Password</label>
              <div className="password-input-wrapper">
                <input
                  type={passwordVisible.login ? 'text' : 'password'}
                  minLength={6}
                  id="loginPassword"
                  name="password"
                  className="form-control"
                  placeholder="Enter your password"
                  value={loginPassword}
                  onChange={(event) => setLoginPassword(event.target.value)}
                  required
                />
                <button
                  type="button"
                  className="toggle-password"
                  aria-label={passwordVisible.login ? 'Hide password' : 'Show password'}
                  onClick={() => togglePassword('login')}
                >
                  {passwordVisible.login ? '🔒' : '👁️'}
                </button>
              </div>
            </div>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: 18,
                fontSize: '0.85rem',
              }}
            >
              <label style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer' }}>
                <input type="checkbox" name="remember" /> Remember me
              </label>
              <button
                type="button"
                className="auth-link"
                onClick={() => setTab('forgot')}
              >
                Forgot password?
              </button>
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>
                Sign In
              </button>
              <button type="button" className="btn btn-outline" onClick={autofill}>
                Autofill Demo
              </button>
            </div>
          </form>
        )}

        {tab === 'register' && (
          <form onSubmit={handleRegister}>
            <div className="form-group">
              <label htmlFor="regName">Full Name</label>
              <input type="text" id="regName" name="name" className="form-control" placeholder="e.g. Maya Chen" required />
            </div>
            <div className="form-group">
              <label htmlFor="regEmail">College Email</label>
              <input type="email" id="regEmail" name="email" className="form-control" placeholder="e.g. maya@sportsphere.edu" required />
            </div>
            <div className="form-group">
              <label htmlFor="regPhone">Phone Number</label>
              <input type="tel" id="regPhone" name="phone" className="form-control" placeholder="+1 (555) 019-9922" required />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div className="form-group">
                <label htmlFor="regPassword">Password</label>
                <div className="password-input-wrapper">
                  <input
                    type={passwordVisible.register ? 'text' : 'password'}
                    id="regPassword"
                    name="password"
                    className="form-control"
                    minLength={6}
                    placeholder="Min 6 chars"
                    required
                  />
                  <button type="button" className="toggle-password" onClick={() => togglePassword('register')}>
                    {passwordVisible.register ? '🔒' : '👁️'}
                  </button>
                </div>
              </div>
              <div className="form-group">
                <label htmlFor="regConfirmPassword">Confirm Password</label>
                <input
                  type={passwordVisible.confirm ? 'text' : 'password'}
                  id="regConfirmPassword"
                  name="confirm"
                  className="form-control"
                  minLength={6}
                  placeholder="Re-enter password"
                  required
                />
              </div>
            </div>
            <div className="form-group">
              <label htmlFor="regRole">Role</label>
              <select id="regRole" name="role" className="form-control">
                <option value="Player">Player</option>
                <option value="Coach">Coach</option>
              </select>
            </div>
            <div className="form-group">
              <label>Select Sports Interests</label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6, fontSize: '0.85rem' }}>
                {DEFAULT_SPORTS.map((sport) => (
                  <label key={sport.id} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <input type="checkbox" name="sports" value={sport.name} />
                    {sport.icon} {sport.name}
                  </label>
                ))}
              </div>
            </div>
            <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: 8 }}>
              Create Account
            </button>
          </form>
        )}

        {tab === 'forgot' && (
          <form onSubmit={handleForgot}>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: 16 }}>
              Enter your registered email address to reset its demo password.
            </p>
            <div className="form-group">
              <label htmlFor="forgotEmail">Registered Email</label>
              <input
                type="email"
                id="forgotEmail"
                name="email"
                className="form-control"
                placeholder="name@sportsphere.edu"
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="forgotNewPassword">Set New Password</label>
              <input
                type="password"
                id="forgotNewPassword"
                name="password"
                className="form-control"
                minLength={6}
                placeholder="New password"
                required
              />
            </div>
            <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>
              Reset Password
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

function EventModal({ event, user, onClose, onRegister, onCancel }) {
  if (!event) return null;
  const registered = (user?.registeredEvents || []).includes(event.id);
  const status = registrationStatus(event);

  return (
    <div className="modal-overlay active" onClick={onClose}>
      <div className="modal-box" role="dialog" aria-modal="true" aria-labelledby="modalEventTitle" onClick={(eventClick) => eventClick.stopPropagation()}>
        <div className="modal-header">
          <h3 id="modalEventTitle">{event.title}</h3>
          <button className="modal-close" aria-label="Close event details" onClick={onClose}>
            ✕
          </button>
        </div>
        <div className="modal-body">
          <div className="detail-status">
            Registration <StatusBadge event={event} />
          </div>
          <p style={{ color: 'var(--text-muted)', lineHeight: 1.5, marginBottom: 16 }}>
            {event.description}
          </p>
          <div
            style={{
              background: 'var(--bg-subtle)',
              padding: 14,
              borderRadius: 12,
              marginBottom: 18,
              border: '1px solid var(--border-subtle)',
              fontSize: '0.88rem',
            }}
          >
            <p style={{ marginBottom: 6 }}>
              <strong>Sport Category:</strong> {event.sportName}
            </p>
            <p style={{ marginBottom: 6 }}>
              <strong>Scheduled Time:</strong> {event.date}
            </p>
            <p style={{ marginBottom: 6 }}>
              <strong>Tournament Location:</strong> {event.venue}
            </p>
            <p style={{ marginBottom: 6 }}>
              <strong>Last Date to Apply:</strong> {event.deadline}
            </p>
            <p>
              <strong>Available Slots:</strong>{' '}
              {Math.max(0, event.totalSlots - event.registeredSlots)} remaining out of {event.totalSlots}
            </p>
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
            <button className="btn btn-outline" onClick={onClose}>
              Close
            </button>
            {registered ? (
              <button
                className="btn btn-danger"
                onClick={() => {
                  onCancel(event.id);
                  onClose();
                }}
              >
                Cancel Registration
              </button>
            ) : (
              <button
                className="btn btn-primary"
                disabled={status !== 'Open'}
                onClick={() => {
                  onRegister(event.id);
                  onClose();
                }}
              >
                {status === 'Open' ? 'Confirm registration' : status}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function GuideModal({ open, onClose }) {
  if (!open) return null;
  return (
    <div className="modal-overlay active" onClick={onClose}>
      <div className="modal-box" style={{ maxWidth: 650 }} role="dialog" aria-modal="true" onClick={(event) => event.stopPropagation()}>
        <div className="modal-header">
          <h3>SportSphere project guide</h3>
          <button className="modal-close" aria-label="Close project guide" onClick={onClose}>
            ✕
          </button>
        </div>
        <div className="modal-body" style={{ fontSize: '0.9rem', lineHeight: 1.6 }}>
          <p>
            SportSphere is a React single-page application. Its UI is built from components, and
            sample account, tournament, and player data is persisted in browser storage.
          </p>
          <h4 style={{ color: 'var(--electric-blue)', marginTop: 18 }}>Run the project</h4>
          <pre
            style={{
              background: 'var(--bg-subtle)',
              padding: 12,
              borderRadius: 8,
              margin: '8px 0',
              border: '1px solid var(--border-subtle)',
              fontSize: '0.8rem',
              overflowX: 'auto',
            }}
          >
            npm install{'\n'}npm run dev
          </pre>
          <p>
            Use the demo account <span className="code-pill">alex@sportsphere.edu</span> /{' '}
            <span className="code-pill">demo1234</span> to try the dashboard.
          </p>
          <div
            style={{
              background: 'rgba(0,102,255,0.08)',
              padding: '10px 14px',
              borderRadius: 8,
              borderLeft: '3px solid var(--electric-blue)',
              fontSize: '0.82rem',
              marginTop: 18,
            }}
          >
            <strong>Demo limitation:</strong> accounts and app data stay in this browser. This
            client-side simulation is not production authentication.
          </div>
        </div>
      </div>
    </div>
  );
}

function NotificationDrawer({ open, activities, onClose }) {
  return (
    <aside className={`drawer ${open ? 'open' : ''}`} aria-label="Notifications and alerts">
      <div className="drawer-header">
        <h4>Notifications & Alerts</h4>
        <button className="btn-icon" aria-label="Close notifications" onClick={onClose}>
          <Icon name="close" />
        </button>
      </div>
      <div className="drawer-body">
        {activities.map((activity, index) => (
          <div
            key={`${activity.text}-${index}`}
            style={{
              background: 'var(--bg-subtle)',
              padding: 12,
              borderRadius: 10,
              borderLeft: '3px solid var(--electric-blue)',
              fontSize: '0.84rem',
            }}
          >
            <p style={{ color: 'var(--text-main)', fontWeight: 500 }}>{activity.text}</p>
            <span
              style={{
                fontSize: '0.75rem',
                color: 'var(--text-light)',
                marginTop: 4,
                display: 'inline-block',
              }}
            >
              {activity.time}
            </span>
          </div>
        ))}
      </div>
    </aside>
  );
}

function Toasts({ items }) {
  return (
    <div className="toast-container" aria-live="polite" aria-atomic="false">
      {items.map((toast) => (
        <div className={`toast ${toast.type}`} key={toast.id}>
          <span>{toast.type === 'success' ? '✅' : toast.type === 'error' ? '⚠️' : 'ℹ️'}</span>
          <span>{toast.message}</span>
        </div>
      ))}
    </div>
  );
}

export default function App() {
  const [data, setData] = useState(initializeAppData);
  const [activeView, setActiveView] = useState('dashboard');
  const [theme, setTheme] = useState(() => localStorage.getItem('ss_theme') || 'light');
  const [authOpen, setAuthOpen] = useState(() => !data.activeUser);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [guideOpen, setGuideOpen] = useState(false);
  const [selectedEventId, setSelectedEventId] = useState(null);
  const [search, setSearch] = useState('');
  const [sportSearch, setSportSearch] = useState('');
  const [sportCategory, setSportCategory] = useState('all');
  const [eventFilter, setEventFilter] = useState('all');
  const [profileDraft, setProfileDraft] = useState({
    name: '',
    phone: '',
    role: 'Player',
    sports: [],
  });
  const [toasts, setToasts] = useState([]);
  const toastId = useRef(0);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('ss_theme', theme);
  }, [theme]);

  useEffect(() => {
    const user = data.activeUser;
    setProfileDraft({
      name: user?.name || '',
      phone: user?.phone || '',
      role: user?.role || 'Player',
      sports: user?.sports || [],
    });
  }, [data.activeUser, activeView]);

  const addToast = (message, type = 'info') => {
    const id = toastId.current++;
    setToasts((current) => [...current, { id, message, type }]);
    window.setTimeout(() => {
      setToasts((current) => current.filter((toast) => toast.id !== id));
    }, 3500);
  };

  const navigate = (viewName) => {
    if (!VIEW_LABELS[viewName]) return;
    setActiveView(viewName);
    setMobileSidebarOpen(false);
    if (viewName === 'sports') {
      setSportCategory('all');
      setSportSearch('');
    }
    if (viewName === 'events') setEventFilter('all');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const saveActiveUser = (user, startingUsers = data.users, startingPlayers = data.players) => {
    const users = [...startingUsers];
    const userIndex = users.findIndex((item) => item.email.toLowerCase() === user.email.toLowerCase());
    if (userIndex === -1) users.push(user);
    else users[userIndex] = user;

    const players = [...startingPlayers];
    const playerIndex = players.findIndex(
      (player) => player.email.toLowerCase() === user.email.toLowerCase(),
    );
    const playerRecord = {
      name: user.name,
      email: user.email,
      role: user.role,
      sports: user.sports || [],
      eventsCount: (user.registeredEvents || []).length,
      status: 'Active',
    };
    if (playerIndex === -1) players.push(playerRecord);
    else players[playerIndex] = { ...players[playerIndex], ...playerRecord };

    localStorage.setItem('ss_users', JSON.stringify(users));
    localStorage.setItem('ss_players', JSON.stringify(players));
    const activeStorage = sessionStorage.getItem('ss_transient') ? sessionStorage : localStorage;
    activeStorage.setItem('ss_active_user', JSON.stringify(user));
    setData((current) => ({ ...current, users, players, activeUser: user }));
  };

  const handleLogin = ({ email, password, remember }) => {
    const user = data.users.find((item) => item.email.toLowerCase() === email.toLowerCase());
    if (!user || user.password !== password) {
      addToast('Invalid email or password. Use demo account or register.', 'error');
      return false;
    }

    if (remember) {
      sessionStorage.removeItem('ss_transient');
      sessionStorage.removeItem('ss_active_user');
    } else {
      sessionStorage.setItem('ss_transient', '1');
      sessionStorage.removeItem('ss_active_user');
    }
    saveActiveUser(user);
    setAuthOpen(false);
    addToast(`Welcome back, ${user.name}!`, 'success');
    navigate('dashboard');
    return true;
  };

  const handleRegister = ({ name, email, phone, password, confirm, role, sports }) => {
    const cleanName = name.trim();
    const cleanEmail = email.trim();
    if (password !== confirm) {
      addToast('Passwords do not match!', 'error');
      return false;
    }
    if (data.users.some((user) => user.email.toLowerCase() === cleanEmail.toLowerCase())) {
      addToast('An account with this email already exists.', 'error');
      return false;
    }

    const user = {
      name: cleanName,
      email: cleanEmail,
      phone: phone.trim(),
      password,
      role,
      sports: sports.length > 0 ? sports : ['Cricket', 'Football'],
      registeredEvents: [],
    };
    const players = [
      ...data.players,
      {
        name: user.name,
        email: user.email,
        role: user.role,
        sports: user.sports,
        eventsCount: 0,
        status: 'Active',
      },
    ];

    sessionStorage.setItem('ss_transient', '1');
    sessionStorage.removeItem('ss_active_user');
    saveActiveUser(user, [...data.users, user], players);
    setAuthOpen(false);
    addToast('Registration successful! Welcome to SportSphere.', 'success');
    navigate('dashboard');
    return true;
  };

  const handleForgotPassword = (email, password) => {
    const users = [...data.users];
    const userIndex = users.findIndex((user) => user.email.toLowerCase() === email.toLowerCase());
    if (userIndex === -1) {
      addToast('Email address not found in browser storage.', 'error');
      return false;
    }

    users[userIndex] = { ...users[userIndex], password };
    localStorage.setItem('ss_users', JSON.stringify(users));
    setData((current) => ({ ...current, users }));
    addToast('Password reset complete. You may now log in.', 'success');
    return true;
  };

  const handleLogout = () => {
    if (!window.confirm('Are you sure you want to log out of SportSphere?')) return;
    localStorage.removeItem('ss_active_user');
    sessionStorage.removeItem('ss_active_user');
    sessionStorage.removeItem('ss_transient');
    setData((current) => ({ ...current, activeUser: null }));
    setAuthOpen(true);
    addToast('Logged out successfully.', 'info');
  };

  const registerForEvent = (eventId) => {
    const user = data.activeUser;
    if (!user) {
      addToast('Please sign in to register for events', 'error');
      setAuthOpen(true);
      return;
    }

    if ((user.registeredEvents || []).includes(eventId)) {
      addToast('You are already registered for this tournament!', 'info');
      return;
    }

    const event = data.events.find((item) => item.id === eventId);
    if (!event) return;
    const status = registrationStatus(event);
    if (status !== 'Open') {
      addToast(`Registration is ${status.toLowerCase()}.`, 'error');
      return;
    }

    const events = data.events.map((item) =>
      item.id === eventId ? { ...item, registeredSlots: item.registeredSlots + 1 } : item,
    );
    localStorage.setItem('ss_events', JSON.stringify(events));
    setData((current) => ({ ...current, events }));

    const updatedUser = {
      ...user,
      registeredEvents: [...(user.registeredEvents || []), eventId],
    };
    saveActiveUser(updatedUser);

    const activities = [
      { text: `${user.name} registered for ${event.title}.`, time: 'Just now' },
      ...data.activities,
    ];
    localStorage.setItem('ss_activities', JSON.stringify(activities));
    setData((current) => ({ ...current, activities }));
    addToast(`Success! You have registered for ${event.title}.`, 'success');
  };

  const cancelRegistration = (eventId) => {
    const user = data.activeUser;
    if (!(user?.registeredEvents || []).includes(eventId)) return;

    const event = data.events.find((item) => item.id === eventId);
    const updatedUser = {
      ...user,
      registeredEvents: user.registeredEvents.filter((id) => id !== eventId),
    };
    saveActiveUser(updatedUser);

    if (event && event.registeredSlots > 0) {
      const events = data.events.map((item) =>
        item.id === eventId ? { ...item, registeredSlots: item.registeredSlots - 1 } : item,
      );
      localStorage.setItem('ss_events', JSON.stringify(events));
      setData((current) => ({ ...current, events }));
    }
    addToast('Registration cancelled successfully.', 'info');
  };

  const handleProfileSave = (event) => {
    event.preventDefault();
    if (!data.activeUser) return;
    saveActiveUser({
      ...data.activeUser,
      name: profileDraft.name.trim(),
      phone: profileDraft.phone.trim(),
      role: profileDraft.role,
      sports: profileDraft.sports,
    });
    addToast('Profile updated successfully in browser storage!', 'success');
  };

  const handlePasswordChange = (event) => {
    event.preventDefault();
    if (!data.activeUser) return;
    const values = Object.fromEntries(new FormData(event.currentTarget));
    if (data.activeUser.password && values.current !== data.activeUser.password) {
      addToast('Current password does not match.', 'error');
      return;
    }
    if (values.password !== values.confirm) {
      addToast('New passwords do not match.', 'error');
      return;
    }
    saveActiveUser({ ...data.activeUser, password: values.password });
    event.currentTarget.reset();
    addToast('Password changed successfully!', 'success');
  };

  const handleResetData = () => {
    if (!window.confirm('Reset browser storage to the original sample demo data?')) return;
    for (const storage of [localStorage, sessionStorage]) {
      const keys = Array.from({ length: storage.length }, (_, index) => storage.key(index));
      keys.filter((key) => key?.startsWith('ss_')).forEach((key) => storage.removeItem(key));
    }
    const initialData = initializeAppData();
    setData(initialData);
    setTheme('light');
    setActiveView('dashboard');
    setSportCategory('all');
    setSportSearch('');
    setEventFilter('all');
    setSearch('');
    setAuthOpen(false);
    setNotificationsOpen(false);
    addToast('Sample dataset restored successfully!', 'success');
  };

  const handleExportData = () => {
    const exported = {
      users: data.users,
      events: data.events,
      activeUser: data.activeUser,
    };
    window.alert(
      `Browser Storage Export:\n\n${JSON.stringify(
        exported,
        (key, value) => (key === 'password' ? undefined : value),
        2,
      )}`,
    );
  };

  const handleGlobalSearch = (event) => {
    if (event.key !== 'Enter') return;
    const query = search.toLowerCase().trim();
    if (!query) return;

    const sport = DEFAULT_SPORTS.find((item) => item.name.toLowerCase().includes(query));
    if (sport) {
      navigate('sports');
      setSportSearch(sport.name);
      return;
    }

    const matchingEvent = data.events.find(
      (item) =>
        item.title.toLowerCase().includes(query) || item.sportName.toLowerCase().includes(query),
    );
    if (matchingEvent) navigate('events');
  };

  const handleToggleSidebar = () => {
    if (window.innerWidth <= 768) setMobileSidebarOpen((open) => !open);
    else setSidebarCollapsed((collapsed) => !collapsed);
  };

  const handleFilterEventsBySport = (sportId) => {
    navigate('events');
    setEventFilter(sportId);
  };

  const selectedEvent = data.events.find((event) => event.id === selectedEventId) || null;

  return (
    <>
      <div className="app-container">
        <Sidebar
          activeView={activeView}
          user={data.activeUser}
          registrationCount={data.activeUser?.registeredEvents?.length || 0}
          collapsed={sidebarCollapsed}
          mobileOpen={mobileSidebarOpen}
          onNavigate={navigate}
          onGuide={() => setGuideOpen(true)}
          onLogout={handleLogout}
        />
        <div className="main-wrapper">
          <Topbar
            user={data.activeUser}
            activeView={activeView}
            theme={theme}
            notificationsCount={data.activities.length}
            search={search}
            setSearch={setSearch}
            onToggleSidebar={handleToggleSidebar}
            onToggleTheme={() => setTheme((current) => (current === 'dark' ? 'light' : 'dark'))}
            onToggleNotifications={() => setNotificationsOpen((open) => !open)}
            onNavigate={navigate}
            onSearchKeyDown={handleGlobalSearch}
          />
          <main className="content-area">
            {activeView === 'dashboard' && (
              <DashboardView
                user={data.activeUser}
                events={data.events}
                players={data.players}
                activities={data.activities}
                onNavigate={navigate}
                onOpen={setSelectedEventId}
                onRegister={registerForEvent}
                onCancel={cancelRegistration}
              />
            )}
            {activeView === 'sports' && (
              <SportsView
                events={data.events}
                category={sportCategory}
                setCategory={setSportCategory}
                search={sportSearch}
                setSearch={setSportSearch}
                onFilterEvents={handleFilterEventsBySport}
              />
            )}
            {activeView === 'events' && (
              <EventsView
                events={data.events}
                user={data.activeUser}
                filter={eventFilter}
                setFilter={setEventFilter}
                onOpen={setSelectedEventId}
                onRegister={registerForEvent}
                onCancel={cancelRegistration}
              />
            )}
            {activeView === 'myevents' && (
              <RegistrationsView
                events={data.events}
                user={data.activeUser}
                onNavigate={navigate}
                onOpen={setSelectedEventId}
                onRegister={registerForEvent}
                onCancel={cancelRegistration}
              />
            )}
            {activeView === 'players' && <PlayersView players={data.players} />}
            {activeView === 'profile' && (
              <ProfileView
                user={data.activeUser}
                draft={profileDraft}
                setDraft={setProfileDraft}
                onSaveProfile={handleProfileSave}
                onChangePassword={handlePasswordChange}
                onResetData={handleResetData}
                onExportData={handleExportData}
              />
            )}
          </main>
        </div>
      </div>

      <NotificationDrawer
        open={notificationsOpen}
        activities={data.activities}
        onClose={() => setNotificationsOpen(false)}
      />
      <AuthOverlay
        open={authOpen}
        onLogin={handleLogin}
        onRegister={handleRegister}
        onForgot={handleForgotPassword}
        onAutofill={() => addToast('Demo credentials autofilled!', 'info')}
      />
      <EventModal
        event={selectedEvent}
        user={data.activeUser}
        onClose={() => setSelectedEventId(null)}
        onRegister={registerForEvent}
        onCancel={cancelRegistration}
      />
      <GuideModal open={guideOpen} onClose={() => setGuideOpen(false)} />
      <Toasts items={toasts} />
    </>
  );
}
