import styles from './BlogLayout.module.css';
import { sanitizeRichTextHtml } from '../../../src/lib/server/blog/html.mjs';
import AdsenseAd from '../AdsenseAd';

export default function BlogArticleBody({ article }) {
  const html = sanitizeRichTextHtml(article?.contentHtml || '').trim();

  // Logic to inject ad in the middle of the article
  const renderContentWithAds = () => {
    if (!html) {
      return (
        <div className={styles.prose}>
          <p>{article?.excerpt || 'This article has been created but does not have any published body content yet.'}</p>
        </div>
      );
    }

    const paragraphs = html.split('</p>');
    // If article is long enough, inject ad after 5th paragraph
    if (paragraphs.length > 7) {
      const midPoint = 5;
      const firstPart = paragraphs.slice(0, midPoint).join('</p>') + '</p>';
      const secondPart = paragraphs.slice(midPoint).join('</p>');

      return (
        <>
          <div className={styles.prose} dangerouslySetInnerHTML={{ __html: firstPart }} />
          <AdsenseAd 
            slot="3526268926" 
            layout="in-article" 
            format="fluid" 
            style={{ margin: '40px 0' }} 
          />
          <div className={styles.prose} dangerouslySetInnerHTML={{ __html: secondPart }} />
        </>
      );
    }

    return <div className={styles.prose} dangerouslySetInnerHTML={{ __html: html }} />;
  };

  return (
    <article className={styles.articleBody} itemProp="articleBody">
      {renderContentWithAds()}
    </article>
  );
}
