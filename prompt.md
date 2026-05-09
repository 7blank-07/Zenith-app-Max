You are a senior Next.js App Router engineer + Technical SEO debugging specialist.

CRITICAL ISSUE:
My SEO migration to clean tool URLs is mostly complete, but there is now a redirect loop error on legacy query URLs.

CURRENT PROBLEM:
When visiting:
http://localhost:3000/tools?tool=squadbuilder

I get:
ERR_TOO_MANY_REDIRECTS

BUT:
http://localhost:3000/tools/squad-builder
works correctly.

PRIMARY OBJECTIVE:
Fix the redirect loop completely while preserving perfect SEO architecture.

IMPORTANT:
I need:
- Legacy query URLs to 301 ONCE to clean URLs
- Clean URLs to load normally with 200
- Zero redirect loops
- Zero crawl waste
- Zero duplicate content
- Zero canonical confusion

DESIRED BEHAVIOR:

/tools?tool=squadbuilder
→ 301
→ /tools/squad-builder
→ 200

/tools?tool=compare
→ 301
→ /tools/player-compare
→ 200

/tools?tool=watchlist
→ 301
→ /tools/watchlist
→ 200

/tools/squad-builder
→ 200 only

/tools/player-compare
→ 200 only

/tools/watchlist
→ 200 only

LIKELY ROOT CAUSES TO AUDIT:
1. next.config.js redirect rules too broad
2. middleware redirect conditions conflicting
3. Legacy redirect rules matching clean routes
4. Cleanup redirects looping
5. Client-side router logic re-appending ?tool=
6. window.history.replaceState
7. router.push/router.replace
8. useSearchParams sync
9. Redirect chain conflicts

TASKS:

1. Audit next.config.js redirects thoroughly
2. Audit middleware thoroughly
3. Audit ToolsInteractions.client.js thoroughly
4. Search entire codebase for:
   - tool=
   - replaceState
   - pushState
   - router.push
   - router.replace
   - searchParams
   - useSearchParams

5. Ensure legacy redirects ONLY trigger when:
   pathname === /tools
   AND query param tool exists

6. Ensure clean URLs NEVER trigger legacy redirects

7. Ensure cleanup redirects ONLY strip params from already-clean routes:
   Example:
   /tools/squad-builder?tool=squadbuilder
   → /tools/squad-builder

8. Prevent:
   /tools?tool=squadbuilder
   → /tools/squad-builder
   → /tools?tool=squadbuilder

9. Ensure no reverse redirects exist

10. Preserve:
   - Current UI
   - Tool rendering
   - SEO metadata
   - Sitemap
   - Canonicals

11. Validate:
   One-hop redirects only

12. Production-ready implementation

IDEAL IMPLEMENTATION:
- Strict redirect conditions
- Path-specific matching
- No wildcard overreach
- No duplicate rule collisions

DELIVER:
- Root cause diagnosis
- next.config.js fixes
- middleware fixes
- client-side fixes
- exact corrected redirect logic
- validation checklist
- explanation of why loop occurred

PRIORITY:
SEO + Redirect correctness + Crawl efficiency + Production stability

IMPORTANT:
This is a technical SEO debugging mission.
Do NOT rebuild architecture.
Fix the existing implementation with the cleanest possible redirect logic.
Think like:
Google Search Console expert +
Next.js routing engineer +
SEO migration specialist.