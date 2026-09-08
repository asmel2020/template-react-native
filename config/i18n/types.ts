import "react-i18next";
import type { es } from "./locales/es";

declare module "react-i18next" {
  interface CustomTypeOptions {
    defaultNS: "translation";
    resources: {
      translation: typeof es;
    };
  }
}

export type AppLanguage = "es" | "en";

export interface LanguageOption {
  id: AppLanguage;
  name: string;
  nativeName: string;
  flag: string;
}

export const SUPPORTED_LANGUAGES: LanguageOption[] = [
  { id: "es", name: "Spanish", nativeName: "Español", flag: "🇪🇸" },
  { id: "en", name: "English", nativeName: "English", flag: "🇺🇸" },
];
