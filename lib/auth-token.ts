// src/lib/auth-token.ts
import { Platform } from "react-native";
import { createMMKV } from "react-native-mmkv";
const isWeb = Platform.OS === "web";
// Instancia cifrada dedicada a auth
export const authStorage = createMMKV({
  id: "token-storage",
  mode: "multi-process",
  readOnly: false,
  compareBeforeSet: false,

  ...(!isWeb && {
    encryptionKey: "hunter2",
    encryptionType: "AES-256",
  }),
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
