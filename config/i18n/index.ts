import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import { getLocales } from "expo-localization";
import { createSafeMMKV } from "@/lib/safe-mmkv";
import { es } from "./locales/es";
import { en } from "./locales/en";
import type { AppLanguage } from "./types";

const LANGUAGE_STORAGE_KEY = "user-language";

// Instancia MMKV dedicada para preferencias de la app (SSR-safe y Web-safe)
export const preferenceStorage = createSafeMMKV({
  id: "app-preferences-storage",
});

/**
 * Detecta el idioma inicial:
 * 1. Idioma guardado en almacenamiento nativo MMKV.
 * 2. Idioma configurado en el dispositivo del usuario (expo-localization).
 * 3. Fallback: Español ('es').
 */
export function getInitialLanguage(): AppLanguage {
  const savedLanguage = preferenceStorage.getString(LANGUAGE_STORAGE_KEY) as AppLanguage | undefined;
  if (savedLanguage === "es" || savedLanguage === "en") {
    return savedLanguage;
  }

  const deviceLocales = getLocales();
  const primaryLocale = deviceLocales[0]?.languageCode;

  if (primaryLocale?.startsWith("en")) {
    return "en";
  }

  return "es";
}

const initialLanguage = getInitialLanguage();

i18n.use(initReactI18next).init({
  compatibilityJSON: "v4",
  resources: {
    es: { translation: es },
    en: { translation: en },
  },
  lng: initialLanguage,
  fallbackLng: "es",
  interpolation: {
    escapeValue: false, // React ya previene ataques XSS
  },
  react: {
    useSuspense: false, // React Native no requiere Suspense para i18n síncrono
  },
});

/**
 * Cambia el idioma en caliente y persiste la elección en MMKV
 */
export async function changeLanguage(language: AppLanguage): Promise<void> {
  await i18n.changeLanguage(language);
  preferenceStorage.set(LANGUAGE_STORAGE_KEY, language);
}

/**
 * Retorna el idioma activo actual
 */
export function getCurrentLanguage(): AppLanguage {
  return (i18n.language as AppLanguage) || "es";
}

export default i18n;
