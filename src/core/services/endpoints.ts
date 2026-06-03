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

  COMMENT_GET_BY_POST = "COMMENT_GET_BY_POST",

  FRIENDS = "FRIENDS",
  FRIENDSHIP_RECEIVED = "FRIENDSHIP_RECEIVED",
  FRIENDSHIP_SENT = "FRIENDSHIP_SENT",
}
