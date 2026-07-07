"use client";

import { useCallback, useRef } from "react";
import { useSelector } from "react-redux";
import { useQuery, useMutation, useQueryClient } from "@/core/plugins/reactQuery";
import { FetchQueryKeys } from "../endpoints";
import { vaultApi, VaultBlob, PutVaultPayload } from "../api/vault";
import { clearCachedDK } from "@/core/lib/vault/indexeddb";
import type { RootState } from "@/core/redux/store";

// ---------- helpers ----------

function isConflict(err: unknown): number | null {
  const e = err as { response?: { status?: number; data?: { currentVersion?: number } } };
  if (e?.response?.status === 409) {
    return e.response.data?.currentVersion ?? -1;
  }
  return null;
}

// ---------- hooks ----------

/**
 * Fetch the encrypted vault blob on mount.
 * Returns undefined while loading, null on 404 (no vault yet), or the full VaultBlob.
 * Never fires for guests.
 */
export function useGetVault() {
  const { isAuth } = useSelector((state: RootState) => state.user);

  return useQuery({
    queryKey: [FetchQueryKeys.VAULT],
    queryFn: async () => {
      try {
        return await vaultApi.getVault().then((r) => r.data);
      } catch (err: unknown) {
        const e = err as { response?: { status?: number } };
        if (e?.response?.status === 404) return null;
        throw err;
      }
    },
    enabled: isAuth,
    // Client owns all writes — no need to re-fetch on window focus.
    staleTime: Infinity,
    refetchOnWindowFocus: false,
  });
}

/**
 * PUT the encrypted vault blob.
 * On 409 VERSION_CONFLICT: automatically fetches the latest blob and calls
 * onConflict(latestBlob) so the caller can decrypt → merge → re-encrypt → PUT again.
 * On success: updates the query cache with the new version.
 */
export function usePutVault(onConflict?: (latest: VaultBlob) => void) {
  const queryClient = useQueryClient();
  const onConflictRef = useRef(onConflict);
  onConflictRef.current = onConflict;

  return useMutation({
    mutationFn: (payload: PutVaultPayload) =>
      vaultApi.putVault(payload).then((r) => r.data),

    onSuccess: (data, payload) => {
      // Patch the cached blob's version without re-fetching.
      queryClient.setQueryData<VaultBlob | null>(
        [FetchQueryKeys.VAULT],
        (prev) =>
          prev
            ? { ...prev, ciphertext: payload.ciphertext, iv: payload.iv, version: data.version }
            : prev
      );
    },

    onError: async (err) => {
      const conflictVersion = isConflict(err);
      if (conflictVersion !== null && onConflictRef.current) {
        // Pull the latest blob so the caller can merge then retry.
        try {
          const latest = await vaultApi.getVault().then((r) => r.data);
          queryClient.setQueryData<VaultBlob | null>([FetchQueryKeys.VAULT], latest);
          onConflictRef.current(latest);
        } catch {
          // network failed on re-fetch — surface original error, caller handles
        }
      }
    },
  });
}

/**
 * DELETE the vault (forget PIN / wipe).
 * Clears the IndexedDB DK cache and resets the query cache to null.
 * Never fires for guests — caller must gate on isAuth.
 */
export function useDeleteVault() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => vaultApi.deleteVault(),

    onSuccess: async () => {
      await clearCachedDK();
      queryClient.setQueryData<VaultBlob | null>([FetchQueryKeys.VAULT], null);
    },
  });
}

/**
 * Returns a stable debounced PUT function (3s).
 * Multiple rapid edits are coalesced — only the last payload is sent.
 * Resets the timer on every call.
 */
export function useDebouncedPut(delayMs = 3000) {
  const { mutate } = usePutVault();
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  return useCallback(
    (payload: PutVaultPayload) => {
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => {
        mutate(payload);
        timerRef.current = null;
      }, delayMs);
    },
    [mutate, delayMs]
  );
}
