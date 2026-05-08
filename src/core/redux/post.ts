import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export interface PostAuthor {
  id: string;
  fullName: string;
  username: string;
  profilePic?: string;
}

export interface Post {
  id: string;
  authorId: string;
  author: PostAuthor;
  content: string;
  imageUrls: string[];
  likesCount: number;
  commentCount: number;
  isPublished: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface PostState {
  posts: Post[];
  hasMore: boolean;
  selectedPost: Post | null;
}

const initialPostState: PostState = {
  posts: [],
  hasMore: true,
  selectedPost: null,
};

const postSlice = createSlice({
  name: "post",
  initialState: initialPostState,
  reducers: {
    setPosts: (state, action: PayloadAction<Post[]>) => {
      state.posts = action.payload;
    },
    appendPosts: (state, action: PayloadAction<{ posts: Post[]; hasMore: boolean }>) => {
      const existingIds = new Set(state.posts.map((p) => p.id));
      const newPosts = action.payload.posts.filter((p) => !existingIds.has(p.id));
      state.posts.push(...newPosts);
      state.hasMore = action.payload.hasMore;
    },
    addPost: (state, action: PayloadAction<Post>) => {
      state.posts.unshift(action.payload);
    },
    updatePost: (state, action: PayloadAction<Post>) => {
      const index = state.posts.findIndex((p) => p.id === action.payload.id);
      if (index !== -1) state.posts[index] = action.payload;
    },
    removePost: (state, action: PayloadAction<string>) => {
      state.posts = state.posts.filter((p) => p.id !== action.payload);
    },
    setSelectedPost: (state, action: PayloadAction<Post | null>) => {
      state.selectedPost = action.payload;
    },
    resetPosts: (state) => {
      state.posts = [];
      state.hasMore = true;
    },
  },
});

export const {
  setPosts,
  appendPosts,
  addPost,
  updatePost,
  removePost,
  setSelectedPost,
  resetPosts,
} = postSlice.actions;

export default postSlice.reducer;
