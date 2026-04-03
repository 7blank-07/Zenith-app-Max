import { getBlogSectionName, getBlogSiteName, toAbsoluteBlogUrl } from './seo.mjs';

function toText(value, fallback = '') {
  if (value === undefined || value === null) return fallback;
  return String(value).trim();
}

function cleanJsonLdValue(value) {
  if (Array.isArray(value)) {
    const cleanedArray = value.map((entry) => cleanJsonLdValue(entry)).filter((entry) => entry !== undefined);
    return cleanedArray.length ? cleanedArray : undefined;
  }

  if (value && typeof value === 'object') {
    const cleanedEntries = Object.entries(value)
      .map(([key, entry]) => [key, cleanJsonLdValue(entry)])
      .filter(([, entry]) => entry !== undefined);

    if (!cleanedEntries.length) {
      return undefined;
    }

    return Object.fromEntries(cleanedEntries);
  }

  if (value === undefined || value === null || value === '') {
    return undefined;
  }

  return value;
}

export function serializeJsonLd(schema) {
  return JSON.stringify(cleanJsonLdValue(schema));
}

export function buildBreadcrumbListSchema(items = [], rawEnv = process.env) {
  const listItems = items
    .map((item, index) => {
      const name = toText(item?.name);
      const path = toText(item?.path);
      if (!name || !path) return null;

      return {
        '@type': 'ListItem',
        position: index + 1,
        name,
        item: toAbsoluteBlogUrl(path, rawEnv)
      };
    })
    .filter(Boolean);

  if (!listItems.length) {
    return null;
  }

  return cleanJsonLdValue({
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: listItems
  });
}

export function buildBlogPostingSchema(article, rawEnv = process.env) {
  const categorySlug = toText(article?.category?.slug);
  const articleSlug = toText(article?.slug);

  if (!categorySlug || !articleSlug) {
    return null;
  }

  const canonicalPath = `/blogs/${encodeURIComponent(categorySlug)}/${encodeURIComponent(articleSlug)}`;
  const image = toText(article?.coverImage);

  return cleanJsonLdValue({
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': toAbsoluteBlogUrl(canonicalPath, rawEnv)
    },
    headline: toText(article?.title),
    alternativeHeadline: toText(article?.subtitle),
    description: toText(article?.metaDescription || article?.excerpt),
    image: image ? [toAbsoluteBlogUrl(image, rawEnv)] : undefined,
    datePublished: toText(article?.publishedAt),
    dateModified: toText(article?.updatedAt || article?.publishedAt),
    author: {
      '@type': 'Person',
      name: toText(article?.author?.name, getBlogSiteName())
    },
    publisher: {
      '@type': 'Organization',
      name: getBlogSiteName(),
      url: toAbsoluteBlogUrl('/', rawEnv),
      logo: {
        '@type': 'ImageObject',
        url: toAbsoluteBlogUrl('/assets/images/zenith_logo_main.png', rawEnv)
      }
    },
    articleSection: toText(article?.category?.name),
    keywords: Array.isArray(article?.seoKeywords) ? article.seoKeywords.join(', ') : undefined,
    timeRequired: article?.readingTime ? `PT${article.readingTime}M` : undefined,
    isAccessibleForFree: true,
    url: toAbsoluteBlogUrl(canonicalPath, rawEnv)
  });
}

export function buildBlogCollectionSchema({ title, description, path, items = [] } = {}, rawEnv = process.env) {
  const canonicalPath = toText(path);
  if (!canonicalPath) {
    return null;
  }

  const listItems = items
    .map((post, index) => {
      const categorySlug = toText(post?.category?.slug);
      const articleSlug = toText(post?.slug);
      if (!categorySlug || !articleSlug) return null;

      return {
        '@type': 'ListItem',
        position: index + 1,
        name: toText(post?.title),
        url: toAbsoluteBlogUrl(`/blogs/${encodeURIComponent(categorySlug)}/${encodeURIComponent(articleSlug)}`, rawEnv)
      };
    })
    .filter(Boolean);

  return cleanJsonLdValue({
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: toText(title, getBlogSectionName()),
    description: toText(description),
    url: toAbsoluteBlogUrl(canonicalPath, rawEnv),
    mainEntity: {
      '@type': 'ItemList',
      numberOfItems: listItems.length,
      itemListElement: listItems
    }
  });
}

