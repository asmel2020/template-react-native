import React, { useState } from "react";
import { Stack, useRouter } from "expo-router";
import { ErrorState } from "@/components/ui/error-state";

export function ServerErrorScreen() {
  const router = useRouter();
  const [isRetrying, setIsRetrying] = useState(false);

  const handleRetry = async () => {
    setIsRetrying(true);
    await new Promise((resolve) => setTimeout(resolve, 1200));
    setIsRetrying(false);
    router.replace("/(app)/(tabs)" as any);
  };

  return (
    <>
      <Stack.Screen
        options={{
          title: "Error del Servidor",
          headerShown: true,
          headerBackTitle: "Atrás",
        }}
      />
      <ErrorState
        variant="500"
        title="Error del Servidor (500)"
        description="Nuestros servidores están experimentando intermitencias o están en mantenimiento programado. Por favor, intenta de nuevo en unos minutos."
        onRetry={handleRetry}
        retryLabel="Comprobar estado y reintentar"
        isRetrying={isRetrying}
        onAction={() => router.replace("/(app)/(tabs)" as any)}
        actionLabel="Volver al Inicio"
        secondaryAction={() => router.back()}
        secondaryActionLabel="Regresar"
      />
    </>
  );
}

export default ServerErrorScreen;
