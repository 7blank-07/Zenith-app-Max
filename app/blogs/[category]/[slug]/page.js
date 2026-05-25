import { notFound } from 'next/navigation';
import SiteChrome from '../../../components/SiteChrome';
import BlogArticleBody from '../../../components/blog/BlogArticleBody';
import BlogArticleHero from '../../../components/blog/BlogArticleHero';
import RelatedArticles from '../../../components/blog/RelatedArticles';
import AdsenseAd from '../../../components/AdsenseAd';
import styles from '../../../components/blog/BlogLayout.module.css';
import { buildBlogPostingSchema, buildBreadcrumbListSchema, serializeJsonLd } from '../../../../src/lib/server/blog/schema.mjs';
import {
  BLOG_ROUTE_REVALIDATE_SECONDS,
  buildBlogArticleRouteMetadata,
  getCachedBlogArticlePageData
} from '../../../../src/lib/server/blog/seo.mjs';

export const revalidate = BLOG_ROUTE_REVALIDATE_SECONDS;

export async function generateMetadata({ params }) {
  const pageData = await getCachedBlogArticlePageData(params.category, params.slug);
  return buildBlogArticleRouteMetadata(pageData, {
    categorySlug: params.category,
    slug: params.slug
  });
}

export default async function BlogArticlePage({ params }) {
  const startedAt = Date.now();
  const pageData = await getCachedBlogArticlePageData(params.category, params.slug);

  if (!pageData) {
    notFound();
  }

  const schemas = !pageData.post || pageData.availability?.isConfigured === false
    ? []
    : [
        buildBreadcrumbListSchema([
          { name: 'Home', path: '/' },
          { name: 'Blogs', path: '/blogs' },
          {
            name: pageData.category?.name || params.category,
            path: `/blogs/${encodeURIComponent(pageData.category?.slug || params.category)}`
          },
          {
            name: pageData.post.title,
            path: `/blogs/${encodeURIComponent(pageData.category?.slug || params.category)}/${encodeURIComponent(pageData.post.slug)}`
          }
        ]),
        buildBlogPostingSchema(pageData.post)
      ].filter(Boolean);

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
      <main className={`main-content blog-article-main-content ${styles.articleMainContent}`}>
        {schemas.map((schema, index) => (
          <script
            key={`blog-article-schema-${index}`}
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: serializeJsonLd(schema) }}
          />
        ))}
        <div className={`${styles.page} ${styles.articlePage}`}>
          {!pageData.availability?.isConfigured ? (
            <section className={styles.unavailableState}>
              <h1 className={styles.emptyStateTitle}>{pageData.availability?.title}</h1>
              <p className={styles.emptyStateText}>{pageData.availability?.description}</p>
              <span className={styles.emptyStateCode}>npm run db:migrate:blog</span>
            </section>
          ) : (
            <>
              <BlogArticleHero article={pageData.post} />

              <div className="article-top-ad-wrapper" style={{ maxWidth: '1200px', margin: '0 auto', width: '100%' }}>
                <AdsenseAd slot="8823360464" style={{ margin: '20px 0 40px' }} />
              </div>

              <div className={styles.articleShell}>
                <div className={styles.articleMain}>
                  <BlogArticleBody article={pageData.post} />
                  
                  <section className="article-footer-ads" style={{ marginTop: '60px', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '40px' }}>
                    <h3 style={{ fontSize: '1.1rem', color: 'var(--color-text-muted)', marginBottom: '20px', textAlign: 'center' }}>Recommended for you</h3>
                    <AdsenseAd slot="7171367449" format="autorelaxed" />
                  </section>
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
