
    /* ==========================================================================
       1. DATA MODULE: Initial Datasets for SportSphere
       ========================================================================== */
    const DEFAULT_SPORTS = [
      {
        id: 'cricket',
        name: 'Cricket',
        category: 'Team',
        icon: '🏏',
        bgGradient: 'linear-gradient(135deg, #1e3a8a, #3b82f6)',
        description: 'T20 and One-Day championship series held on the college campus turf ground.',
        playersPerTeam: 11,
        courtType: 'Outdoor Turf Pitch',
        activeTournaments: 2
      },
      {
        id: 'football',
        name: 'Football',
        category: 'Team',
        icon: '⚽',
        bgGradient: 'linear-gradient(135deg, #065f46, #10b981)',
        description: 'Inter-Department 7-a-side and full 11v11 League cup matches under floodlights.',
        playersPerTeam: 11,
        courtType: 'Outdoor Grass Field',
        activeTournaments: 2
      },
      {
        id: 'basketball',
        name: 'Basketball',
        category: 'Team',
        icon: '🏀',
        bgGradient: 'linear-gradient(135deg, #9a3412, #f97316)',
        description: 'Full-court 5v5 intramural tournament with shot clock and certified referees.',
        playersPerTeam: 5,
        courtType: 'Indoor / Outdoor Court',
        activeTournaments: 1
      },
      {
        id: 'badminton',
        name: 'Badminton',
        category: 'Individual',
        icon: '🏸',
        bgGradient: 'linear-gradient(135deg, #4c1d95, #8b5cf6)',
        description: 'Singles and Doubles matches held in the air-conditioned indoor sports arena.',
        playersPerTeam: 2,
        courtType: 'Indoor Synthetic Court',
        activeTournaments: 1
      },
      {
        id: 'volleyball',
        name: 'Volleyball',
        category: 'Team',
        icon: '🏐',
        bgGradient: 'linear-gradient(135deg, #0369a1, #0284c7)',
        description: 'Six-a-side competitive knockout series featuring varsity and club athletes.',
        playersPerTeam: 6,
        courtType: 'Outdoor Sand & Hard Court',
        activeTournaments: 1
      },
      {
        id: 'athletics',
        name: 'Athletics',
        category: 'Individual',
        icon: '🏃',
        bgGradient: 'linear-gradient(135deg, #be123c, #f43f5e)',
        description: '100m, 400m track sprints, 4x100m relays, high jump, and shot put challenges.',
        playersPerTeam: 1,
        courtType: 'Outdoor 400m Track',
        activeTournaments: 1
      }
    ];

    const DEFAULT_EVENTS = [
      {
        id: 'evt-1',
        title: 'Inter-College T20 Championship',
        sportId: 'cricket',
        sportName: 'Cricket',
        icon: '🏏',
        date: 'Dec 05, 2026 • 09:30 AM',
        venue: 'Main Campus Stadium Ground',
        deadline: 'Dec 01, 2026',
        totalSlots: 32,
        registeredSlots: 26,
        status: 'Open',
        description: 'Annual inter-college tournament featuring 16 top university squads. White ball, colored uniforms provided.'
      },
      {
        id: 'evt-2',
        title: 'Varsity Football League Cup',
        sportId: 'football',
        sportName: 'Football',
        icon: '⚽',
        date: 'Dec 08, 2026 • 04:00 PM',
        venue: 'North Arena Floodlit Field',
        deadline: 'Dec 04, 2026',
        totalSlots: 24,
        registeredSlots: 21,
        status: 'Open',
        description: 'High-intensity knockout tournament. Group matches leading to semifinals and grand finale under lights.'
      },
      {
        id: 'evt-3',
        title: 'Campus Badminton Open',
        sportId: 'badminton',
        sportName: 'Badminton',
        icon: '🏸',
        date: 'Dec 08, 2026 • 10:00 AM',
        venue: 'Indoor Sports Complex Hall A',
        deadline: 'Dec 04, 2026',
        totalSlots: 16,
        registeredSlots: 15,
        status: 'Open',
        description: 'Individual singles bracket for undergraduate and graduate students. Best of 3 sets of 21 points.'
      },
      {
        id: 'evt-4',
        title: 'All-University 3v3 Basketball Clash',
        sportId: 'basketball',
        sportName: 'Basketball',
        icon: '🏀',
        date: 'Dec 14, 2026 • 02:00 PM',
        venue: 'Central Gymnasium Court 1',
        deadline: 'Dec 10, 2026',
        totalSlots: 20,
        registeredSlots: 12,
        status: 'Open',
        description: 'Fast-paced streetball rules with official FIBA 3x3 scoring and DJ music during timeouts.'
      },
      {
        id: 'evt-5',
        title: 'Inter-Department Volleyball Trophy',
        sportId: 'volleyball',
        sportName: 'Volleyball',
        icon: '🏐',
        date: 'Dec 20, 2026 • 01:30 PM',
        venue: 'South Quad Volleyball Arena',
        deadline: 'Dec 17, 2026',
        totalSlots: 16,
        registeredSlots: 8,
        status: 'Open',
        description: 'Battle for the department cup. 6 players on court, rolling substitutions allowed.'
      },
      {
        id: 'evt-6',
        title: 'Annual University Sprint & Track Meet',
        sportId: 'athletics',
        sportName: 'Athletics',
        icon: '🏃',
        date: 'Dec 26, 2026 • 08:00 AM',
        venue: 'Olympic Standard Track Field',
        deadline: 'Dec 22, 2026',
        totalSlots: 40,
        registeredSlots: 38,
        status: 'Open',
        description: 'Track events (100m, 200m, 400m) and 4x100m relay competitions with electronic timing.'
      }
    ];

    const DEFAULT_PLAYERS = [
      { name: 'Alex Rivers', email: 'alex@sportsphere.edu', role: 'Player', sports: ['Football', 'Cricket'], eventsCount: 1, status: 'Active' },
      { name: 'Jordan Hayes', email: 'jordan@sportsphere.edu', role: 'Player', sports: ['Basketball', 'Athletics'], eventsCount: 2, status: 'Active' },
      { name: 'Sophia Sterling', email: 'sophia@sportsphere.edu', role: 'Coach', sports: ['Badminton', 'Volleyball'], eventsCount: 3, status: 'Certified' },
      { name: 'Marcus Bell', email: 'marcus@sportsphere.edu', role: 'Player', sports: ['Football'], eventsCount: 1, status: 'Active' },
      { name: 'Elena Gomez', email: 'elena@sportsphere.edu', role: 'Player', sports: ['Cricket', 'Badminton'], eventsCount: 2, status: 'Active' },
      { name: 'Devon Patel', email: 'devon@sportsphere.edu', role: 'Player', sports: ['Athletics'], eventsCount: 1, status: 'Active' }
    ];

    const DEFAULT_ACTIVITIES = [
      { text: 'Registration opened for Inter-College T20 Championship.', time: '10 mins ago' },
      { text: 'Jordan Hayes confirmed slot in Varsity Football League Cup.', time: '2 hours ago' },
      { text: 'Indoor Sports Complex Hall A synthetic floor maintenance completed.', time: 'Yesterday' },
      { text: 'New tournament rule handbook uploaded for 2026 Academic Season.', time: '2 days ago' }
    ];

    const DEMO_USER = {
      name: 'Alex Rivers',
      email: 'alex@sportsphere.edu',
      password: 'demo1234',
      phone: '+1 (555) 438-9210',
      role: 'Player',
      sports: ['Football', 'Cricket'],
      registeredEvents: ['evt-1'] // Registered in cricket
    };

    /* ==========================================================================
       2. LOCALSTORAGE INITIALIZER
       ========================================================================== */
