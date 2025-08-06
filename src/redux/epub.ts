import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export interface Chapter {
  id: number;
  info: {
    title: string;
    content: string;
  };
  completed: boolean;
}
export interface chapterFormatI {
  chapter_content?: {
    tag: string | null;
    id: string | null;
    class: string | null;
  };
  chapter_title?: {
    tag: string | null;
    id: string | null;
    class: string | null;
  };
}

export interface ChaptersState {
  items: Chapter[];
  formatArray: string[];
  aiResponse: {
    chapterInfo: {
      title: string;
      content: string;
    };
    format: chapterFormatI;
  } | null;
  epubOptions: {
    title: string;
    author: string;
  } | null;
}

const initialState: ChaptersState = {
  items: [],
  formatArray: [],
  aiResponse: null,
  epubOptions: null,
};

export const chaptersSlice = createSlice({
  name: "chapters",
  initialState,
  reducers: {
    addChapter: (state, action: PayloadAction<Chapter["info"]>) => {
      state.items.push({
        id: Date.now(),
        info: action.payload,
        completed: false,
      });
    },
    toggleChapter: (state, action: PayloadAction<number>) => {
      const chapter = state.items.find(
        (chapter) => chapter.id === action.payload
      );
      if (chapter) {
        chapter.completed = !chapter.completed;
      }
    },
    editEpubOptions: (
      state,
      action: PayloadAction<ChaptersState["epubOptions"]>
    ) => {
      state.epubOptions = action.payload;
    },
    deleteChapter: (state, action: PayloadAction<number>) => {
      state.items = state.items.filter(
        (chapter) => chapter.id !== action.payload
      );
    },

    editFormatArray: (state, action: PayloadAction<string[]>) => {
      state.formatArray = action.payload;
    },
    editAIResponse: (
      state,
      action: PayloadAction<ChaptersState["aiResponse"]>
    ) => {
      console.log("AI response:", action.payload);
      state.aiResponse = action.payload;
    },
  },
});

export const {
  addChapter,
  toggleChapter,
  deleteChapter,
  editFormatArray,
  editAIResponse,
} = chaptersSlice.actions;

export default chaptersSlice.reducer;
