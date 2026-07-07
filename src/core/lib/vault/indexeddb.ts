/**
 * IndexedDB cache for the vault Data Key (DK).
 *
 * Storing a CryptoKey in IndexedDB (not localStorage) is intentional:
 *   - CryptoKey objects are non-extractable after unwrap — IndexedDB is the only
 *     browser API that can persist them across sessions without exporting raw bytes.
 *   - Survives page reload, tab close, browser restart, device restart.
 *   - Cleared on logout and on vault wipe — never outlives the session intent.
 */

const DB_NAME = "kpro-vault";
const DB_VERSION = 1;
const STORE_NAME = "keys";
const DK_KEY = "dk";

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = () => {
      req.result.createObjectStore(STORE_NAME);
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

/** Persist the Data Key so the user doesn't need to re-enter their PIN on reload. */
export async function cacheDK(dk: CryptoKey): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readwrite");
    tx.objectStore(STORE_NAME).put(dk, DK_KEY);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

/**
 * Retrieve the cached Data Key.
 * Returns null if the user has never unlocked on this device, or after a cache clear.
 */
export async function getCachedDK(): Promise<CryptoKey | null> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readonly");
    const req = tx.objectStore(STORE_NAME).get(DK_KEY);
    req.onsuccess = () => resolve((req.result as CryptoKey) ?? null);
    req.onerror = () => reject(req.error);
  });
}

/** Remove the cached DK — call on logout or vault wipe. */
export async function clearCachedDK(): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readwrite");
    tx.objectStore(STORE_NAME).delete(DK_KEY);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}
