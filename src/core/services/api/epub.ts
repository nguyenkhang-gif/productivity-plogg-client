import epubAxiosInstance from "@/core/lib/epubAxiosInstance";
import { Endpoints } from "../endpoints";
import { chapterFormatI } from "@/core/redux/epub";

export interface EpubItem {
  id: number;
  info: {
    title: string;
    content: string;
  };
  completed: boolean;
  properties?: {
    format?: chapterFormatI;
  };
}

export const getAllEpub = async (): Promise<EpubItem[] | undefined> => {
  console.log("getAllEpub -> prompt", prompt);
  try {
    const data = await epubAxiosInstance.post(Endpoints.EPUB_GET_USER_EPUB, {});
    return data.data;
  } catch (error) {
    console.log(error);
  }
};
