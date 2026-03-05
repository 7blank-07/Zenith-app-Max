'use client';

import { useEffect } from 'react';
import { createPortal } from 'react-dom';

export default function MarketUnderConstructionModal({ isOpen, onClose }) {
  useEffect(() => {
    if (!isOpen) return;
    const onKeyDown = (event) => {
      if (event.key !== 'Escape') return;
      event.preventDefault();
      onClose();
    };
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const modal = (
    <div
      className="construction-modal active"
      role="dialog"
      aria-modal="true"
      aria-labelledby="market-construction-title"
      aria-describedby="market-construction-message"
    >
      <div className="construction-overlay" onClick={onClose} />
      <div className="construction-content" role="document">
        <button className="construction-close" type="button" onClick={onClose} aria-label="Close">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
        <div className="construction-icon">
          <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
          </svg>
        </div>
        <h2 id="market-construction-title" className="construction-title">
          Market
        </h2>
        <p id="market-construction-message" className="construction-message">
          This feature is currently under construction and will be available soon.
        </p>
      </div>
    </div>
  );

  return createPortal(modal, document.body);
}
