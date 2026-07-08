"use client";

import { useState } from "react";
import {
  Plus, X, Circle, CheckCircle2, Lock, LockOpen, AlertTriangle, RefreshCw,
} from "lucide-react";
import { useVault } from "@/core/lib/vault/vaultStore";
import SetPinModal from "./SetPinModal";
import UnlockPinModal from "./UnlockPinModal";
import WipeConfirmModal from "./WipeConfirmModal";

interface Props {
  onSkip?: () => void;
}

export default function VaultTaskList({ onSkip }: Props) {
  const { status, tasks, nearLimit, isRefreshing, addTask, updateTask, deleteTask, lock, refresh } = useVault();
  const [text, setText] = useState("");
  const [showWipe, setShowWipe] = useState(false);

  // ---------- loading ----------

  if (status === "loading") {
    return (
      <div className="w-full flex flex-col gap-3">
        <div className="flex items-center justify-between border-b-2 border-border pb-2">
          <h2 className="text-sm font-bold text-text-primary tracking-wide">Tasks</h2>
          <span className="text-xs text-text-muted animate-pulse">Loading…</span>
        </div>
        <div className="flex flex-col gap-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-10 rounded-lg bg-surface-raised animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  // ---------- PIN modals (rendered over everything) ----------

  if (status === "no-vault") return <SetPinModal onSkip={onSkip} />;

  if (status === "locked") {
    if (showWipe) return <WipeConfirmModal onCancel={() => setShowWipe(false)} />;
    return <UnlockPinModal onForgotPin={() => setShowWipe(true)} />;
  }

  // ---------- unlocked ----------

  const ongoing = tasks.filter((t) => !t.done);
  const finished = tasks.filter((t) => t.done);
  const total = tasks.length;

  function handleAdd() {
    if (!text.trim()) return;
    addTask(text.trim());
    setText("");
  }

  return (
    <>
      {showWipe && <WipeConfirmModal onCancel={() => setShowWipe(false)} />}

      <div className="w-full flex flex-col gap-3">
        {/* header */}
        <div className="flex items-center justify-between border-b-2 border-border pb-2">
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-bold text-text-primary tracking-wide">Tasks</h2>
            <span className="flex items-center gap-1 text-xs text-text-muted">
              <LockOpen size={10} className="text-blue-400" />
              Encrypted
            </span>
          </div>
          <div className="flex items-center gap-3">
            {total > 0 && (
              <span className="text-xs font-semibold text-text-muted">
                <span style={{ color: "var(--drink)" }}>{ongoing.length} ongoing</span>
                {" · "}
                {finished.length} done
              </span>
            )}
            <button
              onClick={() => refresh()}
              disabled={isRefreshing}
              title="Refresh from server"
              aria-label="Refresh tasks"
              className="p-1 rounded text-text-muted hover:text-text-primary hover:bg-surface-raised transition-colors disabled:opacity-40"
            >
              <RefreshCw size={13} className={isRefreshing ? "animate-spin" : ""} />
            </button>
            <button
              onClick={() => lock()}
              title="Lock vault"
              aria-label="Lock vault"
              className="p-1 rounded text-text-muted hover:text-text-primary hover:bg-surface-raised transition-colors"
            >
              <Lock size={13} />
            </button>
          </div>
        </div>

        {/* near-limit warning */}
        {nearLimit && (
          <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-amber-500/10 border border-amber-500/20">
            <AlertTriangle size={13} className="text-amber-400 flex-shrink-0" />
            <p className="text-amber-300 text-xs">Task list is almost full (64KB). Please delete some tasks.</p>
          </div>
        )}

        {/* task list */}
        {total > 0 && (
          <ul className="max-h-[28rem] overflow-y-auto flex flex-col gap-2 pr-0.5">
            {ongoing.map((task) => (
              <li
                key={task.id}
                className="group flex items-center gap-2 bg-surface-raised rounded-lg px-2 py-3 border-l-4 border-l-coffee"
              >
                <button
                  onClick={() => updateTask(task.id, { done: true })}
                  aria-label="Mark as done"
                  className="shrink-0 text-text-muted hover:text-coffee transition-colors"
                >
                  <Circle className="h-5 w-5" />
                </button>
                <span className="flex-1 text-base font-semibold text-text-primary break-words leading-snug">
                  {task.text}
                </span>
                <button
                  onClick={() => deleteTask(task.id)}
                  aria-label="Delete task"
                  className="p-1.5 rounded text-text-muted hover:text-red-400 opacity-60 md:opacity-0 md:group-hover:opacity-100 transition-opacity shrink-0"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </li>
            ))}
            {finished.map((task) => (
              <li
                key={task.id}
                className="group flex items-center gap-2 bg-surface-raised rounded-lg px-2 py-3 border-l-4 border-l-transparent opacity-60"
              >
                <button
                  onClick={() => updateTask(task.id, { done: false })}
                  aria-label="Mark as not done"
                  className="shrink-0 text-coffee"
                >
                  <CheckCircle2 className="h-5 w-5" />
                </button>
                <span className="flex-1 text-base font-semibold text-text-muted line-through break-words leading-snug">
                  {task.text}
                </span>
                <button
                  onClick={() => deleteTask(task.id)}
                  aria-label="Delete task"
                  className="p-1.5 rounded text-text-muted hover:text-red-400 opacity-60 md:opacity-0 md:group-hover:opacity-100 transition-opacity shrink-0"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </li>
            ))}
          </ul>
        )}

        {/* add row */}
        <div className="flex items-center gap-2 border-2 border-dashed border-border rounded-lg px-3 py-2.5 focus-within:border-coffee transition-colors">
          <Plus className="h-4 w-4 text-text-muted shrink-0" />
          <input
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") handleAdd(); }}
            placeholder="Add a task…"
            className="flex-1 bg-transparent text-sm font-semibold text-text-primary placeholder:text-text-muted focus:outline-none"
          />
          {text.trim() && (
            <button
              onClick={handleAdd}
              className="text-xs font-semibold text-coffee hover:text-coffee-foam transition-colors shrink-0"
            >
              Add
            </button>
          )}
        </div>

        {/* wipe link */}
        <button
          onClick={() => setShowWipe(true)}
          className="text-xs text-text-muted hover:text-red-400 transition-colors text-left"
        >
          Forgot PIN / Delete vault
        </button>
      </div>
    </>
  );
}
