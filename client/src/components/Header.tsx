interface HeaderProps {
  activeTab: 'chat' | 'map' | 'search' | 'home';
  onTabChange: (tab: 'chat' | 'search' | 'home') => void;
}

export default function Header({ activeTab, onTabChange }: HeaderProps) {
  return (
    <header className="app-header">
      <div className="header-brand">
        <div className="header-accent-bar" />
        <div className="header-text">
          <span className="header-city">City of Boston</span>
          <h1 className="header-title">Circular Economy Guide</h1>
        </div>
      </div>
      <nav className="header-nav">
        <button
          className={`header-nav-btn${activeTab === 'home' ? ' header-nav-btn--active' : ''}`}
          onClick={() => onTabChange('home')}
        >
          🏠 Home
        </button>
        <button
          className={`header-nav-btn${activeTab === 'chat' ? ' header-nav-btn--active' : ''}`}
          onClick={() => onTabChange('chat')}
        >
          💬 Chat
        </button>
        <button
          className={`header-nav-btn${activeTab === 'search' ? ' header-nav-btn--active' : ''}`}
          onClick={() => onTabChange('search')}
        >
          🔍 Search
        </button>
      </nav>
    </header>
  );
}
