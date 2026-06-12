import { Upload, FileText, Loader2, X } from "lucide-react";
import { useFileHelpers } from "@/core/hooks/useFileHelpers";
import { Bucket, PendingFile } from "./types";

interface Props {
  pending: PendingFile[];
  tab: Bucket;
  providerLabel: string;
  isUploading: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  onRemove: (idx: number) => void;
}

export default function UploadConfirmModal({
  pending,
  tab,
  providerLabel,
  isUploading,
  onConfirm,
  onCancel,
  onRemove,
}: Props) {
  const { formatBytes } = useFileHelpers();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
      <div className="bg-modal border border-border rounded-2xl w-full max-w-md shadow-2xl">
        <div className="flex items-center justify-between px-5 py-4 border-b border-border">
          <div>
            <p className="text-text-primary font-semibold">Xác nhận upload</p>
            <p className="text-text-muted text-xs mt-0.5">
              {pending.length} file · bucket&nbsp;
              <span className="text-accent-text">{tab}</span>&nbsp;·&nbsp;
              <span className="text-accent-text">{providerLabel}</span>
            </p>
          </div>
          <button
            onClick={onCancel}
            className="p-1.5 rounded-lg text-text-muted hover:text-text-primary hover:bg-surface-raised transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        <div className="px-5 py-4 flex flex-col gap-2 max-h-64 overflow-y-auto">
          {pending.map((p, idx) => (
            <div key={idx} className="flex items-center gap-3 bg-surface-raised rounded-xl px-3 py-2">
              <div className="w-10 h-10 rounded-lg overflow-hidden flex-shrink-0 bg-overlay flex items-center justify-center">
                {p.previewUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={p.previewUrl} alt={p.file.name} className="object-cover w-full h-full" />
                ) : (
                  <FileText size={18} className="text-text-muted" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-text-secondary text-xs font-medium truncate">{p.file.name}</p>
                <p className="text-text-muted text-[10px]">{formatBytes(p.file.size)}</p>
              </div>
              <button
                onClick={() => onRemove(idx)}
                className="p-1 rounded-lg text-text-muted hover:text-red-400 hover:bg-red-400/10 transition-colors flex-shrink-0"
              >
                <X size={13} />
              </button>
            </div>
          ))}
        </div>

        <div className="flex gap-2 px-5 py-4 border-t border-border">
          <button
            onClick={onCancel}
            disabled={isUploading}
            className="flex-1 py-2.5 rounded-xl border border-border text-text-muted text-sm hover:bg-surface-raised transition-colors disabled:opacity-40"
          >
            Hủy
          </button>
          <button
            onClick={onConfirm}
            disabled={isUploading || pending.length === 0}
            className="flex-1 py-2.5 rounded-xl bg-accent hover:bg-accent/90 text-white text-sm font-medium transition-colors disabled:opacity-40 flex items-center justify-center gap-2"
          >
            {isUploading ? (
              <><Loader2 size={14} className="animate-spin" />Đang upload...</>
            ) : (
              <><Upload size={14} />Upload {pending.length} file</>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
