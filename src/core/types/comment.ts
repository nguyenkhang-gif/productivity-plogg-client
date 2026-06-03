export interface CommentAuthor {
  id: string;
  fullName: string;
  username: string;
  profilePic?: string;
}

export interface Comment {
  id: string;
  postId: string;
  content: string;
  iconUrl?: string;
  authorId: string;
  author: CommentAuthor;
  createdAt: string;
  updatedAt: string;
}
