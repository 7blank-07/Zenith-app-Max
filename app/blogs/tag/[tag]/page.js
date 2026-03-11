import { notFound } from 'next/navigation';
import SiteChrome from '../../../components/SiteChrome';
import BlogIndexPage from '../../../components/blog/BlogIndexPage';
import { getBlogTagPageData } from '../../../../src/lib/server/blog/public.mjs';

export const dynamic = 'force-dynamic';

function humanizeSlug(value) {
  return String(value || '')
    .split('-')
    .filter(Boolean)
    .map((part) => `${part[0]?.toUpperCase() || ''}${part.slice(1).toLowerCase()}`)
    .join(' ');
}

export async function generateMetadata({ params }) {
  const tagLabel = humanizeSlug(params.tag) || 'Tag';

  return {
    title: `${tagLabel} | Zenith Blogs`,
    description: `Published FC Mobile articles tagged with ${tagLabel}.`,
    alternates: { canonical: `/blogs/tag/${encodeURIComponent(params.tag)}` }
  };
}

export default async function BlogTagPage({ params, searchParams = {} }) {
  const startedAt = Date.now();
  const pageData = await getBlogTagPageData(params.tag, { searchParams });

  if (!pageData) {
    notFound();
  }

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
        <BlogIndexPage {...pageData} />
      </main>
    </SiteChrome>
  );
}
