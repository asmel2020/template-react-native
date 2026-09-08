import { KeyboardAvoidingView, Platform, ScrollView, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTranslation } from "react-i18next";
import { useForm } from "@tanstack/react-form";
import { z } from "zod";
import { Button, Card, Input, Text, toast } from "panelui-native";
import { useAuthStore } from "@/stores/auth-store";

// Esquema de validación con Zod v4 (top-level z.email y parámetro { error })
const signInSchema = z.object({
  email: z.email({ error: "Ingresa un correo electrónico válido" }),
  password: z.string().min(6, { error: "La contraseña debe tener al menos 6 caracteres" }),
});

/**
 * Genera un token JWT mock válido para pruebas sin backend
 */
function createMockJwt(user: { id: number; username: string; email: string }) {
  const header = btoa(JSON.stringify({ alg: "HS256", typ: "JWT" }));
  const payload = btoa(JSON.stringify(user));
  const signature = "mock_sig";
  return `${header}.${payload}.${signature}`;
}

export default function SignInScreen() {
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();
  const setAccessToken = useAuthStore((s) => s.auth.setAccessToken);

  // Formulario gestionado con TanStack Form y validado con Zod
  const form = useForm({
    defaultValues: {
      email: "usuario@ejemplo.com",
      password: "password123",
    },
    validators: {
      onChange: signInSchema,
    },
    onSubmit: async ({ value }) => {
      try {
        // Simula petición de red
        await new Promise((resolve) => setTimeout(resolve, 600));

        const mockToken = createMockJwt({
          id: 1,
          username: value.email.split("@")[0],
          email: value.email,
        });

        setAccessToken(mockToken);

        toast.show({
          variant: "success",
          label: t("auth.loginSuccess"),
        });
      } catch {
        toast.show({
          variant: "destructive",
          label: t("common.error"),
          description: "Credenciales incorrectas.",
        });
      }
    },
  });

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      className="flex-1 bg-background"
    >
      <ScrollView
        contentContainerStyle={{
          paddingTop: insets.top + 40,
          paddingBottom: insets.bottom + 24,
          paddingHorizontal: 24,
          flexGrow: 1,
          justifyContent: "center",
        }}
        keyboardShouldPersistTaps="handled"
      >
        <View className="items-center mb-8 gap-2">
          <Text size="3xl" weight="bold">
            {t("auth.signInTitle")}
          </Text>
          <Text muted className="text-center">
            {t("auth.signInSubtitle")}
          </Text>
        </View>

        <Card>
          <Card.Content className="p-6 gap-4">
            {/* Campo Email */}
            <form.Field
              name="email"
              children={(field) => {
                const error =
                  field.state.meta.isTouched && field.state.meta.errors[0];
                return (
                  <View className="gap-1">
                    <Input
                      label={t("auth.emailLabel")}
                      placeholder="correo@ejemplo.com"
                      value={field.state.value}
                      onChangeText={field.handleChange}
                      onBlur={field.handleBlur}
                      keyboardType="email-address"
                      autoCapitalize="none"
                      autoCorrect={false}
                    />
                    {error ? (
                      <Text size="sm" className="text-destructive">
                        {typeof error === "string"
                          ? error
                          : (error as any)?.message}
                      </Text>
                    ) : null}
                  </View>
                );
              }}
            />

            {/* Campo Password */}
            <form.Field
              name="password"
              children={(field) => {
                const error =
                  field.state.meta.isTouched && field.state.meta.errors[0];
                return (
                  <View className="gap-1">
                    <Input
                      label={t("auth.passwordLabel")}
                      placeholder="••••••••"
                      value={field.state.value}
                      onChangeText={field.handleChange}
                      onBlur={field.handleBlur}
                      secureTextEntry
                    />
                    {error ? (
                      <Text size="sm" className="text-destructive">
                        {typeof error === "string"
                          ? error
                          : (error as any)?.message}
                      </Text>
                    ) : null}
                  </View>
                );
              }}
            />

            {/* Botón Submit con estado reactivo */}
            <form.Subscribe
              selector={(state) => ({
                canSubmit: state.canSubmit,
                isSubmitting: state.isSubmitting,
              })}
            >
              {({ canSubmit, isSubmitting }) => (
                <Button
                  className="mt-2"
                  loading={isSubmitting}
                  disabled={!canSubmit}
                  onPress={form.handleSubmit}
                >
                  {isSubmitting ? t("auth.submitting") : t("auth.submitButton")}
                </Button>
              )}
            </form.Subscribe>
          </Card.Content>
        </Card>

        <View className="mt-6 items-center">
          <Text size="sm" muted>
            Formulario gestionado con TanStack Form + Zod
          </Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
