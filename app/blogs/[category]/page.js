import { notFound } from 'next/navigation';
import SiteChrome from '../../components/SiteChrome';
import BlogIndexPage from '../../components/blog/BlogIndexPage';
import { buildBreadcrumbListSchema, buildBlogCollectionSchema, serializeJsonLd } from '../../../src/lib/server/blog/schema.mjs';
import {
  BLOG_ROUTE_REVALIDATE_SECONDS,
  buildBlogCategoryRouteMetadata,
  getCachedBlogCategoryPageData,
  parseBlogPageParam
} from '../../../src/lib/server/blog/seo.mjs';

export const revalidate = BLOG_ROUTE_REVALIDATE_SECONDS;

export async function generateMetadata({ params, searchParams = {} }) {
  const page = parseBlogPageParam(searchParams);
  const pageData = await getCachedBlogCategoryPageData(params.category, page);
  return buildBlogCategoryRouteMetadata(pageData, {
    categorySlug: params.category,
    page
  });
}

export default async function BlogCategoryPage({ params, searchParams = {} }) {
  const startedAt = Date.now();
  const page = parseBlogPageParam(searchParams);
  const pageData = await getCachedBlogCategoryPageData(params.category, page);

  if (!pageData) {
    notFound();
  }

  const schemas = pageData.availability?.isConfigured === false
    ? []
    : [
        buildBreadcrumbListSchema([
          { name: 'Home', path: '/' },
          { name: 'Blogs', path: '/blogs' },
          { name: pageData.title, path: `/blogs/${encodeURIComponent(params.category)}` }
        ]),
        buildBlogCollectionSchema({
          title: pageData.title,
          description: pageData.description,
          path: page > 1 ? `/blogs/${encodeURIComponent(params.category)}?page=${page}` : `/blogs/${encodeURIComponent(params.category)}`,
          items: pageData.posts
        })
      ].filter(Boolean);

  console.info('[metrics] /blogs/[category] render', {
    elapsedMs: Date.now() - startedAt,
    category: params.category,
    configured: pageData.availability?.isConfigured,
    feedCount: pageData.posts.length,
    page: pageData.pagination.page
  });

  return (
    <SiteChrome activeView="blogs">
      <main className="main-content">
        {schemas.map((schema, index) => (
          <script
            key={`blog-category-schema-${index}`}
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: serializeJsonLd(schema) }}
          />
        ))}
        <BlogIndexPage {...pageData} />
      </main>
    </SiteChrome>
  );
}
