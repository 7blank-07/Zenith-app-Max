Perform a HIGH-ROI, controlled deep optimization of ZenithFCM's blog image pipeline.

CONTEXT:
We have already completed:
- Major style.css purge
- Homepage image optimization
- Homepage icon stability fixes
- Deferred search hydration
- Stable production checkpoints

CURRENT SYSTEM:
- src/lib/image-optimization.mjs
- app/components/blog/OptimizedCoverImage.js

PRIMARY GOAL:
Make the blog image pipeline one of the final major performance wins by aggressively reducing real image payload across:
- Homepage featured blog
- Homepage compact blog cards
- Blog article hero
- Blog article cards
- Featured articles
- Related articles

ABSOLUTE RULES:
- Preserve exact visual parity
- Preserve SEO
- Preserve routing
- Preserve AdSense
- Preserve build safety
- No custom loader function serialization issues
- No Players / Tools / Watchlist changes
- Backup all modified files

==================================================
PHASE 1 — PIPELINE AUDIT
==================================================
Inspect:
- src/lib/image-optimization.mjs
- app/components/blog/OptimizedCoverImage.js
- All usage contexts

Tasks:
1. Audit current width params
2. Audit quality defaults
3. Audit responsive breakpoints
4. Identify oversized defaults
5. Identify wasted bytes by context
6. Verify build-safe implementation

==================================================
PHASE 2 — CONTEXTUAL PAYLOAD REDUCTION
==================================================
Tasks:
1. Optimize separately for:
   - Homepage featured
   - Homepage compact
   - Blog hero
   - Related cards
2. Improve:
   - width params
   - sizes
   - quality
   - source selection
3. Preserve appearance

==================================================
PHASE 3 — SYSTEM HARDENING
==================================================
Tasks:
1. Ensure:
   - No client/server boundary issues
   - No broken URLs
   - No homepage icon regressions
2. Improve maintainability of image optimization logic

==================================================
OUTPUT FORMAT
==================================================
## PHASE 1 AUDIT
## PHASE 2 CHANGES
## PHASE 3 HARDENING
## BACKUPS CREATED
## FILES MODIFIED
## EXPECTED KB SAVINGS
## EXPECTED LIGHTHOUSE IMPACT
## RISK LEVEL
## SAFE TO BUILD? (YES/NO)
## SAFE TO DEPLOY? (YES/NO)
## HIGH-RISK QA CHECKLIST
## FULL ROLLBACK COMMAND

Important: - you can check change using playwright mcp if it affects or not UI/UX and everything stayed all well if yes then implement

FINAL GOAL:
Turn the blog image pipeline into one of the final major site-wide performance wins while preserving full production stability.