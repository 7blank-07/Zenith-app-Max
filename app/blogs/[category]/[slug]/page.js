import { notFound } from 'next/navigation';
import SiteChrome from '../../../components/SiteChrome';
import BlogArticleBody from '../../../components/blog/BlogArticleBody';
import BlogArticleHero from '../../../components/blog/BlogArticleHero';
import RelatedArticles from '../../../components/blog/RelatedArticles';
import styles from '../../../components/blog/BlogLayout.module.css';
import { getBlogArticlePageData } from '../../../../src/lib/server/blog/public.mjs';

export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }) {
  const pageData = await getBlogArticlePageData(params.category, params.slug);
  const article = pageData?.post;

  if (!article) {
    return {
      title: 'Blog Article | Zenith',
      description: 'Read the latest FC Mobile editorial coverage from Zenith.'
    };
  }

  return {
    title: `${article.title} | Zenith Blogs`,
    description: article.metaDescription || article.excerpt || 'Read the latest FC Mobile editorial coverage from Zenith.',
    alternates: {
      canonical: `/blogs/${encodeURIComponent(article.category?.slug || params.category)}/${encodeURIComponent(article.slug)}`
    }
  };
}

export default async function BlogArticlePage({ params }) {
  const startedAt = Date.now();
  const pageData = await getBlogArticlePageData(params.category, params.slug);

  if (!pageData) {
    notFound();
  }

  console.info('[metrics] /blogs/[category]/[slug] render', {
    elapsedMs: Date.now() - startedAt,
    category: params.category,
    slug: params.slug,
    configured: pageData.availability?.isConfigured,
    hasPost: Boolean(pageData.post),
    relatedCount: pageData.relatedPosts.length
  });

  return (
    <SiteChrome activeView="blogs">
      <main className="main-content">
        <div className={styles.page}>
          {!pageData.availability?.isConfigured ? (
            <section className={styles.unavailableState}>
              <h1 className={styles.emptyStateTitle}>{pageData.availability?.title}</h1>
              <p className={styles.emptyStateText}>{pageData.availability?.description}</p>
              <span className={styles.emptyStateCode}>npm run db:migrate:blog</span>
            </section>
          ) : (
            <>
              <BlogArticleHero article={pageData.post} />

              <div className={styles.articleShell}>
                <div className={styles.articleMain}>
                  <BlogArticleBody article={pageData.post} />
                </div>

                <div className={styles.articleSidebar}>
                  <RelatedArticles posts={pageData.relatedPosts} />
                </div>
              </div>
            </>
          )}
        </div>
      </main>
    </SiteChrome>
  );
}
