/**
 * Đường dẫn quay lại sau khi đăng nhập (issue #8).
 *
 * User chưa login mở link private (vd /invite/abc) → RouteGuard đưa sang
 * `/auth?redirect=/invite/abc`. Login xong thì quay về đúng chỗ đó thay vì `/`.
 *
 * Google OAuth rời khỏi site rồi backend redirect cố định về `/auth/callback`,
 * nên query `?redirect=` bị mất trên đường đi → lưu tạm vào sessionStorage
 * trước khi rời trang và đọc lại ở callback.
 *
 * Giá trị redirect do user kiểm soát → MỌI chỗ đọc đều phải đi qua
 * `sanitizeReturnTo` để chặn open redirect.
 */

export const RETURN_TO_PARAM = "redirect";

const AUTH_PATH = "/auth";
const STORAGE_KEY = "auth:returnTo";
const MAX_LENGTH = 2048;
// Origin giả chỉ để parse — nếu kết quả đổi origin nghĩa là input trỏ ra ngoài
const PARSE_BASE = "http://return-to.invalid";

/**
 * Chỉ chấp nhận path tương đối cùng origin, trả về dạng đã chuẩn hoá hoặc null.
 *  - phải bắt đầu bằng đúng một `/` (không `//`, không `/\` → protocol-relative)
 *  - không có ký tự điều khiển (browser bỏ tab/newline → `/\t/evil.com` thành `//evil.com`)
 *  - không có `\` (browser coi như `/`)
 *  - phần path không chứa `:` (không có scheme kiểu `javascript:`)
 *  - parse lại phải giữ nguyên origin
 *  - không trỏ về /auth hoặc /auth/* (tránh vòng lặp)
 */
export function sanitizeReturnTo(raw: string | null | undefined): string | null {
  if (typeof raw !== "string") return null;
  if (raw.length === 0 || raw.length > MAX_LENGTH) return null;
  if (raw[0] !== "/" || raw[1] === "/" || raw[1] === "\\") return null;
  if (/[\u0000-\u001F\u007F]/.test(raw) || raw.includes("\\")) return null;
  if (raw.split(/[?#]/)[0].includes(":")) return null;

  let url: URL;
  try {
    url = new URL(raw, PARSE_BASE);
  } catch {
    return null;
  }
  if (url.origin !== PARSE_BASE) return null;
  if (url.pathname === AUTH_PATH || url.pathname.startsWith(`${AUTH_PATH}/`)) {
    return null;
  }

  return `${url.pathname}${url.search}${url.hash}`;
}

/** URL trang login kèm đường dẫn quay lại (nếu hợp lệ). */
export function buildLoginUrl(returnTo: string): string {
  const safe = sanitizeReturnTo(returnTo);
  if (!safe || safe === "/") return AUTH_PATH;
  return `${AUTH_PATH}?${RETURN_TO_PARAM}=${encodeURIComponent(safe)}`;
}

/** Đọc `?redirect=` từ query string (có hoặc không có dấu `?` đầu). */
export function readReturnToFromSearch(search: string): string | null {
  return sanitizeReturnTo(new URLSearchParams(search).get(RETURN_TO_PARAM));
}

/** Lưu trước khi rời site (OAuth). Giá trị không hợp lệ → xoá luôn bản cũ. */
export function saveReturnTo(returnTo: string | null): void {
  try {
    const safe = sanitizeReturnTo(returnTo);
    if (safe) sessionStorage.setItem(STORAGE_KEY, safe);
    else sessionStorage.removeItem(STORAGE_KEY);
  } catch {
    // sessionStorage bị chặn (private mode...) → chấp nhận về trang mặc định
  }
}

/** Đọc và xoá — chỉ dùng một lần sau khi login thành công. */
export function consumeReturnTo(): string | null {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    sessionStorage.removeItem(STORAGE_KEY);
    return sanitizeReturnTo(raw);
  } catch {
    return null;
  }
}

/** Đọc nhưng không xoá — dùng khi callback lỗi và cần quay lại /auth. */
export function peekReturnTo(): string | null {
  try {
    return sanitizeReturnTo(sessionStorage.getItem(STORAGE_KEY));
  } catch {
    return null;
  }
}
