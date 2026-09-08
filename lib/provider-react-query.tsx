import { env } from "@/config/env";
import { useAuthStore } from "@/stores/auth-store";
import {
  QueryCache,
  QueryClient,
  QueryClientProvider,
} from "@tanstack/react-query";
import { AxiosError } from "axios";

import { router } from "expo-router";
import { toast } from "panelui-native";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: (failureCount, error) => {
        if (env.NODE_ENV === "development")
          console.log({ failureCount, error });

        if (failureCount >= 0 && env.NODE_ENV === "development") return false;
        if (failureCount > 3 && env.NODE_ENV === "production") return false;

        return !(
          error instanceof AxiosError &&
          [401, 403, 404].includes(error.response?.status ?? 0)
        );
      },
      refetchOnWindowFocus: env.NODE_ENV === "production",
      staleTime: 10 * 1000, // 10s
    },
    mutations: {
      onError: (error) => {
        if (error instanceof AxiosError) {
          if (error.response?.status === 304) {
            toast.show({
              variant: "warning",
              label: "Content not modified",
              description: "Your changes are live.",
            });
          }
          if (error.response?.status === 404) {
            toast.show({
              variant: "destructive",
              label: "Elemento no encontrado (404)",
              description: "El recurso que intentas modificar ya no existe.",
            });
          }
        }
      },
    },
  },
  queryCache: new QueryCache({
    onError: (error, query) => {
      if (error instanceof AxiosError) {
        if (error.response?.status === 401) {
          toast.show({
            variant: "destructive",
            label: "Session expired!",
          });

          useAuthStore.getState().auth.reset();
          router.replace("/(auth)/sign-in" as any);
        }
        if (error.response?.status === 403) {
          toast.show({
            variant: "destructive",
            label: "Acceso Denegado (403)",
            description: "No tienes permisos suficientes.",
          });
          router.replace("/errors/forbidden" as any);
        }
        if (error.response?.status === 404) {
          toast.show({
            variant: "warning",
            label: "Recurso no encontrado (404)",
            description: "El elemento solicitado no existe o fue eliminado.",
          });

          // Si la consulta tiene configurado meta: { redirectOn404: true }, redirige
          if ((query.meta as Record<string, unknown> | undefined)?.redirectOn404) {
            router.replace("/+not-found" as any);
          }
        }
        if (error.response?.status === 500) {
          toast.show({
            variant: "destructive",
            label: "Internal Server Error!",
          });
          // Only navigate to error page in production to avoid disrupting HMR in development
          if (env.NODE_ENV === "production") {
            router.replace("/errors/server-error" as any);
          }
        }
      }
    },
  }),
});

export default function ProviderReactQuery({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}
