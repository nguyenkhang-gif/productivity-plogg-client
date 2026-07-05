"use client";

import { useEffect } from "react";

/**
 * Keep the screen awake while `active` is true (Screen Wake Lock API).
 *
 * - No-op where unsupported (older Safari) — fails silently, never throws
 * - The browser auto-releases the lock when the tab is hidden; we re-acquire
 *   on visibilitychange so returning to the tab restores it
 * - Released on `active` = false and on unmount
 */
export function useWakeLock(active: boolean) {
  useEffect(() => {
    if (!active || !("wakeLock" in navigator)) return;

    let sentinel: WakeLockSentinel | null = null;
    let cancelled = false;

    const acquire = async () => {
      try {
        sentinel = await navigator.wakeLock.request("screen");
        if (cancelled) await sentinel.release();
      } catch {
        // denied (low battery mode, permissions) — timer still works, the
        // screen just follows normal sleep rules
      }
    };

    const onVisibility = () => {
      if (document.visibilityState === "visible") acquire();
    };

    acquire();
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      cancelled = true;
      document.removeEventListener("visibilitychange", onVisibility);
      sentinel?.release().catch(() => {});
    };
  }, [active]);
}
