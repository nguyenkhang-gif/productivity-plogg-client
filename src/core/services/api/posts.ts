import axiosInstance from "@/core/lib/axiosInstance";
import { Endpoints } from "../endpoints";
import { Post, ReactionType } from "@/core/types/post";
import { PostCategory } from "@/core/enums";
import { PaginatedResponse } from "@/core/types/pagination";

export interface CreatePostDto {
  title?: string;
  content: string;
  imageUrls?: string[];
  tags?: string[];
  category?: PostCategory;
}

export interface UpdatePostDto {
  title?: string;
  content?: string;
  imageUrls?: string[];
  tags?: string[];
  category?: PostCategory;
}

export interface MyStats {
  postCount: number;
  totalReactions: number;
  totalBookmarks: number;
}

export interface GetPostsParams {
  page?: number;
  limit?: number;
  categoryId?: string;
  tags?: string; // comma-separated slugs
  excludeId?: string;
}

export const apiGetPosts = async (params: GetPostsParams = {}): Promise<PaginatedResponse<Post>> => {
  const { data } = await axiosInstance.get(Endpoints.POST_GET_ALL, { params });
  return data;
};

export const apiGetPostById = async (id: string): Promise<Post> => {
  const { data } = await axiosInstance.get(
    Endpoints.POST_GET_BY_ID.replace(":id", id)
  );
  return data;
};

export const apiGetPostsByAuthor = async (
  authorId: string,
  page = 1,
  limit = 10
): Promise<PaginatedResponse<Post>> => {
  const { data } = await axiosInstance.get(
    Endpoints.POST_GET_BY_AUTHOR.replace(":authorId", authorId),
    { params: { page, limit } }
  );
  return data;
};

export const apiCreatePost = async (body: CreatePostDto): Promise<Post> => {
  const { data } = await axiosInstance.post(Endpoints.POST_CREATE, body);
  return data;
};

export const apiUpdatePost = async (id: string, body: UpdatePostDto): Promise<Post> => {
  const { data } = await axiosInstance.patch(
    Endpoints.POST_UPDATE.replace(":id", id),
    body
  );
  return data;
};

export const apiDeletePost = async (id: string): Promise<void> => {
  await axiosInstance.delete(Endpoints.POST_DELETE.replace(":id", id));
};

export const apiReactPost = async (postId: string, type: ReactionType, icon?: string): Promise<Post> => {
  const { data } = await axiosInstance.post(
    Endpoints.POST_REACT.replace(":postId", postId),
    { type, ...(icon ? { icon } : {}) }
  );
  return data;
};

export const apiViewPost = (id: string) =>
  axiosInstance.post(Endpoints.POST_VIEW.replace(":id", id));

export const apiBookmarkPost = (id: string) =>
  axiosInstance.post(Endpoints.POST_BOOKMARK.replace(":id", id));

export const apiUnbookmarkPost = (id: string) =>
  axiosInstance.delete(Endpoints.POST_BOOKMARK.replace(":id", id));

export const apiGetTrending = (): Promise<Post[]> =>
  axiosInstance.get(Endpoints.POST_TRENDING).then((r) => r.data);

export const apiGetMyStats = (): Promise<MyStats> =>
  axiosInstance.get(Endpoints.POST_MY_STATS).then((r) => r.data);
