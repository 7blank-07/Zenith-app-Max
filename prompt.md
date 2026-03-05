Goal

Rewrite the entire Zenith legacy SPA into a full Next.js App Router application while keeping the interface visually identical to the original SPA.

CRITICAL REQUIREMENT

The final UI must look EXACTLY the same as the original SPA.

Visual parity with the SPA is mandatory:

* same layout
* same sections
* same DOM hierarchy
* same CSS classes
* same visual styling
* same component placement
* same interactions

Do NOT redesign anything.
Do NOT simplify the layout.
Do NOT rename CSS classes.

Recreate the exact markup structure used in the SPA so the existing CSS renders the interface identically.

---

Legacy SPA Analysis Requirement

Before implementing anything, analyze the legacy SPA implementation to understand the exact DOM structure and UI behavior.

Specifically inspect these files:

assets/js/app.js
assets/js/router.js
assets/js/data/api-client.js
assets/js/data/supabase-provider.js

Identify how the SPA renders:

* dashboard player cards
* player database rows
* player detail layout
* watchlist table
* tools page components
* header and footer

Extract the DOM structure and class names used by the SPA.

The Next.js implementation must reproduce the same DOM structure so the existing CSS applies correctly.

If a UI element existed in the SPA, it must exist in the Next.js version with the same layout and styling.

---

Legacy Rendering Functions Reference

The SPA already contains functions responsible for generating UI markup.

Before implementing React components, inspect how these functions generate DOM markup:

createDashboardPlayerCard
renderPlayerDetail
renderPlayerRow
renderWatchlistTable
renderToolsPage

These functions define the correct DOM structure and CSS class usage.

The Next.js implementation should reproduce the same markup structure inside React components so the UI appears identical to the SPA.

---

Implementation Process

Before writing any code:

1. Analyze the legacy SPA implementation.
2. Identify all UI sections rendered by the SPA.
3. Map those sections to React components.
4. Only after this analysis begin implementing the Next.js components.

Do not start coding until the SPA structure has been fully understood.

---

Existing CSS That Must Be Reused

/assets/css/style.css
/assets/css/tool-style.css
/assets/css/watchlist-styles.css

These styles already contain all UI styling.

The implementation must reuse the same CSS selectors.

Do NOT create new CSS unless absolutely required.

---

CSS Preservation Rule

Existing CSS must remain untouched.

Do NOT rename, modify, or remove CSS classes used by the SPA.

The Next.js implementation must use the same selectors so styling from the existing CSS files continues to apply.

If a CSS selector existed in the SPA markup, the same selector must exist in the Next.js markup.

---

Allowed Copilot Skills (use when helpful)

vercel-react-best-practices
vercel-composition-patterns
web-design-guidelines

Use these skills if they improve component structure, performance, or accessibility.

---

Architecture Constraints

Keep the current Next.js architecture.

Do NOT remove or change:

generateStaticParams
revalidate
server SEO metadata

The following route must remain ISR:

/player/[id]

The server data layer inside:

src/lib/server/*

must remain unchanged.

---

Pages That Must Be Rebuilt With Full SPA Parity

HOME PAGE (/)

Must include:

Header navigation
Global search bar
Banner section
Latest players section
Trending players section
Recent events section
Player cards grid
Footer

Player cards must reuse the existing dashboard-player-card markup.

---

PLAYERS DATABASE PAGE (/players)

This must replicate the SPA player database view exactly.

Required features:

Search bar
Filters (position, nation, league, etc)
Sorting controls
Player rows table
Watchlist heart button
Player card preview popup
open-stats-modal (stats) for filtering by stats

Each player row must include these columns:

Position
Sub position
Player name
OVR
PAC
SHO
PAS
DRI
DEF
PHY

Use the same row layout and CSS classes used in the SPA.

---

PLAYER DETAIL PAGE (/player/[id])

Restore all sections that existed in the SPA:

Player card
Rank selector
Training level
Stats
Skills & abilities
League
Work rates
Strong foot
Weak foot
Body information
Add to watchlist button
Market data

Reuse the same DOM structure used in the SPA player detail layout.

Do NOT simplify the player page.

---

WATCHLIST PAGE (/watchlist)

Must include:

Search bar
Filters
Player rows
Basic stat columns
Card preview popup
Watchlist management actions

Use the same table layout used by the SPA watchlist.

---

TOOLS PAGE (/tools)

Must include these tools rebuilt as client components:

Squad Builder
Compare Players
Profit Calculator

The tools page layout must visually match the SPA tools page.

---

Component Architecture

Use React Server Components for:

Home page sections
Player database table
Player detail layout

Use Client Components for:

Filters
Watchlist interactions
Tools
Interactive UI widgets

Reuse existing DOM class names from the SPA to maintain styling.

Do NOT create new CSS.

---

Implementation Rules

Preserve the exact DOM structure used in the SPA wherever possible.

Existing class names such as:

dashboard-player-card
player-row-card
player-top-section
stats-grid-container

must remain unchanged.

---

Execution Protocol

Work in phases.

Implement only ONE phase per request.

After finishing a phase respond exactly:

Phase <N> complete.

Then wait for the next instruction.

---

Primary Objective

Deliver a full Next.js rewrite that looks visually identical to the original SPA while preserving:

ISR player pages
SEO server rendering
modern React architecture
