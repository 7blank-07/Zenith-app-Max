import styles from './BlogLayout.module.css';

export default function BlogArticleBody({ article }) {
  const html = article?.contentHtml?.trim();

  return (
    <article className={styles.articleBody}>
      {html ? (
        <div className={styles.prose} dangerouslySetInnerHTML={{ __html: html }} />
      ) : (
        <div className={styles.prose}>
          <p>{article?.excerpt || 'This article has been created but does not have any published body content yet.'}</p>
        </div>
      )}
    </article>
  );
}
