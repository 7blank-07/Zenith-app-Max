'use client';

import { useState } from 'react';
import CoverImageField from './CoverImageField.client';
import InternalLinkPicker from './InternalLinkPicker.client';
import TagSelector from './TagSelector.client';
import styles from './BlogEditor.module.css';

export default function BlogMetadataForm({
  values,
  categories,
  errors,
  capabilities,
  onFieldChange,
  onTagsChange,
  onKeywordsChange,
  onInternalLinksChange,
  onExternalLinksChange,
  onCoverImageChange,
  onUploadAsset,
  onCreateCategory
}) {
  const [categoryName, setCategoryName] = useState('');
  const [categorySlug, setCategorySlug] = useState('');
  const [categoryDescription, setCategoryDescription] = useState('');
  const [categoryNotice, setCategoryNotice] = useState('');
  const [categoryError, setCategoryError] = useState('');
  const [isCreatingCategory, setIsCreatingCategory] = useState(false);

  async function createCategory() {
    if (typeof onCreateCategory !== 'function') {
      return;
    }

    const name = String(categoryName || '').trim();
    if (!name) {
      setCategoryNotice('');
      setCategoryError('Category name is required.');
      return;
    }

    setIsCreatingCategory(true);
    setCategoryNotice('');
    setCategoryError('');

    try {
      const created = await onCreateCategory({
        name,
        slug: String(categorySlug || '').trim(),
        description: String(categoryDescription || '').trim()
      });
      setCategoryName('');
      setCategorySlug('');
      setCategoryDescription('');
      setCategoryNotice(`Category "${created?.name || name}" was added and selected.`);
    } catch (error) {
      setCategoryError(error instanceof Error ? error.message : 'Category creation failed.');
    } finally {
      setIsCreatingCategory(false);
    }
  }

  function handleCategoryKeyDown(event) {
    if (event.key !== 'Enter') return;
    event.preventDefault();
    createCategory();
  }

  return (
    <section className={styles.card}>
      <div className={styles.metaCardBody}>
        <div>
          <h2 className={styles.cardTitle}>Article metadata</h2>
          <p className={styles.cardDescription}>
            Control the URL, category, SEO fields, and editorial metadata that power the public blog experience.
          </p>
        </div>

        <label className={styles.field}>
          <span className={styles.label}>Title</span>
          <input
            className={styles.input}
            name="title"
            value={values.title}
            onChange={(event) => onFieldChange('title', event.target.value)}
            placeholder="Best investments for FC Mobile this week"
          />
          {errors.title ? <span className={styles.fieldError}>{errors.title}</span> : null}
        </label>

        <label className={styles.field}>
          <span className={styles.label}>Subtitle</span>
          <input
            className={styles.input}
            name="subtitle"
            value={values.subtitle}
            onChange={(event) => onFieldChange('subtitle', event.target.value)}
            placeholder="What changed, why it matters, and where value is hiding"
          />
        </label>

        <div className={styles.fieldGrid}>
          <label className={styles.field}>
            <span className={styles.label}>Slug</span>
            <input
              className={styles.input}
              name="slug"
              value={values.slug}
              onChange={(event) => onFieldChange('slug', event.target.value)}
              placeholder="best-investments-fcmobile-week"
            />
          </label>

          <label className={styles.field}>
            <span className={styles.label}>Category</span>
            <select
              className={styles.select}
              name="categoryId"
              value={values.categoryId}
              onChange={(event) => onFieldChange('categoryId', event.target.value)}
            >
              <option value="">Choose category</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
            {errors.categoryId ? <span className={styles.fieldError}>{errors.categoryId}</span> : null}
          </label>
        </div>

        {capabilities.canManageCategories ? (
          <div className={styles.field}>
            <span className={styles.label}>Add category</span>
            <div className={styles.categoryCreateRow}>
              <input
                className={styles.input}
                value={categoryName}
                onChange={(event) => {
                  setCategoryName(event.target.value);
                  setCategoryNotice('');
                  setCategoryError('');
                }}
                onKeyDown={handleCategoryKeyDown}
                placeholder="Market Tips"
              />
              <button
                type="button"
                className={styles.addButton}
                onClick={createCategory}
                disabled={isCreatingCategory || !categoryName.trim()}
              >
                {isCreatingCategory ? 'Adding...' : 'Add'}
              </button>
            </div>
            <input
              className={styles.input}
              value={categorySlug}
              onChange={(event) => {
                setCategorySlug(event.target.value);
                setCategoryNotice('');
                setCategoryError('');
              }}
              onKeyDown={handleCategoryKeyDown}
              placeholder="Optional slug (auto-generated if blank)"
            />
            <textarea
              className={styles.textarea}
              value={categoryDescription}
              onChange={(event) => {
                setCategoryDescription(event.target.value);
                setCategoryNotice('');
                setCategoryError('');
              }}
              placeholder="Optional category description for archive pages."
            />
            {categoryNotice ? <span className={styles.fieldSuccess}>{categoryNotice}</span> : null}
            {categoryError ? <span className={styles.fieldError}>{categoryError}</span> : null}
            <span className={styles.fieldHint}>
              New categories become available immediately for this article and public blog routes.
            </span>
          </div>
        ) : null}

        <TagSelector
          name="tags"
          label="Tags"
          values={values.tags}
          placeholder="investment guide"
          hint="Tags drive `/blogs/tag/[tag]` archives and related-article discovery."
          onChange={onTagsChange}
        />

        <CoverImageField
          value={values.coverImage}
          error={errors.coverImage}
          slugHint={values.slug || values.title}
          onChange={onCoverImageChange}
          onUpload={onUploadAsset}
        />

        <TagSelector
          name="seoKeywords"
          label="SEO keywords"
          values={values.seoKeywords}
          placeholder="fc mobile investments"
          hint="These keywords are stored alongside the article for search optimization."
          onChange={onKeywordsChange}
        />

        <label className={styles.field}>
          <span className={styles.label}>Excerpt</span>
          <textarea
            className={styles.textarea}
            name="excerpt"
            value={values.excerpt}
            onChange={(event) => onFieldChange('excerpt', event.target.value)}
            placeholder="Optional short summary for cards, feeds, and sharing previews."
          />
          <span className={styles.fieldHint}>{values.excerpt.length}/220 characters</span>
          {errors.excerpt ? <span className={styles.fieldError}>{errors.excerpt}</span> : null}
        </label>

        <label className={styles.field}>
          <span className={styles.label}>Meta description</span>
          <textarea
            className={styles.textarea}
            name="metaDescription"
            value={values.metaDescription}
            onChange={(event) => onFieldChange('metaDescription', event.target.value)}
            placeholder="Optional search description for metadata and previews."
          />
          <span className={styles.fieldHint}>{values.metaDescription.length}/160 characters</span>
          {errors.metaDescription ? <span className={styles.fieldError}>{errors.metaDescription}</span> : null}
        </label>

        {capabilities.canFeature ? (
          <label className={styles.checkboxRow}>
            <input
              type="checkbox"
              name="featured"
              className={styles.checkbox}
              checked={values.featured}
              onChange={(event) => onFieldChange('featured', event.target.checked)}
            />
            <span className={styles.fieldHint}>
              Mark as featured to make this article eligible for the blog homepage hero.
            </span>
          </label>
        ) : null}

        <div className={styles.divider} />

        <InternalLinkPicker
          name="internalLinks"
          label="Internal links"
          description="Curate extra Zenith links to reinforce internal linking and editorial recirculation."
          placeholder="/blogs/investments/example"
          value={values.internalLinks}
          onChange={onInternalLinksChange}
        />

        <InternalLinkPicker
          name="externalLinks"
          label="External links"
          description="Track cited sources or partner URLs separately from the links extracted out of the article body."
          placeholder="https://example.com/source"
          value={values.externalLinks}
          onChange={onExternalLinksChange}
        />
      </div>
    </section>
  );
}

