"use client";

import { useState } from "react";
import { Plus, X, Circle, CheckCircle2 } from "lucide-react";
import { usePomodoroNotes } from "@/core/hooks/pomodoro/usePomodoroNotes";

export default function NotesSection() {
  const { notes, addNote, toggleNote, removeNote } = usePomodoroNotes();
  const [text, setText] = useState("");

  const doneCount = notes.filter((n) => n.done).length;

  const handleAdd = () => {
    if (!text.trim()) return;
    addNote(text);
    setText("");
  };

  return (
    <div className="w-full flex flex-col gap-3">
      {/* header */}
      <div className="flex items-center justify-between border-b-2 border-border pb-2">
        <h2 className="text-sm font-bold text-text-primary tracking-wide">Tasks</h2>
        {notes.length > 0 && (
          <span className="text-xs font-semibold text-text-muted">
            {doneCount}/{notes.length}
          </span>
        )}
      </div>

      {/* task cards */}
      {notes.length > 0 && (
        <ul className="max-h-48 overflow-y-auto flex flex-col gap-2 pr-0.5">
          {notes.map((note) => (
            <li
              key={note.id}
              className={`group flex items-center gap-3 bg-surface-raised rounded-lg px-3 py-3 border-l-4 transition-colors ${
                note.done ? "border-l-transparent opacity-60" : "border-l-coffee"
              }`}
            >
              <button
                onClick={() => toggleNote(note.id)}
                aria-label={note.done ? "Mark as not done" : "Mark as done"}
                className="shrink-0 text-text-muted hover:text-coffee transition-colors"
              >
                {note.done ? (
                  <CheckCircle2 className="h-5 w-5 text-coffee" />
                ) : (
                  <Circle className="h-5 w-5" />
                )}
              </button>
              <span
                className={`flex-1 text-sm font-semibold break-words ${
                  note.done
                    ? "line-through text-text-muted"
                    : "text-text-primary"
                }`}
              >
                {note.text}
              </span>
              <button
                onClick={() => removeNote(note.id)}
                aria-label="Delete task"
                className="p-1.5 rounded text-text-muted hover:text-red-400 opacity-60 md:opacity-0 md:group-hover:opacity-100 transition-opacity shrink-0"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </li>
          ))}
        </ul>
      )}

      {/* dashed add row — capturing a thought must never touch the timer */}
      <div className="flex items-center gap-2 border-2 border-dashed border-border rounded-lg px-3 py-2.5 focus-within:border-coffee transition-colors">
        <Plus className="h-4 w-4 text-text-muted shrink-0" />
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter") handleAdd(); }}
          placeholder="Add a task or thought…"
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
    </div>
  );
}
