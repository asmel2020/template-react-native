import React from "react";
import { Stack, useRouter } from "expo-router";
import { ErrorState } from "@/components/ui/error-state";

export function ForbiddenScreen() {
  const router = useRouter();

  return (
    <>
      <Stack.Screen
        options={{
          title: "Acceso Denegado",
          headerShown: true,
          headerBackTitle: "Atrás",
        }}
      />
      <ErrorState
        variant="403"
        title="Acceso Denegado (403)"
        description="No dispones de los privilegios o permisos necesarios para ver esta pantalla o realizar esta acción."
        onAction={() => router.replace("/(app)/(tabs)" as any)}
        actionLabel="Volver al Inicio"
        secondaryAction={() => router.back()}
        secondaryActionLabel="Regresar a la pantalla anterior"
      />
    </>
  );
}

export default ForbiddenScreen;
