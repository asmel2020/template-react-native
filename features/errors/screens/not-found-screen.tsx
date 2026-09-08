import React from "react";
import { Stack, useRouter } from "expo-router";
import { ErrorState } from "@/components/ui/error-state";

export function NotFoundScreen() {
  const router = useRouter();

  return (
    <>
      <Stack.Screen
        options={{
          title: "No encontrado",
          headerShown: false,
        }}
      />
      <ErrorState
        variant="404"
        title="Página no encontrada"
        description="Lo sentimos, la ruta a la que intentas acceder no existe en la aplicación o ha sido removida."
        onAction={() => router.replace("/(app)/(tabs)" as any)}
        actionLabel="Volver al Inicio"
        secondaryAction={() => router.back()}
        secondaryActionLabel="← Regresar"
      />
    </>
  );
}

export default NotFoundScreen;
