"use client";

import { useCallback, useEffect, useState } from "react";
import {
  PomodoroNote,
  getNotes,
  saveNotes,
} from "@/core/lib/pomodoro/coffeeFocusStore";

export function usePomodoroNotes() {
  // Empty on first render (matches server HTML); real notes load after mount.
  const [notes, setNotes] = useState<PomodoroNote[]>([]);

  useEffect(() => {
    setNotes(getNotes());
  }, []);

  const update = useCallback((next: PomodoroNote[]) => {
    setNotes(next);
    saveNotes(next);
  }, []);

  const addNote = useCallback(
    (text: string) => {
      const trimmed = text.trim();
      if (!trimmed) return;
      const note: PomodoroNote = {
        id: crypto.randomUUID(),
        text: trimmed,
        done: false,
        createdAt: Date.now(),
      };
      update([note, ...notes]);
    },
    [notes, update]
  );

  const toggleNote = useCallback(
    (id: string) => {
      update(notes.map((n) => (n.id === id ? { ...n, done: !n.done } : n)));
    },
    [notes, update]
  );

  const removeNote = useCallback(
    (id: string) => {
      update(notes.filter((n) => n.id !== id));
    },
    [notes, update]
  );

  /** Edit a task's text. Empty result keeps the old text (delete is explicit). */
  const editNote = useCallback(
    (id: string, text: string) => {
      const trimmed = text.trim();
      if (!trimmed) return;
      update(notes.map((n) => (n.id === id ? { ...n, text: trimmed } : n)));
    },
    [notes, update]
  );

  /** Move an ongoing task within the ongoing group (drag & drop). Finished
   *  tasks keep their own order at the bottom. */
  const reorderActive = useCallback(
    (fromIndex: number, toIndex: number) => {
      const active = notes.filter((n) => !n.done);
      const done = notes.filter((n) => n.done);
      if (
        fromIndex < 0 || fromIndex >= active.length ||
        toIndex < 0 || toIndex >= active.length
      ) {
        return;
      }
      const [moved] = active.splice(fromIndex, 1);
      active.splice(toIndex, 0, moved);
      update([...active, ...done]);
    },
    [notes, update]
  );

  // Ongoing first (user-ordered via drag), done sink to the bottom
  const ongoing = notes.filter((n) => !n.done);
  const finished = notes.filter((n) => n.done);

  return { ongoing, finished, addNote, toggleNote, removeNote, editNote, reorderActive };
}
