    function initLocalStorage() {
      if (!localStorage.getItem('ss_users')) {
        localStorage.setItem('ss_users', JSON.stringify([DEMO_USER]));
      }
      if (!localStorage.getItem('ss_events')) {
        localStorage.setItem('ss_events', JSON.stringify(DEFAULT_EVENTS));
      }
      if (!localStorage.getItem('ss_players')) {
        localStorage.setItem('ss_players', JSON.stringify(DEFAULT_PLAYERS));
      }
      if (!localStorage.getItem('ss_activities')) {
        localStorage.setItem('ss_activities', JSON.stringify(DEFAULT_ACTIVITIES));
      }
      // If no session exists, default log in the demo user for immediate browsing
      if (!localStorage.getItem('ss_session_initialized')) {
        localStorage.setItem('ss_session_initialized','1');
        localStorage.setItem('ss_active_user', JSON.stringify(DEMO_USER));
      }
    }

    function getActiveUser() {
      const u = sessionStorage.getItem('ss_active_user') || localStorage.getItem('ss_active_user');
      return u ? JSON.parse(u) : null;
    }

    function saveActiveUser(user) {
      (sessionStorage.getItem('ss_transient') ? sessionStorage : localStorage).setItem('ss_active_user', JSON.stringify(user));
      // Also update in all users array
      const users = JSON.parse(localStorage.getItem('ss_users') || '[]');
      const idx = users.findIndex(item => item.email === user.email);
      if (idx !== -1) {
        users[idx] = user;
      } else {
        users.push(user);
      }
      localStorage.setItem('ss_users', JSON.stringify(users));
      const roster = JSON.parse(localStorage.getItem('ss_players') || '[]');
      const row = roster.find(p=>p.email===user.email);
      if(row) Object.assign(row,{name:user.name,role:user.role,sports:user.sports,eventsCount:user.registeredEvents.length});
      localStorage.setItem('ss_players',JSON.stringify(roster));
      renderHeaderUser();
    }

    function getEvents() {
      return JSON.parse(localStorage.getItem('ss_events') || '[]');
    }

    function saveEvents(events) {
      localStorage.setItem('ss_events', JSON.stringify(events));
    }

    /* ==========================================================================
       3. UI NOTIFICATIONS & TOASTS
       ========================================================================== */
    function populateProfileForm() {
      const user = getActiveUser();
      if (!user) return;

      document.getElementById('profName').value = user.name || '';
      document.getElementById('profEmail').value = user.email || '';
      document.getElementById('profPhone').value = user.phone || '';
      document.getElementById('profRole').value = user.role || 'Player';

      const interestsBox = document.getElementById('profileInterestsCheckboxes');
      interestsBox.innerHTML = DEFAULT_SPORTS.map(s => {
        const checked = (user.sports || []).includes(s.name) ? 'checked' : '';
        return `
          <label style="display:flex; align-items:center; gap:6px; font-size:0.85rem; cursor:pointer;">
            <input type="checkbox" name="profInterest" value="${s.name}" ${checked}> ${s.icon} ${s.name}
          </label>
        `;
      }).join('');
    }

    function handleUpdateProfile(e) {
      e.preventDefault();
      const user = getActiveUser();
      if (!user) return;

      user.name = document.getElementById('profName').value.trim();
      user.phone = document.getElementById('profPhone').value.trim();
      user.role = document.getElementById('profRole').value;

      const checkedInterests = [];
      document.querySelectorAll('input[name="profInterest"]:checked').forEach(cb => {
        checkedInterests.push(cb.value);
      });
      user.sports = checkedInterests;

      saveActiveUser(user);
      showToast('Profile updated successfully in LocalStorage!', 'success');
      renderHeaderUser();
    }

    function handleChangePassword(e) {
      e.preventDefault();
      const user = getActiveUser();
      if (!user) return;

      const current = document.getElementById('currentPassword').value;
      const newP = document.getElementById('newPassword').value;
      const confirmP = document.getElementById('confirmNewPassword').value;

      if (user.password && current !== user.password) {
        showToast('Current password does not match.', 'error');
        return;
      }
      if (newP !== confirmP) {
        showToast('New passwords do not match.', 'error');
        return;
      }

      user.password = newP;
      saveActiveUser(user);
      document.getElementById('changePasswordForm').reset();
      showToast('Password changed successfully!', 'success');
    }

    /* ==========================================================================
       11. AUTHENTICATION MODULE (LOGIN / REGISTRATION / RESET)
       ========================================================================== */
    function showAuthOverlay(tab = 'login') {
      document.getElementById('authOverlay').classList.remove('hidden');
      switchAuthTab(tab);
    }

    function hideAuthOverlay() {
      document.getElementById('authOverlay').classList.add('hidden');
    }

    function switchAuthTab(tab) {
      document.getElementById('tabLogin').classList.toggle('active', tab === 'login');
      document.getElementById('tabRegister').classList.toggle('active', tab === 'register');
      document.getElementById('tabForgot').classList.toggle('active', tab === 'forgot');

      document.getElementById('loginForm').style.display = tab === 'login' ? 'block' : 'none';
      document.getElementById('registerForm').style.display = tab === 'register' ? 'block' : 'none';
      document.getElementById('forgotForm').style.display = tab === 'forgot' ? 'block' : 'none';

      if (tab === 'register') {
        const regBox = document.getElementById('regInterestsContainer');
        regBox.innerHTML = DEFAULT_SPORTS.map(s => `
          <label style="display:flex; align-items:center; gap:6px; cursor:pointer;">
            <input type="checkbox" name="regInterest" value="${s.name}"> ${s.icon} ${s.name}
          </label>
        `).join('');
      }
    }

    function handleLoginSubmit(e) {
      e.preventDefault();
      const email = document.getElementById('loginEmail').value.trim();
      const password = document.getElementById('loginPassword').value;

      const users = JSON.parse(localStorage.getItem('ss_users') || '[]');
      const user = users.find(u => u.email.toLowerCase() === email.toLowerCase());

      if (!user || user.password !== password) {
        showToast('Invalid email or password. Use demo account or register.', 'error');
        return;
      }

      if (document.getElementById('rememberMe').checked) sessionStorage.removeItem('ss_transient');
      else sessionStorage.setItem('ss_transient','1');
      saveActiveUser(user);
      hideAuthOverlay();
      showToast(`Welcome back, ${user.name}!`, 'success');
      switchView('dashboard');
    }

    function handleRegisterSubmit(e) {
      e.preventDefault();
      const name = document.getElementById('regName').value.trim();
      const email = document.getElementById('regEmail').value.trim();
      const phone = document.getElementById('regPhone').value.trim();
      const password = document.getElementById('regPassword').value;
      const confirmPass = document.getElementById('regConfirmPassword').value;
      const role = document.getElementById('regRole').value;

      if (password !== confirmPass) {
        showToast('Passwords do not match!', 'error');
        return;
      }

      const users = JSON.parse(localStorage.getItem('ss_users') || '[]');
      if (users.some(u => u.email.toLowerCase() === email.toLowerCase())) {
        showToast('An account with this email already exists.', 'error');
        return;
      }

      const selectedSports = [];
      document.querySelectorAll('input[name="regInterest"]:checked').forEach(cb => selectedSports.push(cb.value));

      const newUser = {
        name,
        email,
        phone,
        password,
        role,
        sports: selectedSports.length > 0 ? selectedSports : ['Cricket', 'Football'],
        registeredEvents: []
      };

      users.push(newUser);
      localStorage.setItem('ss_users', JSON.stringify(users));

      // Also add to public player roster
      const players = JSON.parse(localStorage.getItem('ss_players') || '[]');
      players.push({
        name,
        email,
        role,
        sports: newUser.sports,
        eventsCount: 0,
        status: 'Active'
      });
      localStorage.setItem('ss_players', JSON.stringify(players));

      saveActiveUser(newUser);
      hideAuthOverlay();
      showToast('Registration successful! Welcome to SportSphere.', 'success');
      switchView('dashboard');
    }

    function handleForgotSubmit(e) {
      e.preventDefault();
      const email = document.getElementById('forgotEmail').value.trim();
      const newP = document.getElementById('forgotNewPassword').value;

      const users = JSON.parse(localStorage.getItem('ss_users') || '[]');
      const user = users.find(u => u.email.toLowerCase() === email.toLowerCase());

      if (!user) {
        showToast('Email address not found in LocalStorage.', 'error');
        return;
      }

      user.password = newP;
      localStorage.setItem('ss_users', JSON.stringify(users));
      showToast('Password reset complete. You may now log in.', 'success');
      switchAuthTab('login');
      document.getElementById('loginEmail').value = email;
      document.getElementById('loginPassword').value = newP;
    }

    function autofillDemo() {
      document.getElementById('loginEmail').value = 'alex@sportsphere.edu';
      document.getElementById('loginPassword').value = 'demo1234';
      showToast('Demo credentials autofilled!', 'info');
    }

    function togglePasswordVisibility(fieldId, btn) {
      const input = document.getElementById(fieldId);
      if (input.type === 'password') {
        input.type = 'text';
        btn.textContent = '🔒';
      } else {
        input.type = 'password';
        btn.textContent = '👁️';
      }
    }

    function handleLogout() {
      if (confirm('Are you sure you want to log out of SportSphere?')) {
        localStorage.removeItem('ss_active_user');
        sessionStorage.removeItem('ss_active_user'); sessionStorage.removeItem('ss_transient');
        showAuthOverlay('login');
        showToast('Logged out successfully.', 'info');
      }
    }

    /* ==========================================================================
       12. SEARCH & THEME UTILITIES
       ========================================================================== */
