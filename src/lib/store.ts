import { configureStore, createSlice } from '@reduxjs/toolkit';

// Định nghĩa kiểu dữ liệu cho state
interface CounterState {
  count: number;
}

// Giá trị ban đầu của state
const initialState: CounterState = {
  count: 0,
};

// Tạo slice
const counterSlice = createSlice({
  name: 'counter',
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

// Export actions
export const { increment, decrement } = counterSlice.actions;

// Tạo store
const store = configureStore({
  reducer: {
    counter: counterSlice.reducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;  // Định nghĩa kiểu dữ liệu cho RootState

export default store;
