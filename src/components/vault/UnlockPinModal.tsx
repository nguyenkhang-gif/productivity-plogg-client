"use client";

import { useState } from "react";
import { LockKeyhole, Loader2, ShieldAlert } from "lucide-react";
import { useVault } from "@/core/lib/vault/vaultStore";

const MAX_ATTEMPTS = 5;

interface Props {
  onForgotPin: () => void;
}

export default function UnlockPinModal({ onForgotPin }: Props) {
  const { unlock } = useVault();
  const [pin, setPin] = useState("");
  const [loading, setLoading] = useState(false);
  const [attempts, setAttempts] = useState(0);
  const [error, setError] = useState("");

  const remaining = MAX_ATTEMPTS - attempts;
  const blocked = remaining <= 0;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (blocked || loading || !pin) return;
    setError("");
    setLoading(true);
    try {
      await unlock(pin);
      // On success, VaultProvider updates status → this modal unmounts
    } catch {
      const next = attempts + 1;
      setAttempts(next);
      setPin("");
      if (MAX_ATTEMPTS - next <= 0) {
        setError("Too many failed attempts. Use 'Forgot PIN' to reset your vault.");
      } else {
        setError(`Incorrect PIN. ${MAX_ATTEMPTS - next} attempt${MAX_ATTEMPTS - next === 1 ? "" : "s"} remaining.`);
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
      <div className="bg-modal border border-border rounded-2xl w-full max-w-sm shadow-2xl p-6 flex flex-col gap-5">
        {/* header */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center flex-shrink-0">
            <LockKeyhole size={18} className="text-blue-400" />
          </div>
          <div>
            <p className="text-text-primary font-semibold text-sm">Unlock Vault</p>
            <p className="text-text-muted text-xs mt-0.5">Enter your PIN to view the task list</p>
          </div>
        </div>

        {blocked ? (
          <div className="flex flex-col gap-4">
            <div className="flex gap-2 p-3 rounded-xl bg-red-500/10 border border-red-500/20">
              <ShieldAlert size={14} className="text-red-400 flex-shrink-0 mt-0.5" />
              <p className="text-red-300 text-xs leading-relaxed">
                Too many failed attempts ({MAX_ATTEMPTS}). If you forgot your PIN, you can only delete the vault and start over.
              </p>
            </div>
            <button
              onClick={onForgotPin}
              className="w-full py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white text-sm font-medium transition-colors"
            >
              Forgot PIN — delete vault
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col gap-3">
            <div className="flex flex-col gap-1.5">
              <label className="text-text-muted text-xs">Vault PIN</label>
              <input
                type="password"
                inputMode="numeric"
                autoFocus
                value={pin}
                onChange={(e) => setPin(e.target.value)}
                placeholder="Enter PIN"
                disabled={loading}
                className="w-full px-3 py-2.5 rounded-xl bg-surface-raised border border-border text-text-primary text-sm placeholder:text-text-muted focus:outline-none focus:border-blue-500 transition-colors disabled:opacity-40 tracking-widest"
              />
            </div>

            {error && (
              <p className="text-red-400 text-xs">{error}</p>
            )}

            {attempts > 0 && !error && (
              <p className="text-text-muted text-xs">{remaining} attempt{remaining === 1 ? "" : "s"} remaining.</p>
            )}

            <button
              type="submit"
              disabled={loading || !pin}
              className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium transition-colors disabled:opacity-40 flex items-center justify-center gap-2"
            >
              {loading ? (
                <><Loader2 size={14} className="animate-spin" />Unlocking...</>
              ) : (
                <><LockKeyhole size={14} />Unlock</>
              )}
            </button>

            <button
              type="button"
              onClick={onForgotPin}
              className="text-text-muted text-xs hover:text-text-secondary transition-colors text-center"
            >
              Forgot PIN?
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
