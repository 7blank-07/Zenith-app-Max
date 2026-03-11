function toText(value, fallback = '') {
  if (value === undefined || value === null) return fallback;
  return String(value).trim();
}

function normalizeUrl(value) {
  const href = toText(value);
  if (!href) return '';

  if (href.startsWith('/') || href.startsWith('#')) {
    return href;
  }

  try {
    const parsed = new URL(href);
    if (parsed.protocol === 'http:' || parsed.protocol === 'https:') {
      return parsed.toString();
    }
  } catch {
    return '';
  }

  return '';
}

function stripHtml(value) {
  return toText(value)
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function resolveSiteOrigin(siteUrl) {
  try {
    return new URL(siteUrl).origin;
  } catch {
    return '';
  }
}

function classifyLink(href, siteOrigin) {
  if (!href) {
    return '';
  }

  if (href.startsWith('/') || href.startsWith('#')) {
    return 'internal';
  }

  try {
    const parsed = new URL(href);
    if (!siteOrigin) {
      return 'external';
    }
    return parsed.origin === siteOrigin ? 'internal' : 'external';
  } catch {
    return '';
  }
}

function normalizeLinkList(value) {
  if (Array.isArray(value)) {
    return value;
  }

  if (typeof value === 'string') {
    const trimmed = value.trim();
    if (!trimmed) return [];

    try {
      const parsed = JSON.parse(trimmed);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }

  return [];
}

function dedupeLinks(links) {
  const unique = new Map();

  for (const link of links) {
    const href = normalizeUrl(link?.href || link?.url);
    if (!href || unique.has(href)) continue;

    unique.set(href, {
      href,
      label: toText(link?.label || link?.title || link?.text) || null,
      title: toText(link?.title) || null
    });
  }

  return [...unique.values()];
}

export function extractLinksFromHtml(html, { siteUrl = process.env.NEXT_PUBLIC_SITE_URL } = {}) {
  const siteOrigin = resolveSiteOrigin(siteUrl);
  const extracted = [];
  const linkPattern = /<a\b([^>]*)>([\s\S]*?)<\/a>/gi;
  let match;

  while ((match = linkPattern.exec(String(html || '')))) {
    const attributeChunk = String(match[1] || '');
    const hrefMatch = /\bhref\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s"'=<>`]+))/i.exec(attributeChunk);
    const href = normalizeUrl(hrefMatch?.[1] ?? hrefMatch?.[2] ?? hrefMatch?.[3] ?? '');
    const label = stripHtml(match[2]);

    if (!href) continue;

    extracted.push({
      href,
      label: label || null,
      kind: classifyLink(href, siteOrigin)
    });
  }

  const internalLinks = [];
  const externalLinks = [];

  for (const link of extracted) {
    if (link.kind === 'internal') {
      internalLinks.push(link);
    }

    if (link.kind === 'external') {
      externalLinks.push(link);
    }
  }

  return {
    internalLinks: dedupeLinks(internalLinks),
    externalLinks: dedupeLinks(externalLinks)
  };
}

export function mergeBlogLinks({
  html,
  manualInternalLinks,
  manualExternalLinks,
  siteUrl = process.env.NEXT_PUBLIC_SITE_URL
} = {}) {
  const extracted = extractLinksFromHtml(html, { siteUrl });
  const siteOrigin = resolveSiteOrigin(siteUrl);
  const normalizedInternal = [];
  const normalizedExternal = [];

  for (const link of dedupeLinks(normalizeLinkList(manualInternalLinks))) {
    const kind = classifyLink(link.href, siteOrigin);
    if (kind === 'internal') {
      normalizedInternal.push(link);
    }
  }

  for (const link of dedupeLinks(normalizeLinkList(manualExternalLinks))) {
    const kind = classifyLink(link.href, siteOrigin);
    if (kind === 'external') {
      normalizedExternal.push(link);
    }
  }

  return {
    internalLinks: dedupeLinks([...normalizedInternal, ...extracted.internalLinks]),
    externalLinks: dedupeLinks([...normalizedExternal, ...extracted.externalLinks])
  };
}

