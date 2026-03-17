export type OrgCategory = 'reuse' | 'repair' | 'food' | 'clothing' | 'share' | 'reduce';

export type OrgFilter = 'electronics' | 'appliances' | 'clothing';

export interface Organization {
  id: string;
  name: string;
  category: OrgCategory;
  description: string;
  address: string;
  lat: number;
  lng: number;
  website?: string;
  tags: string[];
}

export type MessageRole = 'user' | 'agent';

export interface ChatMessage {
  id: string;
  role: MessageRole;
  text: string;
  orgIds?: string[];
  showActions?: boolean;
  timestamp: number;
}

export interface AgentResponse {
  text: string;
  highlightedOrgIds: string[];
}
