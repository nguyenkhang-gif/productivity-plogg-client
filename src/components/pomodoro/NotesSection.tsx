"use client";

import { useState } from "react";
import { createPortal } from "react-dom";
import { Plus, X, Circle, CheckCircle2, GripVertical } from "lucide-react";
import {
  DndContext,
  DragOverlay,
  closestCenter,
  PointerSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { usePomodoroNotes } from "@/core/hooks/pomodoro/usePomodoroNotes";
import type { PomodoroNote } from "@/core/lib/pomodoro/coffeeFocusStore";

interface TaskRowProps {
  note: PomodoroNote;
  sortable: boolean;
  onToggle: (id: string) => void;
  onRemove: (id: string) => void;
  onEdit: (id: string, text: string) => void;
}

function TaskRow({ note, sortable, onToggle, onRemove, onEdit }: TaskRowProps) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(note.text);

  const startEdit = () => {
    setDraft(note.text);
    setEditing(true);
  };

  const commitEdit = () => {
    setEditing(false);
    if (draft.trim() && draft.trim() !== note.text) onEdit(note.id, draft);
  };

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: note.id, disabled: !sortable || editing });

  return (
    <li
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={`group flex items-center gap-2 bg-surface-raised rounded-lg px-2 py-3 border-l-4 transition-colors ${
        note.done ? "border-l-transparent opacity-60" : "border-l-coffee"
      } ${isDragging ? "opacity-30" : ""}`}
    >
      {sortable ? (
        <button
          {...attributes}
          {...listeners}
          aria-label="Drag to reorder"
          className="touch-none cursor-grab active:cursor-grabbing p-1 text-text-muted hover:text-text-primary shrink-0"
        >
          <GripVertical className="h-4 w-4" />
        </button>
      ) : (
        <span className="w-6 shrink-0" />
      )}
      <button
        onClick={() => onToggle(note.id)}
        aria-label={note.done ? "Mark as not done" : "Mark as done"}
        className="shrink-0 text-text-muted hover:text-coffee transition-colors"
      >
        {note.done ? (
          <CheckCircle2 className="h-5 w-5 text-coffee" />
        ) : (
          <Circle className="h-5 w-5" />
        )}
      </button>
      {editing ? (
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onBlur={commitEdit}
          onKeyDown={(e) => {
            if (e.key === "Enter") commitEdit();
            if (e.key === "Escape") setEditing(false);
          }}
          autoFocus
          className="flex-1 bg-surface border border-border rounded px-2 py-1 text-sm font-semibold text-text-primary focus:outline-none focus:border-coffee"
        />
      ) : (
        <span
          onClick={startEdit}
          title="Click to edit"
          className={`flex-1 text-sm font-semibold break-words cursor-text ${
            note.done ? "line-through text-text-muted" : "text-text-primary"
          }`}
        >
          {note.text}
        </span>
      )}
      <button
        onClick={() => onRemove(note.id)}
        aria-label="Delete task"
        className="p-1.5 rounded text-text-muted hover:text-red-400 opacity-60 md:opacity-0 md:group-hover:opacity-100 transition-opacity shrink-0"
      >
        <X className="h-3.5 w-3.5" />
      </button>
    </li>
  );
}

/** Non-interactive copy of a task row — rendered inside the DragOverlay portal
 *  so the dragged card escapes the list's overflow clipping. */
function TaskRowGhost({ note }: { note: PomodoroNote }) {
  return (
    <li className="flex items-center gap-2 bg-surface-raised rounded-lg px-2 py-3 border-l-4 border-l-coffee shadow-xl list-none cursor-grabbing">
      <span className="p-1 text-text-muted">
        <GripVertical className="h-4 w-4" />
      </span>
      <Circle className="h-5 w-5 text-text-muted shrink-0" />
      <span className="flex-1 text-sm font-semibold text-text-primary break-words">
        {note.text}
      </span>
    </li>
  );
}

export default function NotesSection() {
  const { ongoing, finished, addNote, toggleNote, removeNote, editNote, reorderActive } =
    usePomodoroNotes();
  const [text, setText] = useState("");
  const [draggedNote, setDraggedNote] = useState<PomodoroNote | null>(null);

  const sensors = useSensors(
    // distance threshold keeps taps on the handle from hijacking scrolls/clicks
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleDragStart = (event: DragStartEvent) => {
    setDraggedNote(ongoing.find((n) => n.id === event.active.id) ?? null);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    setDraggedNote(null);
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const from = ongoing.findIndex((n) => n.id === active.id);
    const to = ongoing.findIndex((n) => n.id === over.id);
    if (from !== -1 && to !== -1) reorderActive(from, to);
  };

  const handleAdd = () => {
    if (!text.trim()) return;
    addNote(text);
    setText("");
  };

  const total = ongoing.length + finished.length;

  return (
    <div className="w-full flex flex-col gap-3">
      {/* header */}
      <div className="flex items-center justify-between border-b-2 border-border pb-2">
        <h2 className="text-sm font-bold text-text-primary tracking-wide">Tasks</h2>
        {total > 0 && (
          <span className="text-xs font-semibold text-text-muted">
            <span style={{ color: "var(--drink)" }}>{ongoing.length} ongoing</span>
            {" · "}
            {finished.length} finished
          </span>
        )}
      </div>

      {/* task cards — ongoing are drag-sortable, finished pinned below */}
      {total > 0 && (
        <ul className="max-h-48 overflow-y-auto flex flex-col gap-2 pr-0.5">
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
            onDragCancel={() => setDraggedNote(null)}
          >
            <SortableContext
              items={ongoing.map((n) => n.id)}
              strategy={verticalListSortingStrategy}
            >
              {ongoing.map((note) => (
                <TaskRow
                  key={note.id}
                  note={note}
                  sortable
                  onToggle={toggleNote}
                  onEdit={editNote}
                  onRemove={removeNote}
                />
              ))}
            </SortableContext>
            {/* portal to body — the drag preview escapes the list's overflow clip */}
            {typeof document !== "undefined" &&
              createPortal(
                <DragOverlay>
                  {draggedNote ? <TaskRowGhost note={draggedNote} /> : null}
                </DragOverlay>,
                document.body
              )}
          </DndContext>
          {finished.map((note) => (
            <TaskRow
              key={note.id}
              note={note}
              sortable={false}
              onToggle={toggleNote}
                  onEdit={editNote}
              onRemove={removeNote}
            />
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
