export type FriendshipStatus = "pending" | "accepted" | "blocked";

export interface FriendInfo {
  id: string;
  fullName: string;
  username: string;
  profilePic?: string;
}

export interface Friendship {
  id: string;
  userId: string;
  friendId: string;
  status: FriendshipStatus;
  friendInfo?: FriendInfo;
  createdAt: string;
  updatedAt: string;
}
