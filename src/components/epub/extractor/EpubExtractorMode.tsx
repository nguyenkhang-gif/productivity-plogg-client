"use client";

import { useRef, useState, useEffect, DragEvent } from "react";
import { Upload, Download, RotateCcw, Loader2, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useEpubExtractor } from "@/core/hooks/epub/useEpubExtractor";
import type { ExtractedChapter } from "@/core/lib/epub/extractChapters";
import { ChapterPreview } from "./ChapterPreview";

interface EpubExtractorModeProps {
  onSendToContext: (chapters: ExtractedChapter[]) => void;
}

export function EpubExtractorMode({ onSendToContext }: EpubExtractorModeProps) {
  const { state, processFile, reset, exportChapter, exportAll } = useEpubExtractor();
  const [previewIndex, setPreviewIndex] = useState<number | null>(null);
  const [checkedIndices, setCheckedIndices] = useState<Set<number>>(new Set());
  const [isDragging, setIsDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

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

      {state.status === "idle" && (
        <div
          onDrop={handleDrop}
          onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
          onDragLeave={() => setIsDragging(false)}
          onClick={() => inputRef.current?.click()}
          className={`border-2 border-dashed rounded-xl p-16 text-center cursor-pointer transition-colors ${
            isDragging ? "border-accent bg-accent/10" : "border-gray-600 hover:border-gray-400 bg-surface-raised"
          }`}
        >
          <Upload className="h-10 w-10 mx-auto mb-4 text-gray-500" />
          <p className="text-gray-300 font-medium">Drop an EPUB file here</p>
          <p className="text-gray-500 text-sm mt-1">or click to browse</p>
          <input ref={inputRef} type="file" accept=".epub" className="hidden"
            onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); }} />
        </div>
      )}

      {state.status === "processing" && (
        <div className="bg-surface-raised rounded-xl p-12 text-center">
          <Loader2 className="h-8 w-8 mx-auto mb-4 animate-spin text-accent" />
          <p className="text-gray-300 font-medium">{state.fileName}</p>
          {state.progress.total > 0 && (
            <>
              <p className="text-gray-500 text-sm mt-1">{state.progress.current} / {state.progress.total} items</p>
              <div className="w-64 mx-auto mt-3 h-1.5 bg-gray-700 rounded-full overflow-hidden">
                <div className="h-full bg-accent rounded-full transition-all duration-200"
                  style={{ width: `${(state.progress.current / state.progress.total) * 100}%` }} />
              </div>
            </>
          )}
        </div>
      )}

      {state.status === "error" && (
        <div className="bg-red-900/20 border border-red-700 rounded-xl p-8 text-center">
          <p className="text-red-400 font-medium">{state.error}</p>
          <Button variant="ghost" size="sm" onClick={handleReset} className="mt-4 text-gray-400">Try another file</Button>
        </div>
      )}

      {state.status === "done" && (
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <p className="text-gray-400 text-sm">
                <span className="text-white font-medium">{state.chapters.length}</span> chapters ·{" "}
                <span className="text-white font-medium">{state.fileName}</span>
              </p>
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
                className="bg-accent hover:bg-accent/90 disabled:opacity-40"
              >
                <ArrowRight className="h-3.5 w-3.5 mr-1.5" />
                Send to Context ({checkedIndices.size})
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-[300px_1fr] gap-4 h-[calc(100vh-280px)]">
            <div className="bg-surface-raised rounded-xl overflow-y-auto">
              {state.chapters.map((ch, i) => (
                <div
                  key={ch.index}
                  className={`group flex items-center gap-2 px-3 py-2.5 border-b border-gray-800 last:border-0 hover:bg-white/5 transition-colors ${
                    previewIndex === i ? "bg-accent/10" : ""
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={checkedIndices.has(i)}
                    onChange={() => toggleCheck(i)}
                    className="accent-[#0E78F9] shrink-0 cursor-pointer"
                  />
                  <button onClick={() => setPreviewIndex(i)} className="flex-1 text-left min-w-0">
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

            <div className="bg-surface-raised rounded-xl flex flex-col overflow-hidden">
              <ChapterPreview
                chapter={selectedChapter}
                onExport={() => exportChapter(previewIndex!)}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
