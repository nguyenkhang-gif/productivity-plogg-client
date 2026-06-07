import axiosInstance from "@/core/lib/axiosInstance";
import { Endpoints } from "../endpoints";
import { Post, ReactionType } from "@/core/types/post";
import { PaginatedResponse } from "@/core/types/pagination";

export interface CreatePostDto {
  title?: string;
  content: string;
  imageUrls?: string[];
}

export interface UpdatePostDto {
  title?: string;
  content?: string;
  imageUrls?: string[];
}

export const apiGetPosts = async (page = 1, limit = 10): Promise<PaginatedResponse<Post>> => {
  const { data } = await axiosInstance.get(Endpoints.POST_GET_ALL, {
    params: { page, limit },
  });

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
