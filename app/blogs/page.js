import SiteChrome from '../components/SiteChrome';
import BlogIndexPage from '../components/blog/BlogIndexPage';
import { getBlogIndexPageData } from '../../src/lib/server/blog/public.mjs';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Blogs | Zenith',
  description: 'Daily FC Mobile news, investments, event guides, and reviews.',
  alternates: { canonical: '/blogs' }
};

export default async function BlogsPage({ searchParams = {} }) {
  const startedAt = Date.now();
  const pageData = await getBlogIndexPageData({ searchParams });

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
        <BlogIndexPage {...pageData} />
      </main>
    </SiteChrome>
  );
}
