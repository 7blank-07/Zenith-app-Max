Perform a full architecture and runtime behavior audit of this project and generate a comprehensive documentation file called:

zenith-details.md

The goal is to clearly document how the Zenith application works internally.

This document must analyze the real implementation and confirm behavior based on code, not assumptions.

Topics that must be covered in detail:

1. Technology Stack
- Determine if the app is fully Next.js App Router based or if any SPA behavior still exists.
- Identify all frameworks and libraries used (Next.js, React, ISR, etc).
- Confirm if any legacy SPA scripts remain and where they are used.

2. Rendering Architecture
Explain exactly how pages are rendered:

- Static generation
- ISR (Incremental Static Regeneration)
- Dynamic rendering
- Server rendering
- Client components

Confirm how the following pages render:

/
 /players
 /player/[id]
 /blogs
 /tools
 /watchlist
 /compare
 /legacy

3. Player Page Generation Strategy
Investigate the generateStaticParams logic and explain:

- prerenderLimit (currently 10,000)
- how the first 10k players are selected
- what happens for the remaining ~25k players

Document the exact flow:

Build time
User first visit
ISR cache generation
Subsequent visits

Explain where the cached HTML is stored and how Next.js handles it.

4. Cache and Revalidation
Explain all caching layers used in the project:

Next.js ISR cache
Browser caching
Nginx caching
Static asset caching
Image CDN caching

If possible determine:

- ISR revalidation interval
- whether player pages are permanent or periodically regenerated

5. Static Assets and CDN
Document how assets are served:

images.zenithfcm.com
_next/static bundles
public assets

Explain how caching works for these resources.

6. Tools System Architecture
Explain how tools are implemented:

Compare tool
Squad builder
Shard calculator

Identify:

client components
dynamic imports
bundle splitting

7. Blog System Architecture
Explain the blog CMS system:

- PostgreSQL schema
- admin workflow
- blog routes
- ISR behavior
- SEO structure

8. Data Layer
Explain where data comes from:

PostgreSQL tables
API endpoints
server functions
repository layer

9. Build System
Document the build pipeline:

npm run build
static generation
ISR page generation
bundle creation

Explain what the build output shows and what it means.

10. Runtime Architecture
Explain how production runs:

PM2
Next.js server
Nginx reverse proxy
image CDN

Document the request flow:

User
↓
Nginx
↓
Next.js
↓
Database

11. Performance Strategy
Document how the system scales:

10k prerendered player pages
ISR generation for remaining players
lazy-loaded tools
optimized images

Explain how the system handles 35k+ player pages.

12. Deployment Process
Document the full deployment workflow:

Laptop development
GitHub push
VPS pull
npm install
npm run build
pm2 restart

13. Known Limits
Document important limits in the architecture:

prerenderLimit
players list limits
bundle sizes
ISR behavior

14. Future Scaling Considerations
Explain what would happen if traffic grows to:

10k users/day
50k users/day
100k users/day

Identify potential bottlenecks.

Output Requirements:

Create a clear, structured markdown document with sections and diagrams where useful.

File must be created at:

zenith-details.md

Do not modify any application code.

Only analyze the project and generate documentation.