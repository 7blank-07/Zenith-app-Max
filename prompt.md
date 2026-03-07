Start Phase 3 responsive header refinement.

Act as a senior frontend engineer and product UI/UX architect.

IMPORTANT RULE:
Do NOT modify the desktop header layout.  
Desktop (width > 1020px) is already correct and must remain exactly as it is.

Only improve responsive behavior for screens ≤1020px.

No logic changes allowed.  
Do not modify:
- formation logic
- drag/drop logic
- squad calculations
- save/load/export functionality
- state handlers
- event handlers

This task is ONLY layout and responsive UI refinement.

------------------------------------------------

GOAL

Make the squad-header professional and extremely space-efficient on small screens.

Avoid wasted space, large gaps, or oversized controls.

The layout should resemble professional dashboard toolbars used in modern SaaS applications.

Controls must be grouped logically and arranged for maximum efficiency.

------------------------------------------------

BREAKPOINTS

Implement responsive layouts for these breakpoints:

≤1020px  (tablet)
≤768px   (large mobile)
≤480px   (small mobile)
≤368px   (very small phones)

Desktop (>1020px) must not change.

------------------------------------------------

TABLET LAYOUT (≤1020px)

Use two compact rows.

Row 1:
Squad Builder title
Squad name input
Theme toggle
Fullscreen button
Close button

Row 2:
Formation selector
Save Squad
Load Squad
Reset
Export
Badges
OVR
VALUE

Use flex-wrap or grid but maintain tight spacing.

------------------------------------------------

MOBILE LAYOUT (≤768px)

Use structured multi-row layout without wasting horizontal space.

Row 1:
Title
Fullscreen
Close

Row 2:
Squad name input

Row 3:
Formation selector
Save
Load

Row 4:
Export
Badges
Reset

Row 5:
OVR
VALUE

Buttons should share width evenly where possible.

------------------------------------------------

SMALL MOBILE (≤480px)

Use grid layout to maximize efficiency.

Example grid:

grid-template-columns: 1fr 1fr
gap: 8px

Buttons should fill the available width.

Example grouping:

Row 1:
Title | Fullscreen

Row 2:
Squad name input

Row 3:
Formation selector

Row 4:
Save | Load

Row 5:
Export | Badges

Row 6:
OVR | VALUE

------------------------------------------------

VERY SMALL DEVICES (≤368px)

Ensure layout never overflows.

Use compact spacing and allow text truncation.

Example:

overflow: hidden
text-overflow: ellipsis
white-space: nowrap

------------------------------------------------

MOBILE CONTROL SIZE

Reduce button sizes for smaller screens.

Use:

height: 36px
padding: 6px 10px
font-size: 13px

------------------------------------------------

SPACING SYSTEM

Use consistent spacing rhythm.

gap between controls: 8px
gap between rows: 12px

------------------------------------------------

HEADER PADDING

Reduce container padding on small screens.

Use:

padding: 12px

------------------------------------------------

INPUT WIDTH

Limit squad name input width so it does not waste space.

Example:

max-width: 180px

------------------------------------------------

END RESULT

The squad-header must look like a professional responsive toolbar used in production dashboard tools.

It should be:

compact  
efficient  
well-grouped  
space optimized  
visually clean  

while preserving the existing desktop layout completely.