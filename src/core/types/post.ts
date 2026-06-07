import { PostCategory, ReactionType } from "@/core/enums";

export type { PostCategory, ReactionType };

export interface PostAuthor {
  id: string;
  fullName: string;
  username: string;
  profilePic?: string;
}

export interface UserReaction {
  type: ReactionType;
  icon?: string;
}

export interface PostTag {
  id: string;
  name: string;
  slug: string;
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
  tags?: (string | PostTag)[];
  viewCount?: number;
  isBookmarked?: boolean;
  category?: PostCategory;
}
