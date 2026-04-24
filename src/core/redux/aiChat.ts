import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface Message {
  id: string;
  sender: "user" | "bot";
  text: string;
}

interface ChatState {
  messages: Message[];
  loading: boolean;
  error: string | null;
  conversationId?: string;
  aiInfo: {
    name: string;
  };
}

const initialState: ChatState = {
  messages: [],
  loading: false,
  error: null,
  aiInfo: {
    name: "Gemini Pro",
  },
};

export const aiChatSlice = createSlice({
  name: "aiChat",
  initialState,
  reducers: {
    addMessage: (state, action: PayloadAction<Message>) => {
      state.messages.push(action.payload);
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
    setMessages: (state, action: PayloadAction<Message[]>) => {
      state.messages = action.payload;
    },
    clearChat: (state) => {
      state.messages = [];
    },
  },
});

export const { addMessage, setLoading, setError, clearChat, setMessages } =
  aiChatSlice.actions;

export default aiChatSlice.reducer;
