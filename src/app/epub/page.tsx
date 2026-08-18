"use client";

import { useState, useCallback } from "react";
import type { ExtractedChapter } from "@/core/lib/epub/extractChapters";
import { EpubNav } from "@/components/epub/EpubNav";
import { EpubExtractorMode } from "@/components/epub/extractor/EpubExtractorMode";
import { ContextMode } from "@/components/epub/context/ContextMode";
import { TranslateMode } from "@/components/epub/translate/TranslateMode";

type AppMode = "epub" | "context" | "translate";

export default function EpubPage() {
  const [mode, setMode] = useState<AppMode>("epub");
  const [pendingChapters, setPendingChapters] = useState<ExtractedChapter[]>([]);

  const handleSendToContext = useCallback((chapters: ExtractedChapter[]) => {
    setPendingChapters(chapters);
    setMode("context");
  }, []);

  return (
    // nền + padding ngoài do shell trong DefaultLayout lo (config/navigation.ts)
    <div className="text-text-primary">
      <EpubNav mode={mode} onModeChange={setMode} />
      <div className="py-6">
        {mode === "epub" && <EpubExtractorMode onSendToContext={handleSendToContext} />}
        {mode === "context" && (
          <ContextMode
            pendingChapters={pendingChapters}
            onPendingConsumed={() => setPendingChapters([])}
          />
        )}
        {mode === "translate" && (
          <TranslateMode
            pendingChapters={pendingChapters}
            onPendingConsumed={() => setPendingChapters([])}
          />
        )}
      </div>
    </div>
  );
}
