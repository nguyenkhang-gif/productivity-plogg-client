"use client";

import { useQuery, useMutation, useQueryClient } from "@/core/plugins/reactQuery";
import { useSelector } from "react-redux";
import { RootState } from "@/core/redux/store";
import { FetchQueryKeys } from "../endpoints";
import { friendshipApi } from "../api/friendships";
import { Friendship } from "@/core/types/friendship";

export const useGetFriends = () => {
  const isAuth = useSelector((s: RootState) => s.user.isAuth);
  return useQuery({
    queryKey: [FetchQueryKeys.FRIENDS],
    queryFn: friendshipApi.getFriends,
    enabled: isAuth,
    staleTime: 2 * 60 * 1000,
  });
};

export const useGetReceivedRequests = () => {
  const isAuth = useSelector((s: RootState) => s.user.isAuth);
  return useQuery({
    queryKey: [FetchQueryKeys.FRIENDSHIP_RECEIVED],
    queryFn: friendshipApi.getReceivedRequests,
    enabled: isAuth,
    staleTime: 30 * 1000,
  });
};

export const useGetSentRequests = () => {
  const isAuth = useSelector((s: RootState) => s.user.isAuth);
  return useQuery({
    queryKey: [FetchQueryKeys.FRIENDSHIP_SENT],
    queryFn: friendshipApi.getSentRequests,
    enabled: isAuth,
    staleTime: 2 * 60 * 1000,
  });
};

export const useSendFriendRequest = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (friendId: string) => friendshipApi.sendRequest(friendId),
    onSuccess: (newFriendship: Friendship) => {
      queryClient.setQueryData<Friendship[]>(
        [FetchQueryKeys.FRIENDSHIP_SENT],
        (old) => (old ? [...old, newFriendship] : [newFriendship])
      );
    },
  });
};

export const useAcceptFriendRequest = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => friendshipApi.acceptRequest(id),
    onSuccess: (accepted: Friendship) => {
      queryClient.setQueryData<Friendship[]>(
        [FetchQueryKeys.FRIENDSHIP_RECEIVED],
        (old) => old?.filter((f) => f.id !== accepted.id) ?? []
      );
      queryClient.setQueryData<Friendship[]>(
        [FetchQueryKeys.FRIENDS],
        (old) => (old ? [...old, accepted] : [accepted])
      );
    },
  });
};

export const useRejectFriendRequest = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => friendshipApi.rejectRequest(id),
    onSuccess: (_, id) => {
      queryClient.setQueryData<Friendship[]>(
        [FetchQueryKeys.FRIENDSHIP_RECEIVED],
        (old) => old?.filter((f) => f.id !== id) ?? []
      );
    },
  });
};

export const useUnfriend = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (friendId: string) => friendshipApi.unfriend(friendId),
    onSuccess: (_, friendId) => {
      queryClient.setQueryData<Friendship[]>(
        [FetchQueryKeys.FRIENDS],
        (old) => old?.filter((f) => f.userId !== friendId && f.friendId !== friendId) ?? []
      );
    },
  });
};

export const useBlockUser = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (friendId: string) => friendshipApi.block(friendId),
    onSuccess: (_, friendId) => {
      queryClient.setQueryData<Friendship[]>(
        [FetchQueryKeys.FRIENDS],
        (old) => old?.filter((f) => f.userId !== friendId && f.friendId !== friendId) ?? []
      );
      queryClient.invalidateQueries({ queryKey: [FetchQueryKeys.FRIENDS] });
    },
  });
};
