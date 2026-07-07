"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useReducer,
  useRef,
  type ReactNode,
} from "react";
import { useSelector } from "react-redux";
import type { RootState } from "@/core/redux/store";
import { getCachedDK, cacheDK, clearCachedDK } from "./indexeddb";
import {
  deriveKEK,
  generateDK,
  generateSalt,
  wrapDK,
  unwrapDK,
  encryptBlob,
  decryptBlob,
  checkBlobSize,
} from "./crypto";
import {
  useGetVault,
  usePutVault,
  useDeleteVault,
} from "@/core/services/client/useVaultSync";
import type { PutVaultPayload, VaultBlob, VaultKdf } from "@/core/services/api/vault";

// ---------- types ----------

export type VaultStatus = "loading" | "no-vault" | "locked" | "unlocked";

export interface VaultTask {
  id: string;
  text: string;
  done: boolean;
  updatedAt: number;
}

// ---------- state ----------

interface VaultState {
  status: VaultStatus;
  version: number;
  tasks: VaultTask[];
  wrappedKey: string;
  kdf: VaultKdf;
  nearLimit: boolean;
}

const KDF_ALGO = "PBKDF2-SHA256";
const KDF_ITERATIONS = 600_000;
const DEBOUNCE_MS = 3_000;

const EMPTY_KDF: VaultKdf = { algo: KDF_ALGO, salt: "", iterations: KDF_ITERATIONS };

const INIT_STATE: VaultState = {
  status: "loading",
  version: 0,
  tasks: [],
  wrappedKey: "",
  kdf: EMPTY_KDF,
  nearLimit: false,
};

type Action =
  | { type: "SET_STATUS"; status: VaultStatus }
  | { type: "UNLOCK"; tasks: VaultTask[]; version: number; wrappedKey: string; kdf: VaultKdf }
  | { type: "SET_TASKS"; tasks: VaultTask[]; nearLimit: boolean }
  | { type: "SET_VERSION"; version: number }
  | { type: "RESET" };

function reducer(state: VaultState, action: Action): VaultState {
  switch (action.type) {
    case "SET_STATUS":
      return { ...state, status: action.status };
    case "UNLOCK":
      return {
        ...state,
        status: "unlocked",
        tasks: action.tasks,
        version: action.version,
        wrappedKey: action.wrappedKey,
        kdf: action.kdf,
        nearLimit: false,
      };
    case "SET_TASKS":
      return { ...state, tasks: action.tasks, nearLimit: action.nearLimit };
    case "SET_VERSION":
      return { ...state, version: action.version };
    case "RESET":
      return { ...INIT_STATE, status: "no-vault" };
    default:
      return state;
  }
}

// ---------- context ----------

export interface VaultContextValue {
  status: VaultStatus;
  tasks: VaultTask[];
  nearLimit: boolean;
  /** Decrypt the vault with PIN. Throws on wrong PIN — caller shows error. */
  unlock: (pin: string) => Promise<void>;
  /** First-time setup: generate DK, encrypt empty list, PUT to server. */
  setupVault: (pin: string) => Promise<void>;
  addTask: (text: string) => void;
  updateTask: (id: string, patch: Partial<Pick<VaultTask, "text" | "done">>) => void;
  deleteTask: (id: string) => void;
  /** DELETE vault + clear IndexedDB DK. Irreversible. */
  wipe: () => void;
  /** Clear DK from memory + IndexedDB without deleting server vault. */
  lock: () => Promise<void>;
}

const VaultContext = createContext<VaultContextValue | null>(null);

// ---------- provider ----------

export function VaultProvider({ children }: { children: ReactNode }) {
  const { isAuth } = useSelector((state: RootState) => state.user);
  const [state, dispatch] = useReducer(reducer, INIT_STATE);

  // Sensitive refs — never in React state or Redux
  const dkRef = useRef<CryptoKey | null>(null);
  const syncTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  // Always-current view of state for use inside async callbacks
  const stateRef = useRef(state);
  stateRef.current = state;

  const { data: serverBlob } = useGetVault();
  const { mutate: putVault } = usePutVault(handleConflict);
  const { mutate: deleteVault } = useDeleteVault();

  // ---------- initialise on vault load ----------

  useEffect(() => {
    if (!isAuth || serverBlob === undefined) return;

    if (serverBlob === null) {
      dispatch({ type: "SET_STATUS", status: "no-vault" });
      return;
    }

    (async () => {
      const cachedDk = await getCachedDK();
      if (!cachedDk) {
        dispatch({ type: "SET_STATUS", status: "locked" });
        return;
      }
      try {
        const tasks = await decryptTasks(serverBlob, cachedDk);
        dkRef.current = cachedDk;
        dispatch({
          type: "UNLOCK",
          tasks,
          version: serverBlob.version,
          wrappedKey: serverBlob.wrappedKey,
          kdf: serverBlob.kdf,
        });
      } catch {
        // Stale / corrupted cache — ask for PIN again
        await clearCachedDK();
        dispatch({ type: "SET_STATUS", status: "locked" });
      }
    })();
  }, [isAuth, serverBlob]);

  // Clear vault from memory on logout
  useEffect(() => {
    if (!isAuth && dkRef.current) {
      clearCachedDK();
      dkRef.current = null;
      dispatch({ type: "RESET" });
    }
  }, [isAuth]);

  // ---------- helpers ----------

  async function decryptTasks(blob: VaultBlob, dk: CryptoKey): Promise<VaultTask[]> {
    const plaintext = await decryptBlob(blob.ciphertext, blob.iv, dk);
    return JSON.parse(plaintext) as VaultTask[];
  }

  function buildPayload(
    tasks: VaultTask[],
    encrypted: { ciphertext: string; iv: string },
    wrappedKey: string,
    kdf: VaultKdf,
    baseVersion?: number
  ): PutVaultPayload {
    return {
      ciphertext: encrypted.ciphertext,
      iv: encrypted.iv,
      wrappedKey,
      kdf,
      ...(baseVersion !== undefined && { baseVersion }),
    };
  }

  // ---------- sync ----------

  const syncNow = useCallback(
    async (tasks: VaultTask[], version: number, wrappedKey: string, kdf: VaultKdf) => {
      if (!dkRef.current) return;
      const plaintext = JSON.stringify(tasks);
      const { nearLimit, overLimit } = checkBlobSize(plaintext);
      // Over limit — block the PUT, UI will show warning via nearLimit flag
      if (overLimit) {
        dispatch({ type: "SET_TASKS", tasks, nearLimit: true });
        return;
      }
      const encrypted = await encryptBlob(plaintext, dkRef.current);
      putVault(buildPayload(tasks, encrypted, wrappedKey, kdf, version));
      dispatch({ type: "SET_TASKS", tasks, nearLimit });
    },
    [putVault]
  );

  function scheduleSync(tasks: VaultTask[], version: number, wrappedKey: string, kdf: VaultKdf) {
    if (syncTimerRef.current) clearTimeout(syncTimerRef.current);
    syncTimerRef.current = setTimeout(() => {
      syncNow(tasks, version, wrappedKey, kdf);
      syncTimerRef.current = null;
    }, DEBOUNCE_MS);
  }

  // ---------- conflict resolution (called by usePutVault on 409) ----------

  async function handleConflict(latest: VaultBlob) {
    if (!dkRef.current) return;
    try {
      const serverTasks = await decryptTasks(latest, dkRef.current);
      const localTasks = stateRef.current.tasks;

      // Union merge: for each task id, keep the entry with higher updatedAt
      const merged = new Map<string, VaultTask>(serverTasks.map((t) => [t.id, t]));
      for (const local of localTasks) {
        const server = merged.get(local.id);
        if (!server || local.updatedAt > server.updatedAt) {
          merged.set(local.id, local);
        }
      }

      const mergedTasks = [...merged.values()];
      await syncNow(mergedTasks, latest.version, latest.wrappedKey, latest.kdf);
    } catch {
      // Server blob uses a different DK (shouldn't happen) — skip merge
    }
  }

  // ---------- exposed actions ----------

  const unlock = useCallback(
    async (pin: string) => {
      if (!serverBlob) return;
      const kek = await deriveKEK(pin, serverBlob.kdf.salt, serverBlob.kdf.iterations);
      // Throws DOMException on wrong PIN — caller catches and shows error
      const dk = await unwrapDK(serverBlob.wrappedKey, kek);
      const tasks = await decryptTasks(serverBlob, dk);
      dkRef.current = dk;
      await cacheDK(dk);
      dispatch({
        type: "UNLOCK",
        tasks,
        version: serverBlob.version,
        wrappedKey: serverBlob.wrappedKey,
        kdf: serverBlob.kdf,
      });
    },
    [serverBlob]
  );

  const setupVault = useCallback(
    async (pin: string) => {
      const salt = generateSalt();
      const kdf: VaultKdf = { algo: KDF_ALGO, salt, iterations: KDF_ITERATIONS };
      const kek = await deriveKEK(pin, salt, KDF_ITERATIONS);
      const dk = await generateDK();
      const wrappedKey = await wrapDK(dk, kek);
      const encrypted = await encryptBlob(JSON.stringify([]), dk);
      dkRef.current = dk;
      await cacheDK(dk);
      // No baseVersion on first PUT — server creates version 1
      putVault(buildPayload([], encrypted, wrappedKey, kdf));
      dispatch({ type: "UNLOCK", tasks: [], version: 1, wrappedKey, kdf });
    },
    [putVault]
  );

  const addTask = useCallback(
    (text: string) => {
      const { tasks, version, wrappedKey, kdf } = stateRef.current;
      const next = [
        ...tasks,
        { id: crypto.randomUUID(), text, done: false, updatedAt: Date.now() },
      ];
      const { nearLimit } = checkBlobSize(JSON.stringify(next));
      dispatch({ type: "SET_TASKS", tasks: next, nearLimit });
      scheduleSync(next, version, wrappedKey, kdf);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [syncNow]
  );

  const updateTask = useCallback(
    (id: string, patch: Partial<Pick<VaultTask, "text" | "done">>) => {
      const { tasks, version, wrappedKey, kdf } = stateRef.current;
      const next = tasks.map((t) =>
        t.id === id ? { ...t, ...patch, updatedAt: Date.now() } : t
      );
      const { nearLimit } = checkBlobSize(JSON.stringify(next));
      dispatch({ type: "SET_TASKS", tasks: next, nearLimit });
      scheduleSync(next, version, wrappedKey, kdf);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [syncNow]
  );

  const deleteTask = useCallback(
    (id: string) => {
      const { tasks, version, wrappedKey, kdf } = stateRef.current;
      const next = tasks.filter((t) => t.id !== id);
      const { nearLimit } = checkBlobSize(JSON.stringify(next));
      dispatch({ type: "SET_TASKS", tasks: next, nearLimit });
      scheduleSync(next, version, wrappedKey, kdf);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [syncNow]
  );

  const wipe = useCallback(() => {
    deleteVault(undefined, {
      onSuccess: () => {
        dkRef.current = null;
        if (syncTimerRef.current) clearTimeout(syncTimerRef.current);
        dispatch({ type: "RESET" });
      },
    });
  }, [deleteVault]);

  const lock = useCallback(async () => {
    if (syncTimerRef.current) clearTimeout(syncTimerRef.current);
    await clearCachedDK();
    dkRef.current = null;
    dispatch({ type: "SET_STATUS", status: "locked" });
  }, []);

  return (
    <VaultContext.Provider
      value={{
        status: state.status,
        tasks: state.tasks,
        nearLimit: state.nearLimit,
        unlock,
        setupVault,
        addTask,
        updateTask,
        deleteTask,
        wipe,
        lock,
      }}
    >
      {children}
    </VaultContext.Provider>
  );
}

// ---------- consumer ----------

export function useVault(): VaultContextValue {
  const ctx = useContext(VaultContext);
  if (!ctx) throw new Error("useVault must be used inside <VaultProvider>");
  return ctx;
}
