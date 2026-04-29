'use client';

export default function CodeStatusFilter({ activeFilter, onFilterChange, counts }) {
  return (
    <div className="code-status-filter">
      <button
        className={`filter-pill ${activeFilter === 'all' ? 'filter-pill--active' : ''}`}
        onClick={() => onFilterChange('all')}
      >
        All Codes
        <span className="filter-count">{counts.all}</span>
      </button>

      <button
        className={`filter-pill ${activeFilter === 'active' ? 'filter-pill--active' : ''}`}
        onClick={() => onFilterChange('active')}
      >
        Active
        <span className="filter-count">{counts.active}</span>
      </button>

      <button
        className={`filter-pill ${activeFilter === 'expired' ? 'filter-pill--active' : ''}`}
        onClick={() => onFilterChange('expired')}
      >
        Expired
        <span className="filter-count">{counts.expired}</span>
      </button>
    </div>
  );
}
