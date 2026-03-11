import { notFound } from 'next/navigation';
import SiteChrome from '../../../components/SiteChrome';
import BlogIndexPage from '../../../components/blog/BlogIndexPage';
import { buildBreadcrumbListSchema, buildBlogCollectionSchema, serializeJsonLd } from '../../../../src/lib/server/blog/schema.mjs';
import {
  BLOG_ROUTE_REVALIDATE_SECONDS,
  buildBlogTagRouteMetadata,
  getCachedBlogTagPageData,
  parseBlogPageParam
} from '../../../../src/lib/server/blog/seo.mjs';

export const revalidate = BLOG_ROUTE_REVALIDATE_SECONDS;

export async function generateMetadata({ params, searchParams = {} }) {
  const page = parseBlogPageParam(searchParams);
  const pageData = await getCachedBlogTagPageData(params.tag, page);
  return buildBlogTagRouteMetadata(pageData, {
    tagSlug: params.tag,
    page
  });
}

export default async function BlogTagPage({ params, searchParams = {} }) {
  const startedAt = Date.now();
  const page = parseBlogPageParam(searchParams);
  const pageData = await getCachedBlogTagPageData(params.tag, page);

  if (!pageData) {
    notFound();
  }

  const tagLabel = pageData.tag?.name || pageData.activeTag?.name || params.tag;
  const schemas = pageData.availability?.isConfigured === false
    ? []
    : [
        buildBreadcrumbListSchema([
          { name: 'Home', path: '/' },
          { name: 'Blogs', path: '/blogs' },
          { name: tagLabel, path: `/blogs/tag/${encodeURIComponent(params.tag)}` }
        ]),
        buildBlogCollectionSchema({
          title: pageData.title,
          description: pageData.description,
          path: page > 1 ? `/blogs/tag/${encodeURIComponent(params.tag)}?page=${page}` : `/blogs/tag/${encodeURIComponent(params.tag)}`,
          items: pageData.posts
        })
      ].filter(Boolean);

  console.info('[metrics] /blogs/tag/[tag] render', {
    elapsedMs: Date.now() - startedAt,
    tag: params.tag,
    configured: pageData.availability?.isConfigured,
    feedCount: pageData.posts.length,
    page: pageData.pagination.page
  });

  return (
    <SiteChrome activeView="blogs">
      <main className="main-content">
        {schemas.map((schema, index) => (
          <script
            key={`blog-tag-schema-${index}`}
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: serializeJsonLd(schema) }}
          />
        ))}
        <BlogIndexPage {...pageData} />
      </main>
    </SiteChrome>
  );
}
