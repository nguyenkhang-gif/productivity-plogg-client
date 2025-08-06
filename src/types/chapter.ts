interface Chapter {
  id: number;
  text: string;
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
}
