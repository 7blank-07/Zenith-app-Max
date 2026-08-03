'use client';

import { useState } from 'react';
import { useFormState, useFormStatus } from 'react-dom';
import Link from 'next/link';
import styles from './AdminShell.module.css';

const DEFAULT_SEO_MAPPING = {
  '/': {
    title: 'Zenith - FC Mobile Database and Tools',
    metaDescription: 'The ultimate FC Mobile database, squad builder, and market tools.'
  },
  '/players': {
    title: 'Player Database | Zenith',
    metaDescription: 'Player database with search, filters, stats controls, and watchlist interactions.'
  },
  '/tools/squad-builder': {
    title: 'FC Mobile Squad Builder | ZenithFCM',
    metaDescription: 'Build your ultimate FC Mobile squad with OVR optimization, chemistry planning, and team testing tools.'
  },
  '/tools/player-compare': {
    title: 'FC Mobile Player Compare | ZenithFCM',
    metaDescription: 'Compare FC Mobile player stats side-by-side. Analyze pace, shooting, passing, and physical attributes to find the best players for your team.'
  },
  '/tools/watchlist': {
    title: 'FC Mobile Watchlist | ZenithFCM',
    metaDescription: 'Track your favorite FC Mobile players and monitor their market prices in real-time with the Zenith Watchlist tool.'
  },
  '/fc-mobile-redeem-codes': {
    title: 'FC Mobile Redeem Codes | ZenithFCM',
    metaDescription: 'Latest active FC Mobile redeem codes. Claim free gems, coins, and player packs.'
  },
  '/top-10/st': {
    title: 'Top 10 ST Players - FC Mobile',
    metaDescription: 'Discover the best 10 ST players in FC Mobile. Expert curated rankings to help you build the ultimate squad.'
  }
};

const PREDEFINED_PATHS = [
  { value: '/', label: 'Homepage' },
  { value: '/players', label: 'Player Database' },
  { value: '/tools/squad-builder', label: 'Squad Builder Tool' },
  { value: '/tools/player-compare', label: 'Player Compare Tool' },
  { value: '/tools/watchlist', label: 'Watchlist Tool' },
  { value: '/fc-mobile-redeem-codes', label: 'Global Redeem Codes' },
  { value: '/top-10/st', label: 'Top 10 ST' },
  { value: 'custom', label: 'Custom Path...' }
];

function SubmitButton({ pageSeoId, isDeleting }) {
  const { pending } = useFormStatus();
  const label = pageSeoId ? 'Save configuration' : 'Create configuration';

  return (
    <button
      type="submit"
      disabled={pending || isDeleting}
      className={styles.button}
      name="intent"
      value="save"
    >
      {pending && !isDeleting ? 'Processing...' : label}
    </button>
  );
}

function DeleteButton({ pageSeoId, isDeleting, setIsDeleting }) {
  const { pending } = useFormStatus();

  if (isDeleting) {
    return (
      <div className={styles.deleteConfirmRow}>
        <p className={styles.tableDescription}>Are you sure? This action cannot be undone.</p>
        <button
          type="submit"
          disabled={pending}
          className={styles.buttonDanger}
          name="intent"
          value="delete"
        >
          {pending ? 'Deleting...' : 'Confirm delete'}
        </button>
        <button
          type="button"
          disabled={pending}
          className={styles.buttonSecondary}
          onClick={() => setIsDeleting(false)}
        >
          Cancel
        </button>
      </div>
    );
  }

  return (
    <button
      type="button"
      disabled={pending}
      className={styles.buttonDanger}
      onClick={() => setIsDeleting(true)}
    >
      Delete configuration
    </button>
  );
}

export default function AdminPageSeoForm({ action, pageSeo = {}, error: externalError }) {
  const [state, formAction] = useFormState(action, {
    error: externalError || null,
    fieldErrors: {}
  });
  const [isDeleting, setIsDeleting] = useState(false);
  
  const [selectedPath, setSelectedPath] = useState(() => {
    if (!pageSeo.pagePath) return PREDEFINED_PATHS[0].value;
    const isPredefined = PREDEFINED_PATHS.some(p => p.value === pageSeo.pagePath);
    return isPredefined ? pageSeo.pagePath : 'custom';
  });
  
  const [customPath, setCustomPath] = useState(() => {
    const isPredefined = PREDEFINED_PATHS.some(p => p.value === pageSeo.pagePath);
    return isPredefined ? '' : (pageSeo.pagePath || '');
  });

  const [title, setTitle] = useState(pageSeo.title || '');
  const [metaDescription, setMetaDescription] = useState(pageSeo.metaDescription || '');

  const handlePathSelection = (e) => {
    const val = e.target.value;
    setSelectedPath(val);
    
    if (val !== 'custom' && DEFAULT_SEO_MAPPING[val]) {
      setTitle(DEFAULT_SEO_MAPPING[val].title);
      setMetaDescription(DEFAULT_SEO_MAPPING[val].metaDescription);
    }
  };

  const actualPath = selectedPath === 'custom' ? customPath : selectedPath;

  const [isFetchingMetadata, setIsFetchingMetadata] = useState(false);
  const handleFetchMetadata = async () => {
    if (!actualPath || !actualPath.startsWith('/')) {
      alert('Please enter a valid custom path starting with /');
      return;
    }
    
    setIsFetchingMetadata(true);
    try {
      const res = await fetch(`/api/admin/fetch-metadata?path=${encodeURIComponent(actualPath)}`);
      if (!res.ok) {
        throw new Error('Could not fetch metadata for this path. Make sure the page exists.');
      }
      
      const data = await res.json();
      if (data.title) setTitle(data.title);
      if (data.metaDescription) setMetaDescription(data.metaDescription);
      
    } catch (err) {
      alert(err.message);
    } finally {
      setIsFetchingMetadata(false);
    }
  };

  return (
    <form action={formAction} className={styles.editorForm}>
      <input type="hidden" name="pageSeoId" value={pageSeo.id || ''} />
      <input type="hidden" name="pagePath" value={actualPath} />

      {state.error ? <div className={styles.errorBanner}>{state.error}</div> : null}

      <div className={styles.formGrid}>
        <section className={styles.formSection}>
          <h3 className={styles.tableTitle}>Page Identification</h3>
          
          <label className={styles.field}>
            <span className={styles.label}>Select Page *</span>
            <select 
              className={styles.select} 
              value={selectedPath} 
              onChange={handlePathSelection}
              disabled={!!pageSeo.id}
            >
              {PREDEFINED_PATHS.map((p) => (
                <option key={p.value} value={p.value}>{p.label}</option>
              ))}
            </select>
          </label>
          
          {selectedPath === 'custom' && (
            <label className={styles.field}>
              <span className={styles.label}>Custom Page Path *</span>
              <input
                className={styles.input}
                type="text"
                value={customPath}
                onChange={(e) => setCustomPath(e.target.value)}
                placeholder="e.g. /tools/new-tool"
                required={selectedPath === 'custom'}
                disabled={!!pageSeo.id}
              />
              <p className={styles.fieldHint}>Must start with a forward slash. Represents the URL of the page.</p>
              {state.fieldErrors?.pagePath ? <span className={styles.fieldError}>{state.fieldErrors.pagePath}</span> : null}
              
              <button 
                type="button" 
                onClick={handleFetchMetadata}
                disabled={isFetchingMetadata}
                style={{ marginTop: '8px', padding: '6px 12px', fontSize: '13px', cursor: 'pointer' }}
              >
                {isFetchingMetadata ? 'Fetching...' : 'Auto-fill current Title & Description'}
              </button>
            </label>
          )}
        </section>

        <section className={styles.formSection}>
          <h3 className={styles.tableTitle}>Metadata & SEO</h3>
          
          <label className={styles.field}>
            <span className={styles.label}>Meta Title</span>
            <input
              className={styles.input}
              type="text"
              name="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Custom title tag..."
            />
          </label>

          <label className={styles.field}>
            <span className={styles.label}>Meta Description</span>
            <textarea
              className={styles.textarea}
              name="metaDescription"
              value={metaDescription}
              onChange={(e) => setMetaDescription(e.target.value)}
              placeholder="Custom meta description..."
              rows={3}
            />
          </label>
          
          <label className={styles.field}>
            <span className={styles.label}>H1 Heading Override</span>
            <input
              className={styles.input}
              type="text"
              name="h1Heading"
              defaultValue={pageSeo.h1Heading || ''}
              placeholder="Override page H1 tag..."
            />
            <p className={styles.fieldHint}>Leave empty to use the default heading built into the page.</p>
          </label>

          <label className={styles.field}>
            <span className={styles.label}>SEO Keywords</span>
            <input
              className={styles.input}
              type="text"
              name="seoKeywords"
              defaultValue={(pageSeo.seoKeywords || []).join(', ')}
              placeholder="fifa, fc mobile, squad builder..."
            />
            <p className={styles.fieldHint}>Comma separated list of keywords.</p>
          </label>
          
          <label className={styles.field}>
            <span className={styles.label}>Canonical URL</span>
            <input
              className={styles.input}
              type="url"
              name="canonicalUrl"
              defaultValue={pageSeo.canonicalUrl || ''}
              placeholder="https://..."
            />
            <p className={styles.fieldHint}>Optional. Leave blank to self-reference the current path.</p>
          </label>

          <label className={styles.field}>
            <span className={styles.label}>OpenGraph Image URL</span>
            <input
              className={styles.input}
              type="text"
              name="ogImage"
              defaultValue={pageSeo.ogImage || ''}
              placeholder="/assets/images/..."
            />
          </label>
        </section>

        <section className={styles.formSection}>
          <h3 className={styles.tableTitle}>Advanced SEO Directives</h3>
          
          <div className={styles.checkboxField}>
            <label className={styles.checkboxLabel}>
              <input
                type="checkbox"
                name="noindex"
                defaultChecked={pageSeo.noindex}
              />
              <span className={styles.label}>No Index (noindex)</span>
            </label>
            <p className={styles.fieldHint}>Instruct search engines not to index this page.</p>
          </div>

          <div className={styles.checkboxField}>
            <label className={styles.checkboxLabel}>
              <input
                type="checkbox"
                name="nofollow"
                defaultChecked={pageSeo.nofollow}
              />
              <span className={styles.label}>No Follow (nofollow)</span>
            </label>
            <p className={styles.fieldHint}>Instruct search engines not to follow links on this page.</p>
          </div>

          <label className={styles.field}>
            <span className={styles.label}>Custom JSON-LD (Structured Data)</span>
            <textarea
              className={styles.textarea}
              name="customJsonLd"
              defaultValue={pageSeo.customJsonLd || ''}
              placeholder='{"@context": "https://schema.org", "@type": "FAQPage", ...}'
              rows={6}
              style={{ fontFamily: 'monospace' }}
            />
            <p className={styles.fieldHint}>Paste valid JSON-LD to inject into the page. Do not include script tags.</p>
          </label>
        </section>
      </div>

      <div className={styles.formActions}>
        <div className={styles.actionRow}>
          <SubmitButton pageSeoId={pageSeo.id} isDeleting={isDeleting} />
          <Link href="/admin/pages-seo" className={styles.buttonSecondary}>
            Cancel
          </Link>
        </div>

        {pageSeo.id ? (
          <div className={styles.dangerZone}>
            <h4 className={styles.tableTitle}>Danger zone</h4>
            <DeleteButton 
              pageSeoId={pageSeo.id} 
              isDeleting={isDeleting} 
              setIsDeleting={setIsDeleting} 
            />
          </div>
        ) : null}
      </div>
    </form>
  );
}
