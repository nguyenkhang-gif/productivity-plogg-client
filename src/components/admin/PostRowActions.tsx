import { Check, X, Trash2 } from "lucide-react";

export default function PostRowActions({
  busy,
  isPending,
  rejectReason,
  onReasonChange,
  onApprove,
  onReject,
  onDelete,
}: {
  busy: boolean;
  isPending: boolean;
  rejectReason: string;
  onReasonChange: (value: string) => void;
  onApprove: () => void;
  onReject: () => void;
  onDelete: () => void;
}) {
  return (
    <>
      {isPending && (
        <>
          <button
            onClick={onApprove}
            disabled={busy}
            title="Approve"
            className="p-1.5 rounded-lg bg-emerald-600/20 hover:bg-emerald-600/40 text-emerald-400 disabled:opacity-40 transition-colors"
          >
            <Check size={14} />
          </button>
          <div className="flex items-center gap-1">
            <input
              placeholder="Reason..."
              value={rejectReason}
              onChange={(e) => onReasonChange(e.target.value)}
              className="w-28 text-xs bg-white/5 border border-border rounded px-2 py-1 text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent"
            />
            <button
              onClick={onReject}
              disabled={busy}
              title="Reject"
              className="p-1.5 rounded-lg bg-red-600/20 hover:bg-red-600/40 text-red-400 disabled:opacity-40 transition-colors"
            >
              <X size={14} />
            </button>
          </div>
        </>
      )}
      <button
        onClick={onDelete}
        disabled={busy}
        title="Delete"
        className="p-1.5 rounded-lg bg-white/5 hover:bg-red-600/20 text-text-muted hover:text-red-400 disabled:opacity-40 transition-colors"
      >
        <Trash2 size={14} />
      </button>
    </>
  );
}
