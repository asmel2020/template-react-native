// src/lib/auth-token.ts
import { createSafeMMKV } from "@/lib/safe-mmkv";

// Instancia cifrada dedicada a auth (SSR-safe y Web-safe)
export const authStorage = createSafeMMKV({
  id: "token-storage",
  mode: "multi-process",
  readOnly: false,
  compareBeforeSet: false,
  encryptionKey: "hunter2",
  encryptionType: "AES-256",
});

export function saveAuthToken(key: string, token: string): void {
  authStorage.set(key, token);
}

export function getAuthToken(key: string): string | null {
  return authStorage.getString(key) ?? null;
}

export function deleteAuthToken(key: string): void {
  authStorage.remove(key);
}
