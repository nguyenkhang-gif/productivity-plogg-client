import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export interface UserProfile {
  fullName: string;
  gender: string;
  username: string;
  profilePic: string;
  email: string;
  memberShip: string;
  role: string;
  id: string;
  isPrivate?: boolean;
}

export interface UserState {
  profile: UserProfile;
  token: string | null;
  isAuth: boolean;
  isLoading: boolean;
}

const initialProfile: UserProfile = {
  fullName: "",
  gender: "",
  username: "",
  profilePic: "",
  email: "",
  memberShip: "",
  role: "",
  id: "",
};

const initialUserState: UserState = {
  profile: initialProfile,
  token: null,
  isAuth: false,
  isLoading: true,
};

const userSlice = createSlice({
  name: "user",
  initialState: initialUserState,
  reducers: {
    setCredentials: (
      state,
      action: PayloadAction<{ profile: UserProfile; token: string }>
    ) => {
      state.profile = action.payload.profile;
      state.token = action.payload.token;
      state.isAuth = true;
      state.isLoading = false;
    },
    setAuthLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    logout: () => ({
      profile: initialProfile,
      token: null,
      isAuth: false,
      isLoading: false,
    }),
    updateProfile: (state, action: PayloadAction<Partial<UserProfile>>) => {
      state.profile = { ...state.profile, ...action.payload };
    },
    // Cập nhật access token sau khi refresh — không cần fetch lại profile
    updateToken: (state, action: PayloadAction<string>) => {
      state.token = action.payload;
    },
    resetToDefault: () => ({
      profile: initialProfile,
      token: null,
      isAuth: false,
      isLoading: false,
    }),
  },
});

export const { setCredentials, setAuthLoading, logout, resetToDefault, updateProfile, updateToken } =
  userSlice.actions;

export default userSlice.reducer;
