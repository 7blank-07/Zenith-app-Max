Add Google AdSense site verification code globally to ZenithFCM.

Insert this exact script inside the global <head> section on every page, right before </head>, ensuring it loads sitewide only once and does not duplicate:

<script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-4474200951186936"
     crossorigin="anonymous"></script>

Requirements:
- Detect project structure automatically (Next.js App Router / Pages Router / React / custom)
- Place in the correct global head/layout file
- Preserve SEO/meta tags
- Do not break hydration
- Production-safe implementation
- If Next.js, use the best-practice method (next/script if appropriate)
- Confirm exact file modified