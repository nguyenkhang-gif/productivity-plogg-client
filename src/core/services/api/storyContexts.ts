import axiosInstance from "@/core/lib/axiosInstance";
import { Endpoints } from "@/core/services/endpoints";

export interface StoryContextCharacter {
  name: string;
  vietnameseName?: string;
  role: string;
  personality?: string;
  speechStyle?: string;
  honorific?: string;
  note?: string;
}

export interface StoryContextGlossaryItem {
  original: string;
  translation: string;
  note?: string;
}

export interface StoryContextStyleGuide {
  formality: string;
  keepHonorifics: boolean;
  keepOriginalNames: boolean;
  chapterLabel: string;
  extraNotes?: string;
}

export interface StoryContextChapterSummary {
  chapterNumber: string | number;
  summary: string;
}

export interface StoryContext {
  id: string;
  title: string;
  author: string;
  genre: string;
  setting: string;
  targetTone: string;
  sourceLanguage: string;
  targetLanguage: string;
  characters: StoryContextCharacter[];
  glossary: StoryContextGlossaryItem[];
  styleGuide: StoryContextStyleGuide;
  chapterSummaries: StoryContextChapterSummary[];
  createdAt: string;
  updatedAt: string;
}

export type CreateStoryContextDto = Omit<StoryContext, "id" | "createdAt" | "updatedAt">;
export type UpdateStoryContextDto = Partial<CreateStoryContextDto>;

export interface StoryContextListResponse {
  data: StoryContext[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export const storyContextsApi = {
  create: (dto: CreateStoryContextDto) =>
    axiosInstance
      .post<StoryContext>(Endpoints.STORY_CONTEXT_CREATE, dto)
      .then((r) => r.data),

  list: (page = 1, limit = 20) =>
    axiosInstance
      .get<StoryContextListResponse>(Endpoints.STORY_CONTEXT_LIST, {
        params: { page, limit },
      })
      .then((r) => r.data),

  getById: (id: string) =>
    axiosInstance
      .get<StoryContext>(Endpoints.STORY_CONTEXT_GET_BY_ID.replace(":id", id))
      .then((r) => r.data),

  update: (id: string, dto: UpdateStoryContextDto) =>
    axiosInstance
      .patch<StoryContext>(Endpoints.STORY_CONTEXT_UPDATE.replace(":id", id), dto)
      .then((r) => r.data),

  remove: (id: string) =>
    axiosInstance
      .delete(Endpoints.STORY_CONTEXT_DELETE.replace(":id", id))
      .then((r) => r.data),
};
