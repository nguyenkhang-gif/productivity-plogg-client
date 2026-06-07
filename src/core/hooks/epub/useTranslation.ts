"use client";

import { useState, useCallback, useRef } from "react";
import { useSelector } from "react-redux";
import { RootState } from "@/core/redux/store";
import type { ExtractedChapter } from "@/core/lib/epub/extractChapters";

export const DEFAULT_TRANSLATE_PROMPT = `Dịch đoạn truyện dưới đây từ tiếng Anh sang tiếng Việt.

Yêu cầu:
- Dịch tự nhiên, sát nghĩa, giữ phong cách của tác giả
- Giữ nguyên tên nhân vật, địa danh theo glossary đã cung cấp (nếu có)
- Giữ nguyên định dạng: xuống dòng, đoạn văn, dấu câu
- Chỉ trả về bản dịch, không có ghi chú hay giải thích thêm

=== NỘI DUNG GỐC ===`;

export interface TranslatedFile {
  name: string;
  text: string;
  wordCount: number;
}

export type FileStatus = "pending" | "processing" | "done" | "error";

export interface TranslationConfig {
  basePrompt: string;
  apiKey: string;
  storyContext: string | null;
}

interface TranslationState {
  nextIndex: number;
  results: TranslatedFile[];
  fileErrors: Record<string, string>;
  status: "idle" | "running" | "paused" | "done" | "error";
  error: string | null;
  countdown: number;
  streamingText: string;
  streamingName: string;
}

// ── utils ─────────────────────────────────────────────────────────────────────

function buildPrompt(
  basePrompt: string,
  storyContext: string | null,
  chapter: ExtractedChapter
): string {
  let prompt = "";
  if (storyContext) {
    prompt +=
      "Dưới đây là ngữ cảnh truyện để tham khảo khi dịch (tên nhân vật, thuật ngữ, phong cách):\n\n";
    prompt += "=== NGỮ CẢNH TRUYỆN ===\n" + storyContext + "\n\n";
    prompt += "=== YÊU CẦU DỊCH ===\n";
  }
  prompt += basePrompt;
  prompt += `\n\n[${chapter.title}]\n${chapter.text}`;
  return prompt;
}

function storageKey(sessionId: string): string {
  return `epub_translate_${sessionId}`;
}

function loadProgress(sessionId: string): { nextIndex: number; results: TranslatedFile[] } {
  try {
    const raw = localStorage.getItem(storageKey(sessionId));
    if (!raw) return { nextIndex: 0, results: [] };
    const parsed = JSON.parse(raw);
    return { nextIndex: parsed.nextIndex ?? 0, results: parsed.results ?? [] };
  } catch {
    return { nextIndex: 0, results: [] };
  }
}

function saveProgress(sessionId: string, nextIndex: number, results: TranslatedFile[]) {
  try {
    localStorage.setItem(storageKey(sessionId), JSON.stringify({ nextIndex, results }));
  } catch {}
}

function clearProgress(sessionId: string) {
  try {
    localStorage.removeItem(storageKey(sessionId));
  } catch {}
}

function defaultState(): TranslationState {
  return {
    nextIndex: 0,
    results: [],
    fileErrors: {},
    status: "idle",
    error: null,
    countdown: 0,
    streamingText: "",
    streamingName: "",
  };
}

// ── hook ──────────────────────────────────────────────────────────────────────

export function useTranslation(
  chapters: ExtractedChapter[],
  sessionId: string | null
) {
  const token = useSelector((s: RootState) => s.user.token);
  const abortRef = useRef<AbortController | null>(null);
  const countdownRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const [state, setState] = useState<TranslationState>(() => {
    const saved = sessionId ? loadProgress(sessionId) : { nextIndex: 0, results: [] };
    return { ...defaultState(), nextIndex: saved.nextIndex, results: saved.results };
  });

  const [config, setConfig] = useState<TranslationConfig>({
    basePrompt: DEFAULT_TRANSLATE_PROMPT,
    apiKey: "",
    storyContext: null,
  });

  const abort = useCallback(() => {
    abortRef.current?.abort();
    if (countdownRef.current) clearInterval(countdownRef.current);
    setState((prev) => ({ ...prev, status: "paused", countdown: 0, streamingText: "" }));
  }, []);

  const reset = useCallback(() => {
    abortRef.current?.abort();
    if (countdownRef.current) clearInterval(countdownRef.current);
    if (sessionId) clearProgress(sessionId);
    setState(defaultState());
  }, [sessionId]);

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

  const run = useCallback(async () => {
    if (!sessionId || !chapters.length) return;
    if (!config.basePrompt.trim()) {
      setState((prev) => ({ ...prev, status: "error", error: "Vui lòng nhập Translation Prompt." }));
      return;
    }

    const ctrl = new AbortController();
    abortRef.current = ctrl;
    setState((prev) => ({ ...prev, status: "running", error: null }));

    let nextIndex = state.nextIndex;

    while (nextIndex < chapters.length) {
      if (ctrl.signal.aborted) break;

      const chapter = chapters[nextIndex];

      setState((prev) => ({
        ...prev,
        streamingText: "",
        streamingName: chapter.title,
      }));

      try {
        const prompt = buildPrompt(config.basePrompt, config.storyContext, chapter);

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

        const translated: TranslatedFile = {
          name: chapter.title,
          text: fullText,
          wordCount: fullText.trim().split(/\s+/).length,
        };

        nextIndex += 1;

        setState((prev) => {
          const newResults = [...prev.results, translated];
          if (sessionId) saveProgress(sessionId, nextIndex, newResults);
          return {
            ...prev,
            nextIndex,
            streamingText: "",
            streamingName: "",
            results: newResults,
          };
        });

        if (nextIndex < chapters.length && !ctrl.signal.aborted) {
          await new Promise<void>((resolve) => startCountdown(15, resolve));
        }
      } catch (err) {
        if ((err as Error).name === "AbortError") break;
        const msg = (err as Error).message;
        // On rate limit or fatal error: stop the whole run
        if (msg.includes("Rate limit")) {
          setState((prev) => ({
            ...prev,
            status: "error",
            error: msg,
            streamingText: "",
            streamingName: "",
            fileErrors: { ...prev.fileErrors, [chapter.title]: msg },
          }));
          return;
        }
        // On per-file error: mark file as error, continue to next
        setState((prev) => ({
          ...prev,
          nextIndex: nextIndex + 1,
          streamingText: "",
          streamingName: "",
          fileErrors: { ...prev.fileErrors, [chapter.title]: msg },
        }));
        nextIndex += 1;
      }
    }

    if (!ctrl.signal.aborted) {
      setState((prev) => ({ ...prev, status: "done", streamingText: "", streamingName: "" }));
    }
  }, [chapters, sessionId, config, state.nextIndex, token]);

  // Derive per-file status for UI
  const getFileStatus = useCallback(
    (chapterTitle: string, chapterIdx: number): FileStatus => {
      if (state.results.some((r) => r.name === chapterTitle)) return "done";
      if (state.fileErrors[chapterTitle]) return "error";
      if (state.status === "running" && chapterIdx === state.nextIndex) return "processing";
      return "pending";
    },
    [state.results, state.fileErrors, state.status, state.nextIndex]
  );

  return {
    state,
    config,
    setConfig,
    run,
    abort,
    reset,
    getFileStatus,
  };
}
