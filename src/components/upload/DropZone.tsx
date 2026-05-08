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
          ? "border-blue-500 bg-blue-500/10"
          : "border-white/10 hover:border-blue-500/50 hover:bg-white/[0.02]"
      }`}
    >
      <input
        ref={inputRef}
        type="file"
        multiple
        className="hidden"
        onChange={(e) => { if (e.target.files?.length) onFiles(e.target.files); e.target.value = ""; }}
      />
      <Upload size={32} className="text-slate-500" />
      <p className="text-slate-400 text-sm">Kéo thả file vào đây hoặc click để chọn</p>
      <p className="text-slate-600 text-xs">
        {tab === "files" ? "Ảnh, tài liệu, v.v." : "PNG, JPG, SVG cho avatar/icon"}
      </p>
    </div>
  );
}
