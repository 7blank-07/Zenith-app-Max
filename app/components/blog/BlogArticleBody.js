import styles from './BlogLayout.module.css';
import { sanitizeRichTextHtml } from '../../../src/lib/server/blog/html.mjs';
import AdsenseAd from '../AdsenseAd';

export default function BlogArticleBody({ article, categorySlug }) {
  let html = sanitizeRichTextHtml(article?.contentHtml || '').trim();

  // If this is a redeem codes article, protect the first column of tables from translation
  if (categorySlug === 'redeem-codes') {
    html = html.replace(/<tr([^>]*)>(.*?)<\/tr>/gis, (match, trAttr, innerContent) => {
      let replaced = false;
      const newInner = innerContent.replace(/<td([^>]*)>/i, (tdMatch, tdAttr) => {
        if (!replaced) {
          replaced = true;
          if (!tdAttr.includes('translate="no"')) {
            return `<td${tdAttr} translate="no" class="notranslate">`;
          }
        }
        return tdMatch;
      });
      return `<tr${trAttr}>${newInner}</tr>`;
    });
  }

  // Wrap all tables in a horizontally scrollable container to prevent layout breakage
  html = html.replace(/<table([^>]*)>([\s\S]*?)<\/table>/gis, (match) => {
    return `<div class="${styles.tableWrapper}">${match}</div>`;
  });

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
