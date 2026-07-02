"use client";

import { useState } from "react";
import { Upload, ClipboardPaste } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FileDropZone } from "./FileDropZone";
import type { ExtractedChapter } from "@/core/lib/epub/extractChapters";

type InputTab = "upload" | "paste";

interface InputTabsProps {
  accept: string;
  multiple?: boolean;
  isLoading?: boolean;
  sublabel?: string;
  stats?: React.ReactNode;
  onFiles: (files: FileList) => void;
  addChapters: (chapters: ExtractedChapter[]) => void;
}

export function InputTabs({
  accept, multiple, isLoading, sublabel, stats, onFiles, addChapters,
}: InputTabsProps) {
  const [tab, setTab] = useState<InputTab>("upload");
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

  return (
    <div className="border border-border rounded-xl overflow-hidden">
      <div className="flex border-b border-border bg-surface">
        <button
          onClick={() => setTab("upload")}
          className={`flex items-center gap-1.5 px-4 py-2.5 text-xs font-medium transition-colors border-b-2 ${
            tab === "upload"
              ? "text-accent border-accent"
              : "text-text-muted border-transparent hover:text-text-secondary"
          }`}
        >
          <Upload className="h-3.5 w-3.5" />
          Upload files
        </button>
        <button
          onClick={() => setTab("paste")}
          className={`flex items-center gap-1.5 px-4 py-2.5 text-xs font-medium transition-colors border-b-2 ${
            tab === "paste"
              ? "text-accent border-accent"
              : "text-text-muted border-transparent hover:text-text-secondary"
          }`}
        >
          <ClipboardPaste className="h-3.5 w-3.5" />
          Paste text
        </button>
      </div>

      <div className="p-3 bg-surface-raised">
        {tab === "upload" ? (
          <FileDropZone
            accept={accept}
            multiple={multiple}
            isLoading={isLoading}
            label="Drop files here"
            sublabel={sublabel}
            stats={stats}
            onFiles={onFiles}
          />
        ) : (
          <div className="flex flex-col gap-2">
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Chapter name (optional)"
              className="w-full bg-surface border border-border rounded px-3 py-1.5 text-xs text-text-secondary placeholder:text-text-muted focus:outline-none focus:border-accent"
            />
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) handleAdd(); }}
              placeholder="Paste content here… (Ctrl+Enter to add)"
              rows={7}
              className="w-full bg-surface border border-border rounded px-3 py-2 text-xs text-text-secondary placeholder:text-text-muted resize-y focus:outline-none focus:border-accent font-mono"
            />
            <div className="flex items-center justify-between">
              <span className="text-[10px] text-text-muted">
                {text.trim() ? `${text.trim().split(/\s+/).length.toLocaleString()} words` : "Ctrl+Enter to add"}
              </span>
              <Button
                size="sm"
                onClick={handleAdd}
                disabled={!text.trim()}
                className="bg-accent hover:bg-accent/90 disabled:opacity-40 h-7 px-3 text-xs"
              >
                Add chapter
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
