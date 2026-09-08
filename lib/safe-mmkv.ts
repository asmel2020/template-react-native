import { Platform } from "react-native";
import { createMMKV, type MMKV, type Configuration } from "react-native-mmkv";

/**
 * Determina si el código se está ejecutando en el servidor (Node.js / SSR de Expo Router)
 */
const isServerWeb = (): boolean =>
  Platform.OS === "web" &&
  (typeof window === "undefined" || window.document?.createElement == null);

const memoryStores = new Map<string, Map<string, any>>();

function getMemoryStore(id: string): Map<string, any> {
  let store = memoryStores.get(id);
  if (!store) {
    store = new Map<string, any>();
    memoryStores.set(id, store);
  }
  return store;
}

/**
 * Crea una implementación en memoria de la interfaz MMKV para entornos de servidor (SSR / SSG)
 * donde no existe localStorage ni DOM.
 */
function createServerStorage(id: string): MMKV {
  const listeners = new Set<(key: string) => void>();
  const store = getMemoryStore(id);

  return {
    id,
    isReadOnly: false,
    isEncrypted: false,
    get length(): number {
      return store.size;
    },
    get size(): number {
      return 0;
    },
    get byteSize(): number {
      return 0;
    },
    clearAll: () => {
      store.clear();
    },
    remove: (key: string) => {
      const existed = store.has(key);
      store.delete(key);
      return existed;
    },
    set: (key: string, value: boolean | string | number | Uint8Array | ArrayBuffer) => {
      store.set(key, value);
      listeners.forEach((l) => l(key));
    },
    getString: (key: string) => {
      const val = store.get(key);
      return val != null ? String(val) : undefined;
    },
    getNumber: (key: string) => {
      const val = store.get(key);
      return typeof val === "number" ? val : undefined;
    },
    getBoolean: (key: string) => {
      const val = store.get(key);
      return typeof val === "boolean" ? val : undefined;
    },
    getBuffer: (key: string) => {
      const val = store.get(key);
      if (val instanceof ArrayBuffer) return val;
      return undefined;
    },
    getAllKeys: () => {
      return Array.from(store.keys());
    },
    contains: (key: string) => {
      return store.has(key);
    },
    recrypt: () => {},
    encrypt: () => {},
    decrypt: () => {},
    trim: () => {},
    checkContentChanged: () => {},
    dispose: () => {},
    equals: () => false,
    name: "MMKV",
    addOnValueChangedListener: (listener: (key: string) => void) => {
      listeners.add(listener);
      return {
        remove: () => {
          listeners.delete(listener);
        },
      };
    },
    importAllFrom: () => 0,
  };
}

/**
 * Factory seguro de instancias MMKV con soporte multiplataforma:
 * - En Android / iOS: Instancia nativa MMKV de C++ (NitroModules) con cifrado AES-256.
 * - En Web (Browser): Instancia MMKV web (localStorage) eliminando opciones no soportadas.
 * - En Web (SSR / Node): Almacenamiento en memoria para evitar el error "Tried to access storage on the server".
 */
export function createSafeMMKV(configuration?: Configuration): MMKV {
  const id = configuration?.id ?? "mmkv.default";

  if (Platform.OS !== "web") {
    return createMMKV(configuration);
  }

  let realInstance: MMKV | null = null;
  const serverStorage = createServerStorage(id);

  const getTarget = (): MMKV => {
    if (isServerWeb()) {
      return serverStorage;
    }
    if (!realInstance) {
      try {
        // En Web eliminamos claves no soportadas por la implementación web
        const {
          encryptionKey: _ek,
          encryptionType: _et,
          path: _p,
          ...webConfig
        } = (configuration ?? { id }) as any;
        realInstance = createMMKV(webConfig);
      } catch {
        return serverStorage;
      }
    }
    return realInstance;
  };

  return new Proxy(serverStorage, {
    get(_target, prop: string | symbol) {
      const target = getTarget();
      const value = (target as any)[prop];
      if (typeof value === "function") {
        return value.bind(target);
      }
      return value;
    },
    set(_target, prop: string | symbol, value) {
      const target = getTarget();
      (target as any)[prop] = value;
      return true;
    },
  });
}
