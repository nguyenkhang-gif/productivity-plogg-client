import { useRef, useState } from "react";
import { Upload } from "lucide-react";
import { Bucket } from "./types";

interface Props {
  tab: Bucket;
  onFiles: (files: FileList) => void;
}

export default function DropZone({ tab, onFiles }: Props) {
  const [isDragging, setIsDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files.length) onFiles(e.dataTransfer.files);
  };

  return (
    <div
      onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
      onDragLeave={() => setIsDragging(false)}
      onDrop={handleDrop}
      onClick={() => inputRef.current?.click()}
      className={`relative border-2 border-dashed rounded-2xl p-10 mb-6 flex flex-col items-center justify-center gap-3 cursor-pointer transition-colors ${
        isDragging
          ? "border-accent bg-accent/10"
          : "border-border hover:border-accent/50 hover:bg-surface-raised/50"
      }`}
    >
      <input
        ref={inputRef}
        type="file"
        multiple
        className="hidden"
        onChange={(e) => { if (e.target.files?.length) onFiles(e.target.files); e.target.value = ""; }}
      />
      <Upload size={32} className="text-text-muted" />
      <p className="text-text-secondary text-sm">Kéo thả file vào đây hoặc click để chọn</p>
      <p className="text-text-muted text-xs">
        {tab === "files" ? "Ảnh, tài liệu, v.v." : "PNG, JPG, SVG cho avatar/icon"}
      </p>
    </div>
  );
}
