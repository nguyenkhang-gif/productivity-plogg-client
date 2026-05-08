import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { Conversation, Message } from "@/components/chat/types";

interface ChatState {
  conversations: Conversation[];
  activeConversationId: string | null;
  messages: Record<string, Message[]>;
  typing: Record<string, boolean>;
  isOpen: boolean;
}

const initialState: ChatState = {
  conversations: [],
  activeConversationId: null,
  messages: {},
  typing: {},
  isOpen: false,
};

const chatSlice = createSlice({
  name: "chat",
  initialState,
  reducers: {
    setConversations(state, action: PayloadAction<Conversation[]>) {
      state.conversations = action.payload;
    },

    upsertConversation(state, action: PayloadAction<Conversation>) {
      const idx = state.conversations.findIndex((c) => c.id === action.payload.id);
      if (idx !== -1) {
        state.conversations[idx] = action.payload;
      } else {
        state.conversations.unshift(action.payload);
      }
    },

    setActiveConversation(state, action: PayloadAction<string | null>) {
      state.activeConversationId = action.payload;
    },

    setHistory(state, action: PayloadAction<{ conversationId: string; messages: Message[] }>) {
      state.messages[action.payload.conversationId] = action.payload.messages;
    },

    appendMessage(state, action: PayloadAction<Message>) {
      const { conversationId } = action.payload;
      if (!state.messages[conversationId]) {
        state.messages[conversationId] = [];
      }
      // Deduplicate by id
      const exists = state.messages[conversationId].some((m) => m.id === action.payload.id);
      if (!exists) {
        state.messages[conversationId].push(action.payload);
      }

      // Bubble conversation to top with updated lastMessage
      const idx = state.conversations.findIndex((c) => c.id === conversationId);
      if (idx !== -1) {
        const updated = {
          ...state.conversations[idx],
          lastMessage: action.payload.content,
          lastMessageAt: action.payload.createdAt,
        };
        state.conversations.splice(idx, 1);
        state.conversations.unshift(updated);
      }
    },

    setTyping(state, action: PayloadAction<{ conversationId: string; isTyping: boolean }>) {
      state.typing[action.payload.conversationId] = action.payload.isTyping;
    },

    toggleOpen(state) {
      state.isOpen = !state.isOpen;
      if (!state.isOpen) {
        state.activeConversationId = null;
      }
    },

    setOpen(state, action: PayloadAction<boolean>) {
      state.isOpen = action.payload;
      if (!action.payload) {
        state.activeConversationId = null;
      }
    },
  },
});

export const {
  setConversations,
  upsertConversation,
  setActiveConversation,
  setHistory,
  appendMessage,
  setTyping,
  toggleOpen,
  setOpen,
} = chatSlice.actions;

export default chatSlice.reducer;
