import { Dimensions, PixelRatio, Platform } from "react-native";
import * as Device from "expo-device";
import * as Application from "expo-application";
import { getCalendars, getLocales } from "expo-localization";
import Constants from "expo-constants";
import { createSafeMMKV } from "@/lib/safe-mmkv";
import i18n from "i18next";

const deviceStorage = createSafeMMKV({ id: "device-metadata-storage" });
const DEVICE_ID_KEY = "device_unique_client_id";

/**
 * Genera un UUID v4 estándar
 */
function generateUUID(): string {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

/**
 * Obtiene o inicializa un ID de dispositivo único y persistente.
 * En Android intenta usar el Android ID por hardware; si no está disponible,
 * o en iOS / Web, persiste un UUID en MMKV que sobrevive a reinicios de la app.
 */
export function getPersistentDeviceId(): string {
  if (Platform.OS === "android") {
    try {
      const androidId = Application.getAndroidId();
      if (androidId) return androidId;
    } catch {
      // Fallback a MMKV
    }
  }

  let storedId = deviceStorage.getString(DEVICE_ID_KEY);
  if (!storedId) {
    storedId = generateUUID();
    deviceStorage.set(DEVICE_ID_KEY, storedId);
  }
  return storedId;
}

/**
 * Mapea el enum DeviceType a un texto amigable
 */
function getDeviceTypeString(type: Device.DeviceType | null): string {
  switch (type) {
    case Device.DeviceType.PHONE:
      return "phone";
    case Device.DeviceType.TABLET:
      return "tablet";
    case Device.DeviceType.DESKTOP:
      return "desktop";
    case Device.DeviceType.TV:
      return "tv";
    default:
      return "unknown";
  }
}

/**
 * Genera el diccionario completo de cabeceras HTTP con información del dispositivo.
 * Se calculan en tiempo real para reflejar cambios dinámicos de idioma o rotación de pantalla.
 */
export function getDeviceHeaders(): Record<string, string> {
  const window = Dimensions.get("window");
  const locales = getLocales();
  const primaryLocale = locales[0];
  const calendars = getCalendars();
  const primaryCalendar = calendars[0];

  const deviceId = getPersistentDeviceId();
  const brand = Device.brand ?? (Platform.constants as any)?.Brand ?? "unknown";
  const manufacturer = Device.manufacturer ?? (Platform.constants as any)?.Manufacturer ?? "unknown";
  const modelName = Device.modelName ?? Device.modelId ?? (Platform.constants as any)?.Model ?? "unknown";
  const osName = Device.osName ?? Platform.OS;
  const osVersion = Device.osVersion ?? String(Platform.Version);
  const deviceType = getDeviceTypeString(Device.deviceType);
  const isPhysical = String(Device.isDevice);

  const appName = Application.applicationName ?? Constants.expoConfig?.name ?? "template-react-native";
  const appVersion = Application.nativeApplicationVersion ?? Constants.expoConfig?.version ?? "1.0.0";
  const appBuild = Application.nativeBuildVersion ?? "1";
  const appId = Application.applicationId ?? Constants.expoConfig?.slug ?? "unknown";

  const locale = primaryLocale?.languageTag ?? "es";
  const currentLanguage = i18n.language ?? primaryLocale?.languageCode ?? "es";
  const timezone = primaryCalendar?.timeZone ?? Intl.DateTimeFormat().resolvedOptions().timeZone ?? "UTC";
  const currency = primaryLocale?.currencyCode ?? "";

  const screenRes = `${Math.round(window.width)}x${Math.round(window.height)}@${PixelRatio.get()}x`;
  const fontScale = String(PixelRatio.getFontScale());

  const headers: Record<string, string> = {
    "X-Device-Id": deviceId,
    "X-Device-Platform": Platform.OS,
    "X-Device-Brand": brand,
    "X-Device-Manufacturer": manufacturer,
    "X-Device-Model": modelName,
    "X-Device-OS-Name": osName,
    "X-Device-OS-Version": osVersion,
    "X-Device-Type": deviceType,
    "X-Device-Is-Physical": isPhysical,
    "X-Device-Locale": locale,
    "X-Device-Timezone": timezone,
    "X-Device-Screen": screenRes,
    "X-Device-Font-Scale": fontScale,
    "X-App-Id": appId,
    "X-App-Name": appName,
    "X-App-Version": appVersion,
    "X-App-Build": appBuild,
    "X-App-Language": currentLanguage,
    "X-Client-User-Agent": `${appName}/${appVersion} (${osName} ${osVersion}; ${brand} ${modelName}; ${locale})`,
  };

  if (Device.deviceName) {
    headers["X-Device-Name"] = Device.deviceName;
  }
  if (currency) {
    headers["X-Device-Currency"] = currency;
  }
  if (Device.deviceYearClass) {
    headers["X-Device-Year-Class"] = String(Device.deviceYearClass);
  }
  if (Device.totalMemory) {
    headers["X-Device-Memory"] = String(Device.totalMemory);
  }
  if (Device.supportedCpuArchitectures && Device.supportedCpuArchitectures.length > 0) {
    headers["X-Device-Cpu-Arch"] = Device.supportedCpuArchitectures.join(",");
  }

  return headers;
}

/**
 * Devuelve un objeto estructurado con la metadata del dispositivo para uso interno o debugging
 */
export function getDeviceInfo() {
  const window = Dimensions.get("window");
  const primaryLocale = getLocales()[0];
  const primaryCalendar = getCalendars()[0];

  return {
    deviceId: getPersistentDeviceId(),
    platform: Platform.OS,
    brand: Device.brand,
    manufacturer: Device.manufacturer,
    modelName: Device.modelName,
    modelId: Device.modelId,
    deviceName: Device.deviceName,
    osName: Device.osName,
    osVersion: Device.osVersion,
    deviceType: getDeviceTypeString(Device.deviceType),
    isPhysical: Device.isDevice,
    deviceYearClass: Device.deviceYearClass,
    totalMemory: Device.totalMemory,
    supportedCpuArchitectures: Device.supportedCpuArchitectures,
    locale: primaryLocale?.languageTag,
    languageCode: primaryLocale?.languageCode,
    activeAppLanguage: i18n.language,
    timezone: primaryCalendar?.timeZone,
    currencyCode: primaryLocale?.currencyCode,
    screen: {
      width: window.width,
      height: window.height,
      pixelRatio: PixelRatio.get(),
      fontScale: PixelRatio.getFontScale(),
    },
    app: {
      id: Application.applicationId,
      name: Application.applicationName,
      version: Application.nativeApplicationVersion,
      build: Application.nativeBuildVersion,
    },
  };
}
