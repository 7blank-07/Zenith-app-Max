STRICT HOMEPAGE PLAYER CARD ICON FIX.

ISSUE:
Homepage player card nation/club/league icons are broken (showing fallback text / missing images),
while Players page and other routes are working correctly.

This means the regression is homepage-only.

SCOPE:
ONLY inspect and modify:
- app/page.js

DO NOT TOUCH:
- Players page
- Tools
- Watchlist
- CSS architecture
- Global styles
- Other routes

TASK:
1. Audit homepage player card rendering for:
   - nation flag
   - club flag
   - league flag
   - badge
2. Compare current homepage icon/image implementation against previously working raw asset behavior
3. Identify:
   - broken src
   - broken Image usage
   - broken loader/path
   - malformed attributes
4. Restore working homepage icon rendering
5. Preserve:
   - current homepage performance gains where possible
   - card background optimization
   - player portrait optimization
6. Prioritize functionality over micro-optimization for tiny icons

IMPORTANT:
If tiny icon optimization caused breakage, revert those icon-specific changes only.

Important: - you can check change using playwright mcp if it affects or not UI/UX and everything stayed all well if yes then implement

OUTPUT:
## Root Cause
## Broken Homepage Icon Logic
## Exact Safe Fix
## Performance Tradeoff
## Safe to Build? (YES/NO)
## Safe to Deploy? (YES/NO)
## Rollback Command