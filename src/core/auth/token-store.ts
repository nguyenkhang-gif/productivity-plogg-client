// access_token ở trong memory — mất khi reload (restoreSession sẽ refresh lại)
// refresh_token ở localStorage — sống 7 ngày
let _accessToken: string | null = null;

export const tokenStore = {
  getAccess: () => _accessToken,

  getRefresh: (): string | null => {
    if (typeof window === "undefined") return null;
    return localStorage.getItem("refresh_token");
  },

  save: (accessToken: string, refreshToken: string) => {
    _accessToken = accessToken;
    if (typeof window !== "undefined") {
      localStorage.setItem("refresh_token", refreshToken);
    }
  },

  clear: () => {
    _accessToken = null;
    if (typeof window !== "undefined") {
      localStorage.removeItem("refresh_token");
    }
  },
};
