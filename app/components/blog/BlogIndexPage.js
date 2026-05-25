import React from 'react';
import BlogArticleCard from './BlogArticleCard';
import BlogCategoryTabs from './BlogCategoryTabs';
import BlogPagination from './BlogPagination';
import FeaturedArticles from './FeaturedArticles';
import PopularArticles from './PopularArticles';
import AdsenseAd from '../AdsenseAd';
import styles from './BlogLayout.module.css';

function buildBasePath(activeCategorySlug, activeTag) {
  if (activeTag?.slug) {
    return `/blogs/tag/${encodeURIComponent(activeTag.slug)}`;
  }

  if (activeCategorySlug) {
    return `/blogs/${encodeURIComponent(activeCategorySlug)}`;
  }

  return '/blogs';
}

export default function BlogIndexPage({
  title,
  description,
  categories = [],
  activeCategorySlug = '',
  activeTag = null,
  featuredPosts = [],
  popularPosts = [],
  posts = [],
  pagination,
  availability,
  emptyTitle,
  emptyDescription
}) {
  const isConfigured = availability?.isConfigured !== false;
  const basePath = buildBasePath(activeCategorySlug, activeTag);

  return (
    <div className={styles.page}>
      <header className={styles.pageHeader}>
        <span className={styles.eyebrow}>{activeTag?.slug ? 'Tag archive' : activeCategorySlug ? 'Category archive' : 'Editorial hub'}</span>
        <h1 className={styles.title}>{title}</h1>
        <p className={styles.description}>{description}</p>
      </header>

      <BlogCategoryTabs categories={categories} activeCategorySlug={activeCategorySlug} />

      {!isConfigured ? (
        <section className={styles.unavailableState}>
          <h2 className={styles.emptyStateTitle}>{availability?.title}</h2>
          <p className={styles.emptyStateText}>{availability?.description}</p>
          <span className={styles.emptyStateCode}>npm run db:migrate:blog</span>
        </section>
      ) : (
        <>
          {!activeCategorySlug && !activeTag?.slug && featuredPosts.length ? <FeaturedArticles posts={featuredPosts} /> : null}

          <div className={styles.mainGrid}>
            <div className={styles.contentColumn}>
              {posts.length ? (
                <div className={styles.cardsGrid}>
                  {posts.map((post, index) => (
                    <React.Fragment key={post.id}>
                      <BlogArticleCard post={post} />
                      {(index + 1) % 6 === 0 && (
                        <div className={styles.card} style={{ minHeight: '400px', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                          <AdsenseAd 
                            slot="6836325526" 
                            format="fluid" 
                            layoutKey="-6t+ed+2i-1n-4w" 
                            style={{ margin: '0', minHeight: '380px' }}
                          />
                        </div>
                      )}
                    </React.Fragment>
                  ))}
                </div>
              ) : (
                <section className={styles.emptyState}>
                  <h2 className={styles.emptyStateTitle}>{emptyTitle}</h2>
                  <p className={styles.emptyStateText}>{emptyDescription}</p>
                </section>
              )}

              <BlogPagination basePath={basePath} pagination={pagination} />
            </div>

            <div className={styles.sidebarColumn}>
              <PopularArticles posts={popularPosts} />
            </div>
          </div>
        </>
      )}
    </div>
  );
}
