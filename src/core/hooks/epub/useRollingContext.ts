"use client";

import { useState, useCallback, useRef, useMemo } from "react";
import { useSelector } from "react-redux";
import { RootState } from "@/core/redux/store";
import type { ExtractedChapter } from "@/core/lib/epub/extractChapters";

const DEFAULT_PROMPT = `Bạn là chuyên gia phân tích văn bản dịch thuật. Đọc đoạn truyện đã dịch dưới đây và trích xuất toàn bộ thông tin ngữ cảnh cần thiết cho các lần dịch sau.

Yêu cầu: Chỉ trả về JSON thuần túy, không giải thích, không markdown code block.

Cấu trúc JSON cần xuất:
{
  "title": "tên truyện nếu đoán được",
  "genre": "thể loại (action/romance/fantasy/...)",
  "setting": "mô tả bối cảnh thế giới",
  "targetTone": "giọng văn tổng thể",
  "sourceLanguage": "en",
  "targetLanguage": "vi",
  "characters": [
    {
      "name": "tên gốc",
      "vietnameseName": "tên tiếng Việt nếu có",
      "role": "main/support/villain",
      "personality": "mô tả tính cách dựa trên cách nói chuyện và hành động",
      "speechStyle": "đặc điểm cách nói: ngắn/dài, hay dùng từ gì, cảm xúc thế nào",
      "honorific": "cách xưng hô: tao/mày, anh/em, ta/ngươi...",
      "note": "quirk đặc biệt nếu có"
    }
  ],
  "glossary": [
    {
      "original": "thuật ngữ tiếng Anh",
      "translation": "cách đã dịch trong đoạn văn",
      "note": "giải thích nếu cần"
    }
  ],
  "styleGuide": {
    "formality": "casual/semi-formal/formal",
    "keepHonorifics": true,
    "keepOriginalNames": true,
    "chapterLabel": "Chương/Chapter",
    "extraNotes": "nhận xét về phong cách dịch đặc biệt"
  },
  "chapterSummaries": [
    {
      "chapterNumber": 0,
      "summary": "tóm tắt 3-5 câu nội dung chính đoạn văn này"
    }
  ]
}

=== NỘI DUNG ĐÃ DỊCH ===`;

export interface RoundLog {
  round: number;
  from: string;
  to: string;
  count: number;
  words: number;
  status: "ok" | "error";
  error?: string;
}

interface RollingState {
  nextChapter: number;
  context: string | null;
  status: "idle" | "running" | "paused" | "done" | "error";
  round: number;
  error: string | null;
  log: RoundLog[];
  countdown: number;
  streamingText: string;
}

export interface RollingConfig {
  basePrompt: string;
  threshold: number;
  apiKey: string;
}

export interface BatchPreview {
  count: number;
  totalWords: number;
  budget: number;
  firstTitle: string;
  lastTitle: string;
  overhead: number;
}

// ── pure utils (mirrored from Node.js script) ──────────────────────────────

function countWords(text: string): number {
  return text.trim().split(/\s+/).length;
}

function buildBatch(
  chapters: ExtractedChapter[],
  nextChapter: number,
  basePrompt: string,
  context: string | null,
  threshold: number
): { batch: ExtractedChapter[]; totalWords: number } {
  const overhead = countWords(basePrompt) + (context ? countWords(context) : 0);
  const budget = threshold - overhead;

  const remaining = chapters.filter((c) => c.index >= nextChapter);
  let total = 0;
  const batch: ExtractedChapter[] = [];

  for (const ch of remaining) {
    const words = ch.wordCount;
    if (total + words > budget) break;
    total += words;
    batch.push(ch);
  }

  return { batch, totalWords: total };
}

function buildPrompt(
  basePrompt: string,
  context: string | null,
  batch: ExtractedChapter[]
): string {
  let prompt = basePrompt;

  if (context) {
    prompt =
      "Dưới đây là ngữ cảnh đã trích xuất từ các chương trước. Hãy cập nhật và bổ sung thêm thông tin từ các chương mới, giữ nguyên cấu trúc JSON.\n\n" +
      "=== NGỮ CẢNH ĐÃ TRÍCH XUẤT ===\n" +
      context +
      "\n\n" +
      basePrompt;
  }

  return prompt + "\n\n" + batch.map((c) => c.text).join("\n\n");
}

function extractJson(text: string): string | null {
  const start = text.indexOf("{");
  const end = text.lastIndexOf("}");
  if (start === -1 || end === -1) return null;
  const candidate = text.slice(start, end + 1);
  try {
    JSON.parse(candidate);
    return candidate;
  } catch {
    return null;
  }
}

function storageKey(fileName: string): string {
  return `epub_rolling_${fileName}`;
}

function loadFromStorage(fileName: string): Partial<RollingState> | null {
  try {
    const raw = localStorage.getItem(storageKey(fileName));
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function saveToStorage(fileName: string, state: Pick<RollingState, "nextChapter" | "context">) {
  try {
    localStorage.setItem(storageKey(fileName), JSON.stringify(state));
  } catch {
    // ignore quota errors
  }
}

function clearStorage(fileName: string) {
  try {
    localStorage.removeItem(storageKey(fileName));
  } catch {
    // ignore
  }
}

// ── hook ───────────────────────────────────────────────────────────────────

export function useRollingContext(
  chapters: ExtractedChapter[],
  fileName: string | null
) {
  const token = useSelector((s: RootState) => s.user.token);
  const abortRef = useRef<AbortController | null>(null);
  const countdownRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const [state, setState] = useState<RollingState>(() => {
    if (!fileName) return defaultState();
    const saved = loadFromStorage(fileName);
    return saved
      ? { ...defaultState(), nextChapter: saved.nextChapter ?? 1, context: saved.context ?? null }
      : defaultState();
  });

  const [config, setConfig] = useState<RollingConfig>({
    basePrompt: DEFAULT_PROMPT,
    threshold: 65000,
    apiKey: "",
  });

  // ── batch preview (memoised) ─────────────────────────────────────────────
  const batchPreview = useMemo<BatchPreview | null>(() => {
    if (!chapters.length) return null;
    const { batch, totalWords } = buildBatch(
      chapters,
      state.nextChapter,
      config.basePrompt,
      state.context,
      config.threshold
    );
    const overhead =
      countWords(config.basePrompt) + (state.context ? countWords(state.context) : 0);
    if (!batch.length) return null;
    return {
      count: batch.length,
      totalWords,
      budget: config.threshold - overhead,
      overhead,
      firstTitle: batch[0].title,
      lastTitle: batch[batch.length - 1].title,
    };
  }, [chapters, state.nextChapter, state.context, config.basePrompt, config.threshold]);

  // ── abort ────────────────────────────────────────────────────────────────
  const abort = useCallback(() => {
    abortRef.current?.abort();
    if (countdownRef.current) clearInterval(countdownRef.current);
    setState((prev) => ({ ...prev, status: "paused", countdown: 0 }));
  }, []);

  // ── reset ────────────────────────────────────────────────────────────────
  const reset = useCallback(() => {
    abortRef.current?.abort();
    if (countdownRef.current) clearInterval(countdownRef.current);
    if (fileName) clearStorage(fileName);
    setState(defaultState());
  }, [fileName]);

  // ── countdown helper ─────────────────────────────────────────────────────
  function startCountdown(seconds: number, onDone: () => void) {
    setState((prev) => ({ ...prev, countdown: seconds }));
    let remaining = seconds;
    countdownRef.current = setInterval(() => {
      remaining -= 1;
      setState((prev) => ({ ...prev, countdown: remaining }));
      if (remaining <= 0) {
        clearInterval(countdownRef.current!);
        onDone();
      }
    }, 1000);
  }

  // ── run ──────────────────────────────────────────────────────────────────
  const run = useCallback(async () => {
    if (!fileName || !chapters.length) return;
    if (!config.basePrompt.trim()) {
      setState((prev) => ({ ...prev, status: "error", error: "Vui lòng nhập Base Prompt." }));
      return;
    }

    const ctrl = new AbortController();
    abortRef.current = ctrl;

    setState((prev) => ({ ...prev, status: "running", error: null }));

    // snapshot mutable state for the loop
    let nextChapter = state.nextChapter;
    let context = state.context;
    let round = state.round || 1;

    while (true) {
      if (ctrl.signal.aborted) break;

      const { batch } = buildBatch(chapters, nextChapter, config.basePrompt, context, config.threshold);

      if (batch.length === 0) {
        const remaining = chapters.filter((c) => c.index >= nextChapter);
        if (remaining.length === 0) {
          setState((prev) => ({ ...prev, status: "done", nextChapter, context }));
        } else {
          setState((prev) => ({
            ...prev,
            status: "error",
            error: `Budget quá nhỏ để chứa chapter tiếp theo (${remaining[0].title}). Tăng Threshold.`,
          }));
        }
        break;
      }

      const lastChapter = batch[batch.length - 1].index;
      const logEntry: RoundLog = {
        round,
        from: batch[0].title,
        to: batch[batch.length - 1].title,
        count: batch.length,
        words: batch.reduce((s, c) => s + c.wordCount, 0),
        status: "ok",
      };

      try {
        const prompt = buildPrompt(config.basePrompt, context, batch);

        // Clear streaming buffer for this round
        setState((prev) => ({ ...prev, streamingText: "" }));

        const res = await fetch("/api/gemini", {
          method: "POST",
          signal: ctrl.signal,
          headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          body: JSON.stringify({
            prompt,
            stream: true,
            ...(config.apiKey ? { apiKey: config.apiKey } : {}),
            systemInstruction: "Bạn chỉ được trả lời bằng tiếng Việt. Không dùng tiếng Anh.",
          }),
        });

        if (!res.ok) {
          const body = await res.json().catch(() => ({ error: res.statusText }));
          const errMsg =
            res.status === 429
              ? `Rate limit — thử lại sau ${body.resetAt ?? "24h"}`
              : `API error ${res.status}: ${body.error ?? res.statusText}`;
          throw new Error(errMsg);
        }

        // Read stream chunk-by-chunk
        const reader = res.body!.getReader();
        const decoder = new TextDecoder();
        let fullText = "";

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          const chunk = decoder.decode(value, { stream: true });
          fullText += chunk;
          setState((prev) => ({ ...prev, streamingText: fullText }));
        }

        const text = fullText;
        const newContext = extractJson(text);

        if (!newContext) {
          throw new Error("Response không chứa JSON hợp lệ. Raw output:\n\n" + text.slice(0, 500));
        }

        context = newContext;
        nextChapter = lastChapter + 1;

        if (fileName) saveToStorage(fileName, { nextChapter, context });

        setState((prev) => ({
          ...prev,
          nextChapter,
          context,
          round: round + 1,
          streamingText: "",
          log: [...prev.log, logEntry],
        }));

        round += 1;

        const remaining = chapters.filter((c) => c.index >= nextChapter);
        if (remaining.length === 0) {
          setState((prev) => ({ ...prev, status: "done" }));
          break;
        }

        if (!ctrl.signal.aborted) {
          await new Promise<void>((resolve) => startCountdown(15, resolve));
        }
      } catch (err) {
        if ((err as Error).name === "AbortError") break;
        const msg = (err as Error).message;
        setState((prev) => ({
          ...prev,
          status: "error",
          error: msg,
          log: [...prev.log, { ...logEntry, status: "error", error: msg }],
        }));
        break;
      }
    }
  }, [chapters, fileName, config, state.nextChapter, state.context, state.round, token]);

  return {
    state,
    config,
    setConfig,
    batchPreview,
    run,
    abort,
    reset,
  };
}

function defaultState(): RollingState {
  return {
    nextChapter: 1,
    context: null,
    status: "idle",
    round: 1,
    error: null,
    log: [],
    countdown: 0,
    streamingText: "",
  };
}
