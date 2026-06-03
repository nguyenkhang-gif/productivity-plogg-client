# Rolling Context Feature — Implementation Plan

**Status:** Planning  
**Date:** 2026-06-03  
**Scope:** Tích hợp rolling/cuốn chiếu Gemini processing vào `/epub` page, gọi `/api/gemini`

---

## 1. Overview

Port logic từ Node.js script `rolling.mjs` sang browser UI. User đã extract chapters xong → chuyển sang tab **Rolling Context** để chạy batches qua Gemini AI, tích lũy JSON context qua nhiều vòng.

**Không cần thêm API route** — dùng thẳng `/api/gemini` hiện có (POST `{ prompt, apiKey?, systemInstruction? }` → `{ text }`).

---

## 2. Mapping Script → Browser

| Script (Node.js) | Browser |
|---|---|
| `state.json` (nextChapter) | React state + localStorage |
| `context.json` (accumulated JSON) | React state + localStorage |
| `prompt.txt` | Textarea trong UI |
| `THRESHOLD` env arg | Number input (default 65000) |
| `fs.readFileSync(chapter)` | `chapters[i].text` từ `useEpubExtractor` |
| `process.env.GEMINI_API_KEY` | Server key qua `/api/gemini` (hoặc user nhập key riêng) |
| `--reset` flag | Reset button |
| `printSummary()` | Batch preview panel tự động update |
| `runRolling()` | `run()` trong hook |
| 15s delay giữa vòng | `setTimeout(15_000)` + countdown UI |

---

## 3. New Files

### `src/core/hooks/epub/useRollingContext.ts`

Hook chứa toàn bộ logic rolling. Page chỉ render UI.

**State:**
```ts
interface RollingState {
  nextChapter: number;        // 1-based, map sang chapters[].index
  context: string | null;     // JSON string tích lũy
  status: 'idle' | 'running' | 'paused' | 'done' | 'error';
  round: number;
  error: string | null;
  log: RoundLog[];
}

interface RoundLog {
  round: number;
  from: string;   // "chapter_1"
  to: string;     // "chapter_14"
  count: number;
  words: number;
  status: 'ok' | 'error';
}
```

**Config (passed từ page):**
```ts
interface RollingConfig {
  basePrompt: string;
  threshold: number;   // default 65000
  apiKey: string;      // optional, dùng server key nếu rỗng
}
```

**Functions ported từ script:**

```ts
// Đếm words — giống script
function countWords(text: string): number {
  return text.trim().split(/\s+/).length;
}

// Build batch: greedy fill đến threshold
function buildBatch(
  chapters: ExtractedChapter[],
  nextChapter: number,
  basePrompt: string,
  context: string | null,
  threshold: number
): { batch: ExtractedChapter[]; totalWords: number }

// Build prompt string gửi đến API
function buildPrompt(
  basePrompt: string,
  context: string | null,
  batch: ExtractedChapter[]
): string  // prepend context block nếu có, append chapter texts

// Extract JSON từ raw response — giống script
function extractJson(text: string): string | null {
  const start = text.indexOf("{");
  const end = text.lastIndexOf("}");
  if (start === -1 || end === -1) return null;
  try { JSON.parse(text.slice(start, end + 1)); return text.slice(start, end + 1); }
  catch { return null; }
}
```

**Exposed API:**
```ts
return {
  state,
  run,       // bắt đầu/tiếp tục từ nextChapter hiện tại
  abort,     // dừng giữa chừng, giữ nguyên state (có thể resume)
  reset,     // xóa state + localStorage
  batchPreview,  // { count, totalWords, budget } cho batch kế tiếp
};
```

**Persistence:** `localStorage` key = `epub_rolling_${fileName}` → save `{ nextChapter, context }` sau mỗi vòng thành công.

**Token:** `useSelector(state => state.user.token)` → gửi trong `Authorization: Bearer {token}` header.

**AbortController:** tạo mới mỗi lần `run()`, cancel khi `abort()`, status → `'paused'`.

---

## 4. Modified Files

### `src/app/epub/page.tsx`

Thêm tab switcher vào `status === "done"` section:

```
[ Chapters ]  [ Rolling Context ]
```

**Rolling Context tab layout:**

```
┌─ Config ─────────────────────────────────────────┐
│  Base Prompt:                                     │
│  ┌─────────────────────────────────────────────┐ │
│  │ [textarea — resizable, 8 rows]              │ │
│  └─────────────────────────────────────────────┘ │
│  Threshold: [65000]   API Key (opt): [_________] │
└──────────────────────────────────────────────────┘

┌─ Batch Preview ──────────────────────────────────┐
│  Next: chapter 5    Remaining: 189               │
│  Batch: 12 chapters · 43,200 words               │
│  Budget: 61,800 / 65,000 words                   │
└──────────────────────────────────────────────────┘

[▶ Run]  [■ Abort]  [↺ Reset]
Round 3 · running...  (next batch in 12s)

┌─ Log ────────────────────────────────────────────┐
│  ✓ Round 1  ch1→ch14   14 chap  42,100 words     │
│  ✓ Round 2  ch15→ch27  13 chap  39,800 words     │
│  ⟳ Round 3  ch28→...   running                   │
└──────────────────────────────────────────────────┘

┌─ Accumulated Context ────────────────────────────┐
│  { "characters": [...], "plot": "..." }          │
│                              [Copy]  [Download]  │
└──────────────────────────────────────────────────┘
```

---

## 5. Error Handling

| Case | Xử lý |
|---|---|
| `batch.length === 0` | Error: "Budget too small for next chapter — increase threshold" |
| API trả về lỗi 429 | Show rate limit message + resetAt time |
| Response không có JSON | Status → `'error'`, show raw text để user debug |
| Network error | Status → `'error'`, user có thể retry (giữ nguyên nextChapter) |
| Token hết hạn / 401 | Redirect login hoặc yêu cầu nhập apiKey |

---

## 6. Implementation Phases

### Phase 1 — Hook
- [ ] `useRollingContext.ts` — state, localStorage persistence, `run()`, `abort()`, `reset()`
- [ ] `buildBatch()`, `buildPrompt()`, `extractJson()`, `countWords()` utils

### Phase 2 — Page UI
- [ ] Tab switcher (Chapters / Rolling Context)
- [ ] Config section (prompt textarea, threshold, apiKey)
- [ ] Batch preview (auto-updates khi config thay đổi)
- [ ] Run/Abort/Reset controls + round status
- [ ] Log panel
- [ ] Context output panel (Copy + Download .json)

---

## 7. Out of Scope

- Streaming response (API hiện tại dùng `generateContent` không phải `streamGenerateContent`)
- Lưu context lên server/database
- Multi-file queue (xử lý nhiều EPUB liên tiếp)
