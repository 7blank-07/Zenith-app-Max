You are a senior Next.js App Router developer + Technical SEO architect.

PRIMARY OBJECTIVE:
SEO is the HIGHEST PRIORITY.
This project must be optimized first for Google rankings, indexing, crawlability, keyword dominance, and long-term organic traffic growth.

TASK:
My website currently uses query parameter tool pages:

/tools?tool=squadbuilder
/tools?tool=compare
/tools?tool=watchlist

This is hurting SEO because Google treats them as alternate pages.

I need this migrated into fully SEO-optimized static-style clean routes:

/tools/squad-builder
/tools/player-compare
/tools/watchlist

CORE SEO GOALS:
- Maximize indexing of each tool as its own keyword-targeted landing page
- Rank separately for:
  * FC Mobile Squad Builder
  * FC Mobile Player Compare
  * FC Mobile Watchlist
- Improve crawlability
- Improve sitemap clarity
- Improve canonical precision
- Improve CTR from SERPs
- Improve internal linking structure
- Eliminate duplicate/alternate page issues
- Preserve domain authority while transferring URL equity
- Future-proof for backlinks and content expansion

DEVELOPMENT REQUIREMENTS:

1. Use Next.js App Router best practices
2. Build:
   /app/tools/page.js  (main tools hub)
   /app/tools/[slug]/page.js  (individual SEO pages)

3. Valid slugs:
   - squad-builder
   - player-compare
   - watchlist

4. INVALID slugs:
   - Return proper 404

5. MOST IMPORTANT:
   Reuse current tool components and logic.
   Do NOT rebuild tools from scratch.
   Keep functionality identical.

6. Dynamic SEO Metadata:
   Use generateMetadata() per slug with:
   - Unique title
   - Meta description
   - Canonical
   - Open Graph
   - Twitter cards
   - Keyword relevance

7. Example:
   squad-builder:
   Title: FC Mobile Squad Builder | ZenithFCM
   Description: Build your ultimate FC Mobile squad with OVR optimization, chemistry planning, and team testing tools.

8. Add schema recommendations if useful.

9. Add breadcrumb SEO if beneficial.

10. Ensure:
   /tools links prominently to all tool pages

11. Create 301 PERMANENT redirects from:
   /tools?tool=squadbuilder → /tools/squad-builder
   /tools?tool=compare → /tools/player-compare
   /tools?tool=watchlist → /tools/watchlist

12. Preserve old traffic and SEO equity.

13. Update sitemap structure:
   Include:
   /tools
   /tools/squad-builder
   /tools/player-compare
   /tools/watchlist

14. Ensure robots/indexability is correct.

15. Avoid duplicate content issues.

16. Prioritize:
   SEO > Clean Architecture > Maintainability > UX

ADVANCED SEO EXPECTATIONS:
- Best URL architecture
- Strong canonical strategy
- Search Console compatibility
- Google-friendly indexing
- Strong page-level keyword targeting
- Structured internal authority flow
- Better ranking opportunities

DELIVERABLES:
- Best-practice folder structure
- Full implementation code
- generateMetadata()
- Redirect setup
- next-sitemap recommendations
- Canonical examples
- Structured data recommendations
- SEO reasoning for each major decision

IMPORTANT:
Think like:
Google Search Console expert +
Technical SEO strategist +
Senior Next.js engineer

Do NOT give average code.
Provide the highest SEO-value architecture possible while keeping implementation practical.