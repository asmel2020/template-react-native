import React, { useState } from "react";
import { Stack, useRouter } from "expo-router";
import { ErrorState } from "@/components/ui/error-state";

export function OfflineScreen() {
  const router = useRouter();
  const [isChecking, setIsChecking] = useState(false);

  const handleCheckConnection = async () => {
    setIsChecking(true);
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setIsChecking(false);
    router.replace("/(app)/(tabs)" as any);
  };

  return (
    <>
      <Stack.Screen
        options={{
          title: "Sin Conexión",
          headerShown: true,
          headerBackTitle: "Atrás",
        }}
      />
      <ErrorState
        variant="offline"
        title="Sin Conexión a Internet"
        description="Parece que has perdido la conexión. Comprueba tu señal de Wi-Fi o datos móviles para continuar navegando."
        onRetry={handleCheckConnection}
        retryLabel="Verificar conexión"
        isRetrying={isChecking}
        secondaryAction={() => router.back()}
        secondaryActionLabel="Regresar"
      />
    </>
  );
}

export default OfflineScreen;
