'use client';

import { useState, useMemo } from 'react';
import CodeCard from './CodeCard.client';
import CodeStatusFilter from './CodeStatusFilter.client';

export default function RedeemCodesInteractions({ codes }) {
  const [filter, setFilter] = useState('all');

  // Determine if a code is expired
  const isCodeExpired = (code) => {
    if (code.status === 'expired') return true;
    if (!code.expiresAt) return false;
    const expiryDate = new Date(code.expiresAt);
    return expiryDate < new Date();
  };

  // Filter codes based on active filter
  const filteredCodes = useMemo(() => {
    if (filter === 'all') return codes;
    if (filter === 'active') return codes.filter((code) => !isCodeExpired(code));
    if (filter === 'expired') return codes.filter((code) => isCodeExpired(code));
    return codes;
  }, [codes, filter]);

  // Calculate counts for filter pills
  const counts = useMemo(() => {
    const active = codes.filter((code) => !isCodeExpired(code)).length;
    const expired = codes.filter((code) => isCodeExpired(code)).length;
    return {
      all: codes.length,
      active,
      expired
    };
  }, [codes]);

  const hasFiltered = filter !== 'all';
  const noResults = filteredCodes.length === 0;

  return (
    <>
      {/* Filter Section */}
      <div className="codes-filter-section">
        <CodeStatusFilter activeFilter={filter} onFilterChange={setFilter} counts={counts} />
      </div>

      {/* Empty State */}
      {noResults && (
        <div className="codes-empty-state">
          <div className="empty-state-icon">📭</div>
          <h3 className="empty-state-title">No Codes Found</h3>
          <p className="empty-state-description">
            {hasFiltered ? 'No codes match your current filter.' : 'No redeem codes available at this time.'}
          </p>
          {hasFiltered && (
            <button className="btn btn--secondary btn--sm" onClick={() => setFilter('all')}>
              View All Codes
            </button>
          )}
        </div>
      )}

      {/* Codes Grid */}
      {!noResults && (
        <div className="codes-grid">
          {filteredCodes.map((code) => (
            <CodeCard key={code.id} code={code} isExpired={isCodeExpired(code)} />
          ))}
        </div>
      )}
    </>
  );
}
