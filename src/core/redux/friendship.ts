import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { Friendship } from "@/core/types/friendship";
import { RootState } from "./store";

interface FriendshipState {
  friends: Friendship[];
  received: Friendship[];
  sent: Friendship[];
  isLoading: boolean;
}

const initialState: FriendshipState = {
  friends: [],
  received: [],
  sent: [],
  isLoading: false,
};

const friendshipSlice = createSlice({
  name: "friendship",
  initialState,
  reducers: {
    setFriends(state, action: PayloadAction<Friendship[]>) {
      state.friends = action.payload;
    },

    setReceived(state, action: PayloadAction<Friendship[]>) {
      state.received = action.payload;
    },

    setSent(state, action: PayloadAction<Friendship[]>) {
      state.sent = action.payload;
    },

    setLoading(state, action: PayloadAction<boolean>) {
      state.isLoading = action.payload;
    },

    upsertFriendship(state, action: PayloadAction<Friendship>) {
      const f = action.payload;

      const removeFrom = (list: Friendship[]) =>
        list.filter((x) => x.id !== f.id);

      state.friends = removeFrom(state.friends);
      state.received = removeFrom(state.received);
      state.sent = removeFrom(state.sent);

      if (f.status === "accepted") state.friends.push(f);
      else if (f.status === "pending") {
        // Phân loại lại dựa trên danh sách hiện tại không đủ thông tin,
        // caller phải dispatch setReceived/setSent sau accept/reject nếu cần.
        state.sent.push(f);
      }
    },

    removeFriendship(state, action: PayloadAction<string>) {
      const id = action.payload;
      state.friends = state.friends.filter((x) => x.id !== id);
      state.received = state.received.filter((x) => x.id !== id);
      state.sent = state.sent.filter((x) => x.id !== id);
    },

    // Dùng sau khi accept: chuyển từ received → friends
    acceptLocal(state, action: PayloadAction<Friendship>) {
      state.received = state.received.filter((x) => x.id !== action.payload.id);
      state.friends.push(action.payload);
    },

    // Dùng sau khi reject/unfriend: xóa khỏi mọi list theo id hoặc userId/friendId
    removeByUserId(state, action: PayloadAction<string>) {
      const uid = action.payload;
      const match = (f: Friendship) => f.userId !== uid && f.friendId !== uid;
      state.friends = state.friends.filter(match);
      state.received = state.received.filter(match);
      state.sent = state.sent.filter(match);
    },
  },
});

export const {
  setFriends,
  setReceived,
  setSent,
  setLoading,
  upsertFriendship,
  removeFriendship,
  acceptLocal,
  removeByUserId,
} = friendshipSlice.actions;

// Selector: tra friendInfo của userId bất kỳ trong friends list
export const selectFriendInfo = (userId: string) => (state: RootState) => {
  const match = state.friendship.friends.find(
    (f) => f.userId === userId || f.friendId === userId
  );
  return match?.friendInfo;
};

export const selectPendingCount = (state: RootState) =>
  state.friendship.received.length;

export default friendshipSlice.reducer;
