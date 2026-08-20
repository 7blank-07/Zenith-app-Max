'use client';

import { useState } from 'react';
import { extractPlayerLinksAction } from '../../actions/link-extractor';
import styles from './AdminShell.module.css';

function CopyItem({ label, value }) {
  const [copied, setCopied] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);

  const handleCopy = async () => {
    if (!value) return;
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (e) {
      console.error('Failed to copy', e);
    }
  };

  const handleUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file || !value) return;

    try {
      setUploading(true);
      setUploadSuccess(false);

      // Extract filename from value
      const filename = value.split('/').pop();

      const formData = new FormData();
      formData.append('file', file);
      formData.append('filename', filename);

      const res = await fetch('/api/admin/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      if (data.success) {
        setUploadSuccess(true);
        setTimeout(() => setUploadSuccess(false), 3000);
      } else {
        alert(data.error || 'Upload failed');
      }
    } catch (err) {
      console.error('Upload error:', err);
      alert('Upload failed');
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  if (!value) return null;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '20px' }}>
      <span className={styles.label}>{label}</span>
      <div style={{ display: 'flex', gap: '8px' }}>
        <div 
          style={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'space-between',
            padding: '12px 16px',
            background: 'rgba(15, 23, 42, 0.92)',
            border: '1px solid rgba(148, 163, 184, 0.2)',
            borderRadius: '14px',
            cursor: 'pointer',
            transition: 'all 0.2s',
            flex: 1
          }}
          onClick={handleCopy}
          onMouseOver={(e) => e.currentTarget.style.borderColor = 'rgba(94, 234, 212, 0.5)'}
          onMouseOut={(e) => e.currentTarget.style.borderColor = 'rgba(148, 163, 184, 0.2)'}
        >
          <span style={{ 
            color: copied ? '#5eead4' : '#f8fafc',
            whiteSpace: 'nowrap', 
            overflow: 'hidden', 
            textOverflow: 'ellipsis',
            fontSize: '14px',
            transition: 'color 0.2s'
          }}>
            {value}
          </span>
          
          <span style={{ 
            marginLeft: '12px',
            color: copied ? '#5eead4' : 'rgba(148, 163, 184, 0.6)',
            fontSize: '13px',
            fontWeight: '600',
            transition: 'color 0.2s'
          }}>
            {copied ? 'Copied!' : 'Copy'}
          </span>
        </div>
        
        <label 
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '0 16px',
            background: 'rgba(15, 23, 42, 0.92)',
            border: '1px solid rgba(148, 163, 184, 0.2)',
            borderRadius: '14px',
            cursor: uploading ? 'wait' : 'pointer',
            color: uploadSuccess ? '#5eead4' : 'rgba(148, 163, 184, 0.6)',
            fontSize: '13px',
            fontWeight: '600',
            transition: 'all 0.2s',
            whiteSpace: 'nowrap'
          }}
          onMouseOver={(e) => { 
            if (!uploading) {
              e.currentTarget.style.borderColor = 'rgba(94, 234, 212, 0.5)'; 
              e.currentTarget.style.color = '#5eead4'; 
            }
          }}
          onMouseOut={(e) => { 
            if (!uploading) {
              e.currentTarget.style.borderColor = 'rgba(148, 163, 184, 0.2)'; 
              e.currentTarget.style.color = uploadSuccess ? '#5eead4' : 'rgba(148, 163, 184, 0.6)'; 
            }
          }}
        >
          {uploading ? 'Uploading...' : uploadSuccess ? 'Reuploaded!' : 'Reupload'}
          <input 
            type="file" 
            accept="image/*" 
            style={{ display: 'none' }} 
            onChange={handleUpload}
            disabled={uploading}
          />
        </label>
      </div>
    </div>
  );
}

export default function LinkExtractorClient() {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState(null);

  const handleExtract = async (e) => {
    e.preventDefault();
    if (!url.trim()) return;

    setLoading(true);
    setError('');
    setResult(null);

    const res = await extractPlayerLinksAction(url.trim());
    if (res?.error) {
      setError(res.error);
    } else if (res?.success && res.data) {
      setResult(res.data);
    } else {
      setError('An unknown error occurred.');
    }
    
    setLoading(false);
  };

  return (
    <section className={styles.tableCard} style={{ padding: '32px' }}>
      <div style={{ maxWidth: '800px' }}>
        <h2 className={styles.title} style={{ fontSize: '24px', marginBottom: '24px' }}>Extract Player Images</h2>
        
        <form onSubmit={handleExtract} style={{ display: 'flex', gap: '16px', alignItems: 'flex-end', marginBottom: '32px' }}>
          <label className={styles.field} style={{ flex: 1 }}>
            <span className={styles.label}>Player URL</span>
            <input
              className={styles.input}
              type="text"
              placeholder="e.g. https://zenithfcm.com/player/kaka-122-9795135"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              disabled={loading}
            />
          </label>
          <button type="submit" className={styles.button} disabled={loading || !url.trim()}>
            {loading ? 'Extracting...' : 'Show'}
          </button>
        </form>

        {error && (
          <div style={{ padding: '16px', background: 'rgba(239, 68, 68, 0.1)', color: '#f87171', borderRadius: '14px', marginBottom: '24px' }}>
            {error}
          </div>
        )}

        {result && (
          <div style={{ marginTop: '24px' }}>
            <h3 className={styles.label} style={{ fontSize: '18px', color: '#5eead4', marginBottom: '20px' }}>Extracted Links</h3>
            
            <CopyItem label="Player Image Address" value={result.playerImage} />
            <CopyItem label="Player Background Address" value={result.cardBackground} />
            <CopyItem label="League Image Address" value={result.leagueImage} />
            <CopyItem label="Nation Image Address" value={result.nationFlag} />
            <CopyItem label="Club Image Address" value={result.clubFlag} />
            
            {result.traits?.length > 0 && (
              <div style={{ marginTop: '24px' }}>
                <span className={styles.label} style={{ display: 'block', marginBottom: '12px' }}>Trait Images</span>
                {result.traits.map((t, i) => (
                  <CopyItem key={`trait-${i}`} label={`Trait ${i + 1}`} value={t} />
                ))}
              </div>
            )}
            
            {result.skills?.length > 0 && (
              <div style={{ marginTop: '24px' }}>
                <span className={styles.label} style={{ display: 'block', marginBottom: '12px' }}>Skill Images</span>
                {result.skills.map((s, i) => (
                  <CopyItem key={`skill-${i}`} label={`Skill ${i + 1}`} value={s} />
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
