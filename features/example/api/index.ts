/**
 * ============================================================================
 * ITEMS API SERVICE (MOCK IMPLEMENTATION)
 * ============================================================================
 *
 * JUSTIFICACIÓN DEL MOCK:
 * Este módulo actúa como una capa de servicio de demostración para el template.
 * Implementa un almacén en memoria con latencia de red simulada para que:
 *
 * 1. TanStack Query funcione de forma 100% realista:
 *    - Demuestra estados de carga (`isLoading`, `isPending`, `isFetching`).
 *    - Permite verificar la invalidación automática de caché tras mutaciones.
 *    - Dispara las notificaciones de éxito (`Toast`) sin depender de un servidor externo.
 * 2. Permite desarrollo y pruebas offline inmediatas sin necesidad de tener un
 *    backend levantado o credenciales válidas en `EXPO_PUBLIC_API_URL`.
 * 3. Persistencia en sesión: Las mutaciones (crear, actualizar, eliminar)
 *    modifican el estado en memoria durante la vida útil de la aplicación.
 *
 * MIGRACIÓN A PRODUCCIÓN:
 * Cambia la constante `USE_MOCK_API = false` (o usa una variable de entorno) para
 * delegar las peticiones directamente a la instancia real de Axios (`@/config/api`).
 * ============================================================================
 */

import { api } from "@/config/api";
import type {
  ApiResponse,
  CreateItemDto,
  GetItemsParams,
  Item,
  UpdateItemDto,
} from "./types";

/**
 * Bandera para alternar entre Mock y API Real.
 * Cambia a `false` cuando tu endpoint `/v1/items` esté disponible en el backend.
 */
export const USE_MOCK_API = true;

const ENDPOINT = "/items";

/**
 * Simula latencia de red realista (por defecto 350ms)
 */
const simulateNetworkDelay = (ms = 350) =>
  new Promise((resolve) => setTimeout(resolve, ms));

// ----------------------------------------------------------------------------
// Almacén en memoria inicial (Datos simulados)
// ----------------------------------------------------------------------------
let mockItemsStore: Item[] = [
  {
    id: "1",
    title: "Configurar PanelUI con Tailwind v4",
    description: "Diseño semántico con tokens adaptados al tema claro y oscuro.",
    completed: true,
    createdAt: new Date(Date.now() - 86400000).toISOString(),
    updatedAt: new Date(Date.now() - 86400000).toISOString(),
  },
  {
    id: "2",
    title: "Almacenamiento seguro con MMKV",
    description: "Gestión de sesión y tokens de autenticación con cifrado AES-256.",
    completed: true,
    createdAt: new Date(Date.now() - 43200000).toISOString(),
    updatedAt: new Date(Date.now() - 43200000).toISOString(),
  },
  {
    id: "3",
    title: "Integrar TanStack Query v5",
    description: "Sincronización de caché, hooks modulares e invalidación reactiva.",
    completed: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "4",
    title: "Crear diálogos y bottom sheets modulares",
    description: "Orquestación desacoplada con Zustand para múltiples overlays.",
    completed: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

// ----------------------------------------------------------------------------
// Funciones de API (Conmutador Mock / Real)
// ----------------------------------------------------------------------------

/**
 * Obtener listado de items con soporte para filtros de búsqueda y estado
 */
export async function getItemsFn(params?: GetItemsParams): Promise<Item[]> {
  if (USE_MOCK_API) {
    await simulateNetworkDelay();

    let items = [...mockItemsStore];

    if (params?.search) {
      const term = params.search.toLowerCase();
      items = items.filter(
        (i) =>
          i.title.toLowerCase().includes(term) ||
          i.description?.toLowerCase().includes(term),
      );
    }

    if (params?.status && params.status !== "all") {
      const isCompleted = params.status === "completed";
      items = items.filter((i) => i.completed === isCompleted);
    }

    return items;
  }

  // --- Implementación Real con Axios ---
  const response = await api.get<ApiResponse<Item[]> | Item[]>(ENDPOINT, {
    params,
  });
  if (Array.isArray(response.data)) return response.data;
  return response.data?.data ?? [];
}

/**
 * Obtener un item por su ID
 */
export async function getItemByIdFn(id: string | number): Promise<Item> {
  if (USE_MOCK_API) {
    await simulateNetworkDelay();
    const item = mockItemsStore.find((i) => String(i.id) === String(id));
    if (!item) {
      throw new Error(`Elemento con ID ${id} no encontrado.`);
    }
    return { ...item };
  }

  // --- Implementación Real con Axios ---
  const response = await api.get<ApiResponse<Item> | Item>(`${ENDPOINT}/${id}`);
  if ("data" in response.data && response.data.data) {
    return response.data.data;
  }
  return response.data as Item;
}

/**
 * Crear un nuevo item
 */
export async function createItemFn(payload: CreateItemDto): Promise<Item> {
  if (USE_MOCK_API) {
    await simulateNetworkDelay();

    const newItem: Item = {
      id: String(Date.now()),
      title: payload.title,
      description: payload.description,
      completed: payload.completed ?? false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // Agregar al inicio de la lista simulada
    mockItemsStore = [newItem, ...mockItemsStore];
    return { ...newItem };
  }

  // --- Implementación Real con Axios ---
  const response = await api.post<ApiResponse<Item> | Item>(ENDPOINT, payload);
  if ("data" in response.data && response.data.data) {
    return response.data.data;
  }
  return response.data as Item;
}

/**
 * Actualizar un item existente por ID
 */
export async function updateItemFn({
  id,
  ...payload
}: UpdateItemDto): Promise<Item> {
  if (USE_MOCK_API) {
    await simulateNetworkDelay();

    const index = mockItemsStore.findIndex((i) => String(i.id) === String(id));
    if (index === -1) {
      throw new Error(`No se encontró el elemento con ID ${id} para actualizar.`);
    }

    const updatedItem: Item = {
      ...mockItemsStore[index],
      ...payload,
      updatedAt: new Date().toISOString(),
    };

    mockItemsStore[index] = updatedItem;
    return { ...updatedItem };
  }

  // --- Implementación Real con Axios ---
  const response = await api.put<ApiResponse<Item> | Item>(
    `${ENDPOINT}/${id}`,
    payload,
  );
  if ("data" in response.data && response.data.data) {
    return response.data.data;
  }
  return response.data as Item;
}

/**
 * Eliminar un item por ID
 */
export async function deleteItemFn(
  id: string | number,
): Promise<{ id: string | number }> {
  if (USE_MOCK_API) {
    await simulateNetworkDelay();

    const exists = mockItemsStore.some((i) => String(i.id) === String(id));
    if (!exists) {
      throw new Error(`No se encontró el elemento con ID ${id} para eliminar.`);
    }

    mockItemsStore = mockItemsStore.filter((i) => String(i.id) !== String(id));
    return { id };
  }

  // --- Implementación Real con Axios ---
  await api.delete(`${ENDPOINT}/${id}`);
  return { id };
}
