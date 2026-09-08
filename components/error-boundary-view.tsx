import React, { useState } from "react";
import { ScrollView, View } from "react-native";
import { type ErrorBoundaryProps, useRouter } from "expo-router";
import { Button, Card, Separator, Text } from "panelui-native";
import { ErrorState } from "./ui/error-state";

export function ErrorBoundary({ error, retry }: ErrorBoundaryProps) {
  const router = useRouter();
  const [showDetails, setShowDetails] = useState(false);
  const [isRetrying, setIsRetrying] = useState(false);

  const handleRetry = async () => {
    try {
      setIsRetrying(true);
      await retry();
    } finally {
      setIsRetrying(false);
    }
  };

  const handleGoHome = () => {
    router.replace("/(app)/(tabs)" as any);
  };

  return (
    <ScrollView
      className="flex-1 bg-background"
      contentContainerStyle={{ flexGrow: 1, justifyContent: "center", padding: 16 }}
    >
      <ErrorState
        variant="error"
        title="¡Ups! Algo salió mal"
        description="Se ha producido un error inesperado en la aplicación. Puedes intentar recargar la pantalla o volver al inicio."
        onRetry={handleRetry}
        retryLabel="Reintentar operación"
        isRetrying={isRetrying}
        onAction={handleGoHome}
        actionLabel="Ir al Inicio"
      >
        {/* Toggle para mostrar detalles técnicos */}
        <View className="w-full pt-1">
          <Button
            variant="ghost"
            className="w-full"
            onPress={() => setShowDetails((prev) => !prev)}
          >
            {showDetails ? "Ocultar detalles técnicos ▲" : "Ver detalles técnicos ▼"}
          </Button>

          {showDetails && (
            <Card className="mt-3 p-3 bg-muted/60 border-border gap-2">
              <Text size="xs" weight="bold" className="text-destructive">
                {error.name}: {error.message}
              </Text>
              {error.stack ? (
                <>
                  <Separator />
                  <ScrollView style={{ maxHeight: 160 }} nestedScrollEnabled>
                    <Text size="xs" muted className="font-mono text-[11px] leading-4">
                      {error.stack}
                    </Text>
                  </ScrollView>
                </>
              ) : null}
            </Card>
          )}
        </View>
      </ErrorState>
    </ScrollView>
  );
}
