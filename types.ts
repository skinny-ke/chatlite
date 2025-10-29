export interface User {
  id: string;
  name: string;
  avatarUrl: string;
  statusMessage?: string;
  isAi?: boolean;
}

export interface Reaction {
  emoji: string;
  userId: string;
}

export interface GroundingChunk {
  web?: {
    uri: string;
    title: string;
  };
}

export interface GroundingMetadata {
  groundingChunks: GroundingChunk[];
}

export interface Message {
  id: string;
  senderId: string;
  content: string;
  timestamp: number;
  reactions: Reaction[];
  type: 'text' | 'image' | 'file' | 'call-log';
  groundingMetadata?: GroundingMetadata;
  callInfo?: {
      duration: string;
      type: 'missed' | 'outgoing' | 'incoming';
  }
}

export interface Chat {
  id: string;
  name: string;
  type: 'private' | 'group' | 'ai';
  participants: User[];
  messages: Message[];
  lastMessage?: Message;
  unreadCount: number;
  typingParticipants?: User[];
  avatarUrl: string;
}
