import { CheckCircle2 } from "lucide-react";
import type { BatchPreview } from "@/core/hooks/epub/useRollingContext";

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-surface rounded-lg px-3 py-2">
      <p className="text-[10px] text-gray-500">{label}</p>
      <p className="text-gray-200 font-medium text-sm mt-0.5">{value}</p>
    </div>
  );
}

interface BatchPreviewPanelProps {
  batchPreview: BatchPreview | null;
  totalFiles: number;
  nextChapter: number;
  threshold: number;
  hasPrompt: boolean;
  status: string;
}

export function BatchPreviewPanel({
  batchPreview, totalFiles, nextChapter, threshold, hasPrompt, status,
}: BatchPreviewPanelProps) {
  if (status === "done") {
    return (
      <div className="bg-surface-raised rounded-xl p-4">
        <p className="text-sm text-green-400 flex items-center gap-2">
          <CheckCircle2 className="h-4 w-4" />All files processed.
        </p>
      </div>
    );
  }

  const remaining = totalFiles - (nextChapter - 1);

  return (
    <div className="bg-surface-raised rounded-xl p-4">
      <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Batch Preview</p>
      {!hasPrompt ? (
        <p className="text-xs text-gray-500">Nhập Base Prompt để xem batch preview.</p>
      ) : !batchPreview ? (
        <p className="text-xs text-red-400">Budget quá nhỏ — tăng Word Threshold.</p>
      ) : (
        <div className="grid grid-cols-2 gap-2 text-sm">
          <Stat label="Remaining" value={`${remaining} files`} />
          <Stat label="Batch" value={`${batchPreview.count} files`} />
          <Stat label="Batch words" value={batchPreview.totalWords.toLocaleString()} />
          <Stat label="Budget" value={`${batchPreview.budget.toLocaleString()} / ${threshold.toLocaleString()}`} />
        </div>
      )}
    </div>
  );
}
