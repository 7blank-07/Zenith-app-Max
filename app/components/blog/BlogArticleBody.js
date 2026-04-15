import styles from './BlogLayout.module.css';
import { sanitizeRichTextHtml } from '../../../src/lib/server/blog/html.mjs';

export default function BlogArticleBody({ article }) {
  const html = sanitizeRichTextHtml(article?.contentHtml || '').trim();

  return (
    <article className={styles.articleBody} itemProp="articleBody">
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
