Implement production-ready Google AdSense ads for the Redeem Codes page in my Next.js App Router project.

Context:

* Site: ZenithFCM
* Publisher ID: ca-pub-4474200951186936
* Auto Ads are already limited/minimal
* A reusable AdsenseAd component already exists and supports:

  * display ads
  * multiplex ads
  * fluid/in-feed ads
  * layoutKey support
  * responsive layouts
  * hydration-safe initialization
  * route transition safety
  * CLS protection

Existing ad units:

1. zenith_redeem_active

   * Format: Display
   * Slot: 3323774708

2. zenith_redeem_latest

   * Format: Display
   * Slot: 2010693034

Goal:
Add subtle, premium monetization to the Redeem Codes page without harming UX, readability, performance, or the utility-first experience.

Tasks:

1. Analyze the Redeem Codes page structure and identify the best insertion points.

2. Insert:

* one responsive display ad below the Active Codes section
* one responsive display ad below the Latest Codes section

3. Preserve premium UX:

* no ads above the redeem hero/title area
* no ads between individual code items
* no multiplex ads here
* no intrusive layout changes
* no CLS issues

4. Ensure:

* responsive rendering
* clean spacing
* dark-theme compatibility
* safe App Router behavior
* no duplicate ad initialization
* React Strict Mode compatibility

5. Ads should feel subtle and secondary:

* use stable spacing
* do not interrupt code scanning/copying behavior
* keep the page utility-first and trustworthy

6. If necessary:

* extend the existing AdsenseAd component carefully
* use wrappers/full-width containers where needed
* maintain clean mobile and desktop alignment

7. Do NOT:

* place ads too aggressively
* place ads before the first code block
* break the redeem flow
* modify unrelated styling or business logic

8. Return:

* all modified files
* exact insertion points
* full implementation details
* any CLS prevention improvements
* any spacing/styling changes

Important:
The Redeem Codes page should feel like a useful FC Mobile utility page, not an ad-heavy blog.
Ads should be minimal, contextual, and premium.
