# ZenithFCM Streaming / Live Hub — Production-Ready Gemini CLI Master Prompt

## ROLE

You are a senior full-stack architect, product strategist, UI/UX systems designer, and SEO engineer working on the existing **ZenithFCM web app** (FC Mobile platform).

Your job is to design and implement a **fully production-ready Streaming / Live Hub ecosystem** that transforms ZenithFCM from a blog + database into a:

# FC Mobile Content + Streaming + Tournament + Community Hub

**IMPORTANT:**

* Use **YouTube Live + YouTube embeds only** as the streaming engine
* DO NOT build custom streaming servers or video hosting
* Build scalable infrastructure for tournaments, replays, and future esports growth
* Match existing ZenithFCM premium branding and architecture
* Mobile-first, SEO-first, production-grade

---

# PRIMARY BUSINESS GOAL

ZenithFCM should:

* Host live tournament broadcasts
* Showcase ongoing community events
* Archive stream replays
* Increase social growth via YouTube
* Increase website SEO via streaming pages
* Increase Discord community growth
* Create monetization opportunities

---

# CORE IMPLEMENTATION REQUIREMENTS

# 1. CREATE A NEW TOP-LEVEL STREAMING CATEGORY

## Add:

### Navigation Label:

**Streaming**

### SEO Slug:

`/streaming`

### Integrate into:

* Header navigation
* Footer navigation
* Homepage sections
* Sitemap
* Internal search
* Breadcrumbs

---

# 2. BUILD A COMPLETE STREAMING HUB PAGE

## Route:

`/streaming`

## PURPOSE:

Main central hub for all livestreams, tournaments, replays, and upcoming events.

---

## PAGE ARCHITECTURE:

# HERO SECTION:

### LIVE NOW (if active)

Include:

* Large featured YouTube livestream embed
* Live badge
* Stream title
* Tournament/event title
* Host / streamer
* CTA: Watch on YouTube
* CTA: Join Discord
* CTA: View Tournament Page

### If no live stream:

Display featured upcoming stream instead.

---

# UPCOMING STREAMS SECTION:

Cards with:

* Thumbnail
* Match/Event title
* Date/time
* Countdown / Scheduled label
* Tournament category
* Player/team names
* Reminder CTA

---

# RECENT REPLAYS SECTION:

Cards with:

* YouTube thumbnail/embed
* Replay badge
* Match summary
* Result
* Watch replay CTA
* Read full blog CTA

---

# STREAM FILTER SYSTEM:

Include tabs/filters:

* All
* Live
* Upcoming
* Replay
* Tournaments
* Community

---

# 3. INDIVIDUAL STREAM PAGES (DYNAMIC)

## Route Example:

`/streaming/community-cup-1`

## REQUIRED TEMPLATE:

### Top Section:

* Stream title
* YouTube embed
* Status badge (Live / Upcoming / Replay)
* Tournament banner
* Match date/time
* Host
* Players/participants

### Main Content:

* Full event description
* Match breakdown
* Bracket / standings support
* Related blogs
* Related player database links
* Discord CTA
* Redeem code CTA

### Sidebar / Secondary:

* Upcoming matches
* Related streams
* Featured players
* Popular blogs

### SEO:

* Schema markup
* OpenGraph
* Rich snippets
* Canonical structure

---

# 4. ADMIN / CMS SYSTEM (EXTEND EXISTING ZENITHFCM ADMIN)

## IMPORTANT:

ZenithFCM already has an existing admin CMS at:

### `zenithfcm.com/admin`

This current CMS already manages:

* Blogs
* Redeem Codes

## PRIMARY OBJECTIVE:

DO NOT build a separate CMS.

### Instead:

**Extend the existing ZenithFCM admin panel architecture** to support Streaming / Live Hub features while preserving current admin design language, authentication, dashboard patterns, database structure, and content workflows.

---

# REQUIRED CMS EXPANSION:

## Add a new admin module/tab:

### Streaming

### Suggested Admin Navigation:

* Dashboard
* Blogs
* Redeem Codes
* Streaming (NEW)
* Tournaments (future-ready optional)

---

# STREAMING MODULE FEATURES:

## STREAM MANAGEMENT:

Admins should be able to:

* Create stream
* Edit stream
* Delete stream
* Schedule stream
* Feature stream on homepage
* Mark stream status:

  * Live
  * Upcoming
  * Replay
* Archive completed streams
* Connect stream to related blog post
* Connect stream to tournament/event

---

# REQUIRED STREAM FIELDS:

* Stream title
* Slug (auto-generate + editable)
* YouTube URL
* YouTube video/live ID
* Thumbnail/banner
* Status:

  * Live
  * Upcoming
  * Replay
* Tournament/Event name
* Match stage:

  * Group Stage
  * Quarterfinal
  * Semifinal
  * Final
* Match date/time
* Host / streamer
* Player/team names
* Description
* Featured toggle
* Homepage visibility toggle
* Discord invite/join link
* Related blog selector
* SEO title
* Meta description
* Tags

---

# CMS UX REQUIREMENTS:

## Reuse existing Zenith admin design system:

* Existing sidebar
* Existing authentication
* Existing CRUD patterns
* Existing image upload system
* Existing SEO fields logic
* Existing slug logic

## New additions should feel native, not bolted on.

---

# DASHBOARD ENHANCEMENTS:

Add widgets/cards for:

* Active Live Stream
* Upcoming Streams Count
* Replay Library Count
* Featured Stream Status

---

# DATABASE / CONTENT MODEL:

Extend current CMS schema instead of rebuilding.

## Example:

### New Content Type:

`streams`

### Related to:

* blogs
* tournaments (future)
* categories

---

# AUTOMATION SUPPORT (FUTURE READY):

Prepare architecture for:

* Auto YouTube metadata sync
* Live status sync
* Scheduled publishing
* Replay auto-conversion

---

# PERMISSIONS:

Maintain existing admin permission system and allow role expansion later for:

* Stream managers
* Tournament hosts
* Editors

---

# 5. HOMEPAGE INTEGRATION

## Add a premium section:

# Zenith Live

### Must include:

* Current live stream OR next featured stream
* Live badge
* Watch now CTA
* Latest replay cards
* Tournament promo banner

---

# 6. TOURNAMENT INTEGRATION

Build structure so streams connect naturally with tournament ecosystem.

## Include:

* Tournament pages
* Bracket compatibility
* Match stages (Quarterfinal, Semifinal, Final)
* Community cups
* Discord tournaments

---

# 7. UI / UX REQUIREMENTS

## Design Style:

* Premium esports aesthetic
* FC Mobile-inspired visuals
* Mobile-first responsive
* High-performance
* Clean dark UI optional
* Fast-loading embeds
* Premium cards
* Modern CTA buttons
* Professional badges

## Performance:

* Lazy load embeds
* Thumbnail-first optimization
* Core Web Vitals aware

---

# 8. SEO STRATEGY

## Must include:

* Streaming category index page
* Dynamic stream page schema
* YouTube embed SEO
* Internal linking
* Blog-stream crosslinking
* Discord funnel
* Tournament keyword optimization

### Target Search Terms:

* FC Mobile live stream
* FC Mobile tournament live
* FC Mobile India tournament
* ZenithFCM live

---

# 9. CODE ARCHITECTURE DELIVERABLES

Provide:

## FRONTEND:

* Page architecture
* Component hierarchy
* Reusable stream cards
* Live player embed component
* Status badge system
* CMS integration layer

## BACKEND:

* Database schema
* Admin schema
* Routing
* Slug system
* SEO metadata system

## FILE STRUCTURE:

Production-ready folder/component organization

---

# 10. SCALABILITY

Design for future expansion:

* Multiple hosts
* Regional tournaments
* Creator streams
* Separate esports hub
* Automated YouTube API support
* Sponsorship slots

---

# FINAL OBJECTIVE

ZenithFCM should become:

# Website + YouTube Growth Engine + Tournament Broadcast Hub + Community Ecosystem

### SIMPLE:

**YouTube powers streaming. ZenithFCM powers brand, SEO, community, and monetization.**

---

# OUTPUT FORMAT REQUIRED FROM GEMINI CLI

## Deliver:

### Phase 1:

MVP implementation

### Phase 2:

Scaling architecture

### Phase 3:

Advanced automation

### Include:

* Full product strategy
* Frontend system
* Backend schema
* CMS system
* Routing map
* SEO system
* Monetization opportunities
* Production deployment guidance

---

# NON-NEGOTIABLE:

This must feel like a serious scalable digital media platform, not a basic blog category.
