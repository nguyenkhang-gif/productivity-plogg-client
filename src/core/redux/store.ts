import { configureStore, createSlice } from "@reduxjs/toolkit";
import userReducer from "./user";
import chapterReducer from "./epub";
import aiChatReducer from "./aiChat";
import postReducer from "./post";
import commentReducer from "./comment";
import chatReducer from "./chat";
import friendshipReducer from "./friendship";
import uploadReducer from "./upload";

interface CounterState {
  count: number;
}

const initialState: CounterState = {
  count: 0,
};

const counterSlice = createSlice({
  name: "counter",
  initialState,
  reducers: {
    increment: (state) => {
      state.count += 1;
    },
    decrement: (state) => {
      state.count -= 1;
    },
  },
});

export const { increment, decrement } = counterSlice.actions;

const store = configureStore({
  reducer: {
    counter: counterSlice.reducer,
    user: userReducer,
    chapters: chapterReducer,
    aiChat: aiChatReducer,
    post: postReducer,
    comment: commentReducer,
    chat: chatReducer,
    friendship: friendshipReducer,
    upload: uploadReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export default store;
