# Frontend Auth Integration Guide

> Cập nhật: 2026-06-03 | Backend branch: `work`

---

## Tổng quan

Backend dùng **2 token**:

| Token | Sống bao lâu | Lưu ở đâu | Dùng để |
|---|---|---|---|
| `access_token` | 15 phút (JWT) | Memory (JS variable) | Gửi kèm mọi API request |
| `refresh_token` | 7 ngày (UUID, Redis) | `localStorage` | Xin `access_token` mới khi hết hạn |

**Rotation**: Mỗi lần gọi `/api/auth/refresh`, `refresh_token` cũ bị xóa ngay và server trả về một `refresh_token` mới. Mỗi token chỉ dùng được **1 lần**.

---

## API Reference

### `POST /api/auth/register`

**Request**
```json
{
  "email": "khang@example.com",
  "password": "secret123",
  "fullName": "Nguyễn Khang"
}
```

**Response `201`**
```json
{
  "id": "664f1a2b3c4d5e6f7a8b9c0d",
  "email": "khang@example.com",
  "fullName": "Nguyễn Khang",
  "role": "user"
}
```

---

### `POST /api/auth/login`

**Request**
```json
{
  "email": "khang@example.com",
  "password": "secret123"
}
```

**Response `200`**
```json
{
  "access_token": "eyJhbGci...",
  "refresh_token": "550e8400-e29b-41d4-a716-446655440000"
}
```

**Errors**
| Status | Ý nghĩa |
|---|---|
| `401` | Sai email hoặc password |

---

### `POST /api/auth/refresh`

Dùng khi `access_token` hết hạn. Không cần `Authorization` header.

> **Quan trọng**: Sau khi gọi endpoint này, `refresh_token` cũ **không còn dùng được nữa**. Phải lưu `refresh_token` mới ngay lập tức.

**Request**
```json
{
  "refresh_token": "550e8400-e29b-41d4-a716-446655440000"
}
```

**Response `200`**
```json
{
  "access_token": "eyJhbGci...",
  "refresh_token": "7a8b9c0d-e29b-41d4-a716-112233445566"
}
```

**Errors**
| Status | Ý nghĩa |
|---|---|
| `401` | Token không hợp lệ, đã dùng rồi, hoặc hết 7 ngày → bắt buộc login lại |

---

### `POST /api/auth/logout`

**Headers**
```
Authorization: Bearer <access_token>
```

**Request**
```json
{
  "refresh_token": "550e8400-e29b-41d4-a716-446655440000"
}
```

**Response `200`**
```json
{
  "message": "Logged out successfully"
}
```

> Nên gửi cả hai. Nếu thiếu `refresh_token`: access token vẫn bị blacklist nhưng refresh token sống đến khi hết 7 ngày.

---

### `GET /api/auth/profile`

**Headers**
```
Authorization: Bearer <access_token>
```

**Response `200`**
```json
{
  "id": "664f1a2b3c4d5e6f7a8b9c0d",
  "email": "khang@example.com",
  "fullName": "Nguyễn Khang",
  "role": "user",
  "profilePic": "https://..."
}
```

---

### `GET /api/auth/google`

Redirect browser đến Google OAuth. Không gọi bằng `fetch` — dùng `window.location.href`.

```ts
window.location.href = 'http://localhost:8000/api/auth/google';
```

Sau khi Google xác thực xong, server redirect về:
```
http://localhost:3000/auth/callback?token=<access_token>&refresh_token=<refresh_token>
```

---

## JWT Payload

Decode `access_token` để lấy thông tin user mà không cần gọi API:

```ts
import { jwtDecode } from 'jwt-decode';

const { sub: userId, email, role, exp } = jwtDecode<{
  sub: string;
  email: string;
  role: string;
  exp: number;
}>(accessToken);
```

---

## Implementation

### Bước 1 — Token store

```ts
// auth/token-store.ts
let _accessToken: string | null = null;

export const tokenStore = {
  getAccess: () => _accessToken,
  getRefresh: () => localStorage.getItem('refresh_token'),

  save: (accessToken: string, refreshToken: string) => {
    _accessToken = accessToken;
    localStorage.setItem('refresh_token', refreshToken);
  },

  clear: () => {
    _accessToken = null;
    localStorage.removeItem('refresh_token');
  },
};
```

---

### Bước 2 — Axios instance với interceptors

```ts
// auth/api-client.ts
import axios from 'axios';
import { tokenStore } from './token-store';

export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? 'http://localhost:8000',
});

// Gắn access token vào mọi request
apiClient.interceptors.request.use((config) => {
  const token = tokenStore.getAccess();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Tự động refresh khi nhận 401
let isRefreshing = false;
let queue: Array<{ resolve: (token: string) => void; reject: (err: unknown) => void }> = [];

apiClient.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original = error.config;

    if (error.response?.status !== 401 || original._retry) {
      return Promise.reject(error);
    }

    // Nhiều request cùng nhận 401 → chỉ refresh 1 lần, các request còn lại xếp hàng chờ
    if (isRefreshing) {
      return new Promise<string>((resolve, reject) => {
        queue.push({ resolve, reject });
      }).then((newToken) => {
        original.headers.Authorization = `Bearer ${newToken}`;
        return apiClient(original);
      });
    }

    original._retry = true;
    isRefreshing = true;

    try {
      const refreshToken = tokenStore.getRefresh();
      if (!refreshToken) throw new Error('no_refresh_token');

      const { data } = await axios.post(
        `${import.meta.env.VITE_API_URL ?? 'http://localhost:8000'}/api/auth/refresh`,
        { refresh_token: refreshToken },
      );

      // Lưu cả hai token mới (rotation)
      tokenStore.save(data.access_token, data.refresh_token);

      queue.forEach(({ resolve }) => resolve(data.access_token));
      queue = [];

      original.headers.Authorization = `Bearer ${data.access_token}`;
      return apiClient(original);
    } catch (err) {
      queue.forEach(({ reject }) => reject(err));
      queue = [];
      tokenStore.clear();
      window.location.href = '/login';
      return Promise.reject(err);
    } finally {
      isRefreshing = false;
    }
  },
);
```

---

### Bước 3 — Auth functions

```ts
// auth/auth.ts
import axios from 'axios';
import { apiClient } from './api-client';
import { tokenStore } from './token-store';

const BASE = import.meta.env.VITE_API_URL ?? 'http://localhost:8000';

export async function login(email: string, password: string) {
  const { data } = await axios.post(`${BASE}/api/auth/login`, { email, password });
  tokenStore.save(data.access_token, data.refresh_token);
}

export async function logout() {
  try {
    await apiClient.post('/api/auth/logout', {
      refresh_token: tokenStore.getRefresh(),
    });
  } finally {
    // Xóa token dù server có lỗi
    tokenStore.clear();
    window.location.href = '/login';
  }
}

// Gọi khi app khởi động để khôi phục session sau khi reload trang
export async function restoreSession(): Promise<boolean> {
  const refreshToken = tokenStore.getRefresh();
  if (!refreshToken) return false;

  try {
    const { data } = await axios.post(`${BASE}/api/auth/refresh`, {
      refresh_token: refreshToken,
    });
    tokenStore.save(data.access_token, data.refresh_token);
    return true;
  } catch {
    tokenStore.clear();
    return false;
  }
}
```

---

### Bước 4 — Khởi động app

```ts
// main.ts / App.tsx
import { restoreSession } from './auth/auth';

async function bootstrap() {
  const isAuthenticated = await restoreSession();

  if (!isAuthenticated && requiresAuth(window.location.pathname)) {
    window.location.href = '/login';
    return;
  }

  // render app
}

bootstrap();
```

---

### Bước 5 — Google OAuth callback

```ts
// pages/auth/callback.ts
import { tokenStore } from '@/auth/token-store';

export function handleOAuthCallback() {
  const params = new URLSearchParams(window.location.search);
  const accessToken = params.get('token');
  const refreshToken = params.get('refresh_token');

  if (!accessToken || !refreshToken) {
    window.location.href = '/login';
    return;
  }

  tokenStore.save(accessToken, refreshToken);

  // Xóa token khỏi URL (tránh lộ trong browser history / server logs)
  window.history.replaceState({}, '', '/');

  window.location.href = '/';
}
```

---

## Flow diagram

```
App khởi động
  └─ restoreSession()
       ├─ Có refresh_token trong localStorage?
       │    ├─ Có → POST /api/auth/refresh → lưu cặp token mới → vào app
       │    └─ Không → redirect /login
       └─ /api/auth/refresh trả 401 → clearTokens → redirect /login

Gọi API bất kỳ
  └─ Gửi kèm access_token (interceptor tự gắn)
       ├─ 200 → bình thường
       └─ 401 → interceptor bắt
              ├─ isRefreshing = true
              ├─ POST /api/auth/refresh
              │    ├─ 200 → lưu cặp token mới → retry request gốc
              │    └─ 401 → clearTokens → redirect /login
              └─ Các request 401 đồng thời → xếp hàng chờ, không refresh thêm

Logout
  └─ POST /api/auth/logout (gửi cả access + refresh token)
       └─ clearTokens → redirect /login
```

---

## Edge cases

| Tình huống | Xử lý |
|---|---|
| `refresh_token` hết hạn (7 ngày) | `/refresh` trả `401` → `clearTokens()` → redirect login |
| `refresh_token` đã dùng (rotation) | `/refresh` trả `401` → xử lý như trên |
| Nhiều tab cùng nhận `401` | `isRefreshing` + `queue` — chỉ refresh đúng 1 lần |
| Reload trang | `restoreSession()` chạy lúc boot, tự lấy lại `access_token` |
| Logout tab A, tab B còn access token | Tab B dùng được tối đa 15 phút nữa (đến khi JWT hết hạn) |
| Mạng chập, `/refresh` timeout | Lỗi bị throw → `clearTokens()` → redirect login (safe failure) |
