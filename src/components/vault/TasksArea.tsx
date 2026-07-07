"use client";

import { useState } from "react";
import { ShieldCheck } from "lucide-react";
import { useSelector } from "react-redux";
import type { RootState } from "@/core/redux/store";
import { VaultProvider } from "@/core/lib/vault/vaultStore";
import VaultTaskList from "./VaultTaskList";
import NotesSection from "@/components/pomodoro/NotesSection";

const SKIP_KEY = "vault_skipped";

export default function TasksArea() {
  const { isAuth } = useSelector((state: RootState) => state.user);
  const [skipped, setSkipped] = useState(() =>
    typeof window !== "undefined" && localStorage.getItem(SKIP_KEY) === "true"
  );

  function handleSkip() {
    localStorage.setItem(SKIP_KEY, "true");
    setSkipped(true);
  }

  function handleEnable() {
    localStorage.removeItem(SKIP_KEY);
    setSkipped(false);
  }

  if (isAuth && !skipped) {
    return (
      <VaultProvider>
        <VaultTaskList onSkip={handleSkip} />
      </VaultProvider>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      <NotesSection />
      {isAuth && (
        <button
          onClick={handleEnable}
          className="flex items-center gap-1.5 text-xs text-text-muted hover:text-blue-400 transition-colors self-start"
        >
          <ShieldCheck size={12} />
          Enable encrypted vault
        </button>
      )}
    </div>
  );
}
