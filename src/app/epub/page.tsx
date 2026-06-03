"use client";

import {
  useRef, useState, useEffect, DragEvent, useCallback, useMemo,
} from "react";
import {
  Upload, Download, RotateCcw, Loader2, BookOpen,
  Play, Square, CheckCircle2, XCircle, Clock, Copy,
  ChevronDown, ChevronUp, X, Languages, Database, FileText,
  ArrowRight, Save, BookMarked, Trash2, Eye,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import ReactMarkdown from "react-markdown";
import { useEpubExtractor } from "@/core/hooks/epub/useEpubExtractor";
import { useRollingContext } from "@/core/hooks/epub/useRollingContext";
import { useTxtFiles } from "@/core/hooks/epub/useTxtFiles";
import { useTranslation } from "@/core/hooks/epub/useTranslation";
import type { ExtractedChapter } from "@/core/lib/epub/extractChapters";
import type { BatchPreview } from "@/core/hooks/epub/useRollingContext";
import { contextToMarkdown } from "@/core/lib/epub/contextToMarkdown";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  useCreateStoryContext,
  useGetStoryContexts,
  useDeleteStoryContext,
} from "@/core/services/client/storyContexts";
import type { CreateStoryContextDto, StoryContext } from "@/core/services/api/storyContexts";

type AppMode = "epub" | "context" | "translate";

export default function EpubPage() {
  const [mode, setMode] = useState<AppMode>("epub");
  const [pendingChapters, setPendingChapters] = useState<ExtractedChapter[]>([]);

  const handleSendToContext = useCallback((chapters: ExtractedChapter[]) => {
    setPendingChapters(chapters);
    setMode("context");
  }, []);

  return (
    <div className="min-h-screen bg-[#1C1F2E] text-white">
      {/* Top nav */}
      <div className="border-b border-gray-800 px-6 py-3 flex items-center gap-6">
        <div className="flex items-center gap-2 text-gray-300">
          <BookOpen className="h-5 w-5 text-[#0E78F9]" />
          <span className="font-semibold">Epub Tools</span>
        </div>
        <div className="flex gap-1">
          <ModeTab
            active={mode === "epub"}
            onClick={() => setMode("epub")}
            icon={<BookOpen className="h-3.5 w-3.5" />}
            label="EPUB Extractor"
          />
          <ModeTab
            active={mode === "context"}
            onClick={() => setMode("context")}
            icon={<Database className="h-3.5 w-3.5" />}
            label="Lấy Context"
          />
          <ModeTab
            active={mode === "translate"}
            onClick={() => setMode("translate")}
            icon={<Languages className="h-3.5 w-3.5" />}
            label="Dịch"
          />
        </div>
      </div>

      <div className="p-6 max-w-6xl mx-auto">
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

// ── Mode: EPUB Extractor ─────────────────────────────────────────────────────

function EpubExtractorMode({ onSendToContext }: {
  onSendToContext: (chapters: ExtractedChapter[]) => void;
}) {
  const { state, processFile, reset, exportChapter, exportAll } = useEpubExtractor();
  const [previewIndex, setPreviewIndex] = useState<number | null>(null);
  const [checkedIndices, setCheckedIndices] = useState<Set<number>>(new Set());
  const [isDragging, setIsDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-check all when extraction completes
  useEffect(() => {
    if (state.status === "done") {
      setCheckedIndices(new Set(state.chapters.map((_, i) => i)));
    }
  }, [state.status, state.chapters]);

  const handleFile = (file: File) => {
    if (!file.name.endsWith(".epub")) return;
    setPreviewIndex(null);
    setCheckedIndices(new Set());
    processFile(file);
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  };

  const handleReset = () => {
    reset();
    setPreviewIndex(null);
    setCheckedIndices(new Set());
    if (inputRef.current) inputRef.current.value = "";
  };

  const toggleCheck = (i: number) => {
    setCheckedIndices((prev) => {
      const next = new Set(prev);
      if (next.has(i)) { next.delete(i); } else { next.add(i); }
      return next;
    });
  };

  const toggleAll = () => {
    setCheckedIndices((prev) =>
      prev.size === state.chapters.length
        ? new Set()
        : new Set(state.chapters.map((_, i) => i))
    );
  };

  const handleSend = () => {
    const selected = state.chapters.filter((_, i) => checkedIndices.has(i));
    if (selected.length) onSendToContext(selected);
  };

  const selectedChapter = previewIndex !== null ? state.chapters[previewIndex] : null;
  const allChecked = checkedIndices.size === state.chapters.length;

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-400">
          Drop file <code className="text-gray-300">.epub</code> để extract text từng chapter.
        </p>
        {state.status !== "idle" && (
          <Button variant="ghost" size="sm" onClick={handleReset} className="text-gray-400 hover:text-white">
            <RotateCcw className="h-4 w-4 mr-1" />Reset
          </Button>
        )}
      </div>

      {/* Drop zone */}
      {state.status === "idle" && (
        <div
          onDrop={handleDrop}
          onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
          onDragLeave={() => setIsDragging(false)}
          onClick={() => inputRef.current?.click()}
          className={`border-2 border-dashed rounded-xl p-16 text-center cursor-pointer transition-colors ${
            isDragging ? "border-[#0E78F9] bg-[#0E78F9]/10" : "border-gray-600 hover:border-gray-400 bg-[#161925]"
          }`}
        >
          <Upload className="h-10 w-10 mx-auto mb-4 text-gray-500" />
          <p className="text-gray-300 font-medium">Drop an EPUB file here</p>
          <p className="text-gray-500 text-sm mt-1">or click to browse</p>
          <input ref={inputRef} type="file" accept=".epub" className="hidden"
            onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); }} />
        </div>
      )}

      {/* Processing */}
      {state.status === "processing" && (
        <div className="bg-[#161925] rounded-xl p-12 text-center">
          <Loader2 className="h-8 w-8 mx-auto mb-4 animate-spin text-[#0E78F9]" />
          <p className="text-gray-300 font-medium">{state.fileName}</p>
          {state.progress.total > 0 && (
            <>
              <p className="text-gray-500 text-sm mt-1">{state.progress.current} / {state.progress.total} items</p>
              <div className="w-64 mx-auto mt-3 h-1.5 bg-gray-700 rounded-full overflow-hidden">
                <div className="h-full bg-[#0E78F9] rounded-full transition-all duration-200"
                  style={{ width: `${(state.progress.current / state.progress.total) * 100}%` }} />
              </div>
            </>
          )}
        </div>
      )}

      {/* Error */}
      {state.status === "error" && (
        <div className="bg-red-900/20 border border-red-700 rounded-xl p-8 text-center">
          <p className="text-red-400 font-medium">{state.error}</p>
          <Button variant="ghost" size="sm" onClick={handleReset} className="mt-4 text-gray-400">Try another file</Button>
        </div>
      )}

      {/* Results */}
      {state.status === "done" && (
        <div className="flex flex-col gap-3">
          {/* Action bar */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <p className="text-gray-400 text-sm">
                <span className="text-white font-medium">{state.chapters.length}</span> chapters ·{" "}
                <span className="text-white font-medium">{state.fileName}</span>
              </p>
              {/* Select all toggle */}
              <button
                onClick={toggleAll}
                className="text-xs text-gray-400 hover:text-white border border-gray-700 rounded px-2 py-0.5 transition-colors"
              >
                {allChecked ? "Deselect all" : "Select all"}
              </button>
            </div>
            <div className="flex items-center gap-2">
              <Button size="sm" variant="ghost" onClick={exportAll} className="text-gray-400 hover:text-white">
                <Download className="h-3.5 w-3.5 mr-1.5" />Export all
              </Button>
              <Button
                size="sm"
                onClick={handleSend}
                disabled={checkedIndices.size === 0}
                className="bg-[#0E78F9] hover:bg-[#0E78F9]/90 disabled:opacity-40"
              >
                <ArrowRight className="h-3.5 w-3.5 mr-1.5" />
                Send to Context ({checkedIndices.size})
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-[300px_1fr] gap-4 h-[calc(100vh-280px)]">
            {/* Chapter list with checkboxes */}
            <div className="bg-[#161925] rounded-xl overflow-y-auto">
              {state.chapters.map((ch, i) => (
                <div
                  key={ch.index}
                  className={`flex items-center gap-2 px-3 py-2.5 border-b border-gray-800 last:border-0 hover:bg-white/5 transition-colors ${
                    previewIndex === i ? "bg-[#0E78F9]/10" : ""
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={checkedIndices.has(i)}
                    onChange={() => toggleCheck(i)}
                    className="accent-[#0E78F9] shrink-0 cursor-pointer"
                  />
                  <button
                    onClick={() => setPreviewIndex(i)}
                    className="flex-1 text-left min-w-0"
                  >
                    <p className="text-sm font-medium text-gray-200 truncate">{ch.title}</p>
                    <p className="text-xs text-gray-500 mt-0.5">{ch.wordCount.toLocaleString()} words</p>
                  </button>
                  <button
                    onClick={() => exportChapter(i)}
                    className="opacity-0 group-hover:opacity-100 text-gray-600 hover:text-gray-300 shrink-0"
                    title="Export .txt"
                  >
                    <Download className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))}
            </div>

            {/* Preview */}
            <div className="bg-[#161925] rounded-xl flex flex-col overflow-hidden">
              {selectedChapter ? (
                <>
                  <div className="flex items-center justify-between px-5 py-3 border-b border-gray-800">
                    <div>
                      <p className="font-medium text-gray-100">{selectedChapter.title}</p>
                      <p className="text-xs text-gray-500">{selectedChapter.wordCount.toLocaleString()} words</p>
                    </div>
                    <Button variant="ghost" size="sm" onClick={() => exportChapter(previewIndex!)} className="text-gray-400 hover:text-white">
                      <Download className="h-3.5 w-3.5 mr-1.5" />.txt
                    </Button>
                  </div>
                  <div className="flex-1 overflow-y-auto p-5">
                    <p className="text-gray-300 text-sm leading-7 whitespace-pre-wrap font-mono">{selectedChapter.text}</p>
                  </div>
                </>
              ) : (
                <div className="flex-1 flex items-center justify-center text-center text-gray-600">
                  <div>
                    <FileText className="h-8 w-8 mx-auto mb-2" />
                    <p className="text-sm">Click a chapter to preview</p>
                    <p className="text-xs mt-1">Check chapters to send to Context mode</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Mode: Context ─────────────────────────────────────────────────────────────

function ContextMode({ pendingChapters = [], onPendingConsumed }: {
  pendingChapters?: ExtractedChapter[];
  onPendingConsumed?: () => void;
}) {
  const { files, chapters, totalWords, isLoading, loadFiles, addChapters, removeFile, clearFiles } =
    useTxtFiles();

  // Load chapters passed from EPUB extractor
  useEffect(() => {
    if (pendingChapters.length > 0) {
      addChapters(pendingChapters);
      onPendingConsumed?.();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const {
    state: rolling,
    config,
    setConfig,
    batchPreview,
    run,
    abort,
    reset: resetRolling,
  } = useRollingContext(chapters, chapters.length ? "context_session" : null);

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
  const [isDragging, setIsDragging] = useState(false);

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    loadFiles(e.dataTransfer.files);
  };

  const isRunning = rolling.status === "running";
  const canRun = !isRunning && rolling.status !== "done" && !!config.basePrompt.trim() && chapters.length > 0;

  const copyContext = useCallback(() => {
    if (rolling.context) navigator.clipboard.writeText(rolling.context);
  }, [rolling.context]);

  const downloadContext = useCallback(() => {
    if (!rolling.context) return;
    const blob = new Blob([rolling.context], { type: "application/json;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "context.json";
    a.click();
    URL.revokeObjectURL(url);
  }, [rolling.context]);

  const handleReset = () => {
    clearFiles();
    resetRolling();
    if (inputRef.current) inputRef.current.value = "";
  };

  return (
    <div className="flex flex-col gap-4">

      {/* Header row */}
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

      {/* File picker */}
      <div
        onDrop={handleDrop}
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
        onDragLeave={() => setIsDragging(false)}
        onClick={() => inputRef.current?.click()}
        className={`border-2 border-dashed rounded-xl px-6 py-5 cursor-pointer transition-colors flex items-center gap-4 ${
          isDragging
            ? "border-[#0E78F9] bg-[#0E78F9]/10"
            : "border-gray-700 hover:border-gray-500 bg-[#161925]"
        }`}
      >
        {isLoading
          ? <Loader2 className="h-5 w-5 animate-spin text-[#0E78F9] shrink-0" />
          : <Upload className="h-5 w-5 text-gray-500 shrink-0" />
        }
        <div>
          <p className="text-sm text-gray-300 font-medium">Drop .txt files here</p>
          <p className="text-xs text-gray-500 mt-0.5">
            Multiple files — sorted automatically by filename
          </p>
        </div>
        {files.length > 0 && (
          <div className="ml-auto text-right">
            <p className="text-sm font-medium text-white">{files.length} files</p>
            <p className="text-xs text-gray-400">{totalWords.toLocaleString()} words total</p>
          </div>
        )}
        <input
          ref={inputRef}
          type="file"
          accept=".txt"
          multiple
          className="hidden"
          onChange={(e) => { if (e.target.files) loadFiles(e.target.files); }}
        />
      </div>

      <PasteTextSection addChapters={addChapters} />

      {/* File list + config side by side when files loaded */}
      {files.length > 0 && (
        <div className="grid grid-cols-[320px_1fr] gap-4 items-start">

          {/* File list */}
          <FileList
            files={files}
            batchPreview={batchPreview}
            threshold={config.threshold}
            nextChapter={rolling.nextChapter}
            onRemove={removeFile}
          />

          {/* Config + controls */}
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
            <div className="flex items-center gap-3">
              {isRunning ? (
                <Button onClick={abort} variant="destructive" size="sm">
                  <Square className="h-3.5 w-3.5 mr-1.5" />Abort
                </Button>
              ) : (
                <Button
                  onClick={run}
                  disabled={!canRun}
                  size="sm"
                  className="bg-[#0E78F9] hover:bg-[#0E78F9]/90 disabled:opacity-40"
                >
                  <Play className="h-3.5 w-3.5 mr-1.5" />
                  {rolling.status === "paused" ? "Resume" : "Run"}
                </Button>
              )}
              <Button
                onClick={resetRolling}
                variant="ghost"
                size="sm"
                className="text-gray-400 hover:text-white"
                disabled={isRunning}
              >
                <RotateCcw className="h-3.5 w-3.5 mr-1.5" />Reset Progress
              </Button>
              <StatusBadge status={rolling.status} countdown={rolling.countdown} round={rolling.round} />
            </div>

            {rolling.status === "error" && rolling.error && (
              <div className="bg-red-900/20 border border-red-700 rounded-xl p-4">
                <p className="text-red-400 text-sm whitespace-pre-wrap">{rolling.error}</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Log */}
      {rolling.log.length > 0 && (
        <div className="bg-[#161925] rounded-xl p-4">
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
                <Loader2 className="h-4 w-4 animate-spin text-[#0E78F9] shrink-0" />
                Round {rolling.round} — running...
              </div>
            )}
          </div>
        </div>
      )}

      {/* Streaming */}
      {isRunning && rolling.streamingText && (
        <StreamingPanel text={rolling.streamingText} />
      )}

      {/* Accumulated context */}
      {rolling.context && (
        <ContextPanel
          context={rolling.context}
          onCopy={copyContext}
          onDownload={downloadContext}
          onSave={handleSave}
          isSaving={isSaving}
        />
      )}

      {/* Context Library */}
      <ContextLibrary />
    </div>
  );
}

// ── Sub-components ───────────────────────────────────────────────────────────

function ModeTab({
  active, onClick, icon, label, disabled,
}: {
  active: boolean; onClick: () => void; icon: React.ReactNode;
  label: string; disabled?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
        disabled
          ? "text-gray-600 cursor-not-allowed"
          : active
          ? "bg-[#0E78F9]/15 text-[#0E78F9]"
          : "text-gray-400 hover:text-gray-200 hover:bg-white/5"
      }`}
    >
      {icon}
      {label}
      {disabled && <span className="text-[10px] text-gray-600 ml-1">soon</span>}
    </button>
  );
}

function FileList({
  files, batchPreview, nextChapter, onRemove,
}: {
  files: ReturnType<typeof useTxtFiles>["files"];
  batchPreview: BatchPreview | null;
  threshold: number;
  nextChapter: number;
  onRemove: (name: string) => void;
}) {
  const batchIndices = new Set(
    batchPreview
      ? files
          .filter((f) => f.chapter.index >= nextChapter)
          .slice(0, batchPreview.count)
          .map((f) => f.chapter.index)
      : []
  );
  const processedIndices = new Set(
    files.filter((f) => f.chapter.index < nextChapter).map((f) => f.chapter.index)
  );

  return (
    <div className="bg-[#161925] rounded-xl overflow-hidden">
      <div className="px-4 py-2.5 border-b border-gray-800 flex items-center justify-between">
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Files</p>
        <p className="text-xs text-gray-500">{files.length} loaded</p>
      </div>
      <div className="overflow-y-auto max-h-[420px]">
        {files.map((entry) => {
          const inBatch = batchIndices.has(entry.chapter.index);
          const processed = processedIndices.has(entry.chapter.index);
          return (
            <div
              key={entry.name}
              className={`flex items-center gap-2 px-4 py-2 border-b border-gray-800/50 last:border-0 group ${
                processed ? "opacity-40" : ""
              }`}
            >
              {/* Batch indicator */}
              <div className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                processed ? "bg-green-600" : inBatch ? "bg-[#0E78F9]" : "bg-gray-600"
              }`} />
              <div className="flex-1 min-w-0">
                <p className="text-xs text-gray-300 truncate">{entry.name}</p>
                <p className="text-[10px] text-gray-600">{entry.chapter.wordCount.toLocaleString()} words</p>
              </div>
              <button
                onClick={() => onRemove(entry.name)}
                className="opacity-0 group-hover:opacity-100 transition-opacity text-gray-600 hover:text-red-400"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          );
        })}
      </div>
      {/* Legend */}
      <div className="px-4 py-2 border-t border-gray-800 flex gap-3 text-[10px] text-gray-500">
        <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-green-600 inline-block" />done</span>
        <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-[#0E78F9] inline-block" />next batch</span>
        <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-gray-600 inline-block" />queued</span>
      </div>
    </div>
  );
}

function ConfigPanel({
  config, setConfig, isRunning,
}: {
  config: ReturnType<typeof useRollingContext>["config"];
  setConfig: ReturnType<typeof useRollingContext>["setConfig"];
  isRunning: boolean;
}) {
  return (
    <div className="bg-[#161925] rounded-xl p-4 flex flex-col gap-3">
      <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Config</p>
      <div>
        <label className="text-xs text-gray-400 mb-1 block">Base Prompt</label>
        <textarea
          value={config.basePrompt}
          onChange={(e) => setConfig((c) => ({ ...c, basePrompt: e.target.value }))}
          rows={7}
          disabled={isRunning}
          className="w-full bg-[#1C1F2E] border border-gray-700 rounded-lg px-3 py-2 text-xs text-gray-200 resize-y focus:outline-none focus:border-[#0E78F9] disabled:opacity-50 font-mono"
        />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-xs text-gray-400 mb-1 block">Word Threshold</label>
          <input
            type="number"
            value={config.threshold}
            onChange={(e) => setConfig((c) => ({ ...c, threshold: Number(e.target.value) }))}
            disabled={isRunning}
            className="w-full bg-[#1C1F2E] border border-gray-700 rounded-lg px-3 py-2 text-sm text-gray-200 focus:outline-none focus:border-[#0E78F9] disabled:opacity-50"
          />
        </div>
        <div>
          <label className="text-xs text-gray-400 mb-1 block">API Key (optional)</label>
          <input
            type="password"
            value={config.apiKey}
            onChange={(e) => setConfig((c) => ({ ...c, apiKey: e.target.value }))}
            placeholder="Server key nếu để trống"
            disabled={isRunning}
            className="w-full bg-[#1C1F2E] border border-gray-700 rounded-lg px-3 py-2 text-sm text-gray-200 placeholder-gray-600 focus:outline-none focus:border-[#0E78F9] disabled:opacity-50"
          />
        </div>
      </div>
    </div>
  );
}

function BatchPreviewPanel({
  batchPreview, totalFiles, nextChapter, threshold, hasPrompt, status,
}: {
  batchPreview: BatchPreview | null;
  totalFiles: number;
  nextChapter: number;
  threshold: number;
  hasPrompt: boolean;
  status: string;
}) {
  if (status === "done") {
    return (
      <div className="bg-[#161925] rounded-xl p-4">
        <p className="text-sm text-green-400 flex items-center gap-2">
          <CheckCircle2 className="h-4 w-4" />All files processed.
        </p>
      </div>
    );
  }

  const remaining = totalFiles - (nextChapter - 1);

  return (
    <div className="bg-[#161925] rounded-xl p-4">
      <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Batch Preview</p>
      {!hasPrompt ? (
        <p className="text-xs text-gray-500">Nhập Base Prompt để xem batch preview.</p>
      ) : !batchPreview ? (
        <p className="text-xs text-red-400">Budget quá nhỏ — tăng Word Threshold.</p>
      ) : (
        <div className="grid grid-cols-2 gap-2 text-sm">
          <Stat label="Remaining" value={`${remaining} files`} />
          <Stat label="Batch" value={`${batchPreview.count} files`} />
          <Stat label="Batch words" value={batchPreview.totalWords.toLocaleString()} />
          <Stat label="Budget" value={`${batchPreview.budget.toLocaleString()} / ${threshold.toLocaleString()}`} />
        </div>
      )}
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-[#1C1F2E] rounded-lg px-3 py-2">
      <p className="text-[10px] text-gray-500">{label}</p>
      <p className="text-gray-200 font-medium text-sm mt-0.5">{value}</p>
    </div>
  );
}

function StatusBadge({ status, countdown, round }: {
  status: string; countdown: number; round: number;
}) {
  if (status === "idle") return null;
  if (status === "running") {
    return (
      <span className="text-xs text-gray-400 flex items-center gap-1">
        {countdown > 0
          ? <><Clock className="h-3 w-3" />Next batch in {countdown}s</>
          : `Round ${round} processing...`
        }
      </span>
    );
  }
  if (status === "paused") return <span className="text-xs text-yellow-400">Paused</span>;
  if (status === "done")   return <span className="text-xs text-green-400 flex items-center gap-1"><CheckCircle2 className="h-3 w-3" />Done</span>;
  if (status === "error")  return <span className="text-xs text-red-400">Error</span>;
  return null;
}

function ContextLibrary() {
  const { data, isLoading } = useGetStoryContexts(1, 20);
  const { mutate: deleteCtx } = useDeleteStoryContext();
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [collapsed, setCollapsed] = useState(false);
  const [previewCtx, setPreviewCtx] = useState<StoryContext | null>(null);

  const handleDelete = (id: string) => {
    setDeletingId(id);
    deleteCtx(id, { onSettled: () => setDeletingId(null) });
  };

  const downloadOne = (ctx: StoryContext) => {
    const blob = new Blob([JSON.stringify(ctx, null, 2)], { type: "application/json;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${ctx.title.replace(/\s+/g, "_")}_context.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const count = data?.data?.length ?? 0;

  return (
    <>
      {previewCtx && (
        <ContextPreviewDialog
          open={!!previewCtx}
          onClose={() => setPreviewCtx(null)}
          contextJson={JSON.stringify(previewCtx)}
          title={`${previewCtx.title} — ${previewCtx.author}`}
        />
      )}
    <div className="bg-[#161925] rounded-xl overflow-hidden">
      <button
        onClick={() => setCollapsed((v) => !v)}
        className="w-full px-4 py-3 flex items-center justify-between hover:bg-white/5 transition-colors"
      >
        <div className="flex items-center gap-2">
          <BookMarked className="h-4 w-4 text-[#0E78F9]" />
          <span className="text-sm font-semibold text-gray-300">Context Library</span>
          {count > 0 && (
            <span className="text-xs bg-[#0E78F9]/20 text-[#0E78F9] rounded-full px-2 py-0.5">
              {count}
            </span>
          )}
        </div>
        {collapsed
          ? <ChevronDown className="h-4 w-4 text-gray-500" />
          : <ChevronUp className="h-4 w-4 text-gray-500" />
        }
      </button>

      {!collapsed && (
        <div className="border-t border-gray-800">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-5 w-5 animate-spin text-[#0E78F9]" />
            </div>
          ) : count === 0 ? (
            <div className="text-center py-8 text-gray-600 text-sm">
              Chưa có context nào được lưu.
            </div>
          ) : (
            <div className="p-3 grid grid-cols-2 gap-2">
              {data!.data.map((ctx) => (
                <div key={ctx.id} className="bg-[#1C1F2E] rounded-xl p-3 flex flex-col gap-2">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-gray-200 truncate">{ctx.title}</p>
                      <p className="text-xs text-gray-500">{ctx.author}</p>
                    </div>
                    <span className="text-[10px] bg-gray-700/60 text-gray-300 rounded px-1.5 py-0.5 shrink-0 truncate max-w-[90px]">
                      {ctx.genre}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] text-gray-600">
                      {new Date(ctx.createdAt).toLocaleDateString("vi-VN")}
                    </span>
                    <div className="flex gap-1">
                      <button
                        onClick={() => setPreviewCtx(ctx)}
                        className="p-1 text-gray-500 hover:text-[#0E78F9] rounded hover:bg-white/5 transition-colors"
                        title="Preview"
                      >
                        <Eye className="h-3.5 w-3.5" />
                      </button>
                      <button
                        onClick={() => downloadOne(ctx)}
                        className="p-1 text-gray-500 hover:text-gray-300 rounded hover:bg-white/5 transition-colors"
                        title="Download JSON"
                      >
                        <Download className="h-3.5 w-3.5" />
                      </button>
                      <button
                        onClick={() => handleDelete(ctx.id)}
                        disabled={deletingId === ctx.id}
                        className="p-1 text-gray-500 hover:text-red-400 rounded hover:bg-white/5 transition-colors disabled:opacity-40"
                        title="Delete"
                      >
                        {deletingId === ctx.id
                          ? <Loader2 className="h-3.5 w-3.5 animate-spin" />
                          : <Trash2 className="h-3.5 w-3.5" />
                        }
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
    </>
  );
}

function StreamingPanel({ text }: { text: string }) {
  return (
    <div className="bg-[#161925] rounded-xl p-4">
      <div className="flex items-center gap-2 mb-3">
        <Loader2 className="h-3.5 w-3.5 animate-spin text-[#0E78F9]" />
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Streaming Response</p>
      </div>
      <div className="max-h-72 overflow-y-auto bg-[#1C1F2E] rounded-lg p-3">
        <pre className="text-xs text-gray-300 whitespace-pre-wrap break-words">{text}</pre>
      </div>
    </div>
  );
}

function PasteTextSection({ addChapters }: {
  addChapters: (chapters: ExtractedChapter[]) => void;
}) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [text, setText] = useState("");

  const handleAdd = () => {
    const trimmed = text.trim();
    if (!trimmed) return;
    const wordCount = trimmed.split(/\s+/).length;
    addChapters([{ index: 0, title: name.trim() || "Pasted text", text: trimmed, wordCount }]);
    setText("");
    setName("");
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) handleAdd();
  };

  return (
    <div className="border border-gray-800 rounded-xl overflow-hidden">
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full px-4 py-2.5 flex items-center gap-2 text-xs text-gray-500 hover:text-gray-300 hover:bg-white/5 transition-colors text-left"
      >
        {open ? <ChevronUp className="h-3.5 w-3.5 shrink-0" /> : <ChevronDown className="h-3.5 w-3.5 shrink-0" />}
        Hoặc paste text trực tiếp
      </button>
      {open && (
        <div className="border-t border-gray-800 p-3 flex flex-col gap-2 bg-[#161925]">
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Tên chapter (tuỳ chọn)"
            className="w-full bg-[#1C1F2E] border border-gray-700 rounded px-3 py-1.5 text-xs text-gray-200 placeholder-gray-600 focus:outline-none focus:border-[#0E78F9]"
          />
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Paste nội dung vào đây... (Ctrl+Enter để thêm)"
            rows={6}
            className="w-full bg-[#1C1F2E] border border-gray-700 rounded px-3 py-2 text-xs text-gray-200 placeholder-gray-600 resize-y focus:outline-none focus:border-[#0E78F9] font-mono"
          />
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-gray-600">
              {text.trim() ? `${text.trim().split(/\s+/).length.toLocaleString()} words` : ""}
            </span>
            <Button
              size="sm"
              onClick={handleAdd}
              disabled={!text.trim()}
              className="bg-[#0E78F9] hover:bg-[#0E78F9]/90 disabled:opacity-40 h-7 px-3 text-xs"
            >
              Thêm chapter
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Context Preview Dialog ────────────────────────────────────────────────────

function ContextPreviewDialog({
  open, onClose, contextJson, title,
}: {
  open: boolean;
  onClose: () => void;
  contextJson: string;
  title?: string;
}) {
  const markdown = useMemo(() => contextToMarkdown(contextJson), [contextJson]);
  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-4xl max-h-[85vh] bg-[#1C1F2E] border-gray-700 text-white flex flex-col gap-0 p-0 overflow-hidden">
        <DialogHeader className="px-6 py-4 border-b border-gray-800 shrink-0">
          <DialogTitle className="text-gray-100 text-base">{title ?? "Context Preview"}</DialogTitle>
        </DialogHeader>
        <div className="overflow-y-auto px-6 py-5 flex-1">
          <ReactMarkdown
            components={{
              h1: ({ children }) => <h1 className="text-xl font-bold text-white mb-3">{children}</h1>,
              h2: ({ children }) => <h2 className="text-base font-semibold text-gray-200 mt-5 mb-2 pb-1 border-b border-gray-700">{children}</h2>,
              h3: ({ children }) => <h3 className="text-sm font-semibold text-gray-300 mt-3 mb-1">{children}</h3>,
              p: ({ children }) => <p className="text-sm text-gray-300 mb-2 leading-relaxed">{children}</p>,
              table: ({ children }) => <div className="overflow-x-auto mb-3"><table className="w-full text-xs text-left border-collapse">{children}</table></div>,
              thead: ({ children }) => <thead className="bg-gray-800/60">{children}</thead>,
              tbody: ({ children }) => <tbody className="divide-y divide-gray-800">{children}</tbody>,
              th: ({ children }) => <th className="px-3 py-1.5 font-medium text-gray-400 whitespace-nowrap">{children}</th>,
              td: ({ children }) => <td className="px-3 py-1.5 text-gray-300">{children}</td>,
              ul: ({ children }) => <ul className="list-disc list-inside text-sm text-gray-300 mb-2 space-y-0.5 ml-2">{children}</ul>,
              li: ({ children }) => <li className="text-sm text-gray-300">{children}</li>,
              strong: ({ children }) => <strong className="font-semibold text-gray-200">{children}</strong>,
              hr: () => <hr className="border-gray-700 my-3" />,
            }}
          >
            {markdown}
          </ReactMarkdown>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ─────────────────────────────────────────────────────────────────────────────

function ContextPanel({
  context, onCopy, onDownload, onSave, isSaving,
}: {
  context: string;
  onCopy: () => void;
  onDownload: () => void;
  onSave?: (data: { title: string; author: string }) => Promise<void>;
  isSaving?: boolean;
}) {
  const [expanded, setExpanded] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [showSaveForm, setShowSaveForm] = useState(false);
  const [saveTitle, setSaveTitle] = useState("");
  const [saveAuthor, setSaveAuthor] = useState("");
  const [saveError, setSaveError] = useState<string | null>(null);

  useEffect(() => {
    if (showSaveForm && !saveTitle) {
      try {
        const parsed = JSON.parse(context);
        if (parsed.title) setSaveTitle(parsed.title);
      } catch {}
    }
  }, [showSaveForm, context, saveTitle]);

  const handleSubmit = async () => {
    if (!saveTitle.trim() || !saveAuthor.trim()) return;
    setSaveError(null);
    try {
      await onSave?.({ title: saveTitle.trim(), author: saveAuthor.trim() });
      setShowSaveForm(false);
      setSaveTitle("");
      setSaveAuthor("");
    } catch (err) {
      setSaveError((err as Error).message ?? "Lưu thất bại.");
    }
  };

  const preview = expanded ? context : context.slice(0, 800) + (context.length > 800 ? "..." : "");

  return (
    <>
      <ContextPreviewDialog
        open={showPreview}
        onClose={() => setShowPreview(false)}
        contextJson={context}
        title="Accumulated Context"
      />
    <div className="bg-[#161925] rounded-xl p-4">
      <div className="flex items-center justify-between mb-3">
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Accumulated Context</p>
        <div className="flex gap-2">
          <Button variant="ghost" size="sm" onClick={() => setShowPreview(true)} className="text-gray-400 hover:text-white h-7 px-2">
            <Eye className="h-3.5 w-3.5 mr-1" />Preview
          </Button>
          {onSave && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => { setShowSaveForm((v) => !v); setSaveError(null); }}
              className="text-gray-400 hover:text-white h-7 px-2"
            >
              <Save className="h-3.5 w-3.5 mr-1" />Save
            </Button>
          )}
          <Button variant="ghost" size="sm" onClick={onCopy} className="text-gray-400 hover:text-white h-7 px-2">
            <Copy className="h-3.5 w-3.5 mr-1" />Copy
          </Button>
          <Button variant="ghost" size="sm" onClick={onDownload} className="text-gray-400 hover:text-white h-7 px-2">
            <Download className="h-3.5 w-3.5 mr-1" />.json
          </Button>
        </div>
      </div>

      {showSaveForm && (
        <div className="mb-3 bg-[#1C1F2E] rounded-lg p-3 flex flex-col gap-2 border border-gray-700">
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-[10px] text-gray-400 mb-1 block">Title *</label>
              <input
                value={saveTitle}
                onChange={(e) => setSaveTitle(e.target.value)}
                placeholder="Tên truyện"
                className="w-full bg-[#161925] border border-gray-700 rounded px-2 py-1.5 text-xs text-gray-200 placeholder-gray-600 focus:outline-none focus:border-[#0E78F9]"
              />
            </div>
            <div>
              <label className="text-[10px] text-gray-400 mb-1 block">Author *</label>
              <input
                value={saveAuthor}
                onChange={(e) => setSaveAuthor(e.target.value)}
                placeholder="Tác giả"
                className="w-full bg-[#161925] border border-gray-700 rounded px-2 py-1.5 text-xs text-gray-200 placeholder-gray-600 focus:outline-none focus:border-[#0E78F9]"
              />
            </div>
          </div>
          {saveError && (
            <p className="text-xs text-red-400">{saveError}</p>
          )}
          <div className="flex gap-2 justify-end">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => { setShowSaveForm(false); setSaveError(null); }}
              className="text-gray-500 h-7 px-2 text-xs"
            >
              Cancel
            </Button>
            <Button
              size="sm"
              onClick={handleSubmit}
              disabled={!saveTitle.trim() || !saveAuthor.trim() || isSaving}
              className="bg-[#0E78F9] hover:bg-[#0E78F9]/90 disabled:opacity-40 h-7 px-3 text-xs"
            >
              {isSaving
                ? <Loader2 className="h-3.5 w-3.5 animate-spin" />
                : <><Save className="h-3.5 w-3.5 mr-1" />Save to Library</>
              }
            </Button>
          </div>
        </div>
      )}

      <pre className="text-xs text-gray-300 bg-[#1C1F2E] rounded-lg p-3 overflow-x-auto whitespace-pre-wrap break-words max-h-80 overflow-y-auto">
        {preview}
      </pre>
      {context.length > 800 && (
        <button
          onClick={() => setExpanded((v) => !v)}
          className="mt-2 text-xs text-[#0E78F9] hover:underline flex items-center gap-1"
        >
          {expanded ? <><ChevronUp className="h-3 w-3" />Show less</> : <><ChevronDown className="h-3 w-3" />Show more</>}
        </button>
      )}
    </div>
    </>
  );
}

// ── Mode: Translate ──────────────────────────────────────────────────────────

function TranslationPreviewDialog({
  open, onClose, name, text,
}: {
  open: boolean; onClose: () => void; name: string; text: string;
}) {
  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-3xl max-h-[85vh] bg-[#1C1F2E] border-gray-700 text-white flex flex-col gap-0 p-0 overflow-hidden">
        <DialogHeader className="px-6 py-4 border-b border-gray-800 shrink-0">
          <DialogTitle className="text-gray-100 text-base truncate">{name}</DialogTitle>
        </DialogHeader>
        <div className="overflow-y-auto px-6 py-5 flex-1">
          <p className="text-sm text-gray-300 leading-7 whitespace-pre-wrap">{text}</p>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function TranslateMode({
  pendingChapters = [],
  onPendingConsumed,
}: {
  pendingChapters?: ExtractedChapter[];
  onPendingConsumed?: () => void;
}) {
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
  const [isDragging, setIsDragging] = useState(false);
  const [previewFile, setPreviewFile] = useState<{ name: string; text: string } | null>(null);

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    loadFiles(e.dataTransfer.files);
  };

  const isRunning = trans.status === "running";
  const canRun = !isRunning && trans.status !== "done" && !!config.basePrompt.trim() && chapters.length > 0;

  const downloadFile = useCallback((name: string, text: string) => {
    const safeName = name.replace(/[/\\?%*:|"<>]/g, "_");
    const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = `${safeName}.txt`; a.click();
    URL.revokeObjectURL(url);
  }, []);

  const downloadAll = useCallback(() => {
    trans.results.forEach((r) => downloadFile(r.name, r.text));
  }, [trans.results, downloadFile]);

  const handleReset = () => {
    clearFiles();
    resetTrans();
    if (inputRef.current) inputRef.current.value = "";
  };

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

        {/* Drop zone */}
        <div
          onDrop={handleDrop}
          onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
          onDragLeave={() => setIsDragging(false)}
          onClick={() => inputRef.current?.click()}
          className={`border-2 border-dashed rounded-xl px-6 py-5 cursor-pointer transition-colors flex items-center gap-4 ${
            isDragging ? "border-[#0E78F9] bg-[#0E78F9]/10" : "border-gray-700 hover:border-gray-500 bg-[#161925]"
          }`}
        >
          {isLoading
            ? <Loader2 className="h-5 w-5 animate-spin text-[#0E78F9] shrink-0" />
            : <Upload className="h-5 w-5 text-gray-500 shrink-0" />
          }
          <div>
            <p className="text-sm text-gray-300 font-medium">Drop .txt files here</p>
            <p className="text-xs text-gray-500 mt-0.5">Mỗi file = 1 API call riêng lẻ</p>
          </div>
          {files.length > 0 && (
            <div className="ml-auto text-right">
              <p className="text-sm font-medium text-white">{files.length} files</p>
              <p className="text-xs text-gray-400">{totalWords.toLocaleString()} words total</p>
            </div>
          )}
          <input ref={inputRef} type="file" accept=".txt" multiple className="hidden"
            onChange={(e) => { if (e.target.files) loadFiles(e.target.files); }} />
        </div>

        <PasteTextSection addChapters={addChapters} />

        {files.length > 0 && (
          <div className="grid grid-cols-[280px_1fr] gap-4 items-start">
            {/* File queue with per-file status */}
            <div className="bg-[#161925] rounded-xl overflow-hidden">
              <div className="px-4 py-2.5 border-b border-gray-800 flex items-center justify-between">
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Queue</p>
                <p className="text-xs text-gray-500">{files.length} files</p>
              </div>
              <div className="overflow-y-auto max-h-[420px]">
                {files.map((entry, i) => {
                  const status = getFileStatus(entry.chapter.title, i);
                  return (
                    <div
                      key={entry.name}
                      className={`flex items-center gap-2 px-4 py-2.5 border-b border-gray-800/50 last:border-0 group ${
                        status === "done" ? "opacity-50" : ""
                      }`}
                    >
                      <div className="shrink-0 w-4 h-4 flex items-center justify-center">
                        {status === "done" && <CheckCircle2 className="h-3.5 w-3.5 text-green-500" />}
                        {status === "processing" && <Loader2 className="h-3.5 w-3.5 text-[#0E78F9] animate-spin" />}
                        {status === "error" && <XCircle className="h-3.5 w-3.5 text-red-500" />}
                        {status === "pending" && <div className="w-1.5 h-1.5 rounded-full bg-gray-600" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-gray-300 truncate">{entry.name}</p>
                        <p className="text-[10px] text-gray-600">{entry.chapter.wordCount.toLocaleString()} words</p>
                      </div>
                      {status === "error" && (
                        <span className="text-[10px] text-red-400 shrink-0">error</span>
                      )}
                      {!isRunning && status !== "processing" && (
                        <button
                          onClick={() => removeFile(entry.name)}
                          className="opacity-0 group-hover:opacity-100 transition-opacity text-gray-600 hover:text-red-400 shrink-0"
                        >
                          <X className="h-3.5 w-3.5" />
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
              <div className="px-4 py-2 border-t border-gray-800 flex gap-3 text-[10px] text-gray-500">
                <span className="flex items-center gap-1"><CheckCircle2 className="h-2.5 w-2.5 text-green-500" />done</span>
                <span className="flex items-center gap-1"><Loader2 className="h-2.5 w-2.5 text-[#0E78F9]" />processing</span>
                <span className="flex items-center gap-1"><div className="w-1.5 h-1.5 rounded-full bg-gray-600" />pending</span>
              </div>
            </div>

            {/* Config */}
            <div className="flex flex-col gap-3">
              <div className="bg-[#161925] rounded-xl p-4 flex flex-col gap-3">
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Config</p>

                {ctxLibrary?.data?.length ? (
                  <div>
                    <label className="text-xs text-gray-400 mb-1 block">Story Context (optional)</label>
                    <select
                      onChange={(e) => {
                        const selected = ctxLibrary.data.find((c) => c.id === e.target.value);
                        setConfig((c) => ({
                          ...c,
                          storyContext: selected ? JSON.stringify(selected) : null,
                        }));
                      }}
                      disabled={isRunning}
                      className="w-full bg-[#1C1F2E] border border-gray-700 rounded-lg px-3 py-2 text-sm text-gray-200 focus:outline-none focus:border-[#0E78F9] disabled:opacity-50"
                    >
                      <option value="">Không dùng ngữ cảnh</option>
                      {ctxLibrary.data.map((c) => (
                        <option key={c.id} value={c.id}>{c.title} — {c.author}</option>
                      ))}
                    </select>
                    {config.storyContext && (
                      <p className="text-[10px] text-green-400 mt-1">Ngữ cảnh đã chọn — prepend vào mỗi prompt.</p>
                    )}
                  </div>
                ) : null}

                <div>
                  <label className="text-xs text-gray-400 mb-1 block">Translation Prompt</label>
                  <textarea
                    value={config.basePrompt}
                    onChange={(e) => setConfig((c) => ({ ...c, basePrompt: e.target.value }))}
                    rows={6}
                    disabled={isRunning}
                    className="w-full bg-[#1C1F2E] border border-gray-700 rounded-lg px-3 py-2 text-xs text-gray-200 resize-y focus:outline-none focus:border-[#0E78F9] disabled:opacity-50 font-mono"
                  />
                </div>

                <div>
                  <label className="text-xs text-gray-400 mb-1 block">API Key (optional)</label>
                  <input
                    type="password"
                    value={config.apiKey}
                    onChange={(e) => setConfig((c) => ({ ...c, apiKey: e.target.value }))}
                    placeholder="Server key nếu để trống"
                    disabled={isRunning}
                    className="w-full bg-[#1C1F2E] border border-gray-700 rounded-lg px-3 py-2 text-sm text-gray-200 placeholder-gray-600 focus:outline-none focus:border-[#0E78F9] disabled:opacity-50"
                  />
                </div>
              </div>

              <div className="flex items-center gap-3">
                {isRunning ? (
                  <Button onClick={abort} variant="destructive" size="sm">
                    <Square className="h-3.5 w-3.5 mr-1.5" />Abort
                  </Button>
                ) : (
                  <Button onClick={run} disabled={!canRun} size="sm" className="bg-[#0E78F9] hover:bg-[#0E78F9]/90 disabled:opacity-40">
                    <Play className="h-3.5 w-3.5 mr-1.5" />
                    {trans.status === "paused" ? "Resume" : "Run"}
                  </Button>
                )}
                <Button onClick={resetTrans} variant="ghost" size="sm" className="text-gray-400 hover:text-white" disabled={isRunning}>
                  <RotateCcw className="h-3.5 w-3.5 mr-1.5" />Reset Progress
                </Button>
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
              </div>

              {trans.status === "error" && trans.error && (
                <div className="bg-red-900/20 border border-red-700 rounded-xl p-4">
                  <p className="text-red-400 text-sm whitespace-pre-wrap">{trans.error}</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Streaming current file */}
        {isRunning && trans.streamingText && (
          <div className="bg-[#161925] rounded-xl p-4">
            <div className="flex items-center gap-2 mb-3">
              <Loader2 className="h-3.5 w-3.5 animate-spin text-[#0E78F9]" />
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                Đang dịch: <span className="text-gray-200 normal-case font-normal">{trans.streamingName}</span>
              </p>
            </div>
            <div className="max-h-64 overflow-y-auto bg-[#1C1F2E] rounded-lg p-3">
              <pre className="text-xs text-gray-300 whitespace-pre-wrap break-words">{trans.streamingText}</pre>
            </div>
          </div>
        )}

        {/* Results — per-file cards */}
        {trans.results.length > 0 && (
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                Kết quả — {trans.results.length} file(s)
              </p>
              {trans.results.length > 1 && (
                <Button variant="ghost" size="sm" onClick={downloadAll} className="text-gray-400 hover:text-white h-7 px-3">
                  <Download className="h-3.5 w-3.5 mr-1.5" />Tải tất cả
                </Button>
              )}
            </div>
            <div className="grid grid-cols-1 gap-2">
              {trans.results.map((r) => (
                <div key={r.name} className="bg-[#161925] rounded-xl px-4 py-3 flex items-center gap-3">
                  <CheckCircle2 className="h-4 w-4 text-green-500 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-200 truncate">{r.name}</p>
                    <p className="text-[10px] text-gray-600">{r.wordCount.toLocaleString()} words dịch</p>
                  </div>
                  <div className="flex gap-1.5 shrink-0">
                    <Button
                      variant="ghost" size="sm"
                      onClick={() => setPreviewFile({ name: r.name, text: r.text })}
                      className="text-gray-400 hover:text-[#0E78F9] h-7 px-2"
                    >
                      <Eye className="h-3.5 w-3.5 mr-1" />Preview
                    </Button>
                    <Button
                      variant="ghost" size="sm"
                      onClick={() => downloadFile(r.name, r.text)}
                      className="text-gray-400 hover:text-white h-7 px-2"
                    >
                      <Download className="h-3.5 w-3.5 mr-1" />.txt
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </>
  );
}
