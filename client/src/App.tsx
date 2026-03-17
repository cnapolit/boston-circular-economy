import { useState, useEffect } from 'react';
import type { ChatMessage, OrgFilter } from './types';
import { SCRIPTED_MESSAGES } from './utils/agentLogic';
import Header from './components/Header';
import ChatPanel from './components/ChatPanel';
import MapPanel from './components/MapPanel';
import SearchPanel from './components/SearchPanel';
import HomePage from './components/HomePage';
import './App.css';

let msgCounter = 0;
const makeId = () => `msg-${Date.now()}-${msgCounter++}`;

function App() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [activeTab, setActiveTab] = useState<'chat' | 'map' | 'search' | 'home'>('home');
  const [isSlidingUp, setIsSlidingUp] = useState(false);
  const [pendingSearchQuery, setPendingSearchQuery] = useState('');
  const [pendingChatMessage, setPendingChatMessage] = useState('');
  const [mapQuery, setMapQuery] = useState('');
  const [mapFilter, setMapFilter] = useState<OrgFilter | null>(null);

  useEffect(() => {
    const [zephyr1, zephyr2, zephyr3, zephyr4] = SCRIPTED_MESSAGES;
    const scripted: ChatMessage[] = [
      { id: makeId(), role: 'agent', text: zephyr1.text, orgIds: zephyr1.highlightedOrgIds, timestamp: Date.now() },
      { id: makeId(), role: 'user', text: 'What items do I have that can be re-used?', timestamp: Date.now() },
      { id: makeId(), role: 'agent', text: zephyr2.text, orgIds: zephyr2.highlightedOrgIds, timestamp: Date.now() },
      { id: makeId(), role: 'user', text: 'I have a bike.', timestamp: Date.now() },
      { id: makeId(), role: 'agent', text: zephyr3.text, orgIds: zephyr3.highlightedOrgIds, showActions: true, timestamp: Date.now() },
      { id: makeId(), role: 'user', text: 'What items can I borrow?', timestamp: Date.now() },
      { id: makeId(), role: 'agent', text: zephyr4.text, orgIds: zephyr4.highlightedOrgIds, timestamp: Date.now() },
    ];
    setMessages(scripted);
  }, []);

  const handleViewMap = () => {
    setMapQuery('bikes not bombs');
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

  const handleSendMessage = (text: string) => {
    setMessages(prev => [...prev, {
      id: makeId(),
      role: 'user',
      text,
      timestamp: Date.now(),
    }]);
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
              messages={messages}
              showMapButton={true}
              onViewMap={handleViewMap}
              onViewResults={() => { setMapQuery('bikes not bombs'); setMapFilter(null); setActiveTab('search'); }}
              isSliding={isSlidingUp}
              initialMessage={pendingChatMessage}
              onSendMessage={handleSendMessage}
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
