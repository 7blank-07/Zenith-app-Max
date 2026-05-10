Implement ONLY the safest remaining micro-optimizations for ZenithFCM WITHOUT touching AdSense at all.

CRITICAL:
AdSense must remain EXACTLY untouched.
DO NOT modify:
- Any AdSense script
- Any AdSense loading strategy
- Any Google monetization code
- Any monetization verification logic

PRIMARY GOAL:
Capture final low-risk performance gains through:
1. Resource hints (preconnect)
2. Homepage asset prioritization
3. Tiny network efficiency improvements

==================================================
SCOPE LOCK
==================================================
ONLY modify:
- app/layout.js
- app/page.js

DO NOT modify:
- HomeDashboardInteractions.client.js
- SiteChromeInteractions.client.js
- MobileNavigation.client.js
- Players page
- Tools page
- Watchlist
- Any CSS files
- Any API
- Any routing
- Any AdSense code
- Any GA code unless absolutely required for preconnect only

==================================================
PHASE 1 — RESOURCE HINTS
==================================================
Tasks:
1. Add safe <link rel="preconnect"> hints for:
   - https://images.zenithfcm.com
   - https://www.googletagmanager.com
2. Add crossorigin where appropriate
3. Do NOT alter existing script loading
4. Preserve SEO + SSR integrity

==================================================
PHASE 2 — HOMEPAGE MICRO IMAGE PRIORITY
==================================================
Tasks:
1. Audit homepage first-row player cards and critical visual assets
2. Ensure:
   - LCP-critical assets remain prioritized
   - Tiny club/nation/league icons explicitly use low fetch priority
   - Non-critical tiny assets do not compete with player portraits
3. Preserve exact visual parity
4. Do NOT risk player image stability

==================================================
PHASE 3 — SAFE HEAD CLEANUP
==================================================
Tasks:
1. Detect duplicate or unnecessary head hints
2. Remove only clearly redundant hints
3. No broad script or metadata refactors

==================================================
MANDATORY SAFETY
==================================================
- Backup files before edits
- No broad changes
- No CSS architecture changes
- No homepage layout changes
- No player/tools regressions
- If uncertain, preserve current behavior

==================================================
OUTPUT FORMAT
==================================================
## Files Modified
## Backup Files Created
## Preconnect Hints Added
## Homepage Priority Adjustments
## Head Cleanup Performed
## Expected Micro Performance Gain
## Risk Level
## Safe to Build? (YES/NO)
## Safe to Deploy? (YES/NO)
## Rollback Instructions

Important: - you can check change using playwright mcp if it affects or not UI/UX and everything stayed all well if yes then implement:

FINAL GOAL:
Secure the safest final performance gains while preserving monetization safety and full production stability.