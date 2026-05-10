Perform the FINAL high-ROI optimization polish for ZenithFCM focused on:
- Explicit image dimensions
- CLS prevention
- Residual DOM efficiency
- Forced reflow reduction

CONTEXT:
Major optimization phases already completed:
- style.css purge
- Homepage image optimization
- Blog image pipeline
- Search hydration
- Shared JS reduction
- Chart.js deferral

PRIMARY GOAL:
Capture the final meaningful Lighthouse gains WITHOUT risky architecture rewrites.

TARGET METRICS:
- Explicit width/height warnings
- CLS
- Forced reflow
- DOM efficiency
- Residual long-task micro-optimizations

ABSOLUTE RULES:
- No broad rewrites
- No SEO changes
- No AdSense changes
- No API changes
- No routing changes
- No speculative framework changes
- Preserve visual parity
- Backup every touched file

==================================================
PHASE 1 — IMAGE DIMENSION AUDIT
==================================================
Inspect:
- Homepage cards
- Blog cards
- Player cards
- Search dropdown
- Shared icon/image components

Tasks:
1. Find images missing explicit width/height
2. Add proper intrinsic sizing
3. Preserve responsive behavior
4. Avoid breaking existing CSS positioning

==================================================
PHASE 2 — CLS + LAYOUT STABILITY
==================================================
Tasks:
1. Reduce layout shifts
2. Preserve placeholders/aspect ratios
3. Improve browser pre-layout calculations

==================================================
PHASE 3 — DOM / REFLOW MICRO-AUDIT
==================================================
Tasks:
1. Identify:
   - repeated layout reads
   - forced reflow hotspots
   - unnecessary sync measurements
2. Apply only safe micro-optimizations

==================================================
PHASE 4 — FINAL CLEANUP
==================================================
Tasks:
1. Remove dead micro-waste
2. Preserve all functionality
3. Build-safe only

==================================================
OUTPUT FORMAT
==================================================
## PHASE 1 IMAGE AUDIT
## PHASE 2 CLS FIXES
## PHASE 3 DOM / REFLOW FIXES
## PHASE 4 CLEANUP
## FILES MODIFIED
## EXPECTED LIGHTHOUSE IMPACT
## RISK LEVEL
## SAFE TO BUILD? (YES/NO)
## SAFE TO DEPLOY? (YES/NO)
## QA CHECKLIST
## FULL ROLLBACK COMMAND

Important: - you can check change using playwright mcp if it affects or not UI/UX and everything stayed all well if yes then implement

FINAL GOAL:
Deliver the final production polish pass that captures remaining Lighthouse gains while preserving the now highly-optimized architecture.