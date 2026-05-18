# Hướng dẫn tích hợp Google OAuth (Frontend)

## Tổng quan flow

```
User bấm "Đăng nhập Google"
  → FE redirect tới GET /api/auth/google
  → Backend redirect sang Google consent screen
  → User chấp nhận → Google redirect về /api/auth/google/callback
  → Backend tạo/tìm user, ký JWT
  → Backend redirect về FRONTEND_URL/auth/callback?token=<jwt>
  → FE đọc token từ URL, lưu vào storage, redirect về trang chủ
```

---

## Bước 1 — Nút "Đăng nhập bằng Google"

Không dùng `fetch`/`axios` cho bước này — phải là **hard redirect** để trình duyệt theo cookie/session của Google.

```tsx
// Ví dụ trong LoginPage hoặc component bất kỳ
const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL; // http://localhost:8000

function GoogleLoginButton() {
  const handleGoogleLogin = () => {
    window.location.href = `${BACKEND_URL}/api/auth/google`;
  };

  return (
    <button onClick={handleGoogleLogin}>
      Đăng nhập bằng Google
    </button>
  );
}
```

---

## Bước 2 — Trang callback `/auth/callback`

Tạo file `src/app/auth/callback/page.tsx`. Trang này đọc `?token=...` từ URL, lưu token, rồi redirect.

```tsx
'use client';

import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

export default function AuthCallbackPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const token = searchParams.get('token');

    if (!token) {
      router.replace('/login?error=google_failed');
      return;
    }

    // Lưu token — dùng cùng key với login thường
    localStorage.setItem('access_token', token);

    // Nếu dùng Redux, dispatch action set token ở đây
    // dispatch(setToken(token));

    router.replace('/posts');
  }, [router, searchParams]);

  return <p>Đang xử lý đăng nhập...</p>;
}
```

---

## Bước 3 — Đọc token khi gọi API

Token Google OAuth có cùng format JWT với login thường — không cần xử lý khác biệt. Dùng header `Authorization: Bearer <token>` như bình thường.

```ts
const token = localStorage.getItem('access_token');

const res = await fetch(`${BACKEND_URL}/api/auth/profile`, {
  headers: {
    Authorization: `Bearer ${token}`,
  },
});
```

---

## Env variable cần có ở FE

```env
NEXT_PUBLIC_BACKEND_URL=http://localhost:8000
```

Production:
```env
NEXT_PUBLIC_BACKEND_URL=https://your-backend-domain.com
```

---

## Lưu ý

| Vấn đề | Giải thích |
|--------|------------|
| Google user không có `passwordHash` | Bình thường — backend tạo user với `passwordHash: ''`. Không cho phép đổi password nếu `googleId` có giá trị (handle ở FE/BE riêng nếu cần). |
| `gender` mặc định là `'other'` | Google không cung cấp gender. User có thể cập nhật sau qua `PATCH /api/auth/profile`. |
| `username` tự động | Backend tạo dạng `ten_nguoi_dung_1234`. User có thể đổi sau. |
| Đăng nhập lại bằng Google | Nếu email đã tồn tại (đăng ký thường), backend sẽ **link** `googleId` vào account cũ — không tạo account mới. |

---

## API Reference

### `GET /api/auth/google`
Redirect sang Google consent screen. Không cần body hay header.

### `GET /api/auth/google/callback`
Google gọi endpoint này sau khi user chấp nhận. Backend xử lý nội bộ và redirect về:
```
{FRONTEND_URL}/auth/callback?token=<jwt>
```

### `GET /api/auth/profile` _(có JWT)_
Lấy thông tin user hiện tại. Dùng cùng token từ Google OAuth.

```http
GET /api/auth/profile
Authorization: Bearer <token>
```

Response:
```json
{
  "id": "...",
  "fullName": "Nguyễn Văn A",
  "username": "nguyen_van_a_4821",
  "email": "a@gmail.com",
  "profilePic": "https://...",
  "googleId": "1234567890",
  "role": "user",
  "membership": "basic"
}
```
