"use client";

import { useRef, useEffect, useCallback } from "react";
import { RotateCcw, CheckCircle2, XCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRollingContext } from "@/core/hooks/epub/useRollingContext";
import { useTxtFiles } from "@/core/hooks/epub/useTxtFiles";
import type { ExtractedChapter } from "@/core/lib/epub/extractChapters";
import { downloadFile } from "@/core/lib/epub/downloadFile";
import {
  useCreateStoryContext,
} from "@/core/services/client/storyContexts";
import type { CreateStoryContextDto } from "@/core/services/api/storyContexts";

import { FileDropZone } from "../shared/FileDropZone";
import { PasteTextSection } from "../shared/PasteTextSection";
import { RunControls } from "../shared/RunControls";
import { StatusBadge } from "../shared/StatusBadge";
import { StreamingPanel } from "../shared/StreamingPanel";
import { FileList } from "./FileList";
import { ConfigPanel } from "./ConfigPanel";
import { BatchPreviewPanel } from "./BatchPreviewPanel";
import { ContextPanel } from "./ContextPanel";
import { ContextLibrary } from "./ContextLibrary";

interface ContextModeProps {
  pendingChapters?: ExtractedChapter[];
  onPendingConsumed?: () => void;
}

export function ContextMode({ pendingChapters = [], onPendingConsumed }: ContextModeProps) {
  const { files, chapters, totalWords, isLoading, loadFiles, addChapters, removeFile, clearFiles } =
    useTxtFiles();

  useEffect(() => {
    if (pendingChapters.length > 0) {
      addChapters(pendingChapters);
      onPendingConsumed?.();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const sessionKey = chapters.length
    ? `ctx_${chapters[0].title.slice(0, 20)}_${chapters.length}`
    : null;

  const {
    state: rolling,
    config,
    setConfig,
    batchPreview,
    run,
    abort,
    reset: resetRolling,
  } = useRollingContext(chapters, sessionKey);

  const { mutateAsync: createCtxAsync, isPending: isSaving } = useCreateStoryContext();

  const handleSave = useCallback(
    async ({ title, author }: { title: string; author: string }) => {
      if (!rolling.context) return;
      const parsed = JSON.parse(rolling.context);
      const dto: CreateStoryContextDto = {
        title,
        author,
        genre: parsed.genre ?? "Unknown",
        setting: parsed.setting ?? "",
        targetTone: parsed.targetTone ?? "",
        sourceLanguage: parsed.sourceLanguage ?? "en",
        targetLanguage: parsed.targetLanguage ?? "vi",
        characters: parsed.characters ?? [],
        glossary: parsed.glossary ?? [],
        styleGuide: parsed.styleGuide ?? {
          formality: "casual",
          keepHonorifics: true,
          keepOriginalNames: true,
          chapterLabel: "Chương",
        },
        chapterSummaries: parsed.chapterSummaries ?? [],
      };
      await createCtxAsync(dto);
    },
    [rolling.context, createCtxAsync]
  );

  const inputRef = useRef<HTMLInputElement>(null);

  const copyContext = useCallback(() => {
    if (rolling.context) navigator.clipboard.writeText(rolling.context);
  }, [rolling.context]);

  const downloadContext = useCallback(() => {
    if (!rolling.context) return;
    downloadFile("context.json", rolling.context, "application/json;charset=utf-8");
  }, [rolling.context]);

  const handleReset = () => {
    clearFiles();
    resetRolling();
    if (inputRef.current) inputRef.current.value = "";
  };

  const isRunning = rolling.status === "running";
  const canRun = !isRunning && rolling.status !== "done" && !!config.basePrompt.trim() && chapters.length > 0;

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-400">
          Chọn các file <code className="text-gray-300">.txt</code> (đã extract từ EPUB),
          AI sẽ tích lũy context qua từng batch.
        </p>
        {(files.length > 0 || rolling.context) && (
          <Button variant="ghost" size="sm" onClick={handleReset} className="text-gray-400 hover:text-white">
            <RotateCcw className="h-4 w-4 mr-1" />Reset
          </Button>
        )}
      </div>

      <FileDropZone
        accept=".txt"
        multiple
        isLoading={isLoading}
        label="Drop .txt files here"
        sublabel="Multiple files — sorted automatically by filename"
        stats={files.length > 0 ? (
          <>
            <p className="text-sm font-medium text-white">{files.length} files</p>
            <p className="text-xs text-gray-400">{totalWords.toLocaleString()} words total</p>
          </>
        ) : undefined}
        onFiles={loadFiles}
      />

      <PasteTextSection addChapters={addChapters} />

      {files.length > 0 && (
        <div className="grid grid-cols-[320px_1fr] gap-4 items-start">
          <FileList
            files={files}
            batchPreview={batchPreview}
            threshold={config.threshold}
            nextChapter={rolling.nextChapter}
            onRemove={removeFile}
          />

          <div className="flex flex-col gap-3">
            <ConfigPanel config={config} setConfig={setConfig} isRunning={isRunning} />
            <BatchPreviewPanel
              batchPreview={batchPreview}
              totalFiles={files.length}
              nextChapter={rolling.nextChapter}
              threshold={config.threshold}
              hasPrompt={!!config.basePrompt.trim()}
              status={rolling.status}
            />
            <RunControls
              isRunning={isRunning}
              canRun={canRun}
              status={rolling.status}
              onRun={run}
              onAbort={abort}
              onReset={resetRolling}
              statusSlot={
                <StatusBadge
                  status={rolling.status}
                  countdown={rolling.countdown}
                  round={rolling.round}
                />
              }
            />

            {rolling.status === "error" && rolling.error && (
              <div className="bg-red-900/20 border border-red-700 rounded-xl p-4">
                <p className="text-red-400 text-sm whitespace-pre-wrap">{rolling.error}</p>
              </div>
            )}
          </div>
        </div>
      )}

      {rolling.log.length > 0 && (
        <div className="bg-surface-raised rounded-xl p-4">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Log</p>
          <div className="flex flex-col gap-1.5">
            {rolling.log.map((entry) => (
              <div key={entry.round} className="flex items-center gap-2 text-sm">
                {entry.status === "ok"
                  ? <CheckCircle2 className="h-4 w-4 text-green-500 shrink-0" />
                  : <XCircle className="h-4 w-4 text-red-500 shrink-0" />
                }
                <span className="text-gray-500 shrink-0 w-16">Round {entry.round}</span>
                <span className="text-gray-300 truncate">{entry.from} → {entry.to}</span>
                <span className="text-gray-500 shrink-0">{entry.count} files · {entry.words.toLocaleString()} words</span>
              </div>
            ))}
            {isRunning && (
              <div className="flex items-center gap-2 text-sm text-gray-400">
                <Loader2 className="h-4 w-4 animate-spin text-accent shrink-0" />
                Round {rolling.round} — running...
              </div>
            )}
          </div>
        </div>
      )}

      {isRunning && rolling.streamingText && (
        <StreamingPanel text={rolling.streamingText} />
      )}

      {rolling.context && (
        <ContextPanel
          context={rolling.context}
          onCopy={copyContext}
          onDownload={downloadContext}
          onSave={handleSave}
          isSaving={isSaving}
        />
      )}

      <ContextLibrary />
    </div>
  );
}
