# Zenith - ZenithFCM.com

[![Website](https://img.shields.io/badge/Website-zenithfcm.com-blue)](https://www.zenithfcm.com)
[![Next.js](https://img.shields.io/badge/Framework-Next.js%2014-black)](https://nextjs.org/)
[![License](https://img.shields.io/badge/License-Private-red)](#)

Zenith is a high-performance, comprehensive web application built for **FC Mobile / EA FC enthusiasts**. It provides a robust platform for player scouting, market analysis, and community content, serving as the backbone for [zenithfcm.com](https://www.zenithfcm.com).

## 🚀 Key Features

- **Comprehensive Player Database:** Detailed statistics, traits, and historical data for thousands of players.
- **Market Intelligence:** Real-time price tracking, refresh timers, and market value history powered by Supabase.
- **Squad Builder:** Advanced interactive tool for building, optimizing, and sharing team lineups.
- **Compare Tool:** Side-by-side comparison of player stats and performance metrics.
- **Blog & News CMS:** Custom-built content management system for community guides, news, and updates.
- **Legacy Compatibility:** Seamless integration with legacy SPA components for continuous service during migration.
- **SEO Optimized:** Automated JSON-LD generation and pre-rendering of top 10,000 players for maximum search visibility.

## 🛠️ Tech Stack

- **Frontend:** [Next.js 14](https://nextjs.org/) (App Router), [React 18](https://reactjs.org/), TypeScript.
- **Styling:** Vanilla CSS, Module CSS.
- **Data & Backend:**
    - **Market Data:** [Supabase](https://supabase.com/) (Real-time tracking).
    - **Blog Content:** PostgreSQL.
    - **Static Data:** Local JSON sources for high-performance scouting.
- **Image Processing:** [Sharp](https://sharp.pixelplumbing.com/) (Dynamic image optimization and export).
- **Visualization:** [Chart.js](https://www.chartjs.org/) (Price history and stat radars).

## 🏛️ Architecture

Zenith follows a modern, performance-first architecture:

1.  **Hybrid Rendering Strategy:**
    -   **SSG (Static Site Generation):** The top 10,000 players are pre-rendered at build time to ensure instant load times and perfect SEO.
    -   **ISR (Incremental Static Regeneration):** Dynamic content (market data, blogs) is cached and updated in the background. Player pages have a 50-day cache window, while blogs refresh hourly.
    -   **SSR (Server-Side Rendering):** Used for highly dynamic or personalized views.
2.  **Modular Core:** Core business logic, database repositories, and server-side utilities are isolated in `src/lib/`.
3.  **Legacy Bridge:** A specialized runtime mounts legacy SPA components at `/legacy`, allowing for a phased transition to the App Router.
4.  **API Layer:** Mix of Next.js Route Handlers and internal APIs for data fetching and revalidation.

## 📁 Project Structure

- `app/`: Next.js App Router (Pages, Components, API Routes).
- `src/lib/`: Core logic, database abstractions, and server utilities.
- `src/data/`: Static JSON data sources (e.g., `top-players.json`).
- `scripts/`: Build-time automation, migrations, and maintenance tools.
- `public/`: Static assets and optimized legacy bundles.
- `assets/`: Global styles and legacy JavaScript assets.

## 🏁 Getting Started

### Prerequisites
- Node.js (Latest LTS recommended)
- PostgreSQL (For Blog CMS)
- Supabase Account (For Market Data)

### Installation
```bash
npm install
```

### Environment Setup
Create a `.env.local` file with the following (refer to `Documentation-zenith.md` for details):
- `BLOG_DATABASE_URL`
- `SUPABASE_URL` & `SUPABASE_KEY`
- Admin/Editor credentials for CMS access.

### Development
```bash
npm run dev
```

### Production Build
To build for production with the full 10,000 player pre-render:
```bash
# Optional: Update the top players list
npm run generate:top-players

# Build the application
npm run build

# Start the server
npm run start
```

## 🧪 Maintenance Commands

- **Check Rollout Status:** `npm run rollout:status`
- **Database Migrations:** `npm run db:migrate:blog`
- **On-demand Revalidation:** `npm run revalidate:call`

---

Built with ❤️ for the FC Mobile Community. Visit us at [zenithfcm.com](https://www.zenithfcm.com).
