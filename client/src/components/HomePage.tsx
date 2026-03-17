const MOCK_USER = { name: 'Some Dude', initials: 'SD', points: 1240 }

const RECENT_LOCATIONS = [
  { id: 'bnb',  name: 'Bikes Not Bombs',   category: 'repair',   address: '18 Bartlett Sq, Jamaica Plain', visitedAgo: '2 days ago' },
  { id: 'c2c',  name: 'Cradles to Crayons', category: 'reuse',   address: '155 N Beacon St, Brighton',      visitedAgo: '5 days ago' },
  { id: 'bmrc', name: 'Building Materials Resource Center', category: 'reuse', address: '100 Terrace St, Roxbury', visitedAgo: '1 week ago' },
]

const FRIEND_ACTIVITY = [
  { id: 1, friend: 'Sarah M.',  initials: 'SM', action: 'stitched some holes at',     location: 'Tailors-R-Us',            points: 50, timeAgo: '1 hour ago' },
  { id: 2, friend: 'James T.',  initials: 'JT', action: 'got their bike repaired at', location: 'Bikes Not Bombs',            points: 75, timeAgo: '3 hours ago' },
  { id: 3, friend: 'Priya K.',  initials: 'PK', action: 'donated food to',            location: 'Greater Boston Food Bank',   points: 30, timeAgo: 'Yesterday' },
  { id: 4, friend: 'Marcus L.', initials: 'ML', action: 'borrowed tools from',        location: 'Boston Tool Library',        points: 20, timeAgo: 'Yesterday' },
]

import { useState } from 'react';

const CATEGORY_COLORS: Record<string, string> = {
  reuse: '#2E7D32',
  repair: '#1565C0',
  food: '#E65100',
  clothing: '#6A1B9A',
  share: '#00838F',
  reduce: '#558B2F',
}

interface HomePageProps {
  onSearch: (query: string) => void;
  onChatSearch: (query: string) => void;
}

export default function HomePage({ onSearch, onChatSearch }: HomePageProps) {
  const [searchMode, setSearchMode] = useState<'chat' | 'browse'>('chat');
  const [query, setQuery] = useState('');

  const handleSearchActivate = () => {
    if (!query.trim()) return;
    if (searchMode === 'chat') onChatSearch(query);
    else onSearch(query);
    setQuery('');
  };

  return (
    <div className="home-page">
      {/* Profile strip */}
      <div className="home-profile">
        <div className="home-avatar">{MOCK_USER.initials}</div>
        <div className="home-profile__info">
          <span className="home-profile__greeting">Welcome back,</span>
          <span className="home-profile__name">{MOCK_USER.name}</span>
        </div>
        <div className="home-points">
          <span className="home-points__value">{MOCK_USER.points.toLocaleString()}</span>
          <span className="home-points__label">Points</span>
        </div>
      </div>

      {/* Search bar */}
      <div className="home-search-wrap">
        <div className="home-search-inner">
          <svg className="home-search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            className="home-search-input"
            type="text"
            placeholder={searchMode === 'chat' ? 'Ask about food, clothing, repair…' : 'Search organizations, items…'}
            value={query}
            onChange={e => setQuery(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') handleSearchActivate(); }}
          />
          <div className="home-search-mode-toggle">
            <button
              className={`home-search-mode-btn${searchMode === 'chat' ? ' home-search-mode-btn--active' : ''}`}
              onClick={() => setSearchMode('chat')}
            >
              Chat
            </button>
            <button
              className={`home-search-mode-btn${searchMode === 'browse' ? ' home-search-mode-btn--active' : ''}`}
              onClick={() => setSearchMode('browse')}
            >
              Browse
            </button>
          </div>
        </div>
      </div>

      {/* Recently Visited */}
      <div className="home-section">
        <h2 className="home-section__title">Recently Visited</h2>
        <div className="home-location-list">
          {RECENT_LOCATIONS.map(loc => (
            <div key={loc.id} className="home-location-card">
              <span
                className="home-location-dot"
                style={{ backgroundColor: CATEGORY_COLORS[loc.category] ?? '#999' }}
              />
              <div className="home-location-card__info">
                <span className="home-location-card__name">{loc.name}</span>
                <span className="home-location-card__address">{loc.address}</span>
              </div>
              <span className="home-location-card__time">{loc.visitedAgo}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Friend Activity */}
      <div className="home-section">
        <h2 className="home-section__title">Friend Activity</h2>
        <div className="home-activity-feed">
          {FRIEND_ACTIVITY.map(item => (
            <div key={item.id} className="home-activity-item">
              <div className="home-activity-avatar">{item.initials}</div>
              <div className="home-activity-item__info">
                <p className="home-activity-item__text">
                  <strong>{item.friend}</strong> {item.action} <strong>{item.location}</strong>
                </p>
                <span className="home-activity-item__time">{item.timeAgo}</span>
              </div>
              <span className="home-activity-pts">+{item.points} pts</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
