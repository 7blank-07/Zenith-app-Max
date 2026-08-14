'use client';

import { useState, useRef, useEffect } from 'react';
import styles from './ImageUploadWidget.module.css';

export default function ImageUploadWidget() {
  const [file, setFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [filename, setFilename] = useState('');
  const [uploading, setUploading] = useState(false);
  const [uploadResult, setUploadResult] = useState(null);
  const [error, setError] = useState(null);
  const [dragActive, setDragActive] = useState(false);
  
  const fileInputRef = useRef(null);

  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  const handleFile = (selectedFile) => {
    if (!selectedFile) return;
    
    if (!selectedFile.type.startsWith('image/')) {
      setError('Please select an image file (e.g., .jpg, .png, .webp).');
      return;
    }

    setFile(selectedFile);
    
    // Automatically sanitize initial filename
    const cleanName = selectedFile.name.replace(/[^a-zA-Z0-9.\-_]/g, '-').toLowerCase();
    setFilename(cleanName);
    setPreviewUrl(URL.createObjectURL(selectedFile));
    setError(null);
    setUploadResult(null);
  };

  const onDragEnter = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(true);
  };

  const onDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
  };

  const onDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const onDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const onFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!file || !filename) return;

    setUploading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('file', file);
      
      // Ensure the filename is sanitized on submission just in case
      const finalName = filename.replace(/[^a-zA-Z0-9.\-_]/g, '-');
      formData.append('filename', finalName);

      const response = await fetch('/api/admin/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Upload failed');
      }

      setUploadResult(data.url);
      
      setFile(null);
      setPreviewUrl(null);
      setFilename('');
      
    } catch (err) {
      setError(err.message);
    } finally {
      setUploading(false);
    }
  };

  const copyToClipboard = () => {
    if (uploadResult) {
      navigator.clipboard.writeText(uploadResult);
    }
  };

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>Upload to CDN</h2>
      <p className={styles.description}>Drag and drop an image or click to select one. Images will be publicly available at images.zenithfcm.com.</p>

      {!file && (
        <div 
          className={`${styles.dropzone} ${dragActive ? styles.dragActive : ''}`}
          onDragEnter={onDragEnter}
          onDragLeave={onDragLeave}
          onDragOver={onDragOver}
          onDrop={onDrop}
          onClick={() => fileInputRef.current?.click()}
        >
          <div className={styles.dropzoneContent}>
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{marginBottom: '12px', opacity: 0.6}}>
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
              <polyline points="17 8 12 3 7 8"></polyline>
              <line x1="12" y1="3" x2="12" y2="15"></line>
            </svg>
            <p><strong>Click to upload</strong> or drag and drop</p>
            <p style={{fontSize: '0.8rem', marginTop: '4px', opacity: 0.8}}>SVG, PNG, JPG or GIF (max. 10MB)</p>
          </div>
          <input 
            ref={fileInputRef}
            type="file" 
            accept="image/*" 
            onChange={onFileChange} 
            className={styles.hiddenInput}
          />
        </div>
      )}

      {error && <div className={styles.error}>{error}</div>}

      {uploadResult && (
        <div className={styles.success}>
          <p style={{fontWeight: 600, margin: '0 0 8px 0'}}>Upload successful!</p>
          <div className={styles.urlBox}>
            <a href={uploadResult} target="_blank" rel="noopener noreferrer">{uploadResult}</a>
            <button className={styles.copyButton} onClick={copyToClipboard}>Copy URL</button>
          </div>
        </div>
      )}

      {file && (
        <div className={styles.previewContainer}>
          <div className={styles.imagePreview}>
            <img src={previewUrl} alt="Preview" />
          </div>
          
          <div className={styles.formGroup}>
            <label htmlFor="filename">Rename file before upload</label>
            <input 
              id="filename"
              type="text" 
              value={filename} 
              onChange={(e) => setFilename(e.target.value)}
              className={styles.textInput}
              disabled={uploading}
              placeholder="e.g., hero-image-2024.jpg"
            />
            <small className={styles.helpText}>Spaces and special characters will be converted to dashes.</small>
          </div>

          <div className={styles.actions}>
            <button 
              className={styles.cancelButton} 
              onClick={() => {
                setFile(null);
                setPreviewUrl(null);
                setFilename('');
              }}
              disabled={uploading}
            >
              Cancel
            </button>
            <button 
              className={styles.uploadButton} 
              onClick={handleUpload}
              disabled={uploading || !filename}
            >
              {uploading ? 'Uploading to CDN...' : 'Upload Image'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
