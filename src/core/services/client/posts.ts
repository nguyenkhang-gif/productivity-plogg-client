"use client";
import {
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from "@/core/plugins/reactQuery";
import { InfiniteData } from "@tanstack/react-query";
import { FetchQueryKeys } from "../endpoints";
import {
  apiGetPosts,
  apiGetPostById,
  apiGetPostsByAuthor,
  apiCreatePost,
  apiUpdatePost,
  apiDeletePost,
  apiReactPost,
  CreatePostDto,
  UpdatePostDto,
} from "../api/posts";
import { Post, ReactionType } from "@/core/types/post";
import { useConstants } from "@/core/hooks/useConstants";

type PageResult = { posts: Post[]; hasMore: boolean; page: number; totalPages: number };

function updatePostInFeed(
  old: InfiniteData<PageResult> | undefined,
  updater: (post: Post) => Post
): InfiniteData<PageResult> | undefined {
  if (!old) return old;
  return {
    ...old,
    pages: old.pages.map((page) => ({
      ...page,
      posts: page.posts.map(updater),
    })),
  };
}

export const useGetPostsFeed = () => {
  const { Post: PostConstants } = useConstants();

  return useInfiniteQuery({
    queryKey: [FetchQueryKeys.POST_GET_ALL],
    initialPageParam: 1,
    queryFn: async ({ pageParam }) => {
      const page = pageParam as number;
      const data = await apiGetPosts({ page, limit: PostConstants.PAGE_LIMIT });
      const posts = data.items;
      const totalPages = data.pagination.totalPages;
      const hasMore = page < totalPages;
      return { posts, hasMore, page, totalPages } as PageResult;
    },
    getNextPageParam: (lastPage) =>
      lastPage.hasMore ? lastPage.page + 1 : undefined,
    refetchOnWindowFocus: true,
  });
};

export const useGetPostsByAuthor = (authorId: string) => {
  const { Post: PostConstants } = useConstants();

  return useInfiniteQuery({
    queryKey: [FetchQueryKeys.POST_GET_BY_AUTHOR, authorId],
    initialPageParam: 1,
    queryFn: async ({ pageParam }) => {
      const page = pageParam as number;
      const data = await apiGetPostsByAuthor(authorId, page, PostConstants.PAGE_LIMIT);
      const posts = data.items;
      const { total, totalPages } = data.pagination;
      const hasMore = page < totalPages;
      return { posts, hasMore, page, totalPages, total };
    },
    getNextPageParam: (lastPage) =>
      lastPage.hasMore ? lastPage.page + 1 : undefined,
    enabled: !!authorId,
  });
};

export const useGetPostById = (id: string) => {
  const queryClient = useQueryClient();

  return useQuery({
    queryKey: [FetchQueryKeys.POST_GET_BY_ID, id],
    queryFn: () => apiGetPostById(id),
    enabled: !!id,
    initialData: () => {
      const feedData = queryClient.getQueryData<InfiniteData<PageResult>>(
        [FetchQueryKeys.POST_GET_ALL]
      );
      if (feedData) {
        for (const page of feedData.pages) {
          const found = page.posts.find((p) => p.id === id);
          if (found) return found;
        }
      }
      return undefined;
    },
    initialDataUpdatedAt: () =>
      queryClient.getQueryState([FetchQueryKeys.POST_GET_ALL])?.dataUpdatedAt,
  });
};

export const useCreatePost = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (body: CreatePostDto) => apiCreatePost(body),
    onSuccess: () => {
      queryClient.resetQueries({ queryKey: [FetchQueryKeys.POST_GET_ALL] });
    },
  });
};

export const useUpdatePost = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, body }: { id: string; body: UpdatePostDto }) =>
      apiUpdatePost(id, body),
    onSuccess: (updatedPost: Post) => {
      queryClient.setQueryData<InfiniteData<PageResult>>(
        [FetchQueryKeys.POST_GET_ALL],
        (old) => updatePostInFeed(old, (p) => (p.id === updatedPost.id ? updatedPost : p))
      );
      queryClient.setQueryData<Post>(
        [FetchQueryKeys.POST_GET_BY_ID, updatedPost.id],
        updatedPost
      );
    },
  });
};

export const useDeletePost = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => apiDeletePost(id),
    onSuccess: (_, id) => {
      queryClient.setQueryData<InfiniteData<PageResult>>(
        [FetchQueryKeys.POST_GET_ALL],
        (old) => {
          if (!old) return old;
          return {
            ...old,
            pages: old.pages.map((page) => ({
              ...page,
              posts: page.posts.filter((p) => p.id !== id),
            })),
          };
        }
      );
      queryClient.removeQueries({ queryKey: [FetchQueryKeys.POST_GET_BY_ID, id] });
    },
  });
};

export const useReactPost = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ postId, type }: { postId: string; type: ReactionType }) =>
      apiReactPost(postId, type),

    onMutate: async ({ postId, type }) => {
      await queryClient.cancelQueries({ queryKey: [FetchQueryKeys.POST_GET_ALL] });
      await queryClient.cancelQueries({ queryKey: [FetchQueryKeys.POST_GET_BY_ID, postId] });

      const feedSnapshot = queryClient.getQueryData([FetchQueryKeys.POST_GET_ALL]);
      const postSnapshot = queryClient.getQueryData([FetchQueryKeys.POST_GET_BY_ID, postId]);

      const applyReaction = (post: Post): Post => {
        if (post.id !== postId) return post;
        const isToggleOff = post.userReaction?.type === type;
        return {
          ...post,
          userReaction: isToggleOff ? null : { type },
          reactCount: isToggleOff
            ? Math.max(0, post.reactCount - 1)
            : post.userReaction
            ? post.reactCount
            : post.reactCount + 1,
        };
      };

      queryClient.setQueryData<InfiniteData<PageResult>>(
        [FetchQueryKeys.POST_GET_ALL],
        (old) => updatePostInFeed(old, applyReaction)
      );
      queryClient.setQueryData<Post>(
        [FetchQueryKeys.POST_GET_BY_ID, postId],
        (old) => (old ? applyReaction(old) : old)
      );

      return { feedSnapshot, postSnapshot };
    },

    onError: (_, { postId }, context) => {
      if (context?.feedSnapshot !== undefined) {
        queryClient.setQueryData([FetchQueryKeys.POST_GET_ALL], context.feedSnapshot);
      }
      if (context?.postSnapshot !== undefined) {
        queryClient.setQueryData([FetchQueryKeys.POST_GET_BY_ID, postId], context.postSnapshot);
      }
    },

    onSettled: (_, __, { postId }) => {
      queryClient.invalidateQueries({ queryKey: [FetchQueryKeys.POST_GET_ALL] });
      queryClient.invalidateQueries({ queryKey: [FetchQueryKeys.POST_GET_BY_ID, postId] });
    },
  });
};
