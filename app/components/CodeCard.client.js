'use client';

import { useCopyToClipboard } from '../../src/lib/hooks/useCopyToClipboard';

export default function CodeCard({ code, isExpired }) {
  const { isCopied, copy } = useCopyToClipboard();

  const handleCopy = () => {
    copy(code.code);
  };

  const formatDate = (dateString) => {
    if (!dateString) return null;
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const expiryDate = formatDate(code.expiresAt);

  return (
    <div className={`code-card ${isExpired ? 'code-card--expired' : ''}`}>
      {/* Status Badge */}
      <div className="code-card-header">
        <div className={`status status--${isExpired ? 'error' : 'success'}`}>
          {isExpired ? 'Expired' : 'Active'}
        </div>
      </div>

      {/* Card Content */}
      <div className="code-card-body">
        {/* Code Section */}
        <div className="code-section">
          <label className="code-label">Redeem Code</label>
          <div className="code-container">
            <code className="code-text">{code.code}</code>
            <button
              onClick={handleCopy}
              className={`code-copy-btn ${isCopied ? 'code-copy-btn--copied' : ''}`}
              title={isCopied ? 'Copied!' : 'Copy to clipboard'}
            >
              {isCopied ? (
                <>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                  <span>Copied!</span>
                </>
              ) : (
                <>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                  </svg>
                  <span>Copy</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Reward Section */}
        <div className="reward-section">
          <label className="reward-label">Reward</label>
          <p className="reward-text">{code.reward}</p>
        </div>

        {/* Footer with Expiry & Source */}
        <div className="code-card-footer">
          {expiryDate && (
            <div className="footer-item">
              <span className="footer-label">Expires</span>
              <span className={`footer-value ${isExpired ? 'footer-value--expired' : ''}`}>{expiryDate}</span>
            </div>
          )}

          {code.source && (
            <div className="footer-item">
              <span className="footer-label">Source</span>
              <span className="footer-source">{code.source}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
