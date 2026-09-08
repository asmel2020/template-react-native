import React from "react";
import { Stack, useRouter } from "expo-router";
import { useTranslation } from "react-i18next";
import { ErrorState } from "@/components/ui/error-state";

export function NotFoundScreen() {
  const router = useRouter();
  const { t } = useTranslation();

  return (
    <>
      <Stack.Screen
        options={{
          title: t("errors.notFoundTitle"),
          headerShown: false,
        }}
      />
      <ErrorState
        variant="404"
        title={t("errors.notFoundTitle")}
        description={t("errors.notFoundDesc")}
        onAction={() => router.replace("/(app)/(tabs)" as any)}
        actionLabel={t("errors.goHome")}
        secondaryAction={() => router.back()}
        secondaryActionLabel={`← ${t("errors.goBack")}`}
      />
    </>
  );
}

export default NotFoundScreen;
