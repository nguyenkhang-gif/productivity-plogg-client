import axiosInstance from "@/core/lib/axiosInstance";
import { Endpoints } from "../endpoints";

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

export const apiGetPosts = async (page = 1, limit = 10) => {
  const { data } = await axiosInstance.get(Endpoints.POST_GET_ALL, {
    params: { page, limit },
  });

  return data;
};

export const apiGetPostById = async (id: string) => {
  const { data } = await axiosInstance.get(
    Endpoints.POST_GET_BY_ID.replace(":id", id)
  );
  return data;
};

export const apiGetPostsByAuthor = async (
  authorId: string,
  page = 1,
  limit = 10
) => {
  const { data } = await axiosInstance.get(
    Endpoints.POST_GET_BY_AUTHOR.replace(":authorId", authorId),
    { params: { page, limit } }
  );
  return data;
};

export const apiCreatePost = async (body: CreatePostDto) => {
  const { data } = await axiosInstance.post(Endpoints.POST_CREATE, body);
  return data;
};

export const apiUpdatePost = async (id: string, body: UpdatePostDto) => {
  const { data } = await axiosInstance.patch(
    Endpoints.POST_UPDATE.replace(":id", id),
    body
  );
  return data;
};

export const apiDeletePost = async (id: string) => {
  await axiosInstance.delete(Endpoints.POST_DELETE.replace(":id", id));
};
