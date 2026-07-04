/**
 * SSR-safe localStorage store for Coffee Focus.
 * All reads fall back to defaults — corrupt JSON must never crash the page.
 * Keys are namespaced `coffeeFocus:*` (see docs/coffeFocus/00-overview.md §3).
 */

export interface PomodoroConfig {
  focusMin: number;
  shortBreakMin: number;
  longBreakMin: number;
  sessionsPerCycle: number;
  soundOn: boolean;
}

export const DEFAULT_CONFIG: PomodoroConfig = {
  focusMin: 25,
  shortBreakMin: 5,
  longBreakMin: 15,
  sessionsPerCycle: 4,
  soundOn: true,
};

export interface ActiveSession {
  phase: "focus" | "shortBreak" | "longBreak";
  /** wall-clock end time; ignored while paused */
  endAt: number;
  /** non-null = paused with this much left */
  pausedRemainingMs: number | null;
  /** session duration at start — keeps cup progress stable if config changes */
  totalMs: number;
}

type SessionsByDay = Record<string, { completed: number }>;

const KEY_CONFIG = "coffeeFocus:config";
const KEY_SESSIONS = "coffeeFocus:sessions";
const KEY_ACTIVE = "coffeeFocus:active";
const KEEP_DAYS = 30;

const isBrowser = () => typeof window !== "undefined";

function readJson<T>(key: string): T | null {
  if (!isBrowser()) return null;
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : null;
  } catch {
    return null;
  }
}

function writeJson(key: string, value: unknown) {
  if (!isBrowser()) return;
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // storage full/blocked — the timer still works, it just won't persist
  }
}

/** Local date (not UTC) — a 11pm session belongs to today. */
function localDateKey(d = new Date()): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

// ---------- config ----------

export function getConfig(): PomodoroConfig {
  const stored = readJson<Partial<PomodoroConfig>>(KEY_CONFIG);
  return { ...DEFAULT_CONFIG, ...stored };
}

export function saveConfig(partial: Partial<PomodoroConfig>): PomodoroConfig {
  const merged = { ...getConfig(), ...partial };
  writeJson(KEY_CONFIG, merged);
  return merged;
}

// ---------- daily sessions ----------

function readSessions(): SessionsByDay {
  const stored = readJson<SessionsByDay>(KEY_SESSIONS);
  return stored && typeof stored === "object" ? stored : {};
}

export function getTodayCompleted(): number {
  return readSessions()[localDateKey()]?.completed ?? 0;
}

/** Increment today's completed focus count; prune entries older than KEEP_DAYS. */
export function recordCompletedFocus(): number {
  const sessions = readSessions();
  const today = localDateKey();
  const completed = (sessions[today]?.completed ?? 0) + 1;
  sessions[today] = { completed };

  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - KEEP_DAYS);
  const cutoffKey = localDateKey(cutoff);
  for (const key of Object.keys(sessions)) {
    if (key < cutoffKey) delete sessions[key];
  }

  writeJson(KEY_SESSIONS, sessions);
  return completed;
}

// ---------- notes (distraction pad) ----------

export interface PomodoroNote {
  id: string;
  text: string;
  done: boolean;
  createdAt: number;
}

const KEY_NOTES = "coffeeFocus:notes";
const MAX_NOTES = 100;

export function getNotes(): PomodoroNote[] {
  const stored = readJson<PomodoroNote[]>(KEY_NOTES);
  return Array.isArray(stored) ? stored : [];
}

export function saveNotes(notes: PomodoroNote[]) {
  // Cap to keep localStorage tidy — drop the oldest done items first, then oldest
  let trimmed = notes;
  if (notes.length > MAX_NOTES) {
    const byAge = [...notes].sort((a, b) => b.createdAt - a.createdAt);
    const active = byAge.filter((n) => !n.done);
    const done = byAge.filter((n) => n.done);
    trimmed = [...active, ...done].slice(0, MAX_NOTES);
  }
  writeJson(KEY_NOTES, trimmed);
}

// ---------- active session (reload recovery) ----------

export function getActiveSession(): ActiveSession | null {
  const active = readJson<ActiveSession>(KEY_ACTIVE);
  if (
    !active ||
    typeof active.endAt !== "number" ||
    typeof active.totalMs !== "number" ||
    !["focus", "shortBreak", "longBreak"].includes(active.phase)
  ) {
    return null;
  }
  return active;
}

export function saveActiveSession(session: ActiveSession) {
  writeJson(KEY_ACTIVE, session);
}

export function clearActiveSession() {
  if (!isBrowser()) return;
  try {
    localStorage.removeItem(KEY_ACTIVE);
  } catch {
    // ignore
  }
}
