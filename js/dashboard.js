    function escapeText(value) {
      const node=document.createElement('span'); node.textContent=value; return node.innerHTML;
    }
    function showToast(message, type = 'info') {
      const container = document.getElementById('toastContainer');
      const toast = document.createElement('div');
      toast.className = `toast ${type}`;
      const icon = type === 'success' ? '✅' : type === 'error' ? '⚠️' : 'ℹ️';
      toast.innerHTML = `<span>${icon}</span> <span>${escapeText(message)}</span>`;
      container.appendChild(toast);
      setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateY(10px)';
        setTimeout(() => toast.remove(), 300);
      }, 3500);
    }

    function toggleNotifications() {
      document.getElementById('notificationDrawer').classList.toggle('open');
    }

    function renderNotifications() {
      const container = document.getElementById('notificationsList');
      const activities = JSON.parse(localStorage.getItem('ss_activities') || '[]');
      container.innerHTML = activities.map(act => `
        <div style="background:var(--bg-subtle); padding:12px; border-radius:10px; border-left:3px solid var(--electric-blue); font-size:0.84rem;">
          <p style="color:var(--text-main); font-weight:500;">${escapeText(act.text)}</p>
          <span style="font-size:0.75rem; color:var(--text-light); margin-top:4px; display:inline-block;">${act.time}</span>
        </div>
      `).join('');
      document.getElementById('notifBadge').textContent = activities.length;
    }

    /* ==========================================================================
       4. VIEW CONTROLLER & ROUTING
       ========================================================================== */
    function switchView(viewName) {
      document.getElementById('screenTitle').textContent = {dashboard:'Dashboard',sports:'Sports catalog',events:'Tournaments',myevents:'My registrations',players:'Player roster',profile:'My profile'}[viewName];
      document.getElementById('sidebar').classList.remove('open-mobile');
      const sections = document.querySelectorAll('.view-section');
      sections.forEach(sec => sec.classList.remove('active'));

      const target = document.getElementById(`view-${viewName}`);
      if (target) {
        target.classList.add('active');
      }

      // Update sidebar active link
      document.querySelectorAll('.nav-link').forEach(link => {
        link.classList.remove('active');
        link.removeAttribute('aria-current');
        if (link.getAttribute('onclick')?.includes(viewName)) {
          link.classList.add('active');
          link.setAttribute('aria-current','page');
        }
      });

      // Specific view render hooks
      if (viewName === 'dashboard') renderDashboard();
      if (viewName === 'sports') renderSportsCatalog('all');
      if (viewName === 'events') renderEventsCatalog('all');
      if (viewName === 'myevents') renderMyEvents();
      if (viewName === 'players') renderPlayerRoster();
      if (viewName === 'profile') populateProfileForm();

      window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    /* ==========================================================================
       5. DASHBOARD RENDERING
       ========================================================================== */
    function kickoff(evt) {
      return new Date(evt.date.replace(/\s*•\s*/, ' '));
    }

    function registrationStatus(evt, now = new Date()) {
      const deadline = new Date(evt.deadline);
      deadline.setHours(23, 59, 59, 999);
      if (evt.status?.toLowerCase() === 'closed' || kickoff(evt) <= now || deadline < now) return 'Closed';
      return evt.registeredSlots >= evt.totalSlots || evt.status?.toLowerCase() === 'full' ? 'Full' : 'Open';
    }

    function spotsLabel(evt) {
      const count = Math.max(0, evt.totalSlots - evt.registeredSlots);
      return `${count} ${count === 1 ? 'spot' : 'spots'} left`;
    }

    function statusBadge(evt) {
      const status = registrationStatus(evt);
      return `<span class="fixture-status ${status.toLowerCase()}">${status}</span>`;
    }

    function fixtureRow(evt, registered, catalog = false) {
      const date = kickoff(evt);
      const status = registrationStatus(evt);
      return `<article class="fixture-row">
        <time class="fixture-date"><span>${date.toLocaleString('en-US',{month:'short'})}</span><strong>${date.getDate()}</strong></time>
        <div class="fixture-info"><span class="discipline">${escapeText(evt.sportName)}</span>
          <h4>${escapeText(evt.title)}</h4>
          <p>${escapeText(evt.venue)} · ${date.toLocaleTimeString('en-US',{hour:'numeric',minute:'2-digit'})}</p>
          <p>Register by ${escapeText(evt.deadline)} · ${spotsLabel(evt)}</p>
          ${catalog ? `<progress value="${evt.registeredSlots}" max="${evt.totalSlots}" aria-label="Occupied slots"></progress>` : ''}
        </div>
        <div class="row-controls">${statusBadge(evt)}
          <button class="btn btn-outline" onclick="openEventDetails('${evt.id}')">${registered ? 'My entry' : 'Details'}</button>
          ${catalog && registered ? `<button class="text-action" onclick="cancelRegistration('${evt.id}')">Withdraw</button>` : ''}
          ${catalog && !registered && status==='Open' ? `<button class="btn btn-primary" onclick="registerForEvent('${evt.id}')">Register</button>` : ''}
        </div></article>`;
    }

    function renderDashboard() {
      const user = getActiveUser();
      const events = getEvents();
      const myRegs = user ? (user.registeredEvents || []) : [];

      const now = new Date();
      const upcoming = events.filter(evt=>kickoff(evt) >= now).sort((a,b)=>kickoff(a)-kickoff(b));
      const [next,...remaining] = upcoming;
      document.getElementById('todayDate').textContent = now.toLocaleDateString('en-US',{weekday:'short',month:'short',day:'numeric',year:'numeric'});
      const hero = document.getElementById('nextFixture');
      if (next) {
        const date = kickoff(next);
        const court = DEFAULT_SPORTS.find(sport => sport.id === next.sportId);
        const day = date.toLocaleDateString('en-US', { weekday: 'long' });
        const month = date.toLocaleDateString('en-US', { month: 'short' });
        hero.innerHTML = `<div class="hero-content"><div class="fixture-kicker">NEXT FIXTURE <span></span> ${escapeText(next.sportName)}</div>
          <h2>${escapeText(next.title)}</h2>
          <div class="hero-meta"><span>${escapeText(next.venue)}</span></div>
          <div class="mobile-match-date">${day}, ${month} ${date.getDate()} · ${date.toLocaleTimeString('en-US',{hour:'numeric',minute:'2-digit'})}</div>
          <div class="registration-line">${statusBadge(next)}<span>Register by ${escapeText(next.deadline)} · ${spotsLabel(next)}</span></div>
          <button class="btn btn-primary" onclick="openEventDetails('${next.id}')">${myRegs.includes(next.id)?'View my registration':registrationStatus(next)==='Open'?'Details & register':'Fixture details'}</button></div>
          <div class="pitch-art" aria-hidden="true">${court ? `<img src="courts/${court.id}.svg" alt="">` : ''}</div>
          <div class="ticket-date"><span>${day}</span><strong>${date.getDate().toString().padStart(2,'0')}</strong><b>${month} ${date.getFullYear()}</b><time>${date.toLocaleTimeString('en-US',{hour:'numeric',minute:'2-digit'})}</time></div>`;
      } else {
        hero.innerHTML=`<div class="hero-content"><div class="fixture-kicker">NEXT FIXTURE</div><h2>No upcoming fixtures</h2><p>The next scheduled event will appear here.</p><button class="btn btn-primary" onclick="switchView('events')">Browse tournaments</button></div>`;
      }

      document.getElementById('statParticipants').textContent = JSON.parse(localStorage.getItem('ss_players')).filter(p=>p.role==='Player').length;
      document.getElementById('statTotalSports').textContent = DEFAULT_SPORTS.length;
      document.getElementById('statUpcomingEvents').textContent = events.length;
      document.getElementById('statMyRegistrations').textContent = myRegs.length;
      document.getElementById('myEventsBadge').textContent = myRegs.length;

      // Populate Upcoming Matches
      const matchesContainer = document.getElementById('dashboardMatchesList');
      matchesContainer.innerHTML = remaining.map(evt=>fixtureRow(evt,myRegs.includes(evt.id))).join('') ||
        '<p class="fixture-empty">No additional fixtures scheduled.</p>';

      // Populate Feed
      const activities = JSON.parse(localStorage.getItem('ss_activities') || '[]');
      const feedContainer = document.getElementById('activityFeedList');
      feedContainer.innerHTML = activities.slice(0, 4).map(act => `
        <div class="activity-item">
          <div class="activity-dot"></div>
          <div class="activity-content">
            <p>${escapeText(act.text)}</p>
            <div class="activity-time">${act.time}</div>
          </div>
        </div>
      `).join('');
    }

    /* ==========================================================================
       6. SPORTS CATALOG
       ========================================================================== */
    let activeCategory = 'all';
    function renderSportsCatalog(category = 'all') {
      activeCategory = category;
      const container = document.getElementById('sportsGridContainer');
      const filtered = category === 'all' 
        ? DEFAULT_SPORTS 
        : DEFAULT_SPORTS.filter(s => s.category.toLowerCase() === category.toLowerCase() || (category === 'Indoor' && s.courtType.includes('Indoor')) || (category === 'Outdoor' && s.courtType.includes('Outdoor')));

      container.innerHTML = filtered.filter(s=>s.name.toLowerCase().includes(document.getElementById("sportSearch").value.toLowerCase().trim())).map(sport => `
        <div class="sport-card">
          <div class="sport-card-banner"><img src="courts/${sport.id}.svg" alt=""></div>
          <div class="sport-card-content">
            <h4>${sport.name}</h4>
            <span class="badge-pill" style="align-self:flex-start; margin-bottom:8px; background:rgba(0,102,255,0.1); color:var(--electric-blue);">
              ${sport.category} Discipline
            </span>
            <p>${sport.description}</p>
            <div class="sport-meta-row">
              <span><strong>Team Size:</strong> ${sport.playersPerTeam}</span>
              <span><strong>Venue:</strong> ${sport.courtType}</span>
            </div>
            <button class="btn btn-outline btn-sm" style="margin-top:14px; width:100%;" onclick="filterEventsBySport('${sport.id}')">
              View tournaments (${getEvents().filter(e=>e.sportId===sport.id).length})
            </button>
          </div>
        </div>
      `).join('');
    }

    function filterSports(cat, chipElement) {
      document.querySelectorAll('#view-sports .filter-chip').forEach(c => c.classList.remove('active'));
      if (chipElement) chipElement.classList.add('active');
      renderSportsCatalog(cat);
    }

    function filterEventsBySport(sportId) {
      switchView('events');
      renderEventsCatalog(sportId);
    }

    /* ==========================================================================
       7. EVENTS MANAGEMENT & REGISTRATION
       ========================================================================== */
    function renderEventsCatalog(sportFilter = 'all') {
      const events = getEvents();
      const user = getActiveUser();
      const myRegs = user ? (user.registeredEvents || []) : [];

      // Render filter chips
      const filterContainer = document.getElementById('eventSportFilterContainer');
      filterContainer.innerHTML = `
        <button type="button" class="filter-chip ${sportFilter === 'all' ? 'active' : ''}" onclick="renderEventsCatalog('all')">All Events (${events.length})</button>
        ${DEFAULT_SPORTS.map(s => `
          <button type="button" class="filter-chip ${sportFilter === s.id ? 'active' : ''}" onclick="renderEventsCatalog('${s.id}')">
            ${s.icon} ${s.name}
          </button>
        `).join('')}
      `;

      const filtered = sportFilter === 'all' ? events : events.filter(e => e.sportId === sportFilter);
      const grid = document.getElementById('eventsGridContainer');

      if (filtered.length === 0) {
        grid.innerHTML = `
          <div class="empty-state" style="grid-column: 1 / -1;">
            <div class="empty-icon">🏆</div>
            <h3>No events found for this category</h3>
            <p>Check back soon or explore other sports disciplines.</p>
          </div>
        `;
        return;
      }

      grid.innerHTML = filtered.slice().sort((a,b)=>kickoff(a)-kickoff(b))
        .map(evt=>fixtureRow(evt,myRegs.includes(evt.id),true)).join('');
    }

    function openEventDetails(eventId) {
      const events = getEvents();
      const evt = events.find(e => e.id === eventId);
      if (!evt) return;

      const user = getActiveUser();
      const isReg = user && (user.registeredEvents || []).includes(evt.id);

      document.getElementById('modalEventTitle').textContent = evt.title;
      document.getElementById('modalEventBody').innerHTML = `
        <div class="detail-status">Registration ${statusBadge(evt)}</div>
        <p style="color:var(--text-muted); line-height:1.5; margin-bottom:16px;">${evt.description}</p>
        
        <div style="background:var(--bg-subtle); padding:14px; border-radius:12px; margin-bottom:18px; border:1px solid var(--border-subtle); font-size:0.88rem;">
          <p style="margin-bottom:6px;"><strong>Sport Category:</strong> ${evt.sportName}</p>
          <p style="margin-bottom:6px;"><strong>Scheduled Time:</strong> ${evt.date}</p>
          <p style="margin-bottom:6px;"><strong>Tournament Location:</strong> ${evt.venue}</p>
          <p style="margin-bottom:6px;"><strong>Last Date to Apply:</strong> ${evt.deadline}</p>
          <p><strong>Available Slots:</strong> ${evt.totalSlots - evt.registeredSlots} remaining out of ${evt.totalSlots}</p>
        </div>

        <div style="display:flex; justify-content:flex-end; gap:10px;">
          <button class="btn btn-outline" onclick="closeModal()">Close</button>
          ${isReg ? `
            <button class="btn btn-danger" onclick="cancelRegistration('${evt.id}'); closeModal();">Cancel Registration</button>
          ` : `
            <button class="btn btn-primary" onclick="registerForEvent('${evt.id}'); closeModal();" ${registrationStatus(evt)==='Open'?'':'disabled'}>${registrationStatus(evt)==='Open'?'Confirm registration':registrationStatus(evt)}</button>
          `}
        </div>
      `;
      document.getElementById('eventModal').classList.add('active');
    }

    function closeModal() {
      document.getElementById('eventModal').classList.remove('active');
    }

    function registerForEvent(eventId) {
      const user = getActiveUser();
      if (!user) {
        showToast('Please sign in to register for events', 'error');
        showAuthOverlay('login');
        return;
      }

      user.registeredEvents = user.registeredEvents || [];
      if (user.registeredEvents.includes(eventId)) {
        showToast('You are already registered for this tournament!', 'info');
        return;
      }

      const events = getEvents();
      const evt = events.find(e => e.id === eventId);
      if (!evt) return;

      if (registrationStatus(evt) !== 'Open') {
        showToast(`Registration is ${registrationStatus(evt).toLowerCase()}.`, 'error');
        return;
      }

      // Update slot count
      evt.registeredSlots += 1;
      saveEvents(events);

      // Update user records
      user.registeredEvents.push(eventId);
      saveActiveUser(user);

      // Add to activity feed
      const activities = JSON.parse(localStorage.getItem('ss_activities') || '[]');
      activities.unshift({
        text: `${user.name} registered for ${evt.title}.`,
        time: 'Just now'
      });
      localStorage.setItem('ss_activities', JSON.stringify(activities));

      showToast(`Success! You have registered for ${evt.title}.`, 'success');
      renderEventsCatalog();
      renderDashboard();
      renderNotifications();
    }

    function cancelRegistration(eventId) {
      const user = getActiveUser();
      if (!user?.registeredEvents?.includes(eventId)) return;

      const events = getEvents();
      const evt = events.find(e => e.id === eventId);

      user.registeredEvents = user.registeredEvents.filter(id => id !== eventId);
      saveActiveUser(user);

      if (evt && evt.registeredSlots > 0) {
        evt.registeredSlots -= 1;
        saveEvents(events);
      }

      showToast('Registration cancelled successfully.', 'info');
      renderEventsCatalog();
      renderMyEvents();
      renderDashboard();
    }

    /* ==========================================================================
       8. MY EVENTS VIEW
       ========================================================================== */
    function renderMyEvents() {
      const user = getActiveUser();
      const container = document.getElementById('myEventsContainer');
      const events = getEvents();
      const myRegIds = user ? (user.registeredEvents || []) : [];

      document.getElementById('myEventsBadge').textContent = myRegIds.length;

      if (myRegIds.length === 0) {
        container.innerHTML = `
          <div class="panel-card empty-state">
            <div class="empty-icon">🎟️</div>
            <h3>No registrations yet</h3>
            <p style="max-width:400px; margin:8px auto 16px auto;">You haven't reserved a slot in any upcoming sports competitions yet.</p>
            <button class="btn btn-primary" onclick="switchView('events')">Browse tournaments</button>
          </div>
        `;
        return;
      }

      const myEventsList = events.filter(e => myRegIds.includes(e.id)).sort((a,b)=>kickoff(a)-kickoff(b));
      container.innerHTML = '<div class="registration-list">' + myEventsList.map(evt=>fixtureRow(evt,true,true)).join('') + '</div>';
    }

    /* ==========================================================================
       9. PLAYER ROSTER VIEW
       ========================================================================== */
    function renderPlayerRoster(filteredList = null) {
      const players = filteredList || JSON.parse(localStorage.getItem('ss_players') || '[]');
      const tbody = document.getElementById('playerRosterTbody');
      document.getElementById('rosterCountLabel').textContent = `Showing ${players.length} athlete(s)`;

      tbody.innerHTML = players.map(p => `
        <tr>
          <td>
            <div style="display:flex; align-items:center; gap:10px;">
              <div class="user-avatar" style="width:32px; height:32px; font-size:0.8rem;">${escapeText(p.name.charAt(0))}</div>
              <div>
                <strong>${escapeText(p.name)}</strong>
                <div style="font-size:0.75rem; color:var(--text-muted);">${escapeText(p.email)}</div>
              </div>
            </div>
          </td>
          <td><span class="badge-pill" style="background:rgba(0,102,255,0.1); color:var(--electric-blue);">${p.role}</span></td>
          <td>${(p.sports || []).map(s => `<span class="badge-pill" style="margin-right:4px;">${s}</span>`).join('')}</td>
          <td><strong>${p.eventsCount || 0}</strong> Tournaments</td>
          <td><span style="color:var(--accent-neon); font-weight:600;">● ${p.status || 'Active'}</span></td>
        </tr>
      `).join('');
    }

    function filterPlayerTable() {
      const query = document.getElementById('playerTableSearch').value.toLowerCase();
      const players = JSON.parse(localStorage.getItem('ss_players') || '[]');
      const filtered = players.filter(p => 
        p.name.toLowerCase().includes(query) || 
        p.email.toLowerCase().includes(query) ||
        (p.sports && p.sports.some(s => s.toLowerCase().includes(query)))
      );
      renderPlayerRoster(filtered);
    }

    /* ==========================================================================
       10. USER PROFILE & FORM ACTIONS
       ========================================================================== */
    function handleGlobalSearch(e) {
      const query = e.target.value.toLowerCase().trim();
      if (!query) return;

      // Check sports match
      const sportMatch = DEFAULT_SPORTS.find(s => s.name.toLowerCase().includes(query));
      if (sportMatch && e.key === 'Enter') {
        switchView('sports');
        document.getElementById('sportSearch').value = sportMatch.name; renderSportsCatalog('all');
        return;
      }

      // Check event match
      const events = getEvents();
      const eventMatch = events.find(ev => ev.title.toLowerCase().includes(query) || ev.sportName.toLowerCase().includes(query));
      if (eventMatch && e.key === 'Enter') {
        switchView('events');
      }
    }

    function toggleTheme() {
      const current = document.documentElement.getAttribute('data-theme');
      const next = current === 'dark' ? 'light' : 'dark';
      document.documentElement.setAttribute('data-theme', next);
      localStorage.setItem('ss_theme', next);
      document.getElementById('themeToggleBtn').setAttribute('aria-pressed', String(next === 'dark'));
    }

    function initTheme() {
      const saved = localStorage.getItem('ss_theme') || 'light';
      document.documentElement.setAttribute('data-theme', saved);
      document.getElementById('themeToggleBtn').setAttribute('aria-pressed', String(saved === 'dark'));
    }

    function renderHeaderUser() {
      const user = getActiveUser();
      if (user) {
        const firstLetter = (user.name || 'User').charAt(0).toUpperCase();
        document.getElementById('sidebarAvatar').textContent = firstLetter;
        document.getElementById('topAvatar').textContent = firstLetter;
        document.getElementById('sidebarName').textContent = user.name;
        document.getElementById('topUserName').textContent = user.name.split(' ')[0];
        document.getElementById('sidebarRole').textContent = user.role;
      }
    }

    /* Academic Guide Helpers */
    function openProjectGuide() {
      document.getElementById('guideModal').classList.add('active');
    }
    function closeGuideModal() {
      document.getElementById('guideModal').classList.remove('active');
    }

    function resetToDefaultData() {
      if (confirm('Reset LocalStorage to original sample demo data?')) {
        for (const storage of [localStorage, sessionStorage]) {
          Object.keys(storage).filter(k=>k.startsWith('ss_')).forEach(k=>storage.removeItem(k));
        }
        initLocalStorage();
        initTheme();
        renderHeaderUser();
        renderDashboard();
        showToast('Sample dataset restored successfully!', 'success');
      }
    }

    function exportDataJSON() {
      const data = {
        users: JSON.parse(localStorage.getItem('ss_users') || '[]'),
        events: JSON.parse(localStorage.getItem('ss_events') || '[]'),
        activeUser: getActiveUser()
      };
      alert('LocalStorage Export:\n\n' + JSON.stringify(data, (key,value)=>key==='password'?undefined:value, 2));
    }

    /* ==========================================================================
       13. BOOTSTRAP APPLICATION
       ========================================================================== */
    window.addEventListener('DOMContentLoaded', () => {
      initLocalStorage();
      initTheme();
      if (!getActiveUser()) showAuthOverlay('login');
      renderHeaderUser();
      renderDashboard();
      renderNotifications();

      // Sidebar collapse toggle
      const sidebar = document.getElementById('sidebar');
      document.getElementById('toggleSidebarBtn').addEventListener('click', () => {
        if (window.innerWidth <= 768) {
          sidebar.classList.toggle('open-mobile');
        } else {
          sidebar.classList.toggle('collapsed');
        }
      });
    });
  
document.querySelectorAll('.nav-link,.filter-chip').forEach(control=>{
  control.tabIndex=0;
  control.setAttribute('role','button');
  control.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();control.click();}});
});
document.addEventListener('keydown',e=>{if(e.key==='Escape'){closeModal();closeGuideModal();document.getElementById('sidebar').classList.remove('open-mobile');}});
