I need a strict sitemap parity audit.

ZenithFCM’s ORIGINAL production sitemap structure had:

/sitemap.xml
/sitemap/0.xml
/sitemap/1.xml
/sitemap/2.xml

Your current restored implementation only reports:
- /sitemap/0.xml
- /sitemap/1.xml

This is a red flag unless fully justified.

====================================================
CRITICAL REQUIREMENT
====================================================

I do NOT want assumptions.
I need exact technical truth.

====================================================
AUDIT REQUIRED
====================================================

1. Why is `/sitemap/2.xml` missing?
- Was it intentionally removed?
- Was content merged?
- Was player chunking changed?
- Was it accidentally dropped?
- Was there data loss?

====================================================
2. ORIGINAL PARITY CHECK
====================================================

Compare old production vs new implementation:

OLD:
- /sitemap/0.xml
- /sitemap/1.xml
- /sitemap/2.xml

NEW:
- /sitemap/0.xml
- /sitemap/1.xml

Tell me EXACTLY what each file contains:
- Static pages
- Blogs
- Redeem
- Streaming
- Top 10
- Player pages
- Tools
- Other large datasets

====================================================
3. DATASET COVERAGE
====================================================

Confirm whether ALL previous URLs are still represented.

I need to know:
- Did sitemap URL count shrink?
- Did player pages reduce?
- Were chunks consolidated?
- Were some routes dropped?

====================================================
4. CHUNKING LOGIC
====================================================

Show exact segmentation logic:
- How many URLs per chunk?
- Why only 2 segments now?
- If ZenithFCM still has the same large dataset, why not 3?
- Is chunk size configurable?

====================================================
5. REQUIRED OUTCOME
====================================================

If `/sitemap/2.xml` should still exist:
RESTORE IT.

If `/sitemap/2.xml` is no longer necessary:
Explain EXACTLY why with URL counts and chunking math.

====================================================
6. OUTPUT REQUIRED
====================================================

Provide:
- Exact old sitemap architecture
- Exact new sitemap architecture
- Total URL counts
- Segment sizes
- Whether `/sitemap/2.xml` should exist
- Any SEO regression risks
- Final recommendation:
  KEEP 2 SEGMENTS
  or
  RESTORE 3 SEGMENTS

====================================================
FINAL PRIORITY
====================================================

ZenithFCM SEO parity is critical.
I need full production-equivalent sitemap coverage, not a simplified approximation.
No missing routes.
No indexing regression.