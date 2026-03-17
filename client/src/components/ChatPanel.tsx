import { useEffect, useRef, useState } from 'react';
import type { ChatMessage as ChatMessageType } from '../types';
import ChatMessage from './ChatMessage';

interface ChatPanelProps {
  messages: ChatMessageType[];
  showMapButton?: boolean;
  onViewMap?: () => void;
  onViewResults?: () => void;
  isSliding?: boolean;
  initialMessage?: string;
  onSendMessage?: (text: string) => void;
}

export default function ChatPanel({ messages, onViewMap, onViewResults, isSliding, initialMessage, onSendMessage }: ChatPanelProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [input, setInput] = useState(initialMessage ?? '');

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = () => {
    const text = input.trim();
    if (!text || !onSendMessage) return;
    onSendMessage(text);
    setInput('');
  };

  return (
    <section className={`chat-panel${isSliding ? ' chat-panel--sliding-up' : ''}`}>
      <div className="chat-messages">
        {messages.map(msg => (
          <div key={msg.id}>
            <ChatMessage message={msg} />
            {msg.showActions && (
              <div className="chat-action-btns">
                <button className="chat-view-map-btn" onClick={onViewMap}>
                  View on Map →
                </button>
                <button className="chat-view-results-btn" onClick={onViewResults}>
                  View results →
                </button>
              </div>
            )}
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
      <div className="chat-input-area">
        <input
          className="chat-input"
          type="text"
          placeholder="Ask about food, clothing, repair, building materials..."
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter') handleSend(); }}
        />
        <button className="chat-send-btn" onClick={handleSend} disabled={!input.trim()}>Send</button>
      </div>
    </section>
  );
}
