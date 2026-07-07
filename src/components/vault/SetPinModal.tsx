"use client";

import { useState, useRef } from "react";
import { KeyRound, Loader2, AlertTriangle, Eye, EyeOff } from "lucide-react";
import { useVault } from "@/core/lib/vault/vaultStore";

export default function SetPinModal() {
  const { setupVault } = useVault();
  const [pin, setPin] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPin, setShowPin] = useState(false);
  const confirmRef = useRef<HTMLInputElement>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (pin.length < 6) {
      setError("PIN must be at least 6 characters.");
      return;
    }
    if (pin !== confirm) {
      setError("PINs do not match, please try again.");
      setConfirm("");
      confirmRef.current?.focus();
      return;
    }

    setLoading(true);
    try {
      await setupVault(pin);
    } catch {
      setError("Failed to create vault. Please try again.");
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
      <div className="bg-modal border border-border rounded-2xl w-full max-w-sm shadow-2xl p-6 flex flex-col gap-5">
        {/* header */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center flex-shrink-0">
            <KeyRound size={18} className="text-blue-400" />
          </div>
          <div>
            <p className="text-text-primary font-semibold text-sm">Enable Vault Task List</p>
            <p className="text-text-muted text-xs mt-0.5">End-to-end encrypted — server cannot read your data</p>
          </div>
        </div>

        {/* warnings */}
        <div className="flex flex-col gap-2">
          <div className="flex gap-2 p-3 rounded-xl bg-amber-500/10 border border-amber-500/20">
            <AlertTriangle size={14} className="text-amber-400 flex-shrink-0 mt-0.5" />
            <p className="text-amber-300 text-xs leading-relaxed">
              <strong>Forget your PIN = lose all tasks.</strong> There is no way to recover — not even the admin can help.
            </p>
          </div>
          <div className="flex gap-2 p-3 rounded-xl bg-surface-raised border border-border">
            <AlertTriangle size={14} className="text-text-muted flex-shrink-0 mt-0.5" />
            <p className="text-text-muted text-xs leading-relaxed">
              Your PIN can be longer than 6 characters or a passphrase. The longer, the harder to crack.
            </p>
          </div>
        </div>

        {/* form */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between">
              <label className="text-text-muted text-xs">Vault PIN</label>
              <button
                type="button"
                onClick={() => setShowPin((v) => !v)}
                className="flex items-center gap-1 text-xs text-text-muted hover:text-text-secondary transition-colors"
              >
                {showPin ? <EyeOff size={12} /> : <Eye size={12} />}
                {showPin ? "Hide" : "Show"}
              </button>
            </div>
            <input
              type={showPin ? "text" : "password"}
              inputMode="numeric"
              autoFocus
              value={pin}
              onChange={(e) => setPin(e.target.value)}
              placeholder="Minimum 6 characters"
              disabled={loading}
              className="w-full px-3 py-2.5 rounded-xl bg-surface-raised border border-border text-text-primary text-sm placeholder:text-text-muted focus:outline-none focus:border-blue-500 transition-colors disabled:opacity-40 tracking-widest"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-text-muted text-xs">Confirm PIN</label>
            <input
              ref={confirmRef}
              type={showPin ? "text" : "password"}
              inputMode="numeric"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              placeholder="Re-enter PIN"
              disabled={loading}
              className="w-full px-3 py-2.5 rounded-xl bg-surface-raised border border-border text-text-primary text-sm placeholder:text-text-muted focus:outline-none focus:border-blue-500 transition-colors disabled:opacity-40 tracking-widest"
            />
          </div>

          {error && <p className="text-red-400 text-xs">{error}</p>}

          <button
            type="submit"
            disabled={loading || !pin || !confirm}
            className="mt-1 w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium transition-colors disabled:opacity-40 flex items-center justify-center gap-2"
          >
            {loading ? (
              <><Loader2 size={14} className="animate-spin" />Creating vault...</>
            ) : (
              <><KeyRound size={14} />Create vault</>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
