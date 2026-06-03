export interface PostAuthor {
  id: string;
  fullName: string;
  username: string;
  profilePic?: string;
}

export type ReactionType = "like" | "love" | "haha" | "wow" | "sad" | "angry";

export interface UserReaction {
  type: ReactionType;
  icon?: string;
}

export interface Post {
  id: string;
  authorId: string;
  author: PostAuthor;
  content: string;
  imageUrls: string[];
  reactCount: number;
  commentCount: number;
  isPublished: boolean;
  createdAt: string;
  updatedAt: string;
  userReaction: UserReaction | null;
}
