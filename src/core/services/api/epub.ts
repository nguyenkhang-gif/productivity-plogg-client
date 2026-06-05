import epubAxiosInstance from "@/core/lib/epubAxiosInstance";
import { Endpoints } from "../endpoints";

export const getAllEpub = async () => {
  console.log("getAllEpub -> prompt", prompt);
  try {
    const data = await epubAxiosInstance.post(Endpoints.EPUB_GET_USER_EPUB, {});
    return data.data;
  } catch (error) {
    console.log(error);
  }
};
