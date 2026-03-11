const ALLOWED_TAGS = Object.freeze({
  p: Object.freeze({}),
  div: Object.freeze({}),
  span: Object.freeze({}),
  br: Object.freeze({ selfClosing: true }),
  strong: Object.freeze({}),
  b: Object.freeze({ alias: 'strong' }),
  em: Object.freeze({}),
  i: Object.freeze({ alias: 'em' }),
  u: Object.freeze({}),
  s: Object.freeze({}),
  blockquote: Object.freeze({}),
  pre: Object.freeze({}),
  code: Object.freeze({}),
  ul: Object.freeze({}),
  ol: Object.freeze({}),
  li: Object.freeze({}),
  h1: Object.freeze({ alias: 'h2' }),
  h2: Object.freeze({}),
  h3: Object.freeze({}),
  h4: Object.freeze({}),
  h5: Object.freeze({}),
  h6: Object.freeze({ alias: 'h4' }),
  a: Object.freeze({}),
  img: Object.freeze({ selfClosing: true }),
  table: Object.freeze({}),
  thead: Object.freeze({}),
  tbody: Object.freeze({}),
  tr: Object.freeze({}),
  th: Object.freeze({}),
  td: Object.freeze({}),
  figure: Object.freeze({}),
  figcaption: Object.freeze({}),
  hr: Object.freeze({ selfClosing: true }),
  iframe: Object.freeze({})
});

const DROP_CONTENT_TAGS = new Set(['script', 'style', 'object', 'embed', 'svg', 'math', 'noscript']);
const TRUSTED_EMBED_HOSTS = new Set([
  'www.youtube.com',
  'youtube.com',
  'www.youtube-nocookie.com',
  'youtube-nocookie.com',
  'player.vimeo.com'
]);

function toText(value, fallback = '') {
  if (value === undefined || value === null) return fallback;
  return String(value);
}

function escapeHtml(value) {
  return toText(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function escapeAttribute(value) {
  return escapeHtml(value).replace(/`/g, '&#96;');
}

function normalizeWhitespace(value) {
  return toText(value).replace(/\s+/g, ' ').trim();
}

function sanitizeUrl(value, options = {}) {
  const raw = normalizeWhitespace(value);
  if (!raw) return '';

  if (raw.startsWith('#')) {
    return raw;
  }

  if (raw.startsWith('/')) {
    return raw;
  }

  if (options.allowMailto && raw.toLowerCase().startsWith('mailto:')) {
    return raw;
  }

  if (options.allowTel && raw.toLowerCase().startsWith('tel:')) {
    return raw;
  }

  try {
    const parsed = new URL(raw);
    if (parsed.protocol === 'http:' || parsed.protocol === 'https:') {
      return parsed.toString();
    }
  } catch {
    return '';
  }

  return '';
}

function sanitizeIframeSource(value) {
  const normalized = sanitizeUrl(value);
  if (!normalized) return '';

  try {
    const parsed = new URL(normalized);
    return TRUSTED_EMBED_HOSTS.has(parsed.hostname.toLowerCase()) ? parsed.toString() : '';
  } catch {
    return '';
  }
}

function extractAttributes(token) {
  const attributes = new Map();
  const attributePattern = /([^\s"'<>\/=]+)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s"'=<>`]+)))?/g;
  let match;

  while ((match = attributePattern.exec(token))) {
    const name = String(match[1] || '').toLowerCase();
    if (!name || name === '/' || name === token) continue;

    const value = match[2] ?? match[3] ?? match[4] ?? '';
    attributes.set(name, value);
  }

  return attributes;
}

function parseTag(token) {
  const match = /^<\s*(\/)?\s*([a-zA-Z0-9:-]+)([^>]*)>$/.exec(token);
  if (!match) return null;

  return {
    isClosing: Boolean(match[1]),
    rawName: String(match[2] || ''),
    name: String(match[2] || '').toLowerCase(),
    rawAttributes: String(match[3] || ''),
    isSelfClosing: /\/\s*>$/.test(token)
  };
}

function sanitizeTagAttributes(tagName, attributes) {
  const sanitizedAttributes = [];

  if (tagName === 'a') {
    const href = sanitizeUrl(attributes.get('href'), { allowMailto: true, allowTel: true });
    if (!href) return null;

    sanitizedAttributes.push(`href="${escapeAttribute(href)}"`);

    const title = normalizeWhitespace(attributes.get('title'));
    if (title) {
      sanitizedAttributes.push(`title="${escapeAttribute(title)}"`);
    }

    const isExternal = /^https?:\/\//i.test(href);
    if (isExternal) {
      sanitizedAttributes.push('target="_blank"');
      sanitizedAttributes.push('rel="noopener noreferrer nofollow"');
    }
  }

  if (tagName === 'img') {
    const src = sanitizeUrl(attributes.get('src'));
    if (!src) return null;

    sanitizedAttributes.push(`src="${escapeAttribute(src)}"`);
    sanitizedAttributes.push(`alt="${escapeAttribute(normalizeWhitespace(attributes.get('alt')) || 'Blog image')}"`);

    const title = normalizeWhitespace(attributes.get('title'));
    if (title) {
      sanitizedAttributes.push(`title="${escapeAttribute(title)}"`);
    }

    sanitizedAttributes.push('loading="lazy"');
    sanitizedAttributes.push('decoding="async"');
  }

  if (tagName === 'iframe') {
    const src = sanitizeIframeSource(attributes.get('src'));
    if (!src) return null;

    sanitizedAttributes.push(`src="${escapeAttribute(src)}"`);
    sanitizedAttributes.push('loading="lazy"');
    sanitizedAttributes.push('allowfullscreen');
    sanitizedAttributes.push('referrerpolicy="strict-origin-when-cross-origin"');
    sanitizedAttributes.push('allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"');
  }

  if (tagName === 'th' || tagName === 'td') {
    const colspan = Number.parseInt(String(attributes.get('colspan') || ''), 10);
    const rowspan = Number.parseInt(String(attributes.get('rowspan') || ''), 10);

    if (Number.isFinite(colspan) && colspan > 1 && colspan <= 12) {
      sanitizedAttributes.push(`colspan="${colspan}"`);
    }

    if (Number.isFinite(rowspan) && rowspan > 1 && rowspan <= 12) {
      sanitizedAttributes.push(`rowspan="${rowspan}"`);
    }
  }

  if (tagName === 'code') {
    const language = normalizeWhitespace(attributes.get('data-language') || attributes.get('class'));
    if (language) {
      sanitizedAttributes.push(`data-language="${escapeAttribute(language.replace(/language-/gi, ''))}"`);
    }
  }

  return sanitizedAttributes.join(' ');
}

function closeStackUntil(stack, tagName) {
  let output = '';
  let matchIndex = -1;

  for (let index = stack.length - 1; index >= 0; index -= 1) {
    if (stack[index] === tagName) {
      matchIndex = index;
      break;
    }
  }

  if (matchIndex === -1) {
    return '';
  }

  for (let index = stack.length - 1; index >= matchIndex; index -= 1) {
    output += `</${stack[index]}>`;
    stack.pop();
  }

  return output;
}

export function sanitizeRichTextHtml(input) {
  const html = toText(input).replace(/<!DOCTYPE[^>]*>/gi, '').replace(/<!--[\s\S]*?-->/g, '');
  if (!html.trim()) return '';

  const tokens = html.match(/<\/?[^>]+>|[^<]+/g) || [];
  const openStack = [];
  const blockedStack = [];
  let output = '';

  for (const token of tokens) {
    if (!token) continue;

    const tag = parseTag(token);

    if (!tag) {
      if (blockedStack.length) continue;
      output += escapeHtml(token);
      continue;
    }

    if (blockedStack.length) {
      if (!tag.isClosing && DROP_CONTENT_TAGS.has(tag.name) && !tag.isSelfClosing) {
        blockedStack.push(tag.name);
        continue;
      }

      if (tag.isClosing && blockedStack[blockedStack.length - 1] === tag.name) {
        blockedStack.pop();
      }
      continue;
    }

    if (!tag.isClosing && DROP_CONTENT_TAGS.has(tag.name) && !tag.isSelfClosing) {
      blockedStack.push(tag.name);
      continue;
    }

    const config = ALLOWED_TAGS[tag.name];
    if (!config) {
      continue;
    }

    const safeTagName = config.alias || tag.name;

    if (tag.isClosing) {
      output += closeStackUntil(openStack, safeTagName);
      continue;
    }

    const attributes = extractAttributes(tag.rawAttributes);
    const serializedAttributes = sanitizeTagAttributes(safeTagName, attributes);

    if (serializedAttributes === null) {
      continue;
    }

    output += `<${safeTagName}${serializedAttributes ? ` ${serializedAttributes}` : ''}>`;

    if (!config.selfClosing && !tag.isSelfClosing) {
      openStack.push(safeTagName);
    }
  }

  while (openStack.length) {
    output += `</${openStack.pop()}>`;
  }

  return output.trim();
}

export function stripRichTextHtml(input) {
  return toText(input)
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/(p|div|li|blockquote|tr|h1|h2|h3|h4|h5|h6|figcaption)>/gi, '\n')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/\s+/g, ' ')
    .trim();
}

export function hasMeaningfulRichTextContent(input) {
  const html = toText(input);
  if (!html.trim()) return false;

  if (stripRichTextHtml(html)) {
    return true;
  }

  return /<(img|iframe|table|hr|pre|code)\b/i.test(html);
}

export function createStoredEditorDocument(contentHtml) {
  return {
    type: 'doc',
    version: 1,
    source: 'zenith-rich-text-v1',
    html: toText(contentHtml)
  };
}

export function getStoredEditorHtml(contentJson, fallbackHtml = '') {
  if (contentJson && typeof contentJson === 'object' && typeof contentJson.html === 'string') {
    return contentJson.html;
  }

  if (typeof contentJson === 'string') {
    try {
      const parsed = JSON.parse(contentJson);
      return getStoredEditorHtml(parsed, fallbackHtml);
    } catch {
      return fallbackHtml;
    }
  }

  return toText(fallbackHtml);
}

