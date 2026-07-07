"use client";

import { useState } from "react";
import { Trash2, Loader2, ShieldAlert } from "lucide-react";
import { useVault } from "@/core/lib/vault/vaultStore";

const CONFIRM_WORD = "DELETE";

interface Props {
  onCancel: () => void;
}

export default function WipeConfirmModal({ onCancel }: Props) {
  const { wipe } = useVault();
  const [typed, setTyped] = useState("");
  const [loading, setLoading] = useState(false);

  const confirmed = typed.trim() === CONFIRM_WORD;

  function handleWipe() {
    if (!confirmed || loading) return;
    setLoading(true);
    // wipe() is synchronous (mutation) — VaultProvider handles onSuccess reset
    wipe();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
      <div className="bg-modal border border-border rounded-2xl w-full max-w-sm shadow-2xl p-6 flex flex-col gap-5">
        {/* header */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-red-500/10 flex items-center justify-center flex-shrink-0">
            <ShieldAlert size={18} className="text-red-400" />
          </div>
          <div>
            <p className="text-text-primary font-semibold text-sm">Delete entire Vault</p>
            <p className="text-text-muted text-xs mt-0.5">This action cannot be undone</p>
          </div>
        </div>

        {/* warning */}
        <div className="flex flex-col gap-2">
          <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 space-y-1.5">
            <p className="text-red-300 text-xs leading-relaxed font-semibold">All tasks will be permanently deleted.</p>
            <ul className="text-red-300/80 text-xs leading-relaxed space-y-0.5 list-disc list-inside">
              <li>There is no way to recover your data.</li>
              <li>Not even the admin can read the old encrypted data.</li>
              <li>After deletion, you can set a new PIN and start with an empty list.</li>
            </ul>
          </div>
        </div>

        {/* confirm input */}
        <div className="flex flex-col gap-1.5">
          <label className="text-text-muted text-xs">
            Type <span className="text-red-400 font-mono font-semibold">{CONFIRM_WORD}</span> to confirm
          </label>
          <input
            type="text"
            autoFocus
            value={typed}
            onChange={(e) => setTyped(e.target.value)}
            placeholder={CONFIRM_WORD}
            disabled={loading}
            className="w-full px-3 py-2.5 rounded-xl bg-surface-raised border border-border text-text-primary text-sm placeholder:text-text-muted focus:outline-none focus:border-red-500 transition-colors disabled:opacity-40 font-mono tracking-wider"
          />
        </div>

        {/* actions */}
        <div className="flex gap-2">
          <button
            onClick={onCancel}
            disabled={loading}
            className="flex-1 py-2.5 rounded-xl border border-border text-text-muted text-sm hover:bg-surface-raised transition-colors disabled:opacity-40"
          >
            Cancel
          </button>
          <button
            onClick={handleWipe}
            disabled={!confirmed || loading}
            className="flex-1 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white text-sm font-medium transition-colors disabled:opacity-40 flex items-center justify-center gap-2"
          >
            {loading ? (
              <><Loader2 size={14} className="animate-spin" />Deleting...</>
            ) : (
              <><Trash2 size={14} />Delete vault</>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
