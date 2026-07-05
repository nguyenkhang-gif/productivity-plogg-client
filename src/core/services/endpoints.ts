/* eslint-disable @typescript-eslint/no-duplicate-enum-values */
export enum Endpoints {
  EPUB_GET_USER_EPUB = "/epub/get-user-epub",

  STORY_CONTEXT_CREATE = "/story-contexts",
  STORY_CONTEXT_LIST = "/story-contexts",
  STORY_CONTEXT_GET_BY_ID = "/story-contexts/:id",
  STORY_CONTEXT_UPDATE = "/story-contexts/:id",
  STORY_CONTEXT_DELETE = "/story-contexts/:id",

  POST_CREATE = "/posts",
  POST_GET_ALL = "/posts",
  POST_GET_BY_ID = "/posts/:id",
  POST_GET_BY_AUTHOR = "/posts/author/:authorId",
  POST_UPDATE = "/posts/:id",
  POST_DELETE = "/posts/:id",
  POST_REACT = "/posts/:postId/react",
  POST_VIEW = "/posts/:id/view",
  POST_BOOKMARK = "/posts/:id/bookmark",
  POST_TRENDING = "/posts/trending",
  POST_MY_STATS = "/posts/stats/me",

  POST_MODERATION_PENDING = "/posts/moderation/pending",
  POST_APPROVE = "/posts/:id/approve",
  POST_REJECT = "/posts/:id/reject",
  ADMIN_POST_GET_ALL = "/admin/posts",
  ADMIN_POST_GET_BY_ID = "/admin/posts/:id",
  ADMIN_POST_DELETE = "/admin/posts/:id",
  USER_CHANGE_ROLE = "/users/:id/role",
  USER_GET_ALL = "/users",
  ADMIN_USER_GET_ALL = "/admin/users",

  COMMENT_GET_BY_POST = "/posts/:postId/comments",
  COMMENT_CREATE = "/posts/:postId/comments",
  COMMENT_UPDATE = "/posts/:postId/comments/:id",
  COMMENT_DELETE = "/posts/:postId/comments/:id",
}

export enum FetchQueryKeys {
  EPUB_GET_USER_EPUB = "EPUB_GET_USER_EPUB",

  STORY_CONTEXT_LIST = "STORY_CONTEXT_LIST",

  POST_GET_ALL = "POST_GET_ALL",
  POST_GET_BY_ID = "POST_GET_BY_ID",
  POST_GET_BY_AUTHOR = "POST_GET_BY_AUTHOR",
  POST_TRENDING = "POST_TRENDING",
  POST_MY_STATS = "POST_MY_STATS",
  POST_MODERATION_PENDING = "POST_MODERATION_PENDING",
  ADMIN_POST_GET_ALL = "ADMIN_POST_GET_ALL",
  ADMIN_POST_GET_BY_ID = "ADMIN_POST_GET_BY_ID",
  USER_GET_ALL = "USER_GET_ALL",
  ADMIN_USER_GET_ALL = "ADMIN_USER_GET_ALL",

  COMMENT_GET_BY_POST = "COMMENT_GET_BY_POST",

  FRIENDS = "FRIENDS",
  FRIENDSHIP_RECEIVED = "FRIENDSHIP_RECEIVED",
  FRIENDSHIP_SENT = "FRIENDSHIP_SENT",

  FOCUS_PROGRESS = "FOCUS_PROGRESS",
  FOCUS_REPORT = "FOCUS_REPORT",
}
