import { notFound } from 'next/navigation';
import SiteChrome from '../../components/SiteChrome';
import BlogIndexPage from '../../components/blog/BlogIndexPage';
import { getBlogCategoryPageData, getKnownBlogCategory } from '../../../src/lib/server/blog/public.mjs';

export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }) {
  const category = getKnownBlogCategory(params.category);

  if (!category) {
    return {
      title: 'Blogs | Zenith',
      description: 'Daily FC Mobile news, investments, event guides, and reviews.'
    };
  }

  return {
    title: `${category.name} | Zenith Blogs`,
    description: category.description,
    alternates: { canonical: `/blogs/${encodeURIComponent(category.slug)}` }
  };
}

export default async function BlogCategoryPage({ params, searchParams = {} }) {
  const startedAt = Date.now();
  const pageData = await getBlogCategoryPageData(params.category, { searchParams });

  if (!pageData) {
    notFound();
  }

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
        <BlogIndexPage {...pageData} />
      </main>
    </SiteChrome>
  );
}
