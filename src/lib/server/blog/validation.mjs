import { BLOG_EXCERPT_MAX_LENGTH, BLOG_META_DESCRIPTION_MAX_LENGTH, BLOG_USER_ROLE } from './constants.mjs';
import {
  createStoredEditorDocument,
  hasMeaningfulRichTextContent,
  sanitizeRichTextHtml
} from './html.mjs';
import { mergeBlogLinks } from './link-extraction.mjs';
import { slugifyBlogSegment } from './slugs.mjs';

function toText(value, fallback = '') {
  if (value === undefined || value === null) return fallback;
  return String(value).trim();
}

function toBoolean(value) {
  if (typeof value === 'boolean') return value;
  const normalized = toText(value).toLowerCase();
  return normalized === '1' || normalized === 'true' || normalized === 'yes' || normalized === 'on';
}

function parseJsonArray(value) {
  const text = toText(value);
  if (!text) return [];

  try {
    const parsed = JSON.parse(text);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function normalizeStringList(value) {
  const fromJson = parseJsonArray(value);
  const source = fromJson.length ? fromJson : toText(value).split(/[\n,]+/g);
  const deduped = new Map();

  for (const entry of source) {
    const text = toText(typeof entry === 'string' ? entry : entry?.name || entry?.label || entry?.value);
    if (!text) continue;

    const key = text.toLowerCase();
    if (!deduped.has(key)) {
      deduped.set(key, text);
    }
  }

  return [...deduped.values()];
}

function normalizeCoverImage(value) {
  const url = toText(value);
  if (!url) return '';

  if (url.startsWith('/')) {
    return url;
  }

  try {
    const parsed = new URL(url);
    if (parsed.protocol === 'http:' || parsed.protocol === 'https:') {
      return parsed.toString();
    }
  } catch {
    return '';
  }

  return '';
}

function buildErrorState(message, fieldErrors = {}) {
  return {
    ok: false,
    error: message,
    fieldErrors
  };
}

export function validateBlogEditorSubmission(formData, { intent, existingPost = null, currentUser, rawEnv = process.env } = {}) {
  const title = toText(formData.get('title'));
  const subtitle = toText(formData.get('subtitle'));
  const slugInput = toText(formData.get('slug'));
  const categoryId = toText(formData.get('categoryId'));
  const excerpt = toText(formData.get('excerpt'));
  const metaDescription = toText(formData.get('metaDescription'));
  const coverImage = normalizeCoverImage(formData.get('coverImage'));
  const editorHtml = sanitizeRichTextHtml(formData.get('editorHtml'));
  const tags = normalizeStringList(formData.get('tags'));
  const seoKeywords = normalizeStringList(formData.get('seoKeywords'));
  const manualInternalLinks = parseJsonArray(formData.get('internalLinks'));
  const manualExternalLinks = parseJsonArray(formData.get('externalLinks'));
  const linkedPlayerId = toText(formData.get('linkedPlayerId'));
  const fieldErrors = {};

  if (intent !== 'delete') {
    if (!title) {
      fieldErrors.title = 'A title is required.';
    }

    if (!categoryId) {
      fieldErrors.categoryId = 'Choose a category for this article.';
    }

    if (excerpt.length > BLOG_EXCERPT_MAX_LENGTH) {
      fieldErrors.excerpt = `Excerpt must stay under ${BLOG_EXCERPT_MAX_LENGTH} characters.`;
    }

    if (metaDescription.length > BLOG_META_DESCRIPTION_MAX_LENGTH) {
      fieldErrors.metaDescription = `Meta description must stay under ${BLOG_META_DESCRIPTION_MAX_LENGTH} characters.`;
    }

    if (toText(formData.get('coverImage')) && !coverImage) {
      fieldErrors.coverImage = 'Cover image must be an absolute http(s) URL or a site-relative path.';
    }

    if (['submit-review', 'approve', 'publish'].includes(intent) && !hasMeaningfulRichTextContent(editorHtml)) {
      fieldErrors.editorHtml = 'Add article content before sending this post through the editorial workflow.';
    }
  }

  if (Object.keys(fieldErrors).length) {
    return buildErrorState('Please fix the highlighted fields and try again.', fieldErrors);
  }

  const mergedLinks = mergeBlogLinks({
    html: editorHtml,
    manualInternalLinks,
    manualExternalLinks,
    siteUrl: rawEnv.NEXT_PUBLIC_SITE_URL
  });

  return {
    ok: true,
    value: {
      id: toText(formData.get('postId')) || existingPost?.id || '',
      title,
      subtitle: subtitle || null,
      slug: slugInput ? slugifyBlogSegment(slugInput, { fallback: 'post' }) : '',
      categoryId,
      excerpt: excerpt || null,
      metaDescription: metaDescription || null,
      coverImage: coverImage || null,
      contentHtml: editorHtml,
      contentJson: createStoredEditorDocument(editorHtml),
      tags,
      seoKeywords,
      internalLinks: mergedLinks.internalLinks,
      externalLinks: mergedLinks.externalLinks,
      featured: currentUser?.role === BLOG_USER_ROLE.ADMIN && toBoolean(formData.get('featured')),
      linkedPlayerId: linkedPlayerId || null
    }
  };
}

