"use client";

import { useState, useCallback } from "react";
import type { ExtractedChapter } from "@/core/lib/epub/extractChapters";

export interface TxtFileEntry {
  name: string;
  chapter: ExtractedChapter;
}

function naturalSort(a: string, b: string): number {
  return a.localeCompare(b, undefined, { numeric: true, sensitivity: "base" });
}

export function useTxtFiles() {
  const [files, setFiles] = useState<TxtFileEntry[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const loadFiles = useCallback(async (fileList: FileList | File[]) => {
    const list = Array.from(fileList).filter((f) => f.name.endsWith(".txt"));
    if (!list.length) return;

    setIsLoading(true);
    try {
      const entries = await Promise.all(
        list.map(async (file, i) => {
          const text = await file.text();
          const wordCount = text.trim() ? text.trim().split(/\s+/).length : 0;
          const entry: TxtFileEntry = {
            name: file.name,
            chapter: {
              index: i + 1, // will be reassigned after sort
              title: file.name.replace(/\.txt$/i, ""),
              text,
              wordCount,
            },
          };
          return entry;
        })
      );

      // Natural sort by filename, then assign stable indices
      const sorted = entries
        .sort((a, b) => naturalSort(a.name, b.name))
        .map((e, i) => ({
          ...e,
          chapter: { ...e.chapter, index: i + 1 },
        }));

      setFiles((prev) => {
        // Merge: keep existing, add new (deduplicate by name)
        const existingNames = new Set(prev.map((e) => e.name));
        const newEntries = sorted.filter((e) => !existingNames.has(e.name));
        const merged = [...prev, ...newEntries].sort((a, b) =>
          naturalSort(a.name, b.name)
        );
        // Re-index after merge
        return merged.map((e, i) => ({
          ...e,
          chapter: { ...e.chapter, index: i + 1 },
        }));
      });
    } finally {
      setIsLoading(false);
    }
  }, []);

  const removeFile = useCallback((name: string) => {
    setFiles((prev) => {
      const filtered = prev.filter((e) => e.name !== name);
      return filtered.map((e, i) => ({
        ...e,
        chapter: { ...e.chapter, index: i + 1 },
      }));
    });
  }, []);

  // Accept ExtractedChapter[] directly (e.g. from EPUB extractor)
  const addChapters = useCallback((incoming: ExtractedChapter[]) => {
    const entries: TxtFileEntry[] = incoming.map((ch) => ({
      name: `${ch.title}.txt`,
      chapter: ch,
    }));

    setFiles((prev) => {
      const existingNames = new Set(prev.map((e) => e.name));
      const newEntries = entries.filter((e) => !existingNames.has(e.name));
      const merged = [...prev, ...newEntries].sort((a, b) =>
        naturalSort(a.name, b.name)
      );
      return merged.map((e, i) => ({
        ...e,
        chapter: { ...e.chapter, index: i + 1 },
      }));
    });
  }, []);

  const clearFiles = useCallback(() => setFiles([]), []);

  const chapters = files.map((e) => e.chapter);
  const totalWords = files.reduce((s, e) => s + e.chapter.wordCount, 0);

  return { files, chapters, totalWords, isLoading, loadFiles, addChapters, removeFile, clearFiles };
}
