import type { ChatMessage as ChatMessageType } from '../types';
import { getOrgsByIds } from '../data/organizations';
import OrgCard from './OrgCard';

interface ChatMessageProps {
  message: ChatMessageType;
}

function renderText(text: string) {
  // Render **bold** markdown-style syntax
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return <strong key={i}>{part.slice(2, -2)}</strong>;
    }
    return part;
  });
}

export default function ChatMessage({ message }: ChatMessageProps) {
  const orgCards = message.orgIds ? getOrgsByIds(message.orgIds) : [];

  return (
    <div className={`chat-message chat-message--${message.role}`}>
      <div className="chat-bubble">
        <p>{renderText(message.text)}</p>
      </div>
      {message.role === 'agent' && orgCards.length > 0 && (
        <div className="chat-org-cards">
          {orgCards.map(org => (
            <OrgCard key={org.id} org={org} />
          ))}
        </div>
      )}
    </div>
  );
}
