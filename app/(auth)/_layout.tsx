import { Redirect, Stack } from "expo-router";
import { useAuthStore } from "@/stores/auth-store";

export default function AuthLayout() {
  const accessToken = useAuthStore((s) => s.auth.accessToken);

  // Si el usuario ya está autenticado, redirige a las pestañas principales
  if (accessToken) {
    return <Redirect href="/(tabs)" />;
  }

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: "fade",
      }}
    />
  );
}
