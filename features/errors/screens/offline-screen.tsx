import React, { useState } from "react";
import { Stack, useRouter } from "expo-router";
import { useTranslation } from "react-i18next";
import { ErrorState } from "@/components/ui/error-state";

export function OfflineScreen() {
  const router = useRouter();
  const { t } = useTranslation();
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
          title: t("errors.offlineTitle"),
          headerShown: true,
          headerBackTitle: t("common.back"),
        }}
      />
      <ErrorState
        variant="offline"
        title={t("errors.offlineTitle")}
        description={t("errors.offlineDesc")}
        onRetry={handleCheckConnection}
        retryLabel={t("errors.checkConnection")}
        isRetrying={isChecking}
        secondaryAction={() => router.back()}
        secondaryActionLabel={t("errors.goBack")}
      />
    </>
  );
}

export default OfflineScreen;
