"use client";

import { useEffect, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/core/redux/store";
import {
  setFriends,
  setReceived,
  setSent,
  setLoading,
  acceptLocal,
  removeFriendship,
  removeByUserId,
  upsertFriendship,
  selectPendingCount,
  selectFriendInfo,
} from "@/core/redux/friendship";
import { friendshipApi } from "@/core/services/api/friendships";

export function useFriendship() {
  const dispatch = useDispatch<AppDispatch>();
  const { isAuth } = useSelector((state: RootState) => state.user);
  const { friends, received, sent, isLoading } = useSelector(
    (state: RootState) => state.friendship
  );
  const pendingCount = useSelector(selectPendingCount);

  useEffect(() => {
    if (!isAuth) return;

    dispatch(setLoading(true));
    Promise.all([
      friendshipApi.getFriends(),
      friendshipApi.getReceivedRequests(),
      friendshipApi.getSentRequests(),
    ])
      .then(([friendsData, receivedData, sentData]) => {
        dispatch(setFriends(friendsData));
        dispatch(setReceived(receivedData));
        dispatch(setSent(sentData));
      })
      .finally(() => dispatch(setLoading(false)));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuth]);

  const sendRequest = useCallback(
    async (friendId: string) => {
      const friendship = await friendshipApi.sendRequest(friendId);
      dispatch(upsertFriendship(friendship));
      // Thêm vào sent list vì upsertFriendship không biết phân loại
      dispatch(setSent([...sent, friendship]));
    },
    [dispatch, sent]
  );

  const acceptRequest = useCallback(
    async (id: string) => {
      const friendship = await friendshipApi.acceptRequest(id);
      dispatch(acceptLocal(friendship));
    },
    [dispatch]
  );

  const rejectRequest = useCallback(
    async (id: string) => {
      await friendshipApi.rejectRequest(id);
      dispatch(removeFriendship(id));
    },
    [dispatch]
  );

  const unfriend = useCallback(
    async (friendId: string) => {
      await friendshipApi.unfriend(friendId);
      dispatch(removeByUserId(friendId));
    },
    [dispatch]
  );

  const block = useCallback(
    async (friendId: string) => {
      const friendship = await friendshipApi.block(friendId);
      dispatch(removeByUserId(friendId));
      dispatch(upsertFriendship(friendship));
    },
    [dispatch]
  );

  const getFriendInfo = useCallback(
    (userId: string) => selectFriendInfo(userId)({ friendship: { friends, received, sent, isLoading } } as RootState),
    [friends, received, sent, isLoading]
  );

  return {
    friends,
    received,
    sent,
    isLoading,
    pendingCount,
    sendRequest,
    acceptRequest,
    rejectRequest,
    unfriend,
    block,
    getFriendInfo,
  };
}
