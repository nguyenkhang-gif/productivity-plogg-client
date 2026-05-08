export const useConstants = () => {
  const Post = {
    COLLAPSE_THRESHOLD: 300, // ký tự tối đa trước khi hiện "Xem thêm"
    PAGE_LIMIT: 10,          // số bài mỗi trang
    MAX_IMAGES: 4,           // số ảnh hiển thị tối đa trong 1 post
  };

  const Auth = {
    TOKEN_KEY: "token",
    REDIRECT_AUTHED: "/",
    REDIRECT_GUEST: "/auth",
  };

  const Pagination = {
    DEFAULT_LIMIT: 10,
    DEFAULT_PAGE: 1,
  };

  return { Post, Auth, Pagination };
};
