import Link from 'next/link';
import AuthorByline from './AuthorByline';
import OptimizedCoverImage from './OptimizedCoverImage';
import styles from './BlogLayout.module.css';

function getArticleHref(post) {
  return `/blogs/${encodeURIComponent(post.category?.slug || 'news')}/${encodeURIComponent(post.slug)}`;
}

export default function FeaturedArticles({ posts = [] }) {
  if (!Array.isArray(posts) || !posts.length) return null;

  const [primary, ...secondary] = posts;

  return (
    <section className={styles.featuredSection} aria-labelledby="featured-blogs-title">
      <h2 id="featured-blogs-title" className={styles.sectionTitle}>
        Featured stories
      </h2>
      <p className={styles.sectionDescription}>
        Hand-picked editor highlights for FC Mobile news, investments, and event strategy.
      </p>

      <div className={styles.featuredGrid}>
        <article className={`${styles.featuredCard} ${styles.featuredPrimary}`.trim()}>
          <Link href={getArticleHref(primary)} className={styles.featuredLink}>
            <span className={styles.featuredMedia}>
              {primary.coverImage ? (
                <OptimizedCoverImage
                  src={primary.coverImage}
                  alt={primary.title}
                  className={styles.featuredImage}
                  width={1200}
                  height={675}
                  sizes="(max-width: 1024px) 100vw, 62vw"
                  priority
                />
              ) : (
                <span className={styles.featuredFallback}>{primary.title}</span>
              )}
            </span>
          </Link>

          <div className={styles.featuredContent}>
            <Link href={`/blogs/${encodeURIComponent(primary.category?.slug || 'news')}`} className={styles.categoryBadge}>
              {primary.category?.name || 'Featured'}
            </Link>
            <Link href={getArticleHref(primary)} className={styles.featuredLink}>
              <h3 className={styles.featuredTitle}>{primary.title}</h3>
            </Link>
            {primary.excerpt ? <p className={styles.featuredExcerpt}>{primary.excerpt}</p> : null}
            <AuthorByline author={primary.author} writerName={primary.writerName} publishedAt={primary.publishedAt || primary.createdAt} readingTime={primary.readingTime} />
          </div>
        </article>

        <div className={styles.featuredSecondaryStack}>
          {secondary.map((post) => (
            <article key={post.id} className={styles.featuredCard}>
              <Link href={getArticleHref(post)} className={styles.featuredLink}>
                <span className={styles.cardMedia}>
                  {post.coverImage ? (
                    <OptimizedCoverImage
                      src={post.coverImage}
                      alt={post.title}
                      className={styles.cardImage}
                      width={640}
                      height={384}
                      sizes="(max-width: 1024px) 100vw, 32vw"
                      loading="lazy"
                      fetchPriority="low"
                    />
                  ) : (
                    <span className={styles.cardFallback}>{post.title}</span>
                  )}
                </span>
              </Link>

              <div className={styles.cardContent}>
                <Link href={`/blogs/${encodeURIComponent(post.category?.slug || 'news')}`} className={styles.categoryBadge}>
                  {post.category?.name || 'Blogs'}
                </Link>
                <Link href={getArticleHref(post)} className={styles.featuredLink}>
                  <h3 className={styles.relatedTitle}>{post.title}</h3>
                </Link>
                <AuthorByline author={post.author} writerName={post.writerName} publishedAt={post.publishedAt || post.createdAt} readingTime={post.readingTime} compact />
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
