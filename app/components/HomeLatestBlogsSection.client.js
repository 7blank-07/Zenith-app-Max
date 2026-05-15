'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import AuthorByline from './blog/AuthorByline';
import OptimizedCoverImage from './blog/OptimizedCoverImage';
import styles from './HomeLatestBlogsSection.module.css';

function toText(value, fallback = '') {
  if (value === undefined || value === null) return fallback;
  return String(value).trim();
}

function getArticleHref(post) {
  return `/blogs/${encodeURIComponent(post?.category?.slug || 'news')}/${encodeURIComponent(post?.slug || '')}`;
}

function getCategoryHref(category) {
  return `/blogs/${encodeURIComponent(category?.slug || 'news')}`;
}

function buildVisibleCategories(posts, categories) {
  if (Array.isArray(categories) && categories.length > 0) {
    return categories.map(cat => ({
      ...cat,
      slug: toText(cat.slug).toLowerCase()
    }));
  }

  return (Array.isArray(posts) ? posts : []).reduce((accumulator, post) => {
    const slug = toText(post?.category?.slug).toLowerCase();
    if (!slug || accumulator.some((category) => category.slug === slug)) return accumulator;
    accumulator.push({
      slug,
      name: toText(post?.category?.name, 'Blogs'),
      description: ''
    });
    return accumulator;
  }, []);
}

function BlogFeatureCard({ post }) {
  if (!post) return null;

  return (
    <article className={styles.featuredCard}>
      <Link href={getArticleHref(post)} className={styles.featuredMediaLink}>
        <div className={styles.featuredMedia}>
          {post.coverImage ? (
            <OptimizedCoverImage
              src={post.coverImage}
              alt={post.title}
              className={styles.featuredImage}
              width={1024}
              height={614}
              sizes="(max-width: 1100px) 100vw, 65vw"
              loading="lazy"
              fetchPriority="low"
            />
          ) : (
            <div className={styles.featuredFallback}>{post.title}</div>
          )}
        </div>
      </Link>

      <div className={styles.featuredBody}>
        <Link href={getCategoryHref(post.category)} className={styles.categoryBadge}>
          {post.category?.name || 'Blogs'}
        </Link>

        <Link href={getArticleHref(post)} className={styles.featuredTitleLink}>
          <h3 className={styles.featuredTitle}>{post.title}</h3>
        </Link>

        {post.excerpt ? <p className={styles.featuredExcerpt}>{post.excerpt}</p> : null}

        <AuthorByline author={post.author} publishedAt={post.publishedAt || post.createdAt} readingTime={post.readingTime} compact />
      </div>
    </article>
  );
}

function BlogCompactCard({ post }) {
  if (!post) return null;

  return (
    <article className={styles.compactCard}>
      <Link href={getArticleHref(post)} className={styles.compactMediaLink}>
        <div className={styles.compactMedia}>
          {post.coverImage ? (
            <OptimizedCoverImage
              src={post.coverImage}
              alt={post.title}
              className={styles.compactImage}
              width={640}
              height={384}
              sizes="(max-width: 768px) 100vw, (max-width: 1100px) 50vw, 33vw"
              loading="lazy"
              fetchPriority="low"
            />
          ) : (
            <div className={styles.compactFallback}>{post.title}</div>
          )}
        </div>
      </Link>

      <div className={styles.compactBody}>
        <Link href={getCategoryHref(post.category)} className={styles.categoryBadge}>
          {post.category?.name || 'Blogs'}
        </Link>

        <Link href={getArticleHref(post)} className={styles.compactTitleLink}>
          <h3 className={styles.compactTitle}>{post.title}</h3>
        </Link>

        {post.excerpt ? <p className={styles.compactExcerpt}>{post.excerpt}</p> : null}

        <AuthorByline author={post.author} publishedAt={post.publishedAt || post.createdAt} readingTime={post.readingTime} compact />
      </div>
    </article>
  );
}

export default function HomeLatestBlogsSection({ posts = [], categories = [], availability = null }) {
  const visibleCategories = useMemo(() => buildVisibleCategories(posts, categories), [categories, posts]);
  const [activeCategory, setActiveCategory] = useState('all');

  const filteredPosts = useMemo(() => {
    if (activeCategory === 'all') return posts.slice(0, 8);
    return posts.filter((post) => toText(post?.category?.slug).toLowerCase() === activeCategory).slice(0, 8);
  }, [activeCategory, posts]);

  const featuredPost = filteredPosts[0] || null;
  const railPosts = filteredPosts.slice(1, 3);
  const gridPosts = filteredPosts.slice(3, 7);
  const selectedCategoryName =
    activeCategory === 'all' ? 'All Articles' : visibleCategories.find((category) => category.slug === activeCategory)?.name || 'Selected Category';
  const showConfiguredEmptyState = !posts.length && availability?.isConfigured === true;

  return (
    <section className="dashboard-section" data-home-latest-blogs="">
      <div className={styles.sectionHeader}>
        <div className={styles.headerCopy}>
          <span className={styles.eyebrow}>Zenith Editorial</span>
          <h2 className={styles.title}>Latest Blogs</h2>
          <p className={styles.description}>
            News, reviews, event guides, and investment reads in a cleaner editorial layout so the home page feels curated instead of stretched.
          </p>
        </div>

        <Link href="/blogs" className="view-all-btn">
          View All
        </Link>
      </div>

      {visibleCategories.length ? (
        <div className={styles.categoryTabs} role="tablist" aria-label="Blog categories">
          <button
            type="button"
            className={`${styles.categoryTab} ${activeCategory === 'all' ? styles.categoryTabActive : ''}`.trim()}
            onClick={() => setActiveCategory('all')}
            aria-pressed={activeCategory === 'all'}
          >
            All
          </button>
          {visibleCategories.map((category) => (
            <button
              key={category.slug}
              type="button"
              className={`${styles.categoryTab} ${activeCategory === category.slug ? styles.categoryTabActive : ''}`.trim()}
              onClick={() => setActiveCategory(category.slug)}
              aria-pressed={activeCategory === category.slug}
            >
              {category.name}
            </button>
          ))}
        </div>
      ) : null}

      {featuredPost ? (
        <>
          <div className={styles.editorialGrid}>
            <BlogFeatureCard post={featuredPost} />

            <aside className={styles.sideRail}>
              <div className={styles.sidePanel}>
                <div className={styles.sidePanelHeader}>
                  <h3>{selectedCategoryName}</h3>
                  <span>{filteredPosts.length} article{filteredPosts.length === 1 ? '' : 's'}</span>
                </div>

                {railPosts.length ? (
                  <div className={styles.sideStack}>
                    {railPosts.map((post) => (
                      <BlogCompactCard key={post.id || post.slug} post={post} />
                    ))}
                  </div>
                ) : (
                  <div className={styles.categoryChannelList}>
                    {visibleCategories.map((category) => (
                      <button
                        key={category.slug}
                        type="button"
                        className={`${styles.channelButton} ${activeCategory === category.slug ? styles.channelButtonActive : ''}`.trim()}
                        onClick={() => setActiveCategory(category.slug)}
                      >
                        <span>{category.name}</span>
                        <small>{toText(category.description, 'Browse the latest Zenith editorial coverage.')}</small>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </aside>
          </div>

          <div className={styles.subsectionHeader}>
            <h3>More from {selectedCategoryName}</h3>
            <p>Smaller cards keep the feed balanced while still giving readers clear paths into each story.</p>
          </div>

          {gridPosts.length ? (
            <div className={styles.cardsGrid}>
              {gridPosts.map((post) => (
                <BlogCompactCard key={post.id || post.slug} post={post} />
              ))}
            </div>
          ) : (
            <div className={styles.emptyPanel}>
              <h3>Build Out This Channel</h3>
              <p>
                {selectedCategoryName} currently has fewer homepage stories, so the section keeps the focus on the strongest article instead of stretching a single card too wide.
              </p>
              <Link href={activeCategory === 'all' ? '/blogs' : `/blogs/${encodeURIComponent(activeCategory)}`} className={styles.emptyLink}>
                Explore {selectedCategoryName}
              </Link>
            </div>
          )}
        </>
      ) : (
        <div className={styles.emptyPanel}>
          <h3>{showConfiguredEmptyState ? 'No Published Articles Yet' : 'Blogs Are Not Configured Yet'}</h3>
          <p>
            {showConfiguredEmptyState
              ? 'Published posts will appear here as soon as the editorial desk ships the first stories.'
              : availability?.description || 'Set up blog publishing to show editorial content on the home page.'}
          </p>
          <Link href="/blogs" className={styles.emptyLink}>
            Open Blogs
          </Link>
        </div>
      )}
    </section>
  );
}
