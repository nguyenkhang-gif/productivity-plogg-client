import axiosInstance from "@/core/lib/axiosInstance";
import { Endpoints } from "../endpoints";

export interface CreateCommentDto {
  content: string;
}

export interface UpdateCommentDto {
  content: string;
}

const url = {
  byPost: (postId: string) =>
    Endpoints.COMMENT_GET_BY_POST.replace(":postId", postId),
  byId: (postId: string, id: string) =>
    Endpoints.COMMENT_UPDATE.replace(":postId", postId).replace(":id", id),
};

export const apiGetComments = async (postId: string, page = 1, limit = 20) => {
  const { data } = await axiosInstance.get(url.byPost(postId), {
    params: { page, limit },
  });
  return data;
};

export const apiCreateComment = async (postId: string, body: CreateCommentDto) => {
  const { data } = await axiosInstance.post(url.byPost(postId), body);
  return data;
};

export const apiUpdateComment = async (
  postId: string,
  id: string,
  body: UpdateCommentDto
) => {
  const { data } = await axiosInstance.patch(url.byId(postId, id), body);
  return data;
};

export const apiDeleteComment = async (postId: string, id: string) => {
  await axiosInstance.delete(url.byId(postId, id));
};
