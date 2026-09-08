// src/lib/auth-token.ts
import { createMMKV } from "react-native-mmkv";

// Instancia cifrada dedicada a auth
export const authStorage = createMMKV({
  id: `token-storage`,
  encryptionKey: "hunter2",
  encryptionType: "AES-256",
  mode: "multi-process",
  readOnly: false,
  compareBeforeSet: false,
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
