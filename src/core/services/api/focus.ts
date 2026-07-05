import axiosInstance from "@/core/lib/axiosInstance";

export interface UserProgress {
  userId: string;
  totalXp: number;
  totalFocusMin: number;
  drinkId?: string;
  tzOffset: number;
  todayCount: number;
  todayFocusMin: number;
  lastActiveLocalDate?: string;
  currentStreak: number;
  longestStreak: number;
}

export interface FocusSessionPayload {
  clientSessionId: string;
  durationMin: number;
  tzOffset?: number;
}

export interface FocusReportCell {
  period: string;
  sessionsCount: number;
  totalFocusMin: number;
  totalXp: number;
}

export interface FocusReport {
  month: string;
  cells: FocusReportCell[];
}

export const focusApi = {
  getProgress: () =>
    axiosInstance.get<UserProgress>("/focus/progress"),

  postSession: (payload: FocusSessionPayload) =>
    axiosInstance.post<{ alreadyRecorded: boolean; progress: UserProgress }>(
      "/focus/session",
      payload
    ),

  getReport: (month: string) =>
    axiosInstance.get<FocusReport>("/focus/report", { params: { month } }),

  patchConfig: (payload: { drinkId?: string; tzOffset?: number }) =>
    axiosInstance.patch<UserProgress>("/focus/config", payload),
};
