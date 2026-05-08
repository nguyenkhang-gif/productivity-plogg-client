import axiosInstance from "@/core/lib/axiosInstance";
import { Friendship } from "@/core/types/friendship";

export interface UserSearchResult {
  id: string;
  fullName: string;
  username: string;
  profilePic?: string;
}

export const friendshipApi = {
  getFriends: () =>
    axiosInstance.get<Friendship[]>("/friendships").then((r) => r.data),

  getReceivedRequests: () =>
    axiosInstance.get<Friendship[]>("/friendships/requests/received").then((r) => r.data),

  getSentRequests: () =>
    axiosInstance.get<Friendship[]>("/friendships/requests/sent").then((r) => r.data),

  sendRequest: (friendId: string) =>
    axiosInstance.post<Friendship>("/friendships/request", { friendId }).then((r) => r.data),

  acceptRequest: (id: string) =>
    axiosInstance.patch<Friendship>(`/friendships/${id}/accept`).then((r) => r.data),

  rejectRequest: (id: string) =>
    axiosInstance.delete(`/friendships/${id}/reject`),

  unfriend: (friendId: string) =>
    axiosInstance.delete(`/friendships/${friendId}/unfriend`),

  block: (friendId: string) =>
    axiosInstance.post<Friendship>("/friendships/block", { friendId }).then((r) => r.data),

  searchUsers: (q: string) =>
    axiosInstance.get<UserSearchResult[]>("/users/search", { params: { q } }).then((r) => r.data),
};
