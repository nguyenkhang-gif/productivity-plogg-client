import { Loader2, Trash2, LucideIcon } from "lucide-react";

interface Props {
  title: string;
  subtitle?: string;
  message?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  isLoading?: boolean;
  loadingLabel?: string;
  icon?: LucideIcon;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function ConfirmDialog({
  title,
  subtitle,
  message,
  confirmLabel = "Xóa",
  cancelLabel = "Hủy",
  isLoading = false,
  loadingLabel = "Đang xử lý...",
  icon: Icon = Trash2,
  onConfirm,
  onCancel,
}: Props) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
      <div className="bg-modal border border-white/[0.08] rounded-2xl w-full max-w-sm shadow-2xl p-6 flex flex-col gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-red-500/10 flex items-center justify-center flex-shrink-0">
            <Icon size={18} className="text-red-400" />
          </div>
          <div>
            <p className="text-white font-semibold text-sm">{title}</p>
            {subtitle && (
              <p className="text-slate-500 text-xs mt-0.5 truncate max-w-[220px]">{subtitle}</p>
            )}
          </div>
        </div>

        {message && <p className="text-slate-400 text-sm">{message}</p>}

        <div className="flex gap-2">
          <button
            onClick={onCancel}
            disabled={isLoading}
            className="flex-1 py-2.5 rounded-xl border border-white/10 text-slate-400 text-sm hover:bg-white/5 transition-colors disabled:opacity-40"
          >
            {cancelLabel}
          </button>
          <button
            onClick={onConfirm}
            disabled={isLoading}
            className="flex-1 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white text-sm font-medium transition-colors disabled:opacity-40 flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <><Loader2 size={14} className="animate-spin" />{loadingLabel}</>
            ) : (
              <><Icon size={14} />{confirmLabel}</>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
