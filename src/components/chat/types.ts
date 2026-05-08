export interface ChatMessage {
  id: string;
  content: string;
  sender: "me" | "other";
  timestamp: Date;
}

export interface ChatBubbleProps {
  title?: string;
  placeholder?: string;
  onSend?: (message: string) => void | Promise<void>;
  messages?: ChatMessage[];
}

// Socket.IO 1-1 chat types
export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  content: string;
  type: "text" | "image";
  readBy: string[];
  createdAt: string;
}

export interface Conversation {
  id: string;
  participants: string[];
  lastMessage: string | null;
  lastMessageAt: string | null;
  createdAt: string;
  updatedAt: string;
}
