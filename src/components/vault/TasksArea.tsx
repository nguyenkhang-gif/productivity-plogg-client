"use client";

import { useSelector } from "react-redux";
import type { RootState } from "@/core/redux/store";
import { VaultProvider } from "@/core/lib/vault/vaultStore";
import VaultTaskList from "./VaultTaskList";
import NotesSection from "@/components/pomodoro/NotesSection";

/**
 * Renders VaultTaskList (encrypted, synced) for logged-in users,
 * NotesSection (local-only) for guests.
 * VaultProvider is only mounted when the user is authenticated.
 */
export default function TasksArea() {
  const { isAuth } = useSelector((state: RootState) => state.user);

  if (isAuth) {
    return (
      <VaultProvider>
        <VaultTaskList />
      </VaultProvider>
    );
  }

  return <NotesSection />;
}
