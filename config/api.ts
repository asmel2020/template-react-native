import axios from "axios";
import { env } from "./env";
import { useAuthStore } from "@/stores/auth-store";

const BASE_URL = env.EXPO_PUBLIC_API_URL;

const api = axios.create({
  baseURL: `${BASE_URL}/v1`,
});

api.interceptors.request.use(async (config) => {
  const token = useAuthStore.getState().auth.accessToken;

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  if (__DEV__) {
    (config as any).metadata = { startTime: performance.now() };
  }

  return config;
});

if (__DEV__) {
  api.interceptors.response.use(
    (response) => {
      const startTime = (response.config as any)?.metadata?.startTime;
      if (startTime) {
        const elapsedMs = (performance.now() - startTime).toFixed(2);
        const elapsedSec = (Number(elapsedMs) / 1000).toFixed(2);
        console.log(
          `⏱️ [API ${response.config.url}] Respuesta recibida en: ${elapsedMs} ms (${elapsedSec}s)`,
        );
      }
      return response;
    },
    (error) => {
      const startTime = (error.config as any)?.metadata?.startTime;
      if (startTime) {
        const elapsedMs = (performance.now() - startTime).toFixed(2);
        const elapsedSec = (Number(elapsedMs) / 1000).toFixed(2);
        console.log(
          `❌ [API ${error.config?.url}] Falló en: ${elapsedMs} ms (${elapsedSec}s)`,
        );
      }
      return Promise.reject(error);
    },
  );
}

export { api };
