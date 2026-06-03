import { configureStore } from "@reduxjs/toolkit";
import userReducer from "./user";
import chapterReducer from "./epub";
import aiChatReducer from "./aiChat";
import chatReducer from "./chat";
import uploadReducer from "./upload";

const store = configureStore({
  reducer: {
    user: userReducer,
    chapters: chapterReducer,
    aiChat: aiChatReducer,
    chat: chatReducer,
    upload: uploadReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export default store;
