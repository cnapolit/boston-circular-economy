import { useEffect } from 'react';
import { organizations } from '../data/organizations';
import type { OrgCategory, OrgFilter } from '../types';

const BADGE_COLORS: Record<OrgCategory, string> = {
  reuse: '#1871BD',
  repair: '#091F2F',
  food: '#2E7D32',
  clothing: '#7B3FA0',
  share: '#E65100',
  reduce: '#FB4D42',
};

const FILTERS = ['electronics', 'appliances', 'clothing'] as const;

interface SearchPanelProps {
  onOrgViewOnMap: (id: string) => void;
  initialQuery?: string;
  query: string;
  setQuery: (q: string) => void;
  activeFilter: OrgFilter | null;
  setActiveFilter: (f: OrgFilter | null) => void;
}

export default function SearchPanel({ onOrgViewOnMap, initialQuery, query, setQuery, activeFilter, setActiveFilter }: SearchPanelProps) {
  useEffect(() => {
    if (initialQuery) setQuery(initialQuery);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const lower = query.toLowerCase();
  const results = organizations.filter(org => {
    const matchesQuery = !query.trim() || (
      org.name.toLowerCase().includes(lower) ||
      org.description.toLowerCase().includes(lower) ||
      org.category.toLowerCase().includes(lower) ||
      org.tags.some(t => t.toLowerCase().includes(lower))
    );
    const matchesFilter = !activeFilter || org.tags.some(t => t.toLowerCase() === activeFilter);
    return matchesQuery && matchesFilter;
  });

  const handleFilterClick = (filter: OrgFilter) => {
    setActiveFilter(activeFilter === filter ? null : filter);
  };

  return (
    <section className="search-panel">
      <div className="search-results">
        {results.length === 0 ? (
          <p className="search-empty">No organizations match "{query}".</p>
        ) : (
          results.map(org => (
            <div key={org.id} className="search-row">
              <div className="search-row__info">
                <span
                  className="search-row__badge"
                  style={{ backgroundColor: BADGE_COLORS[org.category] }}
                >
                  {org.category}
                </span>
                <p className="search-row__name">{org.name}</p>
                <p className="search-row__address">{org.address}</p>
              </div>
              <button
                className="search-row__map-btn"
                onClick={() => onOrgViewOnMap(org.id)}
              >
                View on Map →
              </button>
            </div>
          ))
        )}
      </div>
      <div className="search-input-area">
        <input
          className="search-input"
          type="text"
          placeholder="Search by name, category, or item…"
          value={query}
          onChange={e => setQuery(e.target.value)}
          autoFocus
        />
        <div className="search-filters">
          {FILTERS.map(filter => (
            <button
              key={filter}
              className={`search-filter-btn${activeFilter === filter ? ' search-filter-btn--active' : ''}`}
              onClick={() => handleFilterClick(filter)}
            >
              {filter}
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
