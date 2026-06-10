"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { ExtractedChapter } from "@/core/lib/epub/extractChapters";

interface PasteTextSectionProps {
  addChapters: (chapters: ExtractedChapter[]) => void;
}

export function PasteTextSection({ addChapters }: PasteTextSectionProps) {
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
    <div className="border border-border rounded-xl overflow-hidden">
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full px-4 py-2.5 flex items-center gap-2 text-xs text-text-muted hover:text-text-secondary hover:bg-white/5 transition-colors text-left"
      >
        {open ? <ChevronUp className="h-3.5 w-3.5 shrink-0" /> : <ChevronDown className="h-3.5 w-3.5 shrink-0" />}
        Hoặc paste text trực tiếp
      </button>
      {open && (
        <div className="border-t border-border p-3 flex flex-col gap-2 bg-surface-raised">
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Tên chapter (tuỳ chọn)"
            className="w-full bg-surface border border-border rounded px-3 py-1.5 text-xs text-text-secondary placeholder:text-text-muted focus:outline-none focus:border-accent"
          />
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Paste nội dung vào đây... (Ctrl+Enter để thêm)"
            rows={6}
            className="w-full bg-surface border border-border rounded px-3 py-2 text-xs text-text-secondary placeholder:text-text-muted resize-y focus:outline-none focus:border-accent font-mono"
          />
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-text-muted">
              {text.trim() ? `${text.trim().split(/\s+/).length.toLocaleString()} words` : ""}
            </span>
            <Button
              size="sm"
              onClick={handleAdd}
              disabled={!text.trim()}
              className="bg-accent hover:bg-accent/90 disabled:opacity-40 h-7 px-3 text-xs"
            >
              Thêm chapter
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
