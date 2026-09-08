import { Pressable, ScrollView, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTranslation } from "react-i18next";
import {
  Button,
  Card,
  Item,
  PANEL_THEMES,
  Switch,
  Text,
  useThemeMode,
} from "panelui-native";
import { useAuthStore } from "@/stores/auth-store";
import { changeLanguage } from "@/config/i18n";
import { SUPPORTED_LANGUAGES, type AppLanguage } from "@/config/i18n/types";

export default function SettingsScreen() {
  const insets = useSafeAreaInsets();
  const { t, i18n } = useTranslation();
  const { family, mode, setFamily, toggleMode } = useThemeMode();
  const { user, reset } = useAuthStore((s) => s.auth);

  const currentLang = (i18n.language as AppLanguage) || "es";

  const handleLogout = () => {
    reset();
  };

  return (
    <ScrollView
      className="flex-1 bg-background"
      contentContainerStyle={{
        paddingTop: insets.top + 16,
        paddingBottom: 32,
        paddingHorizontal: 16,
        gap: 24,
      }}
    >
      <View className="gap-1">
        <Text size="3xl" weight="bold">
          {t("settings.title")}
        </Text>
        <Text muted>{t("settings.subtitle")}</Text>
      </View>

      <View className="gap-3">
        <Text
          size="sm"
          weight="medium"
          muted
          className="uppercase tracking-wider"
        >
          {t("settings.language")}
        </Text>

        <Card className="p-3 gap-2">
          <View className="flex-row gap-2">
            {SUPPORTED_LANGUAGES.map((lang) => {
              const isSelected = currentLang.startsWith(lang.id);
              return (
                <Button
                  key={lang.id}
                  variant={isSelected ? "primary" : "outline"}
                  className="flex-1"
                  onPress={() => changeLanguage(lang.id)}
                >
                  {`${lang.flag} ${lang.nativeName}`}
                </Button>
              );
            })}
          </View>
        </Card>
      </View>

      <View className="gap-3">
        <Text
          size="sm"
          weight="medium"
          muted
          className="uppercase tracking-wider"
        >
          {t("settings.theme")}
        </Text>

        {/* Built from PANEL_THEMES rather than a hardcoded list, so a family
            you write yourself appears here as soon as it is registered. */}
        <View className="flex-row gap-4">
          {PANEL_THEMES.map((entry) => {
            const selected = entry.id === family.id;
            return (
              <Pressable
                key={entry.id}
                accessibilityRole="radio"
                accessibilityState={{ selected }}
                accessibilityLabel={entry.name}
                onPress={() => setFamily(entry.id)}
                className="items-center gap-2"
              >
                <View
                  className={
                    selected
                      ? "rounded-full border-2 border-ring p-0.5"
                      : "p-0.5"
                  }
                >
                  <View
                    className="h-10 w-10 rounded-full border border-border"
                    style={{
                      backgroundColor: entry.swatch[mode === "dark" ? 1 : 0],
                    }}
                  />
                </View>
                <Text size="sm" muted={!selected}>
                  {entry.name}
                </Text>
              </Pressable>
            );
          })}
        </View>

        <Card>
          {/* `toggleMode` keeps the current family, so someone in Moon dark
              who taps this lands in Moon light rather than default light. */}
          <Item>
            <Item.Content>
              <Item.Title>{t("settings.darkMode")}</Item.Title>
              <Item.Description>{`${t("settings.currently")} ${mode}`}</Item.Description>
            </Item.Content>
            <Item.Actions>
              <Switch
                value={mode === "dark"}
                onValueChange={toggleMode}
                accessibilityLabel={t("settings.darkMode")}
                accessibilityHint={`${t("settings.currently")} ${mode}`}
              />
            </Item.Actions>
          </Item>
        </Card>
      </View>

      <View className="gap-3">
        <Text
          size="sm"
          weight="medium"
          muted
          className="uppercase tracking-wider"
        >
          {t("settings.session")}
        </Text>

        <Card>
          <Card.Content className="p-4 gap-3">
            <View>
              <Text weight="semibold">{user?.username ?? "Usuario"}</Text>
              <Text size="sm" muted>
                {user?.email ?? "Sin correo registrado"}
              </Text>
            </View>

            <Button
              variant="destructive"
              onPress={handleLogout}
            >
              {t("settings.logout")}
            </Button>
          </Card.Content>
        </Card>
      </View>
    </ScrollView>
  );
}
