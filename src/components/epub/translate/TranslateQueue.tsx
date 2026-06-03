import { CheckCircle2, Loader2, XCircle, X } from "lucide-react";
import type { TxtFileEntry } from "@/core/hooks/epub/useTxtFiles";

interface TranslateQueueProps {
  files: TxtFileEntry[];
  isRunning: boolean;
  getFileStatus: (title: string, index: number) => string;
  onRemove: (name: string) => void;
}

export function TranslateQueue({ files, isRunning, getFileStatus, onRemove }: TranslateQueueProps) {
  return (
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
                  onClick={() => onRemove(entry.name)}
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
  );
}
