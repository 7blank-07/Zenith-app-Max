Context

The Zenith SPA → Next.js migration has already been completed through Phase 8.

Home page and core routing now work correctly.

We are now repairing the **Players Database page** so it behaves exactly like the original SPA implementation.

Target route:

/players

Important Architecture Rules

Do NOT execute or import legacy SPA scripts.

Legacy files may be used **only as reference to understand behavior**, but all functionality must be implemented using **React state, hooks, and Next.js components**.

Do not attach manual DOM listeners.

Do not rewrite the entire page.
Repair the existing Next.js implementation.

Files to inspect

app/players/page.js
app/components/PlayersDatabaseInteractions.client.js
app/components/PlayerPriceWidget.client.js

Legacy behavior reference files

assets/js/app.js
assets/js/router.js
assets/js/data/api-client.js
assets/js/data/supabase-provider.js

Do NOT modify

generateStaticParams
revalidate
src/lib/server/*

Do NOT modify generated files

src/lib/legacy-body.html
public/assets/js/legacy-app.bundle.mjs

Phase 1 — Diagnose the Players Page

Analyze the current implementation of the /players page and determine why the following SPA behaviors are missing or broken:

Auction Status toggle filter
Player prices not loading in rows
Stats button (open-stats-modal) not opening the stats modal
Sorting not working (Name, Rating, Price)
Pagination missing (should load only 70 players initially)

Trace how these features worked in the legacy SPA and identify where the Next.js implementation lost these behaviors.

Do not modify files yet.

Phase 2 — Repair the Next.js Implementation

Repair the /players page using React hooks and component logic.

Restore the following behaviors exactly as they worked in the SPA.

Auction Status Toggle

Add the Auction Status toggle to the filter panel.

Behavior:

OFF → show all players
ON → show only auctionable players

Filtering must update the players dataset using React state.

Player Prices

Currently player rows show "No data".

Fix the player rows so that each row loads the correct market price using the existing player price API or PlayerPriceWidget.

Prices must render correctly inside the table rows.

Stats Modal

Each player row contains a Stats button.

Currently clicking it does nothing.

Reconnect the interaction so clicking the button opens the player stats modal exactly like the SPA version.

Sorting

Restore sorting functionality for:

Sort by Name
Sort by Rating
Sort by Price

Sorting must be implemented using React state and memoized sorting logic.

Pagination

The players page must initially load **70 players only**.

A **Load More button** must appear at the bottom of the table.

Each click should load the next 70 players.

Example:

Initial load → 70 players
Load More → 140 players
Load More → 210 players

Search Behavior

Searching players must behave like the SPA.

Typing in the search field filters the players list instantly.

When clicking a player:

If the player page was already prerendered → it loads instantly.

If the player page was not prerendered → Next.js generates it using ISR.

Do not modify ISR configuration.

Modal Interactions

Ensure the following interactions work correctly:

Stats modal
Player preview card
Row interaction behavior

UI Parity

The /players page must look visually identical to the SPA version.

Do not change CSS classes or DOM structure unless required to repair interactions.

Phase 3 — Verification

Verify that the following behaviors work:

/players route loads successfully
Auction toggle filters players correctly
Player prices appear in rows
Stats modal opens correctly
Sorting works (Name, Rating, Price)
Pagination loads 70 players at a time
Search filters players correctly

Ensure the page behaves exactly like the SPA version while using the Next.js architecture.

Execution Protocol

Repair the Players Database page and restore full SPA parity using Next.js and React logic.

Do not execute legacy SPA scripts.

When the repair is complete respond exactly:

Players database parity restored.
