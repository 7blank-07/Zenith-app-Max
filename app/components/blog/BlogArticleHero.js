import Link from 'next/link';
import AuthorByline from './AuthorByline';
import BlogTagPills from './BlogTagPills';
import styles from './BlogLayout.module.css';

export default function BlogArticleHero({ article }) {
  if (!article) return null;

  return (
    <section className={styles.articleHero}>
      <div className={styles.articleHeroContent}>
        <Link href={`/blogs/${encodeURIComponent(article.category?.slug || 'news')}`} className={styles.backLink}>
          ← Back to {article.category?.name || 'Blogs'}
        </Link>
        <span className={styles.eyebrow}>{article.category?.name || 'Blogs'}</span>
        <h1 className={styles.articleTitle}>{article.title}</h1>
        {article.subtitle ? <p className={styles.articleSubtitle}>{article.subtitle}</p> : null}
        <AuthorByline author={article.author} publishedAt={article.publishedAt || article.createdAt} readingTime={article.readingTime} />
        <BlogTagPills tags={article.tags} />
      </div>

      <div className={styles.articleCover}>
        {article.coverImage ? (
          <img src={article.coverImage} alt={article.title} className={styles.articleCoverImage} />
        ) : (
          <div className={styles.articleCoverFallback}>{article.title}</div>
        )}
      </div>
    </section>
  );
}
