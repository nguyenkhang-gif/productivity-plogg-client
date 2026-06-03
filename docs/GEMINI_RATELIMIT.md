# Gemini API Route — Rate Limiting Design

## Tổng quan

Route `POST /api/gemini` proxy request đến Google Gemini API với 2 chế độ:

| Chế độ | Điều kiện | Rate limit |
|---|---|---|
| **Custom key** | Body có `apiKey` | Không giới hạn |
| **Server key** | Không có `apiKey` | 20 req / 24h / user |

---

## Request

```json
POST /api/gemini
Authorization: Bearer <access_token>   // bắt buộc nếu không có apiKey

{
  "prompt": "Nội dung câu hỏi",
  "apiKey": "AIza...",          // optional — key riêng của user
  "systemInstruction": "..."    // optional
}
```

## Response

```json
// 200 OK
{ "text": "Gemini trả lời..." }

// 401 — không có Authorization header hoặc token không hợp lệ
{ "error": "Unauthorized" }

// 429 — vượt giới hạn
{
  "error": "Rate limit exceeded",
  "limit": 20,
  "remaining": 0,
  "resetAt": "2026-06-04T12:00:00.000Z"
}
```

---

## Flow

```
Request đến /api/gemini
    │
    ├─ Có apiKey trong body?
    │   YES → call Gemini với key đó → trả kết quả
    │         (không check Redis, không gọi /auth/profile)
    │
    └─ NO
        ├─ GET /auth/profile (forward Authorization header)
        │   Fail → 401
        │   OK   → lấy profile.id làm userId
        │
        ├─ Redis: INCR fe:rl:gemini:{userId}
        │   Key mới → SET EXPIRE 86400s (24h)
        │   count > 20 → 429
        │   Redis down → log warning, cho qua (fail open)
        │
        └─ Call Gemini với GEMINI_API_KEY của server → trả kết quả
```

---

## Redis Key

```
Key:   fe:rl:gemini:{userId}
Value: integer (số lần đã gọi trong window hiện tại)
TTL:   86400 giây (24 giờ từ lần gọi đầu tiên)
```

## Environment Variables

```
GEMINI_API_KEY=...       # Server Gemini key
REDIS_URL=redis://...    # Redis connection string
NEXT_PUBLIC_API_URL=...  # BE URL để gọi /auth/profile
```

---

## Edge Cases

| Tình huống | Xử lý |
|---|---|
| Redis down | Fail open — cho request qua, log warning |
| Token hết hạn | `/auth/profile` trả 401 → route trả 401 |
| apiKey user sai | Gemini trả lỗi → pass-through về client |
| Gọi đúng lần thứ 21 | 429 |
| Không có Authorization header | 401 |
