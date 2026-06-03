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
  const [isDragging, setIsDragging] = useState(false);

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files.length) onFiles(e.dataTransfer.files);
  };

  return (
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
        <p className="text-sm text-gray-300 font-medium">{label}</p>
        {sublabel && <p className="text-xs text-gray-500 mt-0.5">{sublabel}</p>}
      </div>
      {stats && <div className="ml-auto text-right">{stats}</div>}
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        multiple={multiple}
        className="hidden"
        onChange={(e) => { if (e.target.files?.length) onFiles(e.target.files); }}
      />
    </div>
  );
}
