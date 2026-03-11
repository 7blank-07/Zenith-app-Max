import Link from 'next/link';
import styles from './BlogLayout.module.css';

function getArticleHref(post) {
  return `/blogs/${encodeURIComponent(post.category?.slug || 'news')}/${encodeURIComponent(post.slug)}`;
}

export default function PopularArticles({ posts = [] }) {
  if (!Array.isArray(posts) || !posts.length) return null;

  return (
    <aside className={styles.sideCard}>
      <div className={styles.sideCardHeader}>
        <h2 className={styles.sectionTitle}>Popular articles</h2>
        <p className={styles.sectionDescription}>A quick scan of the stories drawing the most attention right now.</p>
      </div>

      <ol className={styles.sideCardList}>
        {posts.map((post, index) => (
          <li key={post.id} className={styles.sideCardItem}>
            <span className={styles.smallMeta}>
              #{index + 1} • {post.views || 0} views
            </span>
            <Link href={getArticleHref(post)} className={styles.popularLink}>
              {post.title}
            </Link>
            <span className={styles.smallMeta}>{post.category?.name || 'Blogs'}</span>
          </li>
        ))}
      </ol>
    </aside>
  );
}
