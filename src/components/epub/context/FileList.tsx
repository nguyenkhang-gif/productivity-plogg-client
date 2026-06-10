import { X } from "lucide-react";
import type { TxtFileEntry } from "@/core/hooks/epub/useTxtFiles";
import type { BatchPreview } from "@/core/hooks/epub/useRollingContext";

interface FileListProps {
  files: TxtFileEntry[];
  batchPreview: BatchPreview | null;
  threshold: number;
  nextChapter: number;
  onRemove: (name: string) => void;
}

export function FileList({ files, batchPreview, nextChapter, onRemove }: FileListProps) {
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
    <div className="bg-surface-raised rounded-xl overflow-hidden">
      <div className="px-4 py-2.5 border-b border-border flex items-center justify-between">
        <p className="text-xs font-semibold text-text-muted uppercase tracking-wider">Files</p>
        <p className="text-xs text-text-muted">{files.length} loaded</p>
      </div>
      <div className="overflow-y-auto max-h-[420px]">
        {files.map((entry) => {
          const inBatch = batchIndices.has(entry.chapter.index);
          const processed = processedIndices.has(entry.chapter.index);
          return (
            <div
              key={entry.name}
              className={`flex items-center gap-2 px-4 py-2 border-b border-border/50 last:border-0 group ${
                processed ? "opacity-40" : ""
              }`}
            >
              <div className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                processed ? "bg-green-600" : inBatch ? "bg-accent" : "bg-text-muted"
              }`} />
              <div className="flex-1 min-w-0">
                <p className="text-xs text-text-secondary truncate">{entry.name}</p>
                <p className="text-[10px] text-text-muted">{entry.chapter.wordCount.toLocaleString()} words</p>
              </div>
              <button
                onClick={() => onRemove(entry.name)}
                className="opacity-0 group-hover:opacity-100 transition-opacity text-text-muted hover:text-red-400"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          );
        })}
      </div>
      <div className="px-4 py-2 border-t border-border flex gap-3 text-[10px] text-text-muted">
        <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-green-600 inline-block" />done</span>
        <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-accent inline-block" />next batch</span>
        <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-text-muted inline-block" />queued</span>
      </div>
    </div>
  );
}
