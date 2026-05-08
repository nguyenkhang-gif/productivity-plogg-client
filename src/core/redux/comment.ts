import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export interface CommentAuthor {
  id: string;
  fullName: string;
  username: string;
}

export interface Comment {
  id: string;
  postId: string;
  content: string;
  authorId: string;
  author: CommentAuthor;
  createdAt: string;
  updatedAt: string;
}

export interface CommentState {
  // key = postId, value = danh sách comment của post đó
  byPostId: Record<string, Comment[]>;
  hasMoreByPostId: Record<string, boolean>;
}

const initialState: CommentState = {
  byPostId: {},
  hasMoreByPostId: {},
};

const commentSlice = createSlice({
  name: "comment",
  initialState,
  reducers: {
    setComments: (
      state,
      action: PayloadAction<{ postId: string; comments: Comment[]; hasMore: boolean }>
    ) => {
      state.byPostId[action.payload.postId] = action.payload.comments;
      state.hasMoreByPostId[action.payload.postId] = action.payload.hasMore;
    },
    appendComments: (
      state,
      action: PayloadAction<{ postId: string; comments: Comment[]; hasMore: boolean }>
    ) => {
      const { postId, comments, hasMore } = action.payload;
      const existing = state.byPostId[postId] ?? [];
      const existingIds = new Set(existing.map((c) => c.id));
      const newComments = comments.filter((c) => !existingIds.has(c.id));
      state.byPostId[postId] = [...existing, ...newComments];
      state.hasMoreByPostId[postId] = hasMore;
    },
    addComment: (state, action: PayloadAction<Comment>) => {
      const { postId } = action.payload;
      state.byPostId[postId] = [action.payload, ...(state.byPostId[postId] ?? [])];
    },
    updateComment: (state, action: PayloadAction<Comment>) => {
      const { postId, id } = action.payload;
      const list = state.byPostId[postId];
      if (!list) return;
      const idx = list.findIndex((c) => c.id === id);
      if (idx !== -1) list[idx] = action.payload;
    },
    removeComment: (
      state,
      action: PayloadAction<{ postId: string; commentId: string }>
    ) => {
      const { postId, commentId } = action.payload;
      const list = state.byPostId[postId];
      if (!list) return;
      state.byPostId[postId] = list.filter((c) => c.id !== commentId);
    },
    clearComments: (state, action: PayloadAction<string>) => {
      delete state.byPostId[action.payload];
      delete state.hasMoreByPostId[action.payload];
    },
  },
});

export const {
  setComments,
  appendComments,
  addComment,
  updateComment,
  removeComment,
  clearComments,
} = commentSlice.actions;

export default commentSlice.reducer;
