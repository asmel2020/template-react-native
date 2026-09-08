import React, { useState } from "react";
import { ScrollView, View } from "react-native";
import { type ErrorBoundaryProps, useRouter } from "expo-router";
import { useTranslation } from "react-i18next";
import { Button, Card, Separator, Text } from "panelui-native";
import { ErrorState } from "./ui/error-state";

export function ErrorBoundary({ error, retry }: ErrorBoundaryProps) {
  const router = useRouter();
  const { t } = useTranslation();
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
        title={t("errors.unexpectedTitle")}
        description={t("errors.unexpectedDesc")}
        onRetry={handleRetry}
        retryLabel={t("errors.retry")}
        isRetrying={isRetrying}
        onAction={handleGoHome}
        actionLabel={t("errors.goHome")}
      >
        {/* Toggle para mostrar detalles técnicos */}
        <View className="w-full pt-1">
          <Button
            variant="ghost"
            className="w-full"
            onPress={() => setShowDetails((prev) => !prev)}
          >
            {showDetails ? t("errors.hideTechnicalDetails") : t("errors.showTechnicalDetails")}
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
