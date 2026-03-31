import { useEffect, useRef, useState } from 'react';
import type { ChatMessage as ChatMessageType } from '../types';
import { organizations } from '../data/organizations';
import ChatMessage from './ChatMessage';

const OLLAMA_URL = 'http://localhost:11434/api/chat';
const MODEL = 'phi4';

const orgDirectory = organizations
  .map(o => {
    const lines = [
      `- **${o.name}** (${o.category})`,
      `  Address: ${o.address}`,
      `  Description: ${o.description}`,
      o.website ? `  Website: ${o.website}` : null,
      `  Tags: ${o.tags.join(', ')}`,
    ];
    return lines.filter(Boolean).join('\n');
  })
  .join('\n');

const SYSTEM_PROMPT = `You are Zephyr, Boston's circular economy assistant. Help users find local organizations for reuse, repair, food rescue, clothing, tools, and building materials. Be concise and friendly. Do not answer unrelated questions.

Here is the directory of circular economy organizations you know about:

${orgDirectory}

When a user asks about a topic, recommend the most relevant organizations from this directory. Include their name, address, and a brief reason why they match. If nothing matches well, say so honestly.`;

let msgCounter = 0;
const makeId = (role: string) => `msg-${Date.now()}-${msgCounter++}-${role}`;

interface ChatPanelProps {
  onViewMap?: (orgIds: string[]) => void;
  onViewResults?: (orgIds: string[]) => void;
  isSliding?: boolean;
  initialMessage?: string;
}

export default function ChatPanel({ onViewMap, onViewResults, isSliding, initialMessage }: ChatPanelProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [messages, setMessages] = useState<ChatMessageType[]>([]);
  const [input, setInput] = useState(initialMessage ?? '');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    const text = input.trim();
    if (!text || isLoading) return;

    const userMsg: ChatMessageType = { id: makeId('user'), role: 'user', text, timestamp: Date.now() };
    const agentId = makeId('agent');
    const agentMsg: ChatMessageType = { id: agentId, role: 'agent', text: '', timestamp: Date.now() };

    setMessages(prev => [...prev, userMsg, agentMsg]);
    setInput('');
    setIsLoading(true);

    try {
      const history = messages.map(m => ({
        role: m.role === 'agent' ? 'assistant' : 'user',
        content: m.text,
      }));

      const res = await fetch(OLLAMA_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: MODEL,
          messages: [
            { role: 'system', content: SYSTEM_PROMPT },
            ...history,
            { role: 'user', content: text },
          ],
          stream: true,
        }),
      });

      if (!res.ok) throw new Error(`Ollama responded with status ${res.status}`);

      const reader = res.body!.getReader();
      const decoder = new TextDecoder();
      let fullText = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        for (const line of decoder.decode(value, { stream: true }).split('\n')) {
          if (!line.trim()) continue;
          try {
            const chunk = JSON.parse(line);
            if (chunk.message?.content) {
              fullText += chunk.message.content;
              setMessages(prev => prev.map(m => m.id === agentId ? { ...m, text: fullText } : m));
            }
          } catch { /* ignore partial JSON lines */ }
        }
      }

      // Show action buttons if the response mentions any organization
      const responseLower = fullText.toLowerCase();
      const matchedOrgIds = organizations
        .filter(o => responseLower.includes(o.name.toLowerCase()))
        .map(o => o.id);
      if (matchedOrgIds.length > 0) {
        setMessages(prev => prev.map(m => m.id === agentId ? { ...m, showActions: true, orgIds: matchedOrgIds } : m));
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Unknown error';
      setMessages(prev => prev.map(m => m.id === agentId ? { ...m, text: `⚠️ ${msg}` } : m));
    } finally {
      setIsLoading(false);
    }
  };

  const lastMsg = messages[messages.length - 1];
  const isTyping = isLoading && lastMsg?.role === 'agent' && lastMsg.text === '';

  return (
    <section className={`chat-panel${isSliding ? ' chat-panel--sliding-up' : ''}`}>
      <div className="chat-messages">
        {messages.map(msg => (
          <div key={msg.id}>
            <ChatMessage message={msg} />
            {msg.showActions && msg.orgIds && (
              <div className="chat-action-btns">
                <button className="chat-view-map-btn" onClick={() => onViewMap?.(msg.orgIds!)}>View on Map →</button>
                <button className="chat-view-results-btn" onClick={() => onViewResults?.(msg.orgIds!)}>View results →</button>
              </div>
            )}
          </div>
        ))}
        {isTyping && <div className="chat-typing">Zephyr is thinking…</div>}
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
          disabled={isLoading}
        />
        <button className="chat-send-btn" onClick={handleSend} disabled={!input.trim() || isLoading}>
          {isLoading ? '…' : 'Send'}
        </button>
      </div>
    </section>
  );
}
