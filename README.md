<div align="center">

# SportSphere

### One campus. Six sports. Every season in play.

A React-powered campus sports hub for discovering tournaments, following fixtures, and keeping player activity in view.

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
| **Demo tools** | Restore the sample dataset or inspect and export browser-stored app data. |

## Get on the field

You'll need [Node.js](https://nodejs.org/) and npm.

1. Clone the repository and install dependencies:

   ```bash
   git clone https://github.com/aarishidey23/sports-league-management-system.git
   cd sports-league-management-system
   npm install
   ```

2. Start the Vite development server:

   ```bash
   npm run dev
   ```

   Open the local URL printed in your terminal.

To create and preview a production build:

```bash
npm run build
npm run preview
```

## Try the demo

If the sign-in screen is shown, use the built-in sample account:

| Email | Password |
| --- | --- |
| `alex@sportsphere.edu` | `demo1234` |

The app also initializes sample users, sports, events, and activity in browser storage so the dashboard has data to explore.

## Under the hood

SportSphere is built with **React**, **Vite**, and plain **CSS**. It has no backend or external data service.

```text
.
├── index.html          # Vite HTML entry
├── src/
│   ├── App.jsx          # React views, interactions, and local demo state
│   ├── data.js          # Sample sports, tournaments, and player data
│   └── main.jsx         # React application entry point
├── css/
│   └── style.css        # Layout, components, and responsive styling
├── courts/              # Sport illustrations
├── oval.svg
└── track.svg
```

## Important demo limitations

This project is a client-side academic demo, **not production authentication or league software**. User accounts and app data are stored in the browser with `localStorage` and `sessionStorage`; there is no server-side authentication or database. The sample password is visible in the source code. Do not enter real passwords, personal information, or other sensitive data.
