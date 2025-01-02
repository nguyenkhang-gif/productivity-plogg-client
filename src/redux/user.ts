import { createSlice, PayloadAction } from "@reduxjs/toolkit";

// Định nghĩa kiểu dữ liệu cho UserState
export interface UserState {
  _id: string;
  fullName: string;
  gender: string;
  username: string;
  profilePic: string;
  email: string;
  memberShip: string;
  role: string;
}

// Khởi tạo giá trị ban đầu (initial state)
const initialUserState: UserState = {
  _id: "",
  fullName: "",
  gender: "",
  username: "",
  profilePic: "",
  email: "",
  memberShip: "",
  role: "",
};

// Tạo slice cho user
const userSlice = createSlice({
  name: "user",
  initialState: initialUserState,
  reducers: {
    // Action để cập nhật tất cả thông tin người dùng
    updateUser: (state, action: PayloadAction<UserState>) => {
      return { ...state, ...action.payload }; // Cập nhật tất cả thông tin người dùng
    },
    // Action để reset tất cả thông tin người dùng về giá trị mặc định
    resetToDefault: () => {
      return { ...initialUserState }; // Đặt lại state về giá trị ban đầu
    },
  },
});

// Export actions để sử dụng trong component
export const { updateUser, resetToDefault } = userSlice.actions;

// Export reducer để thêm vào store
export default userSlice.reducer;
