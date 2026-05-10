Perform a HIGH-ROI advanced JavaScript bundle waste audit for ZenithFCM.

CONTEXT:
Major CSS, image, and search hydration optimizations are already complete.

CURRENT LIGHTHOUSE:
- Reduce unused JS: ~98 KiB
- Shared chunk 2117 includes legacy polyfills
- First Load JS shared by all still significant

PRIMARY GOAL:
Identify and reduce the biggest remaining first-party JavaScript waste BEFORE risky polyfill/build-target surgery.

ABSOLUTE RULES:
- Preserve functionality
- Preserve SEO
- Preserve routing
- Preserve AdSense
- Preserve Players / Tools / Watchlist
- Backup before edits
- No speculative framework rewrites
- Focus on highest-ROI bundle reductions

==================================================
PHASE 1 — SHARED JS FORENSIC AUDIT
==================================================
Inspect:
- Shared chunks
- app/page.js
- SiteChrome
- HomeDashboardInteractions
- Blog components
- Global imports
- Legacy utilities

Tasks:
1. Identify:
   - dead imports
   - duplicated client logic
   - over-hydrated components
   - globally loaded but route-local code
   - unnecessary shared dependencies
2. Rank largest likely JS waste sources

==================================================
PHASE 2 — HIGH-CONFIDENCE JS PURGE
==================================================
Tasks:
1. Remove dead code
2. Split route-specific JS
3. Reduce global client bundle
4. Defer non-critical hydration
5. Preserve UX

==================================================
PHASE 3 — POLYFILL STRATEGY AUDIT
==================================================
Tasks:
1. Determine if chunk 2117 polyfills are framework-default or dependency-driven
2. Identify safe opportunities
3. DO NOT aggressively rewrite browser targets yet unless high confidence

Important: - you can check change using playwright mcp if it affects or not UI/UX and everything stayed all well if yes then implement


==================================================
OUTPUT FORMAT
==================================================
## PHASE 1 AUDIT
## PHASE 2 CHANGES
## PHASE 3 POLYFILL ANALYSIS
## FILES MODIFIED
## EXPECTED JS SAVINGS
## RISK LEVEL
## SAFE TO BUILD? (YES/NO)
## SAFE TO DEPLOY? (YES/NO)
## ROLLBACK COMMAND