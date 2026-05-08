"use client";

import { useDispatch } from "react-redux";
import { useInfiniteQuery, useMutation, useQueryClient } from "@/core/plugins/reactQuery";
import { FetchQueryKeys } from "../endpoints";
import {
  apiGetComments,
  apiCreateComment,
  apiUpdateComment,
  apiDeleteComment,
  CreateCommentDto,
  UpdateCommentDto,
} from "../api/comments";
import { appendComments, addComment, updateComment, removeComment } from "@/core/redux/comment";
import { AppDispatch } from "@/core/redux/store";

const LIMIT = 20;

export const useGetComments = (postId: string) => {
  const dispatch = useDispatch<AppDispatch>();

  return useInfiniteQuery({
    queryKey: [FetchQueryKeys.COMMENT_GET_BY_POST, postId],
    initialPageParam: 1,
    queryFn: async ({ pageParam }) => {
      const data = await apiGetComments(postId, pageParam as number, LIMIT);
      const comments = data.items ?? data.data ?? data ?? [];
      const total = data.pagination?.total ?? data.total ?? comments.length;
      const hasMore = (pageParam as number) * LIMIT < total;

      dispatch(appendComments({ postId, comments, hasMore }));
      return { comments, hasMore, page: pageParam, total };
    },
    getNextPageParam: (lastPage) =>
      lastPage.hasMore ? (lastPage.page as number) + 1 : undefined,
    enabled: !!postId,
  });
};

export const useCreateComment = (postId: string) => {
  const dispatch = useDispatch<AppDispatch>();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (body: CreateCommentDto) => apiCreateComment(postId, body),
    onSuccess: (data) => {
      dispatch(addComment(data));
      queryClient.invalidateQueries({
        queryKey: [FetchQueryKeys.COMMENT_GET_BY_POST, postId],
      });
    },
  });
};

export const useUpdateComment = (postId: string) => {
  const dispatch = useDispatch<AppDispatch>();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, body }: { id: string; body: UpdateCommentDto }) =>
      apiUpdateComment(postId, id, body),
    onSuccess: (data) => {
      dispatch(updateComment(data));
      queryClient.invalidateQueries({
        queryKey: [FetchQueryKeys.COMMENT_GET_BY_POST, postId],
      });
    },
  });
};

export const useDeleteComment = (postId: string) => {
  const dispatch = useDispatch<AppDispatch>();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (commentId: string) => apiDeleteComment(postId, commentId),
    onSuccess: (_, commentId) => {
      dispatch(removeComment({ postId, commentId }));
      queryClient.invalidateQueries({
        queryKey: [FetchQueryKeys.COMMENT_GET_BY_POST, postId],
      });
    },
  });
};
