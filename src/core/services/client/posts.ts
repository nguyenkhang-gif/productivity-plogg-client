"use client";
import { useDispatch } from "react-redux";
import {
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from "@/core/plugins/reactQuery";
import { FetchQueryKeys } from "../endpoints";
import {
  apiGetPosts,
  apiGetPostById,
  apiGetPostsByAuthor,
  apiCreatePost,
  apiUpdatePost,
  apiDeletePost,
  CreatePostDto,
  UpdatePostDto,
} from "../api/posts";
import {
  appendPosts,
  addPost,
  updatePost,
  removePost,
  setSelectedPost,
  resetPosts,
} from "@/core/redux/post";
import { AppDispatch } from "@/core/redux/store";
import { useConstants } from "@/core/hooks/useConstants";

export const useGetPostsFeed = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { Post: PostConstants } = useConstants();

  return useInfiniteQuery({
    queryKey: [FetchQueryKeys.POST_GET_ALL],
    initialPageParam: 1,
    queryFn: async ({ pageParam }) => {
      const data = await apiGetPosts(pageParam as number, PostConstants.PAGE_LIMIT);
      const posts = data.items ?? data.data ?? data ?? [];
      const total = data.pagination?.total ?? data.total ?? posts.length;
      const hasMore = (pageParam as number) * PostConstants.PAGE_LIMIT < total;

      dispatch(appendPosts({ posts, hasMore }));
      return { posts, hasMore, page: pageParam };
    },
    getNextPageParam: (lastPage) =>
      lastPage.hasMore ? (lastPage.page as number) + 1 : undefined,
    refetchOnWindowFocus: true,
  });
};

export const useGetPostsByAuthor = (authorId: string) => {
  const { Post: PostConstants } = useConstants();

  return useInfiniteQuery({
    queryKey: [FetchQueryKeys.POST_GET_BY_AUTHOR, authorId],
    initialPageParam: 1,
    queryFn: async ({ pageParam }) => {
      const data = await apiGetPostsByAuthor(authorId, pageParam as number, PostConstants.PAGE_LIMIT);
      const posts = data.items ?? data.data ?? data ?? [];
      const total = data.pagination?.total ?? data.total ?? posts.length;
      const hasMore = (pageParam as number) * PostConstants.PAGE_LIMIT < total;
      return { posts, hasMore, page: pageParam, total };
    },
    getNextPageParam: (lastPage) =>
      lastPage.hasMore ? (lastPage.page as number) + 1 : undefined,
    enabled: !!authorId,
  });
};

export const useGetPostById = (id: string) => {
  const dispatch = useDispatch<AppDispatch>();

  return useQuery({
    queryKey: [FetchQueryKeys.POST_GET_BY_ID, id],
    queryFn: async () => {
      const data = await apiGetPostById(id);
      dispatch(setSelectedPost(data));
      return data;
    },
    enabled: !!id,
  });
};

export const useCreatePost = () => {
  const dispatch = useDispatch<AppDispatch>();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (body: CreatePostDto) => apiCreatePost(body),
    onSuccess: (data) => {
      dispatch(addPost(data));
      queryClient.invalidateQueries({ queryKey: [FetchQueryKeys.POST_GET_ALL] });
      dispatch(resetPosts());
    },
  });
};

export const useUpdatePost = () => {
  const dispatch = useDispatch<AppDispatch>();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, body }: { id: string; body: UpdatePostDto }) =>
      apiUpdatePost(id, body),
    onSuccess: (data) => {
      dispatch(updatePost(data));
      queryClient.invalidateQueries({ queryKey: [FetchQueryKeys.POST_GET_ALL] });
    },
  });
};

export const useDeletePost = () => {
  const dispatch = useDispatch<AppDispatch>();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => apiDeletePost(id),
    onSuccess: (_, id) => {
      dispatch(removePost(id));
      queryClient.invalidateQueries({ queryKey: [FetchQueryKeys.POST_GET_ALL] });
    },
  });
};
