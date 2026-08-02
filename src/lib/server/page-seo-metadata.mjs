import { getPageSeoByPath } from './page-seo.mjs';

export async function resolvePageSeo(path, defaultMetadata = {}) {
  try {
    const seoOverride = await getPageSeoByPath(path);
    if (!seoOverride) return defaultMetadata;

    const metadata = { ...defaultMetadata };

    if (seoOverride.title) {
      metadata.title = seoOverride.title;
      if (metadata.openGraph) metadata.openGraph.title = seoOverride.title;
      else metadata.openGraph = { title: seoOverride.title };
      
      if (metadata.twitter) metadata.twitter.title = seoOverride.title;
      else metadata.twitter = { title: seoOverride.title };
    }

    if (seoOverride.metaDescription) {
      metadata.description = seoOverride.metaDescription;
      if (metadata.openGraph) metadata.openGraph.description = seoOverride.metaDescription;
      else metadata.openGraph = { ...metadata.openGraph, description: seoOverride.metaDescription };

      if (metadata.twitter) metadata.twitter.description = seoOverride.metaDescription;
      else metadata.twitter = { ...metadata.twitter, description: seoOverride.metaDescription };
    }

    if (seoOverride.canonicalUrl) {
      if (!metadata.alternates) metadata.alternates = {};
      metadata.alternates.canonical = seoOverride.canonicalUrl;
      if (metadata.openGraph) metadata.openGraph.url = seoOverride.canonicalUrl;
      else metadata.openGraph = { ...metadata.openGraph, url: seoOverride.canonicalUrl };
    }

    if (seoOverride.ogImage) {
      if (!metadata.openGraph) metadata.openGraph = {};
      metadata.openGraph.images = [{ url: seoOverride.ogImage }];
      
      if (!metadata.twitter) metadata.twitter = {};
      metadata.twitter.images = [seoOverride.ogImage];
    }

    if (seoOverride.seoKeywords && seoOverride.seoKeywords.length > 0) {
      metadata.keywords = seoOverride.seoKeywords;
    }

    if (seoOverride.noindex || seoOverride.nofollow) {
      metadata.robots = {
        index: !seoOverride.noindex,
        follow: !seoOverride.nofollow
      };
    }

    return metadata;
  } catch (err) {
    console.error(`[SEO] Failed to resolve page SEO for ${path}`, err);
    return defaultMetadata;
  }
}

export async function getPageH1Override(path) {
  try {
    const seoOverride = await getPageSeoByPath(path);
    return seoOverride?.h1Heading || null;
  } catch (err) {
    return null;
  }
}

export function PageSeoH1({ heading }) {
  if (!heading) return null;
  return (
    <h1 style={{ position: 'absolute', width: '1px', height: '1px', padding: 0, margin: '-1px', overflow: 'hidden', clip: 'rect(0, 0, 0, 0)', whiteSpace: 'nowrap', border: 0 }}>
      {heading}
    </h1>
  );
}

export async function getPageCustomJsonLd(path) {
  try {
    const seoOverride = await getPageSeoByPath(path);
    return seoOverride?.customJsonLd || null;
  } catch (err) {
    return null;
  }
}

export function PageSeoCustomJsonLd({ schema }) {
  if (!schema) return null;
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: schema }}
    />
  );
}
