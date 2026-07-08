"use client";

import { useEffect, useRef } from "react";
import { useSelector } from "react-redux";
import { useQuery, useMutation, useQueryClient } from "@/core/plugins/reactQuery";
import { FetchQueryKeys } from "../endpoints";
import { focusApi, FocusSessionPayload, UserProgress } from "../api/focus";
import type { RootState } from "@/core/redux/store";

// ---------- pending-flush queue (offline / retry) ----------

const QUEUE_KEY = "coffeeFocus:pendingFlush";

function readQueue(): FocusSessionPayload[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(QUEUE_KEY);
    return raw ? (JSON.parse(raw) as FocusSessionPayload[]) : [];
  } catch {
    return [];
  }
}

function writeQueue(queue: FocusSessionPayload[]) {
  if (typeof window === "undefined") return;
  try {
    if (queue.length === 0) localStorage.removeItem(QUEUE_KEY);
    else localStorage.setItem(QUEUE_KEY, JSON.stringify(queue));
  } catch {}
}

function pushToQueue(payload: FocusSessionPayload) {
  const queue = readQueue();
  if (queue.some((p) => p.clientSessionId === payload.clientSessionId)) return;
  writeQueue([...queue, payload]);
}

function removeFromQueue(clientSessionId: string) {
  writeQueue(readQueue().filter((p) => p.clientSessionId !== clientSessionId));
}

// ---------- hooks ----------

/** Hydrate XP / streak / todayCount from server on mount. Guest users: never fires. */
export function useFocusProgress() {
  const { isAuth } = useSelector((state: RootState) => state.user);
  return useQuery({
    queryKey: [FetchQueryKeys.FOCUS_PROGRESS],
    queryFn: () => focusApi.getProgress().then((r) => r.data),
    enabled: isAuth,
    staleTime: 60_000,
  });
}

/** Flush a completed focus session to the server. Fire-and-forget — always update
 *  localStorage first before calling this. On network / 5xx failure the payload
 *  is pushed to the pending queue and drained on the next mount. */
export function useFlushSession() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: FocusSessionPayload) =>
      focusApi.postSession(payload).then((r) => r.data),

    onSuccess: (data, payload) => {
      removeFromQueue(payload.clientSessionId);
      queryClient.setQueryData<UserProgress>(
        [FetchQueryKeys.FOCUS_PROGRESS],
        data.progress
      );
      queryClient.invalidateQueries({ queryKey: [FetchQueryKeys.FOCUS_REPORT] });
    },

    onError: (_err, payload) => {
      pushToQueue(payload);
    },
  });
}

/** Calendar heatmap for a given month ("YYYY-MM"). Guest users: never fires. */
export function useFocusReport(month: string | null) {
  const { isAuth } = useSelector((state: RootState) => state.user);
  return useQuery({
    queryKey: [FetchQueryKeys.FOCUS_REPORT, month],
    queryFn: () => focusApi.getReport(month!).then((r) => r.data),
    enabled: isAuth && !!month,
    staleTime: 60_000,
  });
}

/** Sync drinkId and/or tzOffset to the server. No-op for guests — caller should
 *  gate on isAuth before invoking mutate(). */
export function useSyncConfig() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: { drinkId?: string; tzOffset?: number }) =>
      focusApi.patchConfig(payload).then((r) => r.data),

    onSuccess: (progress) => {
      queryClient.setQueryData<UserProgress>(
        [FetchQueryKeys.FOCUS_PROGRESS],
        progress
      );
    },
  });
}

/** Drains the offline pending-flush queue sequentially on mount.
 *  Only runs for logged-in users. Safe to call every mount — stable IDs prevent double-counting. */
export function useDrainPendingFlush() {
  const { isAuth } = useSelector((state: RootState) => state.user);
  const queryClient = useQueryClient();
  const isDraining = useRef(false);

  useEffect(() => {
    if (!isAuth || isDraining.current) return;

    const queue = readQueue();
    if (queue.length === 0) return;

    isDraining.current = true;

    (async () => {
      for (const payload of queue) {
        try {
          const data = await focusApi.postSession(payload).then((r) => r.data);
          removeFromQueue(payload.clientSessionId);
          queryClient.setQueryData<UserProgress>(
            [FetchQueryKeys.FOCUS_PROGRESS],
            data.progress
          );
          queryClient.invalidateQueries({
            queryKey: [FetchQueryKeys.FOCUS_REPORT],
          });
        } catch (err: unknown) {
          const status = (err as { response?: { status?: number } })?.response?.status;
          if (status === 400) {
            // Validation error — this payload will never succeed, drop it.
            removeFromQueue(payload.clientSessionId);
          }
          // On network / 5xx: leave it in the queue for the next mount.
        }
      }
      isDraining.current = false;
    })();
  }, [isAuth, queryClient]);
}
