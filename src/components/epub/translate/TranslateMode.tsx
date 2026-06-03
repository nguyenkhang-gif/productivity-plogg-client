"use client";

import { useRef, useState, useEffect, useCallback } from "react";
import { RotateCcw, Clock, Loader2, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTxtFiles } from "@/core/hooks/epub/useTxtFiles";
import { useTranslation } from "@/core/hooks/epub/useTranslation";
import type { ExtractedChapter } from "@/core/lib/epub/extractChapters";
import { downloadFile } from "@/core/lib/epub/downloadFile";
import { useGetStoryContexts } from "@/core/services/client/storyContexts";

import { FileDropZone } from "../shared/FileDropZone";
import { PasteTextSection } from "../shared/PasteTextSection";
import { RunControls } from "../shared/RunControls";
import { StreamingPanel } from "../shared/StreamingPanel";
import { TranslateQueue } from "./TranslateQueue";
import { TranslateConfigPanel } from "./TranslateConfigPanel";
import { TranslateResults } from "./TranslateResults";
import { TranslationPreviewDialog } from "../dialogs/TranslationPreviewDialog";

interface TranslateModeProps {
  pendingChapters?: ExtractedChapter[];
  onPendingConsumed?: () => void;
}

export function TranslateMode({ pendingChapters = [], onPendingConsumed }: TranslateModeProps) {
  const { files, chapters, totalWords, isLoading, loadFiles, addChapters, removeFile, clearFiles } =
    useTxtFiles();

  useEffect(() => {
    if (pendingChapters.length > 0) {
      addChapters(pendingChapters);
      onPendingConsumed?.();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const { state: trans, config, setConfig, run, abort, reset: resetTrans, getFileStatus } =
    useTranslation(chapters, chapters.length ? "translate_session" : null);

  const { data: ctxLibrary } = useGetStoryContexts(1, 50);

  const inputRef = useRef<HTMLInputElement>(null);
  const [previewFile, setPreviewFile] = useState<{ name: string; text: string } | null>(null);

  const handleDownloadOne = useCallback((name: string, text: string) => {
    const safeName = name.replace(/[/\\?%*:|"<>]/g, "_");
    downloadFile(`${safeName}.txt`, text);
  }, []);

  const handleDownloadAll = useCallback(() => {
    trans.results.forEach((r) => handleDownloadOne(r.name, r.text));
  }, [trans.results, handleDownloadOne]);

  const handleReset = () => {
    clearFiles();
    resetTrans();
    if (inputRef.current) inputRef.current.value = "";
  };

  const isRunning = trans.status === "running";
  const canRun = !isRunning && trans.status !== "done" && !!config.basePrompt.trim() && chapters.length > 0;

  const translateStatusSlot = (
    <>
      {trans.status === "running" && (
        <span className="text-xs text-gray-400 flex items-center gap-1">
          {trans.countdown > 0
            ? <><Clock className="h-3 w-3" />Next in {trans.countdown}s</>
            : <><Loader2 className="h-3 w-3 animate-spin" />Translating {trans.streamingName}...</>
          }
        </span>
      )}
      {trans.status === "paused" && <span className="text-xs text-yellow-400">Paused</span>}
      {trans.status === "done" && (
        <span className="text-xs text-green-400 flex items-center gap-1">
          <CheckCircle2 className="h-3 w-3" />{trans.results.length} file(s) done
        </span>
      )}
    </>
  );

  return (
    <>
      {previewFile && (
        <TranslationPreviewDialog
          open={!!previewFile}
          onClose={() => setPreviewFile(null)}
          name={previewFile.name}
          text={previewFile.text}
        />
      )}

      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-400">
            Mỗi file được dịch riêng thành một prompt. Chọn ngữ cảnh truyện để tăng độ chính xác.
          </p>
          {(files.length > 0 || trans.results.length > 0) && (
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
          sublabel="Mỗi file = 1 API call riêng lẻ"
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
          <div className="grid grid-cols-[280px_1fr] gap-4 items-start">
            <TranslateQueue
              files={files}
              isRunning={isRunning}
              getFileStatus={getFileStatus}
              onRemove={removeFile}
            />

            <div className="flex flex-col gap-3">
              <TranslateConfigPanel
                config={config}
                setConfig={setConfig}
                isRunning={isRunning}
                contextLibrary={ctxLibrary?.data}
              />

              <RunControls
                isRunning={isRunning}
                canRun={canRun}
                status={trans.status}
                onRun={run}
                onAbort={abort}
                onReset={resetTrans}
                statusSlot={translateStatusSlot}
              />

              {trans.status === "error" && trans.error && (
                <div className="bg-red-900/20 border border-red-700 rounded-xl p-4">
                  <p className="text-red-400 text-sm whitespace-pre-wrap">{trans.error}</p>
                </div>
              )}
            </div>
          </div>
        )}

        {isRunning && trans.streamingText && (
          <StreamingPanel
            text={trans.streamingText}
            label={`Đang dịch: ${trans.streamingName}`}
          />
        )}

        {trans.results.length > 0 && (
          <TranslateResults
            results={trans.results}
            onPreview={setPreviewFile}
            onDownloadOne={handleDownloadOne}
            onDownloadAll={handleDownloadAll}
          />
        )}
      </div>
    </>
  );
}
