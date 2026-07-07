import axiosInstance from "@/core/lib/axiosInstance";

export interface VaultKdf {
  algo: string;
  salt: string;
  iterations: number;
}

export interface VaultBlob {
  ciphertext: string;
  iv: string;
  wrappedKey: string;
  kdf: VaultKdf;
  version: number;
}

export interface PutVaultPayload {
  ciphertext: string;
  iv: string;
  wrappedKey: string;
  kdf: VaultKdf;
  baseVersion?: number;
}

export interface PutVaultResponse {
  version: number;
}

export interface PutVaultConflict {
  currentVersion: number;
}

export const vaultApi = {
  getVault: () => axiosInstance.get<VaultBlob>("/vault/tasks"),

  putVault: (payload: PutVaultPayload) =>
    axiosInstance.put<PutVaultResponse>("/vault/tasks", payload),

  deleteVault: () => axiosInstance.delete<void>("/vault/tasks"),
};
