export enum PostCategory {
  Note = "note",
  Achievement = "achievement",
  Question = "question",
  Tutorial = "tutorial",
}

export enum ReactionType {
  Like = "like",
  Love = "love",
  Haha = "haha",
  Wow = "wow",
  Sad = "sad",
  Angry = "angry",
}

export enum FriendshipStatus {
  Pending = "pending",
  Accepted = "accepted",
  Blocked = "blocked",
}

export enum SortOrder {
  RecentlyEdited = "recently-edited",
  Newest = "newest",
  Oldest = "oldest",
}

export enum UploadProvider {
  Default = "default",
  Cloudinary = "cloudinary",
}

export enum PostVisibility {
  Public = "PUBLIC",
  Friends = "FRIENDS",
  Private = "PRIVATE",
}

export enum UserRole {
  User = "user",
  Moderator = "moderator",
  Admin = "admin",
}

export enum PostModerationStatus {
  Approved = "APPROVED",
  Pending = "PENDING",
  Rejected = "REJECTED",
}
