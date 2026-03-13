import Link from 'next/link';
import AuthorByline from './AuthorByline';
import BlogTagPills from './BlogTagPills';
import OptimizedCoverImage from './OptimizedCoverImage';
import styles from './BlogLayout.module.css';

function getArticleHref(post) {
  return `/blogs/${encodeURIComponent(post.category?.slug || 'news')}/${encodeURIComponent(post.slug)}`;
}

export default function BlogArticleCard({ post, showTags = true }) {
  if (!post) return null;

  const articleHref = getArticleHref(post);
  const categoryHref = `/blogs/${encodeURIComponent(post.category?.slug || 'news')}`;

  return (
    <article className={styles.card}>
      <Link href={articleHref} className={styles.cardLink}>
        <span className={styles.cardMedia}>
          {post.coverImage ? (
            <OptimizedCoverImage
              src={post.coverImage}
              alt={post.title}
              className={styles.cardImage}
              width={1200}
              height={720}
              sizes="(max-width: 1024px) 100vw, 50vw"
              loading="lazy"
              fetchPriority="low"
            />
          ) : (
            <span className={styles.cardFallback}>{post.title}</span>
          )}
        </span>
      </Link>

      <div className={styles.cardContent}>
        <Link href={categoryHref} className={styles.categoryBadge}>
          {post.category?.name || 'Blogs'}
        </Link>

        <Link href={articleHref} className={styles.cardLink}>
          <h2 className={styles.cardTitle}>{post.title}</h2>
        </Link>

        {post.excerpt && <p className={styles.cardExcerpt}>{post.excerpt}</p>}

        <AuthorByline author={post.author} publishedAt={post.publishedAt || post.createdAt} readingTime={post.readingTime} compact />

        {showTags ? <BlogTagPills tags={post.tags?.slice(0, 3)} /> : null}
      </div>
    </article>
  );
}
