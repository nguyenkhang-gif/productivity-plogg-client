"use client";

import { useRef, useState, DragEvent } from "react";
import { Upload, Loader2 } from "lucide-react";

interface FileDropZoneProps {
  accept: string;
  multiple?: boolean;
  isLoading?: boolean;
  label: string;
  sublabel?: string;
  stats?: React.ReactNode;
  onFiles: (files: FileList) => void;
}

export function FileDropZone({
  accept, multiple = false, isLoading = false,
  label, sublabel, stats, onFiles,
}: FileDropZoneProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const dragCounterRef = useRef(0);
  const [isDragging, setIsDragging] = useState(false);

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    dragCounterRef.current = 0;
    setIsDragging(false);
    if (e.dataTransfer.files.length) onFiles(e.dataTransfer.files);
  };

  return (
    <div
      onDrop={handleDrop}
      onDragEnter={(e) => { e.preventDefault(); dragCounterRef.current += 1; setIsDragging(true); }}
      onDragOver={(e) => { e.preventDefault(); }}
      onDragLeave={() => { dragCounterRef.current -= 1; if (dragCounterRef.current === 0) setIsDragging(false); }}
      onClick={() => inputRef.current?.click()}
      className={`border-2 border-dashed rounded-xl px-6 py-5 cursor-pointer transition-colors flex items-center gap-4 ${
        isDragging
          ? "border-accent bg-accent/10"
          : "border-border hover:border-accent/50 bg-surface-raised"
      }`}
    >
      {isLoading
        ? <Loader2 className="h-5 w-5 animate-spin text-accent shrink-0" />
        : <Upload className="h-5 w-5 text-text-muted shrink-0" />
      }
      <div>
        <p className="text-sm text-text-secondary font-medium">{label}</p>
        {sublabel && <p className="text-xs text-text-muted mt-0.5">{sublabel}</p>}
      </div>
      {stats && <div className="ml-auto text-right">{stats}</div>}
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        multiple={multiple}
        className="hidden"
        onChange={(e) => {
          if (e.target.files?.length) onFiles(e.target.files);
          e.target.value = "";
        }}
      />
    </div>
  );
}
