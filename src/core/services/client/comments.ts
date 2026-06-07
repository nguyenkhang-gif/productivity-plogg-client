"use client";

import { useInfiniteQuery, useMutation, useQueryClient } from "@/core/plugins/reactQuery";
import { InfiniteData } from "@tanstack/react-query";
import { FetchQueryKeys } from "../endpoints";
import {
  apiGetComments,
  apiCreateComment,
  apiUpdateComment,
  apiDeleteComment,
  CreateCommentDto,
  UpdateCommentDto,
} from "../api/comments";
import { Comment } from "@/core/types/comment";

const LIMIT = 20;

type CommentPage = { comments: Comment[]; hasMore: boolean; page: number; totalPages: number };

export const useGetComments = (postId: string) => {
  return useInfiniteQuery({
    queryKey: [FetchQueryKeys.COMMENT_GET_BY_POST, postId],
    initialPageParam: 1,
    queryFn: async ({ pageParam }) => {
      const page = pageParam as number;
      const data = await apiGetComments(postId, page, LIMIT);
      const comments = data.items;
      const totalPages = data.pagination.totalPages;
      const hasMore = page < totalPages;
      return { comments, hasMore, page, totalPages } as CommentPage;
    },
    getNextPageParam: (lastPage) =>
      lastPage.hasMore ? lastPage.page + 1 : undefined,
    enabled: !!postId,
  });
};

export const useCreateComment = (postId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (body: CreateCommentDto) => apiCreateComment(postId, body),
    onSuccess: (newComment: Comment) => {
      queryClient.setQueryData<InfiniteData<CommentPage>>(
        [FetchQueryKeys.COMMENT_GET_BY_POST, postId],
        (old) => {
          if (!old) return old;
          return {
            ...old,
            pages: old.pages.map((page, i) =>
              i === 0
                ? { ...page, comments: [newComment, ...page.comments] }
                : page
            ),
          };
        }
      );
    },
  });
};

export const useUpdateComment = (postId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, body }: { id: string; body: UpdateCommentDto }) =>
      apiUpdateComment(postId, id, body),
    onSuccess: (updatedComment: Comment) => {
      queryClient.setQueryData<InfiniteData<CommentPage>>(
        [FetchQueryKeys.COMMENT_GET_BY_POST, postId],
        (old) => {
          if (!old) return old;
          return {
            ...old,
            pages: old.pages.map((page) => ({
              ...page,
              comments: page.comments.map((c) =>
                c.id === updatedComment.id ? updatedComment : c
              ),
            })),
          };
        }
      );
    },
  });
};

export const useDeleteComment = (postId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (commentId: string) => apiDeleteComment(postId, commentId),
    onSuccess: (_, commentId) => {
      queryClient.setQueryData<InfiniteData<CommentPage>>(
        [FetchQueryKeys.COMMENT_GET_BY_POST, postId],
        (old) => {
          if (!old) return old;
          return {
            ...old,
            pages: old.pages.map((page) => ({
              ...page,
              comments: page.comments.filter((c) => c.id !== commentId),
            })),
          };
        }
      );
    },
  });
};
