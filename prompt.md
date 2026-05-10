Recover ONLY the valuable homepage search hydration performance optimization that was previously implemented in HomeDashboardInteractions.client.js.

CONTEXT:
All files were restored, so the prior search hydration optimization is gone.
We now want to RE-APPLY ONLY the real performance gains from that work,
WITHOUT reintroducing risky DOM rewrites, dropdown rendering changes, CSS regressions, or structural search changes.

PRIMARY GOAL:
Restore:
1. Immediate homepage card interaction setup (critical path)
2. Deferred search hydration (search logic loads on first focus/input instead of full mount)
3. Reduced initial homepage main-thread work

DO NOT RESTORE:
- Event delegation rewrite
- DocumentFragment rewrite
- Dropdown markup changes
- Search result rendering changes
- CSS structure changes
- Experimental DOM refactors
- Mapping/helper rewrites

ABSOLUTE RULES:
- Keep original stable search dropdown rendering exactly as baseline
- Keep original search result HTML structure exactly as baseline
- Keep original helper logic exactly as baseline
- Only optimize hydration timing / initialization timing
- Preserve keyboard navigation
- Preserve search correctness
- Preserve dropdown behavior
- Preserve player card click behavior
- Build-safe only
- Backup file before edits

==================================================
PHASE 1 — BASELINE RESTORE AUDIT
==================================================
Inspect:
- app/components/HomeDashboardInteractions.client.js

Tasks:
1. Preserve original stable search rendering
2. Identify all search setup currently happening immediately on mount
3. Separate:
   - Critical immediate homepage card interactions
   - Search-specific heavy setup

==================================================
PHASE 2 — SEARCH HYDRATION RECOVERY
==================================================
Tasks:
1. Create setupCritical:
   - Homepage card clicks
   - Above-the-fold essentials
2. Create setupDeferredSearch:
   - Search DOM queries
   - Search listeners
   - Keyboard nav
   - Outside-click logic
3. Trigger setupDeferredSearch ONLY on:
   - first focus
   - first input
4. Ensure one-time initialization only

==================================================
PHASE 3 — SAFETY
==================================================
Tasks:
1. No rendering structure changes
2. No dropdown HTML changes
3. No helper rewrites
4. No event delegation rewrite
5. No syntax corruption
6. Preserve cleanup integrity

==================================================
OUTPUT FORMAT
==================================================
## Original Baseline Preserved
## Search Hydration Gains Restored
## Immediate vs Deferred Split
## Backup Created
## Files Modified
## Expected TBT / INP Gains
## Risk Level
## Safe to Build? (YES/NO)
## Safe to Deploy? (YES/NO)
## QA Checklist
## Rollback Command

Important: - you can check change using playwright mcp if it affects or not UI/UX and everything stayed all well if yes then implement

FINAL GOAL:
Recover the real homepage search hydration performance benefits only, while preserving the original stable search UI and rendering system exactly.