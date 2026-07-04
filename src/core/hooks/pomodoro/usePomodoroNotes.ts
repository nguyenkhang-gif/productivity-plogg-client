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

  // Active first (newest on top), done sink to the bottom
  const sorted = [
    ...notes.filter((n) => !n.done),
    ...notes.filter((n) => n.done),
  ];

  return { notes: sorted, addNote, toggleNote, removeNote };
}
