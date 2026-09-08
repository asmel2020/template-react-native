import { create } from "zustand";
import { saveAuthToken, getAuthToken, deleteAuthToken } from "@/lib/auth-token";
import decodeJwt from "@/lib/decode-jwt";

const ACCESS_TOKEN = "pv-token";

interface AuthUser {
  id: number;
  username: string;
  email: string;
}

interface AuthState {
  auth: {
    user: AuthUser | null;
    setUser: (user: AuthUser | null) => void;
    accessToken: string;
    setAccessToken: (accessToken: string) => void;
    resetAccessToken: () => void;
    reset: () => void;
  };
}

export const useAuthStore = create<AuthState>()((set) => {
  const cookieState = getAuthToken(ACCESS_TOKEN);
  let initToken = "";
  let initUser: AuthUser | null = null;

  if (cookieState) {
    try {
      initToken = cookieState.startsWith('"')
        ? JSON.parse(cookieState)
        : cookieState;
      initUser = decodeJwt<AuthUser>(initToken);
    } catch {
      initToken = "";
      initUser = null;
    }
  }

  return {
    auth: {
      user: initUser,
      setUser: (user) =>
        set((state) => ({ ...state, auth: { ...state.auth, user } })),
      accessToken: initToken,
      setAccessToken: (accessToken) =>
        set((state) => {
          saveAuthToken(ACCESS_TOKEN, accessToken);
          return { ...state, auth: { ...state.auth, accessToken } };
        }),
      resetAccessToken: () =>
        set((state) => {
          deleteAuthToken(ACCESS_TOKEN);
          return { ...state, auth: { ...state.auth, accessToken: "" } };
        }),
      reset: () =>
        set((state) => {
          deleteAuthToken(ACCESS_TOKEN);
          return {
            ...state,
            auth: { ...state.auth, user: null, accessToken: "" },
          };
        }),
    },
  };
});
