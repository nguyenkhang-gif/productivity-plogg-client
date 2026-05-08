/* eslint-disable @typescript-eslint/no-duplicate-enum-values */
export enum Endpoints {
  EPUB_GET_USER_EPUB = "/epub/get-user-epub",

  POST_CREATE = "/posts",
  POST_GET_ALL = "/posts",
  POST_GET_BY_ID = "/posts/:id",
  POST_GET_BY_AUTHOR = "/posts/author/:authorId",
  POST_UPDATE = "/posts/:id",
  POST_DELETE = "/posts/:id",

  COMMENT_GET_BY_POST = "/posts/:postId/comments",
  COMMENT_CREATE = "/posts/:postId/comments",
  COMMENT_UPDATE = "/posts/:postId/comments/:id",
  COMMENT_DELETE = "/posts/:postId/comments/:id",
}

export enum FetchQueryKeys {
  EPUB_GET_USER_EPUB = "EPUB_GET_USER_EPUB",

  POST_GET_ALL = "POST_GET_ALL",
  POST_GET_BY_ID = "POST_GET_BY_ID",
  POST_GET_BY_AUTHOR = "POST_GET_BY_AUTHOR",

  COMMENT_GET_BY_POST = "COMMENT_GET_BY_POST",
}
