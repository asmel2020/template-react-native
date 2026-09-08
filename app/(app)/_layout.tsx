import { Redirect, Stack } from "expo-router";
import { useAuthStore } from "@/stores/auth-store";

export default function AppLayout() {
  const accessToken = useAuthStore((s) => s.auth.accessToken);

  // 🛡️ Guard central de autenticación: Si no hay token, redirige al login
  if (!accessToken) {
    return <Redirect href="/(auth)/sign-in" />;
  }

  return (
    <Stack>
      {/* Pestañas principales (ocultamos header para que rijan las pestañas nativas) */}
      <Stack.Screen
        name="(tabs)"
        options={{
          headerShown: false,
        }}
      />

      {/* Pantalla Stack de ejemplo: Detalle de Item con barra nativa y botón de regreso */}
      <Stack.Screen
        name="item-detail/[id]"
        options={{
          title: "Detalle del Item",
          headerShown: true,
          headerBackTitle: "Atrás",
        }}
      />

      {/* Pantallas de Estado de Error Agrupadas */}
      <Stack.Screen
        name="errors/server-error"
        options={{
          title: "Error del Servidor",
          headerShown: true,
          headerBackTitle: "Atrás",
        }}
      />
      <Stack.Screen
        name="errors/offline"
        options={{
          title: "Sin Conexión",
          headerShown: true,
          headerBackTitle: "Atrás",
        }}
      />
      <Stack.Screen
        name="errors/forbidden"
        options={{
          title: "Acceso Denegado",
          headerShown: true,
          headerBackTitle: "Atrás",
        }}
      />
    </Stack>
  );
}
