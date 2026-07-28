/** Shared shape rendered by TaskListPanel — both local (Pomodoro) notes and
 *  encrypted vault tasks implement this. */
export interface TaskItem {
  id: string;
  text: string;
  done: boolean;
  estPomodoros?: number;
  noteText?: string;
  project?: string;
}
