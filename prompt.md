Act as a Senior Next.js, React, and Google AdSense technical auditor. Inspect my codebase repository to verify if Google AdSense Auto Ads are fully integrated and optimized specifically for mobile devices. 



Check for the following 4 implementations and flag any errors, omissions, or partial configurations:



1. ROUTER / SPA HOOK CHECK: Verify if there is a global useEffect hook tracking route changes (using either next/navigation 'usePathname'/'useSearchParams' for App Router, or next/router events for Pages Router). It must correctly call (window.adsbygoogle = window.adsbygoogle || []).push({}); on every client-side page transition to prevent ads from breaking on mobile navigation.



2. SCRIPT LOADING STRATEGY: Ensure the main AdSense script is injected using the official 'next/script' component (not raw HTML script tags) with the strategy set to 'afterInteractive' or 'lazyOnload'. Verify that the 'crossOrigin="anonymous"' prop is present.



3. HYDRATION AND LAYOUT VALIDATION: Scan components that conditionally render based on mobile screens (e.g., checks for window width or mobile breakpoints). Ensure they do not cause server/client hydration mismatches that compress parent layouts to 0px width/height during the initial AdSense DOM scan.



4. CONTAINER STYLING: Verify that common ad insertion target areas or parent wrappers do not use conflicting flex/grid properties that lack explicitly defined minimum dimensions (like missing 'w-full' or 'min-h-[100px]').



Provide a strict point-by-point report:

- PASSED: What is perfectly implemented.

- FAILED: Exact lines of code or components that are missing the fix or implemented incorrectly.

- ACTION REQUIRED: The exact code snippets needed to fix the failures.



