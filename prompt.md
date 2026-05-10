Perform a HIGH-RISK (but controlled), HIGH-ROI deep optimization of ZenithFCM's global style.css.

CONTEXT:
We want bigger gains than moderate optimization,
but NOT reckless “maximum” destructive surgery.

We already have:
- Stable commits
- Recovery checkpoints
- Backup discipline
- Time for QA
- Willingness to accept meaningful CSS risk for major performance gains

PRIMARY GOAL:
Aggressively reduce style.css bottlenecks while maintaining a realistic safety margin.

TARGET:
- Render-blocking CSS
- Parse weight
- Dead selectors
- Duplicate selectors
- Legacy UI blocks
- Redundant responsive layers
- Safe route-specific offloading ONLY if strongly verified

ABSOLUTE RULES:
- Backup before each major phase
- Verify selector usage before deletion
- Preserve:
  - Homepage
  - Players
  - Player detail
  - Tools
  - Watchlist
  - Blogs
  - Search
  - SiteChrome
- Prefer removing dead systems over restructuring active systems
- If uncertain, classify for review instead of deleting
- No JS/API/SEO/AdSense changes
- Avoid speculative rewrites

==================================================
PHASE 1 — DEEP CSS AUDIT
==================================================
Inspect:
- assets/css/style.css
- Route/component usage

Tasks:
1. Categorize:
   - Critical active
   - Route-specific active
   - Legacy dead
   - Duplicate
   - Deprecated responsive
2. Identify highest-confidence dead systems
3. Identify duplicate blocks
4. Identify low-risk large purge opportunities

==================================================
PHASE 2 — HIGH-CONFIDENCE PURGE
==================================================
Tasks:
1. Remove:
   - Clearly dead legacy UI systems
   - Obsolete player-card variants
   - Unused hero systems
   - Deprecated horizontal/list systems
   - Duplicate responsive blocks
2. Prioritize:
   - Large dead blocks
   - Selector families with zero codebase references
3. Preserve all ambiguous systems

==================================================
PHASE 3 — DUPLICATE / SPECIFICITY CLEANUP
==================================================
Tasks:
1. Merge obvious duplicates
2. Remove redundant breakpoint overrides
3. Reduce parse complexity
4. Avoid changing visual behavior

==================================================
PHASE 4 — LIMITED ROUTE CSS SCOPING (OPTIONAL)
==================================================
ONLY if strongly verified:
1. Move clearly isolated route-exclusive blocks out of global CSS
2. Limit to one route family at a time
3. Skip if dependency chain is risky

==================================================
PHASE 5 — SAFETY
==================================================
Tasks:
1. Create backups:
   - pre-audit
   - post-purge
   - final
2. Provide rollback commands
3. Flag highest-risk pages

==================================================
OUTPUT FORMAT
==================================================
## PHASE 1 CSS MAP
## PHASE 2 PURGED SYSTEMS
## PHASE 3 CLEANUP
## PHASE 4 SCOPING (or SKIPPED)
## TOTAL LINES REMOVED
## ESTIMATED KB SAVED
## EXPECTED LIGHTHOUSE IMPACT
## BACKUPS CREATED
## FILES MODIFIED
## HIGH-RISK QA CHECKLIST
## SAFE TO BUILD? (YES/NO)
## SAFE TO DEPLOY? (YES/NO)
## FULL ROLLBACK COMMANDS
## FINAL RISK LEVEL

Important: - you can check change using playwright mcp if it affects or not UI/UX and everything stayed all well if yes then implement

FINAL GOAL:
Push style.css significantly beyond current optimization with strong gains, while avoiding reckless full-system breakage.