import SiteChrome from '../components/SiteChrome';
import BlogIndexPage from '../components/blog/BlogIndexPage';
import { buildBreadcrumbListSchema, buildBlogCollectionSchema, serializeJsonLd } from '../../src/lib/server/blog/schema.mjs';
import {
  BLOG_ROUTE_REVALIDATE_SECONDS,
  buildBlogIndexRouteMetadata,
  getCachedBlogIndexPageData,
  parseBlogPageParam
} from '../../src/lib/server/blog/seo.mjs';

export const revalidate = BLOG_ROUTE_REVALIDATE_SECONDS;

export async function generateMetadata({ searchParams = {} }) {
  const page = parseBlogPageParam(searchParams);
  const pageData = await getCachedBlogIndexPageData(page);
  return buildBlogIndexRouteMetadata(pageData, { page });
}

export default async function BlogsPage({ searchParams = {} }) {
  const startedAt = Date.now();
  const page = parseBlogPageParam(searchParams);
  const pageData = await getCachedBlogIndexPageData(page);
  const visiblePosts = [...(pageData.featuredPosts || []), ...(pageData.posts || [])];
  const schemas = pageData.availability?.isConfigured === false
    ? []
    : [
        buildBreadcrumbListSchema([
          { name: 'Home', path: '/' },
          { name: 'Blogs', path: '/blogs' }
        ]),
        buildBlogCollectionSchema({
          title: pageData.title,
          description: pageData.description,
          path: page > 1 ? `/blogs?page=${page}` : '/blogs',
          items: visiblePosts
        })
      ].filter(Boolean);

  console.info('[metrics] /blogs render', {
    elapsedMs: Date.now() - startedAt,
    configured: pageData.availability?.isConfigured,
    feedCount: pageData.posts.length,
    featuredCount: pageData.featuredPosts.length,
    page: pageData.pagination.page
  });

  return (
    <SiteChrome activeView="blogs">
      <main className="main-content">
        {schemas.map((schema, index) => (
          <script
            key={`blogs-schema-${index}`}
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: serializeJsonLd(schema) }}
          />
        ))}
        <BlogIndexPage {...pageData} />
      </main>
    </SiteChrome>
  );
}
