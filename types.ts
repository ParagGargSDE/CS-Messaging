export interface Message {
  id: string;
  userId: string;
  timestamp: string; // ISO string
  body: string;
  direction: 'inbound' | 'outbound';
  urgencyScore: number; // 0-100, calculated heuristic
  isRead: boolean;
  status: 'open' | 'resolved';
  agentId?: string; // ID of the agent who sent the message
}

export interface UserProfile {
  userId: string;
  name: string; // Mocked
  phoneNumber: string; // Mocked
  loanBalance: number;
  creditScore: number;
  riskTier: 'Low' | 'Medium' | 'High';
  lastInteraction: string;
}

export interface Agent {
  id: string;
  name: string;
  avatar: string;
  email: string;
  role: string;
  status: 'Online' | 'Away' | 'Busy';
}

export interface CannedResponse {
  id: string;
  label: string;
  text: string;
}