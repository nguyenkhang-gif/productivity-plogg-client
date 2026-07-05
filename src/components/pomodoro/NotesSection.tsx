"use client";

import { useState } from "react";
import { createPortal } from "react-dom";
import {
  Plus, X, Circle, CheckCircle2, GripVertical,
  ChevronUp, ChevronDown, Trash2,
} from "lucide-react";
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

// ---------- edit panel ----------

interface EditPanelProps {
  note: PomodoroNote;
  onSave: (patch: Partial<PomodoroNote>) => void;
  onCancel: () => void;
  onDelete: () => void;
}

function TaskEditPanel({ note, onSave, onCancel, onDelete }: EditPanelProps) {
  const [text, setText] = useState(note.text);
  const [est, setEst] = useState(note.estPomodoros ?? 1);
  const [noteText, setNoteText] = useState(note.noteText ?? "");
  const [project, setProject] = useState(note.project ?? "");
  const [showNote, setShowNote] = useState(!!note.noteText);
  const [showProject, setShowProject] = useState(!!note.project);

  const handleSave = () => {
    if (!text.trim()) return;
    onSave({
      text: text.trim(),
      estPomodoros: est,
      noteText: noteText.trim() || undefined,
      project: project.trim() || undefined,
    });
  };

  return (
    <div className="bg-card border border-border rounded-xl p-4 shadow-lg flex flex-col gap-3">
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSave(); } }}
        autoFocus
        rows={2}
        className="w-full text-base font-semibold text-text-primary bg-transparent resize-none focus:outline-none leading-snug"
      />

      {/* pomodoro counter */}
      <div>
        <p className="text-xs font-bold text-text-muted mb-1.5 uppercase tracking-wide">
          Act / Est Pomodoros
        </p>
        <div className="flex items-center gap-2">
          <span className="w-14 text-center text-sm font-semibold text-text-muted bg-surface rounded px-2 py-1.5 border border-border">
            0
          </span>
          <span className="text-text-muted font-semibold">/</span>
          <span className="w-14 text-center text-sm font-semibold text-text-primary bg-surface rounded px-2 py-1.5 border border-border">
            {est}
          </span>
          <div className="flex flex-col gap-0.5">
            <button
              onClick={() => setEst((v) => v + 1)}
              className="p-0.5 rounded text-text-muted hover:text-text-primary hover:bg-surface-raised transition-colors"
              aria-label="Increase estimate"
            >
              <ChevronUp className="h-4 w-4" />
            </button>
            <button
              onClick={() => setEst((v) => Math.max(1, v - 1))}
              className="p-0.5 rounded text-text-muted hover:text-text-primary hover:bg-surface-raised transition-colors"
              aria-label="Decrease estimate"
            >
              <ChevronDown className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* optional note */}
      {showNote ? (
        <textarea
          value={noteText}
          onChange={(e) => setNoteText(e.target.value)}
          placeholder="Add a note…"
          rows={2}
          className="w-full text-sm text-text-primary bg-surface border border-border rounded-lg px-3 py-2 resize-none focus:outline-none focus:border-coffee"
        />
      ) : (
        <button
          onClick={() => setShowNote(true)}
          className="text-sm font-semibold text-text-muted hover:text-coffee transition-colors text-left"
        >
          + Add Note
        </button>
      )}

      {/* optional project */}
      {showProject ? (
        <input
          value={project}
          onChange={(e) => setProject(e.target.value)}
          placeholder="Project name…"
          className="w-full text-sm text-text-primary bg-surface border border-border rounded-lg px-3 py-2 focus:outline-none focus:border-coffee"
        />
      ) : (
        <button
          onClick={() => setShowProject(true)}
          className="text-sm font-semibold text-text-muted hover:text-coffee transition-colors text-left"
        >
          + Add Project
        </button>
      )}

      {/* actions */}
      <div className="flex items-center justify-between pt-1 border-t border-border">
        <button
          onClick={onDelete}
          aria-label="Delete task"
          className="p-1.5 rounded text-text-muted hover:text-red-400 hover:bg-surface-raised transition-colors"
        >
          <Trash2 className="h-4 w-4" />
        </button>
        <div className="flex items-center gap-2">
          <button
            onClick={onCancel}
            className="px-4 py-1.5 rounded-lg text-sm font-semibold text-text-muted hover:bg-surface-raised transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-1.5 rounded-lg text-sm font-bold bg-text-primary text-page hover:opacity-90 transition-opacity"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
}

// ---------- task row ----------

interface TaskRowProps {
  note: PomodoroNote;
  sortable: boolean;
  onToggle: (id: string) => void;
  onRemove: (id: string) => void;
  onSaveFull: (id: string, patch: Partial<PomodoroNote>) => void;
}

function TaskRow({ note, sortable, onToggle, onRemove, onSaveFull }: TaskRowProps) {
  const [isEditing, setIsEditing] = useState(false);

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: note.id, disabled: !sortable || isEditing });

  if (isEditing) {
    return (
      <li ref={setNodeRef} style={{ transform: CSS.Transform.toString(transform), transition }}>
        <TaskEditPanel
          note={note}
          onSave={(patch) => { onSaveFull(note.id, patch); setIsEditing(false); }}
          onCancel={() => setIsEditing(false)}
          onDelete={() => { onRemove(note.id); setIsEditing(false); }}
        />
      </li>
    );
  }

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

      <span
        onClick={() => setIsEditing(true)}
        title="Click to edit"
        className={`flex-1 text-base font-semibold break-words cursor-text leading-snug ${
          note.done ? "line-through text-text-muted" : "text-text-primary"
        }`}
      >
        {note.text}
        {note.estPomodoros && (
          <span className="ml-2 text-xs font-semibold text-text-muted">
            0/{note.estPomodoros} 🍅
          </span>
        )}
      </span>

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

/** Non-interactive drag ghost */
function TaskRowGhost({ note }: { note: PomodoroNote }) {
  return (
    <li className="flex items-center gap-2 bg-surface-raised rounded-lg px-2 py-3 border-l-4 border-l-coffee shadow-xl list-none cursor-grabbing">
      <span className="p-1 text-text-muted">
        <GripVertical className="h-4 w-4" />
      </span>
      <Circle className="h-5 w-5 text-text-muted shrink-0" />
      <span className="flex-1 text-base font-semibold text-text-primary break-words">
        {note.text}
      </span>
    </li>
  );
}

// ---------- main section ----------

export default function NotesSection() {
  const { ongoing, finished, addNote, toggleNote, removeNote, editNoteFull, reorderActive } =
    usePomodoroNotes();
  const [text, setText] = useState("");
  const [draggedNote, setDraggedNote] = useState<PomodoroNote | null>(null);

  const sensors = useSensors(
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

      {total > 0 && (
        <ul className="max-h-[28rem] overflow-y-auto flex flex-col gap-2 pr-0.5">
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
                  onRemove={removeNote}
                  onSaveFull={editNoteFull}
                />
              ))}
            </SortableContext>
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
              onRemove={removeNote}
              onSaveFull={editNoteFull}
            />
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
