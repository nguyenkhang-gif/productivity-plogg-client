"use client";

import { usePomodoroNotes } from "@/core/hooks/pomodoro/usePomodoroNotes";
import TaskListPanel from "@/components/tasks/TaskListPanel";

export default function NotesSection() {
  const { ongoing, finished, addNote, toggleNote, removeNote, editNoteFull, reorderActive } =
    usePomodoroNotes();

  return (
    <TaskListPanel
      ongoing={ongoing}
      finished={finished}
      onAdd={addNote}
      onToggle={toggleNote}
      onRemove={removeNote}
      onSaveFull={editNoteFull}
      onReorder={reorderActive}
      doneLabel="finished"
    />
  );
}
