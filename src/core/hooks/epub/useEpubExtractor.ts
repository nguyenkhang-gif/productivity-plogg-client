"use client";

import { useState, useCallback } from "react";
import { extractEpub, ExtractedChapter } from "@/core/lib/epub/extractChapters";

type Status = "idle" | "processing" | "done" | "error";

interface ExtractorState {
  chapters: ExtractedChapter[];
  status: Status;
  error: string | null;
  fileName: string | null;
  progress: { current: number; total: number };
}

const initialState: ExtractorState = {
  chapters: [],
  status: "idle",
  error: null,
  fileName: null,
  progress: { current: 0, total: 0 },
};

function downloadTxt(filename: string, content: string) {
  const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export function useEpubExtractor() {
  const [state, setState] = useState<ExtractorState>(initialState);

  const processFile = useCallback(async (file: File) => {
    setState({
      chapters: [],
      status: "processing",
      error: null,
      fileName: file.name,
      progress: { current: 0, total: 0 },
    });

    try {
      const chapters = await extractEpub(file, (current, total) => {
        setState((prev) => ({ ...prev, progress: { current, total } }));
      });

      setState((prev) => ({ ...prev, chapters, status: "done" }));
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Unknown error";
      setState((prev) => ({
        ...prev,
        status: "error",
        error: msg.includes("corrupt") || msg.includes("encrypt")
          ? "Could not read this EPUB — it may be DRM-protected."
          : `Extraction failed: ${msg}`,
      }));
    }
  }, []);

  const reset = useCallback(() => setState(initialState), []);

  const exportChapter = useCallback(
    (chapterIndex: number) => {
      const ch = state.chapters[chapterIndex];
      if (!ch) return;
      downloadTxt(`chapter_${ch.index}.txt`, ch.text);
    },
    [state.chapters]
  );

  const exportAll = useCallback(() => {
    if (!state.chapters.length) return;
    const content = state.chapters
      .map((ch) => `--- ${ch.title} ---\n\n${ch.text}`)
      .join("\n\n");
    downloadTxt(`${state.fileName?.replace(".epub", "") ?? "epub"}_extracted.txt`, content);
  }, [state.chapters, state.fileName]);

  return { state, processFile, reset, exportChapter, exportAll };
}
