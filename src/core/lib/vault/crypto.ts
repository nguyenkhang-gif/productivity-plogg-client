/**
 * Zero-knowledge crypto layer — all operations run in the browser via WebCrypto.
 * PIN never leaves this module. Server sees only opaque base64 blobs.
 *
 * Key hierarchy:
 *   PIN → PBKDF2 → KEK (Key Encryption Key)
 *   KEK → AES-KW → wraps/unwraps the DK (Data Key)
 *   DK  → AES-GCM → encrypts/decrypts the task list blob
 */

const KDF_ALGO = "PBKDF2";
const KDF_HASH = "SHA-256";
const WRAP_ALGO = "AES-KW";
const WRAP_LENGTH = 256;
const ENCRYPT_ALGO = "AES-GCM";
const ENCRYPT_LENGTH = 256;
const IV_BYTES = 12;

// ---------- helpers ----------

function b64ToBuffer(b64: string): ArrayBuffer {
  const binary = atob(b64);
  const buf = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) buf[i] = binary.charCodeAt(i);
  return buf.buffer;
}

function bufferToB64(buf: ArrayBuffer): string {
  return btoa(String.fromCharCode(...new Uint8Array(buf)));
}

function randomBytes(n: number): Uint8Array<ArrayBuffer> {
  return crypto.getRandomValues(new Uint8Array(n)) as Uint8Array<ArrayBuffer>;
}

// ---------- KDF ----------

/**
 * Import the raw PIN string as a base key so PBKDF2 can use it.
 * PIN is processed as UTF-8 bytes — supports digits and passphrase alike.
 */
async function importPinMaterial(pin: string): Promise<CryptoKey> {
  return crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(pin),
    KDF_ALGO,
    false,
    ["deriveKey"]
  );
}

/**
 * Derive the Key Encryption Key (KEK) from PIN + salt.
 * Returns an AES-KW key — used only for wrap/unwrap, never for data encryption.
 */
export async function deriveKEK(
  pin: string,
  saltB64: string,
  iterations: number
): Promise<CryptoKey> {
  const material = await importPinMaterial(pin);
  return crypto.subtle.deriveKey(
    {
      name: KDF_ALGO,
      salt: b64ToBuffer(saltB64),
      iterations,
      hash: KDF_HASH,
    },
    material,
    { name: WRAP_ALGO, length: WRAP_LENGTH },
    false,
    ["wrapKey", "unwrapKey"]
  );
}

/** Generate a fresh random salt for PBKDF2. Returns base64. */
export function generateSalt(): string {
  return bufferToB64(randomBytes(16).buffer);
}

// ---------- Data Key ----------

/** Generate a fresh random AES-256-GCM Data Key (DK). One per vault, ever. */
export async function generateDK(): Promise<CryptoKey> {
  return crypto.subtle.generateKey(
    { name: ENCRYPT_ALGO, length: ENCRYPT_LENGTH },
    true,
    ["encrypt", "decrypt"]
  );
}

/**
 * Wrap DK with KEK using AES-KW. Returns base64 wrappedKey to store on server.
 * KEK is derived from PIN — server never sees the raw DK.
 */
export async function wrapDK(dk: CryptoKey, kek: CryptoKey): Promise<string> {
  const wrapped = await crypto.subtle.wrapKey("raw", dk, kek, WRAP_ALGO);
  return bufferToB64(wrapped);
}

/**
 * Unwrap the server-stored wrappedKey back into a usable DK.
 * Throws if PIN is wrong — AES-KW integrity check fails on bad KEK.
 */
export async function unwrapDK(
  wrappedKeyB64: string,
  kek: CryptoKey
): Promise<CryptoKey> {
  return crypto.subtle.unwrapKey(
    "raw",
    b64ToBuffer(wrappedKeyB64),
    kek,
    WRAP_ALGO,
    { name: ENCRYPT_ALGO, length: ENCRYPT_LENGTH },
    true,
    ["encrypt", "decrypt"]
  );
}

// ---------- Blob encryption ----------

export interface EncryptedBlob {
  ciphertext: string; // base64
  iv: string;         // base64, 12 bytes
}

/**
 * Encrypt a plaintext string with the DK.
 * A fresh random IV is generated every call — never reuse IV with the same key.
 */
export async function encryptBlob(
  plaintext: string,
  dk: CryptoKey
): Promise<EncryptedBlob> {
  const iv = randomBytes(IV_BYTES);
  const cipherBuf = await crypto.subtle.encrypt(
    { name: ENCRYPT_ALGO, iv },
    dk,
    new TextEncoder().encode(plaintext)
  );
  return {
    ciphertext: bufferToB64(cipherBuf),
    iv: bufferToB64(iv.buffer as ArrayBuffer),
  };
}

/**
 * Decrypt a ciphertext blob back to a plaintext string.
 * Throws (DataError) if ciphertext was tampered with or IV/DK is wrong.
 */
export async function decryptBlob(
  ciphertextB64: string,
  ivB64: string,
  dk: CryptoKey
): Promise<string> {
  const plainBuf = await crypto.subtle.decrypt(
    { name: ENCRYPT_ALGO, iv: b64ToBuffer(ivB64) },
    dk,
    b64ToBuffer(ciphertextB64)
  );
  return new TextDecoder().decode(plainBuf);
}

// ---------- Size guard ----------

/** Max ciphertext size the server accepts (64KB in base64 ≈ 87,381 chars). */
const MAX_PLAINTEXT_BYTES = 64 * 1024 * 0.75; // base64 inflates ~33%, work back from 64KB

/** Returns bytes used and whether the task list is approaching the server limit. */
export function checkBlobSize(plaintext: string): {
  bytes: number;
  nearLimit: boolean;
  overLimit: boolean;
} {
  const bytes = new TextEncoder().encode(plaintext).byteLength;
  return {
    bytes,
    nearLimit: bytes > MAX_PLAINTEXT_BYTES * 0.85,
    overLimit: bytes > MAX_PLAINTEXT_BYTES,
  };
}
