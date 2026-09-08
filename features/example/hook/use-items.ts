import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { toast } from "panelui-native";
import {
  createItemFn,
  deleteItemFn,
  getItemByIdFn,
  getItemsFn,
  updateItemFn,
} from "../api";
import type {
  CreateItemDto,
  GetItemsParams,
  UpdateItemDto,
} from "../api/types";

// ---------------------------------------------------------------------------
// 1. Query Keys Factory
// ---------------------------------------------------------------------------
export const itemKeys = {
  all: ["items"] as const,
  lists: () => [...itemKeys.all, "list"] as const,
  list: (params?: GetItemsParams) => [...itemKeys.lists(), params] as const,
  details: () => [...itemKeys.all, "detail"] as const,
  detail: (id: string | number) => [...itemKeys.details(), id] as const,
};

// ---------------------------------------------------------------------------
// Helper: Error Message Extractor
// ---------------------------------------------------------------------------
function getErrorMessage(error: unknown, fallback: string): string {
  if (error instanceof AxiosError) {
    return (
      error.response?.data?.message ??
      error.response?.data?.error ??
      error.message ??
      fallback
    );
  }
  if (error instanceof Error) {
    return error.message;
  }
  return fallback;
}

// ---------------------------------------------------------------------------
// 2. Query Hooks (Read)
// ---------------------------------------------------------------------------

/**
 * Hook to fetch the list of items
 */
export const useItemsQuery = (params?: GetItemsParams) => {
  return useQuery({
    queryKey: itemKeys.list(params),
    queryFn: () => getItemsFn(params),
    staleTime: 1000 * 30, // 30 seconds
  });
};

/**
 * Hook to fetch a single item by ID
 */
export const useItemQuery = (
  id?: string | number | null,
  options?: { enabled?: boolean },
) => {
  return useQuery({
    queryKey: itemKeys.detail(id ?? ""),
    queryFn: () => getItemByIdFn(id!),
    enabled: Boolean(id) && (options?.enabled ?? true),
    staleTime: 1000 * 60, // 1 minute
  });
};

// ---------------------------------------------------------------------------
// 3. Mutation Hooks (Create, Update, Delete)
// ---------------------------------------------------------------------------

/**
 * Hook to create a new item
 */
export const useCreateItemMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (newItem: CreateItemDto) => createItemFn(newItem),
    onSuccess: (createdItem) => {
      toast.show({
        variant: "success",
        label: "Elemento creado",
        description: `"${createdItem.title}" se ha creado con éxito.`,
      });
      // Invalidate all lists to refetch
      queryClient.invalidateQueries({ queryKey: itemKeys.lists() });
    },
    onError: (error) => {
      toast.show({
        variant: "destructive",
        label: "Error al crear",
        description: getErrorMessage(
          error,
          "No se pudo crear el elemento. Intenta nuevamente.",
        ),
      });
    },
  });
};

/**
 * Hook to update an existing item
 */
export const useUpdateItemMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (itemToUpdate: UpdateItemDto) => updateItemFn(itemToUpdate),
    onSuccess: (updatedItem) => {
      toast.show({
        variant: "success",
        label: "Elemento actualizado",
        description: `"${updatedItem.title}" se actualizó correctamente.`,
      });
      // Invalidate list queries and the specific detail query
      queryClient.invalidateQueries({ queryKey: itemKeys.lists() });
      queryClient.invalidateQueries({
        queryKey: itemKeys.detail(updatedItem.id),
      });
    },
    onError: (error) => {
      toast.show({
        variant: "destructive",
        label: "Error al actualizar",
        description: getErrorMessage(
          error,
          "No se pudo actualizar el elemento.",
        ),
      });
    },
  });
};

/**
 * Hook to delete an item
 */
export const useDeleteItemMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string | number) => deleteItemFn(id),
    onSuccess: ({ id }) => {
      toast.show({
        variant: "success",
        label: "Elemento eliminado",
        description: "El elemento ha sido eliminado.",
      });
      // Invalidate lists and remove cached detail
      queryClient.invalidateQueries({ queryKey: itemKeys.lists() });
      queryClient.removeQueries({ queryKey: itemKeys.detail(id) });
    },
    onError: (error) => {
      toast.show({
        variant: "destructive",
        label: "Error al eliminar",
        description: getErrorMessage(error, "No se pudo eliminar el elemento."),
      });
    },
  });
};

// ---------------------------------------------------------------------------
// 4. Consolidated Hook (Full CRUD Facade)
// ---------------------------------------------------------------------------
