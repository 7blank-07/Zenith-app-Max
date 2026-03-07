Start Phase 3 header refinement.

Act as a senior frontend engineer and product UI/UX architect.

The Squad Builder header currently looks unprofessional and has multiple issues.

Fix the header layout and styling to match production-quality SaaS tools.

IMPORTANT:
Do NOT modify any logic related to:
- formations
- drag and drop
- squad calculations
- save/load/export behavior
- state management

Only improve layout, structure, and styling.

------------------------------------------------

1. REMOVE DUPLICATE THEME BUTTON

There are currently two "change field theme" buttons.

Find where the theme toggle button is rendered and ensure it appears ONLY once in the header.

If it is rendered twice in JSX, remove the duplicate.

------------------------------------------------

2. FIX HEADER LAYOUT (SINGLE ROW)

The squad header must fit in a single row on desktop.

Reorganize header structure into logical groups:

LEFT GROUP
- "Squad Builder" title
- squad name input
- theme toggle button

CENTER GROUP
- Export
- Badges
- OVR indicator
- VALUE indicator

RIGHT GROUP
- Formation selector
- Save Squad
- Load Squad
- Reset
- Fullscreen toggle
- Close button

These groups must be aligned horizontally using flex layout.

------------------------------------------------

3. FIX INPUT WIDTH

The squad name input is currently too wide.

Limit it so other controls fit in the same row.

Use something like:

max-width: 220px

Do not allow it to stretch across the header.

------------------------------------------------

4. FIX BUTTON ALIGNMENT

All buttons and controls must have identical height.

Use a consistent height for all controls.

Example:

height: 40px

Ensure the following align perfectly on the same baseline:
- squad name input
- export button
- badges button
- formation selector
- save/load/reset buttons
- fullscreen button
- close button

------------------------------------------------

5. UNIFY BUTTON COLORS

Currently Save Squad and Load Squad are blue but other buttons are different.

Standardize button styles.

Use three button types:

Primary
- Save Squad

Secondary
- Load Squad
- Export
- Badges

Ghost
- Reset
- Close
- Fullscreen

Use the existing Zenith app theme variables.

Do not introduce random colors.

------------------------------------------------

6. IMPLEMENT REAL FULLSCREEN MODE

The fullscreen button currently just enlarges the builder.

Instead implement a real fullscreen experience using the browser Fullscreen API.

When clicking the fullscreen button:

call requestFullscreen() on the squad builder container.

When exiting fullscreen:

call document.exitFullscreen().

Target the main squad builder wrapper.

This should behave similar to F11 fullscreen.

------------------------------------------------

7. IMPROVE SPACING SYSTEM

Apply consistent spacing across the header.

Use spacing rhythm:

8px
16px
24px

Use:

gap: 12px between controls
gap: 24px between control groups

------------------------------------------------

8. RESPONSIVE SAFETY

On smaller screens the header may wrap into two rows.

But on standard desktop widths (1366px and above) it must remain a single row.

------------------------------------------------

9. KEEP CURRENT HANDLERS

Do not rewrite event handlers.

Keep existing functions for:
- saveSquad
- loadSquad
- export
- reset
- formation change

Only adjust layout and styling.

------------------------------------------------

END GOAL

The Squad Builder header should look like a professional dashboard toolbar similar to tools like Figma, Linear, or Vercel dashboards.

Clean alignment.
Consistent button styles.
Proper control grouping.
Single-row professional layout.
Working fullscreen toggle.