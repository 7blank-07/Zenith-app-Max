'use client';

import { useState } from 'react';
import { fetchAssetIdFromUrl } from '../../actions/admin-asset-id';
import styles from './AdminAssetId.module.css';

export default function AdminAssetIdTool() {
  const [url, setUrl] = useState('');
  const [assetId, setAssetId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [copied, setCopied] = useState(false);

  const handleFetch = async () => {
    if (!url) return;
    
    setLoading(true);
    setError(null);
    setAssetId(null);
    setCopied(false);
    
    try {
      const result = await fetchAssetIdFromUrl(url);
      
      if (result.error) {
        setError(result.error);
      } else {
        setAssetId(result.assetId);
      }
    } catch (err) {
      setError('An unexpected error occurred.');
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = async () => {
    if (!assetId) return;
    try {
      await navigator.clipboard.writeText(String(assetId));
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy', err);
    }
  };

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>Asset ID Fetcher</h2>
      <p className={styles.description}>
        Paste a Zenith player URL below to retrieve their internal Asset ID from the database.
      </p>

      <div className={styles.inputGroup}>
        <input
          type="url"
          className={styles.input}
          placeholder="https://zenithfcm.com/player/dalglish-121-9780629"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleFetch()}
          disabled={loading}
        />
        <button 
          className={styles.button} 
          onClick={handleFetch}
          disabled={loading || !url}
        >
          {loading ? <div className={styles.spinner}></div> : 'Fetch ID'}
        </button>
      </div>

      <div className={`${styles.error} ${error ? styles.visible : ''}`}>
        {error}
      </div>

      {assetId && !error && (
        <div className={`${styles.resultContainer} ${assetId ? styles.visible : ''}`}>
          <div className={styles.assetIdWrapper}>
            <span className={styles.assetIdLabel}>Asset ID</span>
            <span className={styles.assetIdValue}>{assetId}</span>
          </div>
          <button 
            className={`${styles.copyButton} ${copied ? styles.copied : ''}`}
            onClick={handleCopy}
            title="Copy to clipboard"
          >
            {copied ? (
              <>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12"></polyline>
                </svg>
                Copied!
              </>
            ) : (
              <>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                  <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                </svg>
                Copy
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
}
