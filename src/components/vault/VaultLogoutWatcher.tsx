"use client";

import { useEffect } from "react";
import { useSelector } from "react-redux";
import type { RootState } from "@/core/redux/store";
import { clearCachedDK } from "@/core/lib/vault/indexeddb";

/**
 * Clears the cached vault Data Key from IndexedDB whenever the user logs out,
 * regardless of which page they are on. Must live in the root layout so it is
 * always mounted — VaultProvider alone is not enough since it only mounts on
 * the focusCoffee page.
 */
export default function VaultLogoutWatcher() {
  const { isAuth } = useSelector((state: RootState) => state.user);

  useEffect(() => {
    if (!isAuth) clearCachedDK();
  }, [isAuth]);

  return null;
}
