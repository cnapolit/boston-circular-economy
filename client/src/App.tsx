import { useState } from 'react';
import type { OrgFilter } from './types';
import { organizations } from './data/organizations';
import Header from './components/Header';
import ChatPanel from './components/ChatPanel';
import MapPanel from './components/MapPanel';
import SearchPanel from './components/SearchPanel';
import HomePage from './components/HomePage';
import './App.css';

function App() {
  const [activeTab, setActiveTab] = useState<'chat' | 'map' | 'search' | 'home'>('home');
  const [isSlidingUp, setIsSlidingUp] = useState(false);
  const [pendingSearchQuery, setPendingSearchQuery] = useState('');
  const [pendingChatMessage, setPendingChatMessage] = useState('');
  const [mapQuery, setMapQuery] = useState('');
  const [mapFilter, setMapFilter] = useState<OrgFilter | null>(null);

  const orgQueryFromIds = (orgIds: string[]) => {
    const org = organizations.find(o => o.id === orgIds[0]);
    return org ? org.name.toLowerCase() : '';
  };

  const handleViewMap = (orgIds: string[]) => {
    setMapQuery(orgQueryFromIds(orgIds));
    setMapFilter(null);
    setIsSlidingUp(true);
    setTimeout(() => {
      setActiveTab('map');
      setIsSlidingUp(false);
    }, 450);
  };

  const handleOrgViewOnMap = (_orgId: string) => {
    setMapQuery('');
    setMapFilter(null);
    setActiveTab('map');
  };

  return (
    <div className="app-layout">
      <Header activeTab={activeTab} onTabChange={setActiveTab} />
      <main className={`app-main${!isSlidingUp ? ` app-main--tab-${activeTab}` : ''}`}>
        {activeTab === 'home' && (
          <HomePage
            onSearch={query => { setPendingSearchQuery(query); setActiveTab('search'); }}
            onChatSearch={query => { setPendingChatMessage(query); setActiveTab('chat'); }}
          />
        )}
        {activeTab !== 'search'
          ? <ChatPanel
              onViewMap={handleViewMap}
              onViewResults={(orgIds: string[]) => { setMapQuery(orgQueryFromIds(orgIds)); setMapFilter(null); setActiveTab('search'); }}
              isSliding={isSlidingUp}
              initialMessage={pendingChatMessage}
            />
          : <SearchPanel
              onOrgViewOnMap={handleOrgViewOnMap}
              initialQuery={pendingSearchQuery}
              query={mapQuery}
              setQuery={setMapQuery}
              activeFilter={mapFilter}
              setActiveFilter={setMapFilter}
            />
        }
        <MapPanel
          mapQuery={mapQuery}
          setMapQuery={setMapQuery}
          mapFilter={mapFilter}
          setMapFilter={setMapFilter}
        />
        <nav className="app-tab-bar">
          <button
            className={`app-tab-btn${activeTab === 'home' ? ' app-tab-btn--active' : ''}`}
            onClick={() => setActiveTab('home')}
          >
            🏠 Home
          </button>
          <button
            className={`app-tab-btn${activeTab === 'chat' ? ' app-tab-btn--active' : ''}`}
            onClick={() => setActiveTab('chat')}
          >
            💬 Chat
          </button>
          <button
            className={`app-tab-btn${activeTab === 'search' ? ' app-tab-btn--active' : ''}`}
            onClick={() => setActiveTab('search')}
          >
            🔍 Search
          </button>
          <button
            className={`app-tab-btn${activeTab === 'map' ? ' app-tab-btn--active' : ''}`}
            onClick={() => setActiveTab('map')}
          >
            🗺 Map
          </button>
        </nav>
      </main>
    </div>
  );
}

export default App;
