import Link from 'next/link';
import AuthorByline from './AuthorByline';
import OptimizedCoverImage from './OptimizedCoverImage';
import styles from './BlogLayout.module.css';

function getArticleHref(post) {
  return `/blogs/${encodeURIComponent(post.category?.slug || 'news')}/${encodeURIComponent(post.slug)}`;
}

export default function RelatedArticles({ posts = [] }) {
  if (!Array.isArray(posts) || !posts.length) return null;

  return (
    <aside className={styles.sideCard}>
      <div className={styles.sideCardHeader}>
        <h2 className={styles.sectionTitle}>Related articles</h2>
        <p className={styles.sectionDescription}>Keep reading with nearby stories from the same editorial stream.</p>
      </div>

      <div className={`${styles.relatedGrid} ${styles.sideCardContent}`.trim()}>
        {posts.map((post) => (
          <article key={post.id} className={styles.relatedCard}>
            <Link href={getArticleHref(post)} className={styles.relatedLink}>
              <span className={styles.relatedMedia}>
                {post.coverImage ? (
                  <OptimizedCoverImage
                    src={post.coverImage}
                    alt={post.title}
                    className={styles.relatedImage}
                    width={1200}
                    height={720}
                    sizes="(max-width: 1024px) 100vw, 30vw"
                    loading="lazy"
                    fetchPriority="low"
                  />
                ) : (
                  <span className={styles.relatedFallback}>{post.title}</span>
                )}
              </span>
            </Link>

            <div className={styles.relatedContent}>
              <Link href={`/blogs/${encodeURIComponent(post.category?.slug || 'news')}`} className={styles.categoryBadge}>
                {post.category?.name || 'Blogs'}
              </Link>
              <Link href={getArticleHref(post)} className={styles.relatedLink}>
                <h3 className={styles.relatedTitle}>{post.title}</h3>
              </Link>
              <AuthorByline author={post.author} publishedAt={post.publishedAt || post.createdAt} readingTime={post.readingTime} compact />
            </div>
          </article>
        ))}
      </div>
    </aside>
  );
}
