import {
  BLOG_EXCERPT_MAX_LENGTH,
  BLOG_MIN_READING_TIME_MINUTES,
  BLOG_READING_WORDS_PER_MINUTE
} from './constants.mjs';

function collapseWhitespace(value) {
  return String(value || '')
    .replace(/\u00a0/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function stripHtmlTags(html) {
  return collapseWhitespace(
    String(html || '')
      .replace(/<style[\s\S]*?<\/style>/gi, ' ')
      .replace(/<script[\s\S]*?<\/script>/gi, ' ')
      .replace(/<[^>]+>/g, ' ')
  );
}

function collectTipTapText(node, parts) {
  if (!node) return;

  if (Array.isArray(node)) {
    node.forEach((entry) => collectTipTapText(entry, parts));
    return;
  }

  if (typeof node === 'object') {
    if (typeof node.text === 'string') {
      parts.push(node.text);
    }

    if (node.type === 'image' && typeof node.attrs?.alt === 'string') {
      parts.push(node.attrs.alt);
    }

    if (node.content) {
      collectTipTapText(node.content, parts);
    }
  }
}

export function extractPlainTextFromRichContent(content) {
  if (content === undefined || content === null) return '';

  if (typeof content === 'string') {
    const trimmed = content.trim();
    if (!trimmed) return '';

    if (trimmed.startsWith('<')) {
      return stripHtmlTags(trimmed);
    }

    if (trimmed.startsWith('{') || trimmed.startsWith('[')) {
      try {
        return extractPlainTextFromRichContent(JSON.parse(trimmed));
      } catch {
        return collapseWhitespace(trimmed);
      }
    }

    return collapseWhitespace(trimmed);
  }

  if (Array.isArray(content) || typeof content === 'object') {
    const parts = [];
    collectTipTapText(content, parts);
    return collapseWhitespace(parts.join(' '));
  }

  return '';
}

export function countWords(text) {
  const normalized = collapseWhitespace(text);
  return normalized ? normalized.split(' ').length : 0;
}

export function estimateReadingTime(content, options = {}) {
  const wordsPerMinute = Number.isFinite(Number(options.wordsPerMinute)) && Number(options.wordsPerMinute) > 0
    ? Math.trunc(Number(options.wordsPerMinute))
    : BLOG_READING_WORDS_PER_MINUTE;
  const minMinutes = Number.isFinite(Number(options.minMinutes)) && Number(options.minMinutes) > 0
    ? Math.trunc(Number(options.minMinutes))
    : BLOG_MIN_READING_TIME_MINUTES;
  const plainText = options.plainText
    ? collapseWhitespace(content)
    : extractPlainTextFromRichContent(content);
  const wordCount = countWords(plainText);
  const minutes = wordCount
    ? Math.max(minMinutes, Math.ceil(wordCount / wordsPerMinute))
    : minMinutes;

  return {
    plainText,
    wordCount,
    minutes,
    label: `${minutes} min read`
  };
}

export function createExcerpt(content, options = {}) {
  const maxLength = Number.isFinite(Number(options.maxLength)) && Number(options.maxLength) > 0
    ? Math.trunc(Number(options.maxLength))
    : BLOG_EXCERPT_MAX_LENGTH;
  const plainText = options.plainText
    ? collapseWhitespace(content)
    : extractPlainTextFromRichContent(content);

  if (plainText.length <= maxLength) return plainText;

  const truncated = plainText.slice(0, maxLength + 1);
  const boundary = truncated.lastIndexOf(' ');
  const safeSlice = boundary >= Math.floor(maxLength * 0.6)
    ? truncated.slice(0, boundary)
    : truncated.slice(0, maxLength);

  return `${safeSlice.trimEnd()}...`;
}
