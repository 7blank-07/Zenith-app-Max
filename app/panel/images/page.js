'use client';

import { useState, useRef, useCallback } from 'react';

export default function ImageUploadPage() {
  const [file, setFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [customName, setCustomName] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0); // Optional: simulated progress
  const [successUrl, setSuccessUrl] = useState(null);
  const [error, setError] = useState(null);
  
  const fileInputRef = useRef(null);

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const processFile = (selectedFile) => {
    if (!selectedFile) return;
    if (!selectedFile.type.startsWith('image/')) {
      setError('Please upload a valid image file (PNG, JPG, WEBP, etc.)');
      return;
    }
    
    setFile(selectedFile);
    setCustomName(selectedFile.name);
    setError(null);
    setSuccessUrl(null);
    
    // Generate preview
    const reader = new FileReader();
    reader.onload = (e) => setPreviewUrl(e.target.result);
    reader.readAsDataURL(selectedFile);
  };

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    setIsDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processFile(e.dataTransfer.files[0]);
    }
  }, []);

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      processFile(e.target.files[0]);
    }
  };

  const clearSelection = () => {
    setFile(null);
    setPreviewUrl(null);
    setCustomName('');
    setError(null);
    setSuccessUrl(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleUpload = async () => {
    if (!file) return;

    setUploading(true);
    setError(null);
    setSuccessUrl(null);
    
    // Simulate progress for better UX
    const progressInterval = setInterval(() => {
      setProgress((prev) => (prev >= 90 ? 90 : prev + 10));
    }, 200);

    try {
      const formData = new FormData();
      formData.append('image', file);
      formData.append('filename', customName);

      const res = await fetch('/api/panel/upload-image', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      clearInterval(progressInterval);

      if (!res.ok) {
        throw new Error(data.error || data.details || 'Upload failed');
      }

      setProgress(100);
      setSuccessUrl(data.url);
      
    } catch (err) {
      clearInterval(progressInterval);
      setError(err.message);
      setProgress(0);
    } finally {
      setUploading(false);
    }
  };

  const copyToClipboard = () => {
    if (successUrl) {
      navigator.clipboard.writeText(successUrl);
      alert('URL copied to clipboard!');
    }
  };

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', fontFamily: 'var(--font-primary, sans-serif)' }}>
      <h1 style={{ fontSize: '32px', fontWeight: 'bold', marginBottom: '8px', color: '#FFF' }}>
        Image Uploader
      </h1>
      <p style={{ color: '#888', marginBottom: '32px' }}>
        Upload images directly to the production VPS <code style={{ backgroundColor: '#222', padding: '2px 6px', borderRadius: '4px' }}>images.zenithfcm.com</code>
      </p>

      {/* Main Container */}
      <div style={{ 
        backgroundColor: '#161616', 
        borderRadius: '16px', 
        border: '1px solid #333',
        padding: '32px',
        boxShadow: '0 10px 30px rgba(0,0,0,0.5)'
      }}>

        {/* Dropzone */}
        {!file && (
          <div 
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            style={{
              border: `2px dashed ${isDragging ? '#FFD700' : '#444'}`,
              borderRadius: '12px',
              padding: '64px 32px',
              textAlign: 'center',
              backgroundColor: isDragging ? 'rgba(255, 215, 0, 0.05)' : '#0F0F0F',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={handleFileChange} 
              accept="image/*" 
              style={{ display: 'none' }} 
            />
            {/* SVG Icon */}
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke={isDragging ? '#FFD700' : '#666'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginBottom: '16px', transition: 'all 0.2s ease' }}>
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
              <polyline points="17 8 12 3 7 8"></polyline>
              <line x1="12" y1="3" x2="12" y2="15"></line>
            </svg>
            <h3 style={{ fontSize: '18px', fontWeight: '600', color: isDragging ? '#FFD700' : '#EEE', margin: '0 0 8px 0' }}>
              Drag & Drop an image here
            </h3>
            <p style={{ color: '#666', margin: 0, fontSize: '14px' }}>
              or click to browse from your computer
            </p>
          </div>
        )}

        {/* Preview & Edit State */}
        {file && !successUrl && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap' }}>
              {/* Image Preview */}
              <div style={{ 
                width: '200px', 
                height: '200px', 
                borderRadius: '12px', 
                overflow: 'hidden',
                border: '1px solid #333',
                backgroundColor: '#000',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                position: 'relative'
              }}>
                {previewUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={previewUrl} alt="Preview" style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} />
                ) : (
                  <span style={{ color: '#666' }}>Loading...</span>
                )}
              </div>

              {/* Form Controls */}
              <div style={{ flex: 1, minWidth: '250px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#BBB', marginBottom: '8px' }}>
                  Target Filename (Optional)
                </label>
                <input 
                  type="text" 
                  value={customName} 
                  onChange={(e) => setCustomName(e.target.value)}
                  disabled={uploading}
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    backgroundColor: '#0F0F0F',
                    border: '1px solid #333',
                    borderRadius: '8px',
                    color: '#FFF',
                    fontSize: '16px',
                    outline: 'none',
                    transition: 'border-color 0.2s'
                  }}
                  onFocus={(e) => e.target.style.borderColor = '#FFD700'}
                  onBlur={(e) => e.target.style.borderColor = '#333'}
                />
                <p style={{ fontSize: '12px', color: '#666', marginTop: '8px' }}>
                  The file will be available at: <br/>
                  <span style={{ color: '#888' }}>https://images.zenithfcm.com/{customName || 'filename.png'}</span>
                </p>
              </div>
            </div>

            {error && (
              <div style={{ padding: '16px', backgroundColor: 'rgba(255, 50, 50, 0.1)', borderLeft: '4px solid #FF3333', borderRadius: '4px', color: '#FFAAAA' }}>
                <strong>Error:</strong> {error}
              </div>
            )}

            {/* Actions */}
            <div style={{ display: 'flex', gap: '16px', justifyContent: 'flex-end', marginTop: '16px' }}>
              <button 
                onClick={clearSelection}
                disabled={uploading}
                style={{
                  padding: '12px 24px',
                  backgroundColor: 'transparent',
                  border: '1px solid #444',
                  borderRadius: '8px',
                  color: '#CCC',
                  fontSize: '16px',
                  cursor: uploading ? 'not-allowed' : 'pointer',
                  fontWeight: '600',
                  opacity: uploading ? 0.5 : 1
                }}
              >
                Cancel
              </button>
              <button 
                onClick={handleUpload}
                disabled={uploading || !customName}
                style={{
                  padding: '12px 32px',
                  backgroundColor: '#FFD700',
                  border: 'none',
                  borderRadius: '8px',
                  color: '#000',
                  fontSize: '16px',
                  fontWeight: 'bold',
                  cursor: (uploading || !customName) ? 'not-allowed' : 'pointer',
                  opacity: (uploading || !customName) ? 0.7 : 1,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  transition: 'background-color 0.2s'
                }}
                onMouseOver={(e) => !uploading && (e.currentTarget.style.backgroundColor = '#FFC000')}
                onMouseOut={(e) => !uploading && (e.currentTarget.style.backgroundColor = '#FFD700')}
              >
                {uploading ? (
                  <>
                    <svg className="spinner" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ animation: 'spin 1s linear infinite' }}>
                      <line x1="12" y1="2" x2="12" y2="6"></line>
                      <line x1="12" y1="18" x2="12" y2="22"></line>
                      <line x1="4.93" y1="4.93" x2="7.76" y2="7.76"></line>
                      <line x1="16.24" y1="16.24" x2="19.07" y2="19.07"></line>
                      <line x1="2" y1="12" x2="6" y2="12"></line>
                      <line x1="18" y1="12" x2="22" y2="12"></line>
                      <line x1="4.93" y1="19.07" x2="7.76" y2="16.24"></line>
                      <line x1="16.24" y1="7.76" x2="19.07" y2="4.93"></line>
                    </svg>
                    Uploading... {progress}%
                  </>
                ) : (
                  <>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="12" y1="19" x2="12" y2="5"></line>
                      <polyline points="5 12 12 5 19 12"></polyline>
                    </svg>
                    Upload Image
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* Success State */}
        {successUrl && (
          <div style={{ textAlign: 'center', padding: '32px 0' }}>
            <div style={{ width: '64px', height: '64px', backgroundColor: 'rgba(46, 204, 113, 0.1)', color: '#2ECC71', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px auto' }}>
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12"></polyline>
              </svg>
            </div>
            
            <h3 style={{ fontSize: '24px', fontWeight: 'bold', color: '#FFF', marginBottom: '8px' }}>
              Upload Successful!
            </h3>
            <p style={{ color: '#AAA', marginBottom: '32px' }}>
              Your image is now live on the server.
            </p>

            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              backgroundColor: '#0A0A0A', 
              border: '1px solid #333', 
              borderRadius: '8px', 
              padding: '8px 16px',
              maxWidth: '500px',
              margin: '0 auto'
            }}>
              <input 
                type="text" 
                readOnly 
                value={successUrl} 
                style={{ 
                  flex: 1, 
                  backgroundColor: 'transparent', 
                  border: 'none', 
                  color: '#4D9AFF', 
                  outline: 'none',
                  fontSize: '14px'
                }} 
              />
              <button 
                onClick={copyToClipboard}
                style={{
                  backgroundColor: '#222',
                  border: '1px solid #444',
                  borderRadius: '6px',
                  color: '#EEE',
                  padding: '6px 12px',
                  cursor: 'pointer',
                  fontSize: '12px',
                  fontWeight: '600',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  transition: 'background-color 0.2s'
                }}
                onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#333'}
                onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#222'}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                  <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                </svg>
                Copy URL
              </button>
            </div>

            <button 
              onClick={clearSelection}
              style={{
                marginTop: '32px',
                padding: '10px 24px',
                backgroundColor: 'transparent',
                border: '1px solid #FFD700',
                borderRadius: '8px',
                color: '#FFD700',
                fontSize: '16px',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.backgroundColor = '#FFD700';
                e.currentTarget.style.color = '#000';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
                e.currentTarget.style.color = '#FFD700';
              }}
            >
              Upload Another Image
            </button>
          </div>
        )}
      </div>

      <style jsx global>{`
        @keyframes spin {
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
