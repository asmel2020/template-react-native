import { useLocalSearchParams, useRouter } from "expo-router";
import { ActivityIndicator, ScrollView, View } from "react-native";
import { useTranslation } from "react-i18next";
import { Badge, Button, Card, Separator, Text } from "panelui-native";
import {
  useItemQuery,
  useUpdateItemMutation,
} from "@/features/example/hook/use-items";

export default function ItemDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { t } = useTranslation();

  const { data: item, isLoading, isError, error } = useItemQuery(id ?? "");
  const updateMutation = useUpdateItemMutation();

  const handleToggleStatus = () => {
    if (!item) return;
    updateMutation.mutate({
      id: item.id,
      completed: !item.completed,
    });
  };

  return (
    <ScrollView
      className="flex-1 bg-background"
      contentContainerStyle={{
        padding: 16,
        gap: 20,
      }}
    >
      {/* Banner explicativo del Stack */}
      <Card className="p-4 bg-primary/10 border-primary/20">
        <View className="gap-1">
          <Text weight="bold" className="text-primary">
            🛡️ {t("itemDetail.protectedNoticeTitle")}
          </Text>
          <Text size="sm" muted>
            {t("itemDetail.protectedNoticeDesc")}
          </Text>
        </View>
      </Card>

      {/* Estado de Carga */}
      {isLoading && (
        <View className="items-center justify-center py-12 gap-3">
          <ActivityIndicator size="large" />
          <Text muted>{`${t("itemDetail.loadingItem")} #${id}`}</Text>
        </View>
      )}

      {/* Estado de Error */}
      {isError && (
        <Card className="p-4 border-destructive/30 bg-destructive/10">
          <View className="gap-3 items-center">
            <Text weight="bold" className="text-destructive">
              {t("itemDetail.errorTitle")}
            </Text>
            <Text size="sm" muted>
              {error instanceof Error ? error.message : "Item not found"}
            </Text>
            <Button variant="outline" onPress={() => router.back()}>
              {t("common.back")}
            </Button>
          </View>
        </Card>
      )}

      {/* Detalle del Item */}
      {item && (
        <Card className="p-5 gap-4">
          <View className="flex-row items-center justify-between">
            <Text size="xs" muted className="uppercase tracking-wider">
              ID: #{item.id}
            </Text>
            <Badge variant={item.completed ? "success" : "secondary"}>
              {item.completed
                ? t("itemDetail.completed")
                : t("itemDetail.pending")}
            </Badge>
          </View>

          <View className="gap-1">
            <Text size="2xl" weight="bold">
              {item.title}
            </Text>
            {item.description ? (
              <Text muted>{item.description}</Text>
            ) : (
              <Text muted>{t("itemDetail.noDescription")}</Text>
            )}
          </View>

          <Separator />

          <View className="gap-1">
            <Text size="xs" muted>
              {t("itemDetail.createdDate")}:
            </Text>
            <Text size="sm">
              {item.createdAt
                ? new Date(item.createdAt).toLocaleString()
                : "N/A"}
            </Text>
          </View>

          <View className="pt-2 gap-2">
            <Button
              variant={item.completed ? "outline" : "primary"}
              loading={updateMutation.isPending}
              onPress={handleToggleStatus}
            >
              {item.completed
                ? t("itemDetail.markPending")
                : t("itemDetail.markCompleted")}
            </Button>

            <Button variant="ghost" onPress={() => router.back()}>
              {`← ${t("itemDetail.backToList")}`}
            </Button>
          </View>
        </Card>
      )}
    </ScrollView>
  );
}
