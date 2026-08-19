'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { useFormState } from 'react-dom';
import BlogMetadataForm from './BlogMetadataForm';
import BlogEditorToolbar from './BlogEditorToolbar.client';
import WorkflowActions from './WorkflowActions';
import { submitBlogEditorAction } from '../../../actions/blog-editor';
import styles from './BlogEditor.module.css';

const INITIAL_FORM_STATE = Object.freeze({
  error: '',
  fieldErrors: {}
});

function toText(value, fallback = '') {
  if (value === undefined || value === null) return fallback;
  return String(value).trim();
}

function slugifyClient(value) {
  return toText(value)
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/&/g, ' and ')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .replace(/-{2,}/g, '-')
    .slice(0, 96);
}

function decodeCommonHtmlEntities(value) {
  return toText(value)
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/&#x27;/gi, "'");
}

function stripHtml(value) {
  return decodeCommonHtmlEntities(value)
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function normalizeEditorHtml(value) {
  return toText(value)
    .replace(/\sdata-selected="true"/g, '')
    .replace(/\u00a0/g, ' ');
}

function estimateReadingTime(html) {
  const words = stripHtml(html).split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.ceil(words / 200));
}

function buildInitialValues(post) {
  return {
    title: post?.title || '',
    subtitle: post?.subtitle || '',
    slug: post?.slug || '',
    categoryId: post?.categoryId || post?.category?.id || '',
    excerpt: post?.excerpt || '',
    metaDescription: post?.metaDescription || '',
    coverImage: post?.coverImage || '',
    tags: Array.isArray(post?.tags) ? post.tags.map((tag) => tag.name).filter(Boolean) : [],
    seoKeywords: Array.isArray(post?.seoKeywords) ? post.seoKeywords : [],
    internalLinks: Array.isArray(post?.internalLinks) ? post.internalLinks : [],
    externalLinks: Array.isArray(post?.externalLinks) ? post.externalLinks : [],
    linkedPlayerId: post?.linkedPlayerId || '',
    writerName: post?.writerName || 'ASTA',
    featured: Boolean(post?.featured)
  };
}

function sortCategoriesByName(input = []) {
  return [...(Array.isArray(input) ? input : [])].sort((left, right) =>
    String(left?.name || '').localeCompare(String(right?.name || ''), undefined, { sensitivity: 'base' })
  );
}

function mergeCategory(categories, category) {
  const next = [];
  const seen = new Set();
  const nextCategory = category && typeof category === 'object' ? category : null;

  for (const entry of [...(Array.isArray(categories) ? categories : []), nextCategory]) {
    if (!entry?.id) continue;
    if (seen.has(entry.id)) continue;
    seen.add(entry.id);
    next.push(entry);
  }

  return sortCategoriesByName(next);
}

export default function BlogEditor({
  user,
  post = null,
  categories = [],
  capabilities,
  notice = ''
}) {
  const [formState, formAction] = useFormState(submitBlogEditorAction, INITIAL_FORM_STATE);
  const editorRef = useRef(null);
  const initialValues = useMemo(() => buildInitialValues(post), [post]);
  const [values, setValues] = useState(initialValues);
  const [availableCategories, setAvailableCategories] = useState(() => sortCategoriesByName(categories));
  const [editorHtml, setEditorHtml] = useState(post?.contentHtml || '');
  const [slugDirty, setSlugDirty] = useState(Boolean(post?.id || post?.slug));

  useEffect(() => {
    setValues(initialValues);
    setSlugDirty(Boolean(post?.id || post?.slug));
  }, [initialValues, post?.id, post?.slug]);

  useEffect(() => {
    setAvailableCategories(sortCategoriesByName(categories));
  }, [categories]);

  useEffect(() => {
    const nextHtml = post?.contentHtml || '';
    setEditorHtml(nextHtml);

    if (editorRef.current && editorRef.current.innerHTML !== nextHtml) {
      editorRef.current.innerHTML = nextHtml;
    }
  }, [post?.contentHtml, post?.id]);

  function updateField(key, nextValue) {
    setValues((current) => {
      const nextState = {
        ...current,
        [key]: nextValue
      };

      if (key === 'title' && !slugDirty) {
        nextState.slug = slugifyClient(nextValue);
      }

      return nextState;
    });

    if (key === 'slug') {
      setSlugDirty(true);
    }
  }

  function syncEditorSnapshot(nextHtml) {
    const resolvedHtml = typeof nextHtml === 'string' ? nextHtml : editorRef.current?.innerHTML || '';
    setEditorHtml(normalizeEditorHtml(resolvedHtml));
  }

  async function uploadAsset(file, slugHint) {
    const formData = new FormData();
    formData.set('file', file);
    formData.set('slugHint', slugHint || values.slug || values.title || 'blog-image');

    const response = await fetch('/api/blog/uploads', {
      method: 'POST',
      body: formData
    });

    const payload = await response.json().catch(() => ({}));
    if (!response.ok) {
      throw new Error(payload?.error || 'Blog image upload failed.');
    }

    return payload.url;
  }

  async function createCategory(input = {}) {
    const response = await fetch('/api/blog/categories', {
      method: 'POST',
      headers: {
        'content-type': 'application/json'
      },
      body: JSON.stringify(input)
    });

    const payload = await response.json().catch(() => ({}));
    if (!response.ok) {
      throw new Error(payload?.error || 'Category creation failed.');
    }

    const category = payload?.category;
    if (!category?.id) {
      throw new Error('The server returned an invalid category response.');
    }

    setAvailableCategories((current) => mergeCategory(current, category));
    setValues((current) => ({
      ...current,
      categoryId: category.id
    }));

    return category;
  }

  const publicHref = post?.id && post?.category?.slug && post?.slug
    ? `/blogs/${encodeURIComponent(post.category.slug)}/${encodeURIComponent(post.slug)}`
    : '';
  const readingTime = estimateReadingTime(editorHtml);
  const wordCount = stripHtml(editorHtml).split(/\s+/).filter(Boolean).length;

  return (
    <form action={formAction} className={styles.editorLayout}>
      <input type="hidden" name="postId" value={post?.id || ''} />
      <input type="hidden" name="editorHtml" value={editorHtml} />

      {notice ? <div className={styles.notice}>{notice}</div> : null}
      {formState.error ? <div className={styles.error}>{formState.error}</div> : null}

      <div className={styles.shell}>
        <div className={styles.mainColumn}>
          <section className={styles.card}>
            <div className={styles.cardHeader}>
              <div>
                <h2 className={styles.cardTitle}>Rich text editor</h2>
                <p className={styles.cardDescription}>
                  Build long-form FC Mobile content with headings, lists, links, images, tables, code blocks, and embeds.
                </p>
              </div>
              <span className={styles.statusPill}>{post?.status || 'draft'}</span>
            </div>

            <BlogEditorToolbar
              editorRef={editorRef}
              onChange={syncEditorSnapshot}
              onUploadImage={uploadAsset}
              slugHint={values.slug || values.title}
            />

            <div
              ref={editorRef}
              className={styles.editorSurface}
              contentEditable
              suppressContentEditableWarning
              data-placeholder="Start writing your article here..."
              onInput={() => syncEditorSnapshot()}
            />

            <div className={styles.editorFooter}>
              <span className={styles.helperText}>
                This editor stores sanitized SSR-ready HTML plus a structured document wrapper in PostgreSQL.
              </span>
              <div className={styles.statsRow}>
                <span className={styles.metaPill}>{wordCount} words</span>
                <span className={styles.metaPill}>{readingTime} min read</span>
                <span className={styles.metaPill}>{user?.name || 'Unknown author'}</span>
              </div>
            </div>

            {formState.fieldErrors?.editorHtml ? <div className={styles.error}>{formState.fieldErrors.editorHtml}</div> : null}
          </section>

          <WorkflowActions
            status={post?.status || 'draft'}
            capabilities={capabilities}
            hasExistingPost={Boolean(post?.id)}
            publicHref={publicHref}
          />
        </div>

        <div className={styles.sideColumn}>
          <BlogMetadataForm
            values={values}
            categories={availableCategories}
            errors={formState.fieldErrors || {}}
            capabilities={capabilities}
            onFieldChange={updateField}
            onTagsChange={(nextTags) => updateField('tags', nextTags)}
            onKeywordsChange={(nextKeywords) => updateField('seoKeywords', nextKeywords)}
            onInternalLinksChange={(nextLinks) => updateField('internalLinks', nextLinks)}
            onExternalLinksChange={(nextLinks) => updateField('externalLinks', nextLinks)}
            onCoverImageChange={(nextUrl) => updateField('coverImage', nextUrl)}
            onUploadAsset={uploadAsset}
            onCreateCategory={createCategory}
          />
        </div>
      </div>
    </form>
  );
}

