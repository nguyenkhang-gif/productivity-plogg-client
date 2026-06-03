"use client";

import { useCallback } from "react";
import { useSelector } from "react-redux";
import { RootState } from "@/core/redux/store";
import { friendshipApi } from "@/core/services/api/friendships";
import {
  useGetFriends,
  useGetReceivedRequests,
  useGetSentRequests,
  useSendFriendRequest,
  useAcceptFriendRequest,
  useRejectFriendRequest,
  useUnfriend,
  useBlockUser,
} from "@/core/services/client/friendships";

export function useFriendship() {
  const currentUserId = useSelector((s: RootState) => s.user.profile.id);

  const { data: friends = [], isLoading: loadingFriends } = useGetFriends();
  const { data: received = [], isLoading: loadingReceived } = useGetReceivedRequests();
  const { data: sent = [], isLoading: loadingSent } = useGetSentRequests();

  const isLoading = loadingFriends || loadingReceived || loadingSent;
  const pendingCount = received.length;

  const { mutateAsync: sendRequestMutation } = useSendFriendRequest();
  const { mutateAsync: acceptMutation } = useAcceptFriendRequest();
  const { mutateAsync: rejectMutation } = useRejectFriendRequest();
  const { mutateAsync: unfriendMutation } = useUnfriend();
  const { mutateAsync: blockMutation } = useBlockUser();

  const sendRequest = useCallback(
    (friendId: string) => sendRequestMutation(friendId),
    [sendRequestMutation]
  );

  const acceptRequest = useCallback(
    (id: string) => acceptMutation(id),
    [acceptMutation]
  );

  const rejectRequest = useCallback(
    (id: string) => rejectMutation(id),
    [rejectMutation]
  );

  const unfriend = useCallback(
    (friendId: string) => unfriendMutation(friendId),
    [unfriendMutation]
  );

  const block = useCallback(
    (friendId: string) => blockMutation(friendId),
    [blockMutation]
  );

  const getFriendInfo = useCallback(
    (userId: string) => {
      const match = friends.find(
        (f) => f.userId === userId || f.friendId === userId
      );
      return match?.friendInfo;
    },
    [friends]
  );

  const searchUsers = useCallback(
    (q: string) => friendshipApi.searchUsers(q),
    []
  );

  return {
    friends,
    received,
    sent,
    isLoading,
    pendingCount,
    currentUserId,
    sendRequest,
    acceptRequest,
    rejectRequest,
    unfriend,
    block,
    getFriendInfo,
    searchUsers,
  };
}
