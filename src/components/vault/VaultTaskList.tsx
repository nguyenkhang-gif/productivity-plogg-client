"use client";

import { useState } from "react";
import { Lock, LockOpen, AlertTriangle, RefreshCw } from "lucide-react";
import { useVault } from "@/core/lib/vault/vaultStore";
import TaskListPanel from "@/components/tasks/TaskListPanel";
import SetPinModal from "./SetPinModal";
import UnlockPinModal from "./UnlockPinModal";
import WipeConfirmModal from "./WipeConfirmModal";

interface Props {
  onSkip?: () => void;
}

export default function VaultTaskList({ onSkip }: Props) {
  const {
    status, tasks, nearLimit, isRefreshing,
    addTask, updateTask, deleteTask, reorderTasks, lock, refresh,
  } = useVault();
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

  return (
    <>
      {showWipe && <WipeConfirmModal onCancel={() => setShowWipe(false)} />}

      <div className="w-full flex flex-col gap-3">
        {/* near-limit warning */}
        {nearLimit && (
          <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-amber-500/10 border border-amber-500/20">
            <AlertTriangle size={13} className="text-amber-400 flex-shrink-0" />
            <p className="text-amber-300 text-xs">Task list is almost full (64KB). Please delete some tasks.</p>
          </div>
        )}

        <TaskListPanel
          ongoing={ongoing}
          finished={finished}
          onAdd={addTask}
          onToggle={(id) => updateTask(id, { done: !tasks.find((t) => t.id === id)?.done })}
          onRemove={deleteTask}
          onSaveFull={(id, patch) => updateTask(id, patch)}
          onReorder={reorderTasks}
          addPlaceholder="Add a task…"
          doneLabel="done"
          titleExtra={
            <span className="flex items-center gap-1 text-xs text-text-muted">
              <LockOpen size={10} className="text-blue-400" />
              Encrypted
            </span>
          }
          headerActions={
            <>
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
            </>
          }
        />

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
