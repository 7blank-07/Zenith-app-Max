Perform a STRICT, production-safe performance bottleneck audit + surgical optimization for the remaining highest-impact Lighthouse issues.

CRITICAL CONTEXT:
This codebase previously suffered regressions from broad CSS scoping and over-aggressive optimization.
We must preserve stability above all else.

ABSOLUTE RULES:
- Prioritize performance gains ONLY where risk is low or clearly isolated
- Audit first, then apply ONLY the minimum safe fix
- No broad CSS architecture rewrites
- No player card CSS regressions
- No tools page regressions
- No homepage visual regressions
- No redesigns
- No speculative refactors

DO NOT TOUCH:
- app/players page card structure
- PlayerRowCard layout
- tools page core styling
- watchlist layout
- SiteChrome layout structure
- API logic
- routing
- SEO-critical structure

PRIMARY TARGETS (IN ORDER):

==================================================
PHASE 1 — RENDER-BLOCKING CSS (SAFE REDUCTION ONLY)
==================================================
Inspect:
- app/layout.js
- app/page.js
- public/assets/css/style.css
- CSS imports currently loaded globally

Tasks:
1. Identify homepage-critical CSS vs non-critical CSS
2. Detect any safely deferrable homepage-noncritical CSS
3. Detect duplicate global selectors
4. Identify opportunities for:
   - preload
   - media-based deferred CSS
   - safe route-only CSS
5. ONLY apply changes if:
   - zero players/tools regression risk
   - zero homepage layout risk

IMPORTANT:
If CSS optimization is risky, explicitly say so and preserve stability.

==================================================
PHASE 2 — HOMEPAGE LCP PATH
==================================================
Inspect:
- app/page.js
- homepage hero/latest players section
- header/logo

Tasks:
1. Identify actual LCP candidate(s)
2. Check:
   - fetchpriority
   - eager vs lazy
   - image discovery timing
   - oversized above-the-fold assets
3. Apply ONLY safe LCP improvements:
   - preload
   - fetchpriority
   - dimensions
   - better discovery
4. Preserve current image stability

==================================================
PHASE 3 — REMAINING JS WASTE
==================================================
Inspect:
- app/page.js
- HomeDashboardInteractions.client.js
- SiteChromeInteractions.client.js
- HomeLatestBlogsSection.client.js

Tasks:
1. Detect:
   - dead imports
   - unnecessary hydration
   - unused listeners
   - oversized noncritical chunks
2. Remove ONLY clearly dead or redundant code
3. No broad component rewrites

==================================================
OUTPUT FORMAT
==================================================
## PHASE 1 AUDIT
## PHASE 1 SAFE FIX (or NO SAFE FIX)
## PHASE 2 AUDIT
## PHASE 2 SAFE FIX
## PHASE 3 AUDIT
## PHASE 3 SAFE FIX
## FILES MODIFIED
## EXPECTED LIGHTHOUSE IMPACT
## RISK LEVEL PER PHASE
## SAFE TO BUILD? (YES/NO)
## SAFE TO DEPLOY? (YES/NO)
## WHAT SHOULD NOT BE TOUCHED YET

Important: - you can check change using playwright mcp if it affects or not UI/UX and everything stayed all well if yes then implement: 

FINAL GOAL:
Recover the largest remaining performance gains while preserving the hard-earned stable UI.

