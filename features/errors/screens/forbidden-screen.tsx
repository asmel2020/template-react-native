import React from "react";
import { Stack, useRouter } from "expo-router";
import { useTranslation } from "react-i18next";
import { ErrorState } from "@/components/ui/error-state";

export function ForbiddenScreen() {
  const router = useRouter();
  const { t } = useTranslation();

  return (
    <>
      <Stack.Screen
        options={{
          title: t("errors.forbiddenTitle"),
          headerShown: true,
          headerBackTitle: t("common.back"),
        }}
      />
      <ErrorState
        variant="403"
        title={t("errors.forbiddenTitle")}
        description={t("errors.forbiddenDesc")}
        onAction={() => router.replace("/(app)/(tabs)" as any)}
        actionLabel={t("errors.goHome")}
        secondaryAction={() => router.back()}
        secondaryActionLabel={t("errors.goBack")}
      />
    </>
  );
}

export default ForbiddenScreen;
