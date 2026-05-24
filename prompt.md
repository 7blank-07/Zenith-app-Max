Create a complete Partners Management System for ZenithFCM by following and reusing the EXISTING project architecture, tech stack, admin panel structure, authentication system, database setup, UI patterns, and component system already present in the codebase.

IMPORTANT:
Before generating code:
- Analyze the current project structure
- Detect the framework and stack automatically
- Reuse existing admin layouts/components
- Reuse existing database patterns/models
- Reuse existing authentication system
- Match existing styling and conventions
- Do NOT introduce a different architecture or unnecessary dependencies

==================================================
CONTEXT
==================================================

ZenithFCM already has:
- Admin dashboard
- Redeem code system
- Blogs system
- Top 10 system
- Streaming system

Existing admin route:
- /admin

The new Partners system must integrate naturally into the existing admin ecosystem.

==================================================
PUBLIC PAGE
==================================================

Create:
- /partners

Purpose:
Display official ZenithFCM partners, creators, streamers, Discord communities, promoters, and ecosystem supporters.

The page should feel premium, modern, creator-focused, and zenith FC Mobile themed.

==================================================
PAGE SECTIONS
==================================================

1. HERO SECTION
- Title:
  "Official ZenithFCM Partners"

- Subtitle:
  "Creators, streamers, communities, and ecosystem partners supporting ZenithFCM."

2. FEATURED PARTNERS SECTION
- Optional section at top
- Larger premium cards
- Smooth glow effects
- Horizontally highlighted layout

3. FILTER SYSTEM
Tabs:
- All
- YouTube
- TikTok
- X/Twitter
- Discord
- Website

4. SEARCH SYSTEM
Allow searching by:
- name
- username
- bio

5. PARTNERS GRID
Responsive modern grid layout.

==================================================
PARTNER CARD REQUIREMENTS
==================================================

Cards should dynamically render only available data.

Required fields:
- name
- platform
- social_url

Optional fields:
- username
- bio
- avatar/logo
- follower_count
- featured
- verified
- display_order

Examples:
- If bio is empty, do not render bio section
- If follower_count is missing, hide it
- If avatar is missing, generate fallback initials/avatar
- If verified is false, hide verified badge
- If featured is false, use standard card style

Each card may include:
- Avatar/logo
- Name
- Username
- Platform icon
- Bio
- Follower/subscriber count
- Verified badge
- Featured badge
- Visit button

==================================================
CARD DESIGN
==================================================

Use:
- Glassmorphism effects
- Smooth hover animations
- Glow borders
- Subtle scaling effects
- Premium dark UI
- Mobile-first responsive design

The page should feel inspired by creator ecosystem pages like RenderZ creators while remaining unique to ZenithFCM branding.

==================================================
CTA SECTION
==================================================

Add optional:
"Become a ZenithFCM Partner"

Button can link to:
- Discord
- Contact page
- Application form

==================================================
ADMIN PANEL INTEGRATION
==================================================

Integrate inside existing:
- /admin

Add:
- "Partners" to existing admin sidebar/navigation

Create:
- /admin/partners

IMPORTANT:
- Reuse current admin authentication
- Reuse current admin layouts/components
- Match existing admin UI patterns

==================================================
ADMIN FEATURES
==================================================

Inside /admin/partners create:

1. PARTNERS TABLE
Columns:
- Avatar
- Name
- Platform
- Featured
- Verified
- Created At
- Actions

2. ADD PARTNER
Modal or dedicated page form

3. EDIT PARTNER

4. DELETE PARTNER
Include confirmation modal

5. QUICK TOGGLES
Allow quick toggle for:
- Featured
- Verified

6. DISPLAY ORDER SYSTEM
Allow sorting/reordering partners

7. ADMIN UX
Include:
- Toast notifications
- Loading states
- Skeleton loaders
- Empty states
- Proper error handling

==================================================
DATABASE
==================================================

Create or extend the existing database structure appropriately for partners.

Suggested structure:

partners
- id
- name
- username
- platform
- bio
- avatar_url
- follower_count
- social_url
- featured
- verified
- display_order
- created_at

Platform types:
- youtube
- tiktok
- twitter
- discord
- website

Only enforce required validation for:
- name
- platform
- social_url

Everything else should remain optional.

==================================================
SEO
==================================================

Add proper SEO metadata for:
- /partners

Include:
- title
- description
- OpenGraph
- Twitter metadata

==================================================
PERFORMANCE
==================================================

- Lazy load images
- Optimize rendering
- Mobile optimized
- Fast loading
- Production-ready

==================================================
CODE QUALITY
==================================================

- Production-ready architecture
- Modular reusable components
- Proper typing
- Scalable structure
- Clean code
- Consistent with existing project standards
- Reusable UI patterns
- Avoid duplicate logic

==================================================
IMPORTANT FINAL REQUIREMENTS
==================================================

- Follow the existing ZenithFCM architecture strictly
- Do NOT rewrite existing systems
- Integrate cleanly into current admin/dashboard setup
- Keep the UI premium and modern
- Ensure the system is flexible enough for creators, Discord servers, streamers, websites, and future partner types