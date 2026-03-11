'use client';

import { useRef, useState } from 'react';
import styles from './BlogEditor.module.css';

export default function CoverImageField({
  value,
  error,
  slugHint,
  onChange,
  onUpload
}) {
  const inputRef = useRef(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');

  async function handleFileSelection(event) {
    const file = event.target.files?.[0];
    event.target.value = '';

    if (!file) return;

    setUploading(true);
    setUploadError('');

    try {
      const url = await onUpload(file, slugHint);
      onChange(url);
    } catch (uploadFailure) {
      setUploadError(uploadFailure instanceof Error ? uploadFailure.message : 'Cover image upload failed.');
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className={styles.listManager}>
      <label className={styles.field}>
        <span className={styles.label}>Cover image URL</span>
        <input
          className={styles.input}
          name="coverImage"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder="https://images.zenithfcm.com/blog/2026/example.png"
        />
      </label>

      <div className={styles.publicLinkRow}>
        <button type="button" className={styles.secondaryButton} onClick={() => inputRef.current?.click()} disabled={uploading}>
          {uploading ? 'Uploading...' : 'Upload image'}
        </button>
        <span className={styles.fieldHint}>Uploads use the protected `/api/blog/uploads` endpoint and return the public image URL.</span>
      </div>

      <input ref={inputRef} type="file" accept="image/*" hidden onChange={handleFileSelection} />

      {error ? <p className={styles.fieldError}>{error}</p> : null}
      {uploadError ? <p className={styles.fieldError}>{uploadError}</p> : null}

      {value ? (
        <div className={styles.coverPreview}>
          <img src={value} alt="Cover preview" className={styles.coverPreviewImage} />
          <span className={styles.fieldHint}>{value}</span>
        </div>
      ) : null}
    </div>
  );
}

