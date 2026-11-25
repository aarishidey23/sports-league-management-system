<div align="center">

# SportSphere

### One campus. Six sports. Every season in play.

An interactive campus sports hub for discovering tournaments, following fixtures, and keeping player activity in view.

</div>

SportSphere is a front-end demonstration of a college sports club management experience. Explore six sports, browse upcoming competitions, register for events, and personalize a player profile - all from a single matchday dashboard.

> **A demo, not a live league platform:** the app runs entirely in your browser and uses sample data.

## The matchday lineup

| Area | What you can do |
| --- | --- |
| **Dashboard** | Check club stats, upcoming fixtures, and recent activity. |
| **Sports catalog** | Explore athletics, badminton, basketball, cricket, football, and volleyball. |
| **Tournaments** | Browse competitions, review event details, and manage registrations. |
| **Player roster** | Search and filter sample player profiles. |
| **Your profile** | Update profile details, choose sports interests, and switch themes. |
| **Demo tools** | Restore sample data or inspect and export browser-stored app data. |

## Get on the field

There is no build step, package installation, or server configuration required.

1. Clone the repository:

   ```bash
   git clone https://github.com/aarishidey23/sports-league-management-system.git
   cd sports-league-management-system
   ```

2. Open `index.html` in a modern browser.

   Or start a local static server:

   ```bash
   py -m http.server 8000
   ```

   Then visit [http://localhost:8000](http://localhost:8000).

## Try the demo

If the sign-in screen is shown, use the built-in sample account:

| Email | Password |
| --- | --- |
| `alex@sportsphere.edu` | `demo1234` |

The app also initializes sample users, sports, events, and activity in browser storage so the dashboard has data to explore.

## Under the hood

SportSphere is built with plain **HTML, CSS, and JavaScript**. It has no framework or external package dependencies.

```text
.
├── index.html          # App layout and views
├── css/
│   └── style.css       # Layout, components, and responsive styling
├── js/
│   ├── data.js         # Sample sports, tournaments, and player data
│   ├── auth.js         # Demo sign-in, profile, and browser storage
│   └── dashboard.js    # Navigation, rendering, search, and interactions
├── courts/             # Sport illustrations
├── oval.svg
└── track.svg
```

## Important demo limitations

This project is a client-side academic demo, **not production authentication or league software**. User accounts and app data are stored in the browser with `localStorage` and `sessionStorage`; there is no backend or database. The sample password is visible in the source code. Do not enter real passwords, personal information, or other sensitive data.
