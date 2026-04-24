import axiosInstance from "@/core/lib/axiosInstance";
import { Endpoints } from "../endpoints";

export const getAllEpub = async () => {
  console.log("getAllEpub -> prompt", prompt);
  try {
    const data = await axiosInstance.post(Endpoints.EPUB_GET_USER_EPUB, {});
    return data.data;
  } catch (error) {
    console.log(error);
  }
};
