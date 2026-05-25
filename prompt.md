Implement production-ready Google AdSense In-feed ads for the Player Database pages in my Next.js App Router project.

Context:

* Site: ZenithFCM
* Publisher ID: ca-pub-4474200951186936
* Auto Ads already work
* A reusable AdsenseAd component already exists and already supports:

  * display ads
  * multiplex ads
  * fluid/in-feed ads
  * layoutKey support
  * responsive layouts
  * hydration-safe initialization
  * route transition safety
  * CLS protection

Existing ad unit:

* zenith_playerdb_infeed
* Format: In-feed
* Slot: 1523077644
* Layout Key: -fb+5w+4e-db+86

Important design note:
For the Player Database pages, use the "image on the side" style for the in-feed ad because the layout is horizontal/list-based and this will blend better than image-above.

Goal:
Add subtle, premium In-feed monetization to the Player Database pages without harming usability, scrolling performance, filtering UX, or the premium utility feel.

Tasks:

1. Analyze the Player Database layout and identify the safest insertion strategy.

2. Insert:

* one In-feed ad after every 12–15 player rows/cards
* choose the cleanest frequency based on mobile UX and database density

3. Ensure the ads:

* visually blend with the player list/grid
* remain subtle
* preserve utility-focused UX
* do not interrupt filtering/searching behavior
* do not break scrolling rhythm
* avoid CLS/layout shift

4. Preserve premium gaming utility aesthetics:

* no aggressive ad density
* no spammy stacking
* dark-theme compatibility
* smooth responsive behavior

5. Ensure:

* fluid format support
* layoutKey rendering
* safe App Router behavior
* no duplicate ad initialization
* React Strict Mode compatibility

6. Use:

* existing card/list wrappers if appropriate
* responsive spacing
* full-width wrappers only if needed

7. Do NOT:

* place ads too frequently
* inject ads inside filters/search bars
* interrupt important interactions
* place ads inside compare/squad-builder functionality
* break virtualization/performance optimizations if used

8. Return:

* all modified files
* exact insertion logic
* full implementation details
* any performance considerations
* any CLS prevention improvements

Important:
The Player Database is a premium utility/productivity surface.
Ads should feel subtle and secondary, not like a spammy marketplace.
