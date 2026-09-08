import React, { useState } from "react";
import { Stack, useRouter } from "expo-router";
import { useTranslation } from "react-i18next";
import { ErrorState } from "@/components/ui/error-state";

export function ServerErrorScreen() {
  const router = useRouter();
  const { t } = useTranslation();
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
          title: t("errors.serverErrorTitle"),
          headerShown: true,
          headerBackTitle: t("common.back"),
        }}
      />
      <ErrorState
        variant="500"
        title={t("errors.serverErrorTitle")}
        description={t("errors.serverErrorDesc")}
        onRetry={handleRetry}
        retryLabel={t("errors.retry")}
        isRetrying={isRetrying}
        onAction={() => router.replace("/(app)/(tabs)" as any)}
        actionLabel={t("errors.goHome")}
        secondaryAction={() => router.back()}
        secondaryActionLabel={t("errors.goBack")}
      />
    </>
  );
}

export default ServerErrorScreen;
