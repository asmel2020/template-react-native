import { Image, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTranslation } from "react-i18next";
import { Text, useThemeMode } from "panelui-native";

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();
  const { mode } = useThemeMode();

  return (
    <View
      className="flex-1 items-center justify-center gap-8 bg-background px-8"
      style={{ paddingTop: insets.top, paddingBottom: insets.bottom }}
    >
      <Image
        source={
          mode === "dark"
            ? require("../../assets/logo-dark.png")
            : require("../../assets/logo-light.png")
        }
        style={{ width: 132, height: 132 }}
        resizeMode="contain"
        accessibilityLabel="PanelUI"
      />

      <View className="items-center gap-2">
        <Text size="3xl" weight="bold">
          {t("home.title")}
        </Text>
        <Text muted className="text-center">
          {t("home.editPrompt")}
        </Text>
      </View>

      <View className="items-center gap-1">
        <Text size="sm" muted>
          {t("home.addComponent")}
        </Text>
        <View className="rounded-xl border border-border bg-surface px-4 py-2.5">
          <Text size="sm" className="font-mono">
            npx panelui-cli@latest add dialog
          </Text>
        </View>
      </View>
    </View>
  );
}
