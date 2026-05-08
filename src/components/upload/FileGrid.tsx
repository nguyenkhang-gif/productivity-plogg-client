import { Loader2, FolderOpen } from "lucide-react";
import { FileItem } from "@/core/services/api/upload";
import FileCard from "./FileCard";

interface Props {
  items: FileItem[];
  isLoading: boolean;
  // default mode
  copiedUrl?: string | null;
  onCopy?: (url: string) => void;
  onDelete?: (item: FileItem) => void;
  // selectable mode
  selectedUrl?: string | null;
  onSelect?: (item: FileItem) => void;
  columns?: "3" | "4";
}

export default function FileGrid({ items, isLoading, copiedUrl, onCopy, onDelete, selectedUrl, onSelect, columns = "4" }: Props) {
  if (isLoading) {
    return (
      <div className="flex justify-center py-16">
        <Loader2 size={28} className="text-blue-400 animate-spin" />
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-3 text-slate-600">
        <FolderOpen size={40} className="opacity-40" />
        <p className="text-sm">Chưa có file nào</p>
      </div>
    );
  }

  const gridClass = columns === "3"
    ? "grid grid-cols-2 sm:grid-cols-3 gap-3"
    : "grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3";

  return (
    <div className={gridClass}>
      {items.map((item) => (
        <FileCard
          key={item.publicUrl}
          item={item}
          isCopied={copiedUrl === item.publicUrl}
          onCopy={onCopy ? () => onCopy(item.publicUrl) : undefined}
          onDelete={onDelete ? () => onDelete(item) : undefined}
          isSelected={selectedUrl === item.publicUrl}
          onSelect={onSelect}
        />
      ))}
    </div>
  );
}
