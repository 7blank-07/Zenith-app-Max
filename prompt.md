I need to add a single manual Google AdSense display ad to my Next.js App Router project.

Requirements:

1. Create a reusable component:
   `components/AdsenseAd.tsx`

2. Use a production-safe implementation for Next.js App Router.

3. The component must:

* use 'use client'
* safely initialize `(window.adsbygoogle = window.adsbygoogle || []).push({})`
* avoid hydration issues
* avoid duplicate initialization errors
* support responsive ads
* accept a `slot` prop
* use publisher ID:
  `ca-pub-4474200951186936`

4. Then insert ONE ad below the “Latest Players” section on the homepage.

5. Use this slot ID:
   `9409697139`

6. The ad should:

* have proper spacing
* not break CLS/layout
* remain mobile friendly
* keep premium UX
* avoid intrusive behavior

7. Do NOT modify unrelated styling, layouts, or business logic.

8. Return:

* full component code
* exact import statement
* exact insertion location/code
* all modified files
* any required fixes for React/Next.js rendering issues

9. Ensure compatibility with:

* Next.js App Router
* React Strict Mode
* production deployment
* responsive layouts
* client-side navigation

10. If the ad component already exists, improve/fix it instead of duplicating it.

11. Ensure the ad only initializes after mount and does not throw duplicate adsbygoogle push errors during route transitions.
