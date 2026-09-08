import React from "react";
import { View } from "react-native";
import { AlertCircle, AlertTriangle, FileQuestion, RefreshCw, ShieldAlert, WifiOff } from "lucide-react-native";
import { Button, Card, Text } from "panelui-native";
import { useCSSVariable } from "uniwind";

export type ErrorStateVariant = "404" | "403" | "500" | "offline" | "error" | "empty";

export interface ErrorStateProps {
  variant?: ErrorStateVariant;
  title?: string;
  description?: string;
  onRetry?: () => void;
  retryLabel?: string;
  onAction?: () => void;
  actionLabel?: string;
  secondaryAction?: () => void;
  secondaryActionLabel?: string;
  isRetrying?: boolean;
  children?: React.ReactNode;
}

const DEFAULT_CONFIGS: Record<
  ErrorStateVariant,
  {
    icon: typeof AlertTriangle;
    title: string;
    description: string;
    colorVar: string;
    badgeBg: string;
  }
> = {
  "404": {
    icon: FileQuestion,
    title: "Página no encontrada (404)",
    description:
      "La ruta a la que intentas acceder no existe, ha cambiado de lugar o fue eliminada.",
    colorVar: "--color-primary",
    badgeBg: "bg-primary/10 border-primary/20",
  },
  "403": {
    icon: ShieldAlert,
    title: "Acceso Denegado (403)",
    description:
      "No cuentas con los permisos o privilegios necesarios para acceder a este recurso.",
    colorVar: "--color-destructive",
    badgeBg: "bg-destructive/10 border-destructive/20",
  },
  "500": {
    icon: AlertTriangle,
    title: "Error del Servidor (500)",
    description:
      "Ocurrió un problema en nuestros servidores. Estamos trabajando para solucionarlo.",
    colorVar: "--color-destructive",
    badgeBg: "bg-destructive/10 border-destructive/20",
  },
  offline: {
    icon: WifiOff,
    title: "Sin Conexión a Internet",
    description:
      "No fue posible establecer conexión. Por favor verifica tu red Wi-Fi o datos móviles.",
    colorVar: "--color-muted-foreground",
    badgeBg: "bg-muted border-border",
  },
  error: {
    icon: AlertCircle,
    title: "Ha ocurrido un error inesperado",
    description:
      "Se presentó una anomalía al procesar la solicitud. Por favor intenta nuevamente.",
    colorVar: "--color-destructive",
    badgeBg: "bg-destructive/10 border-destructive/20",
  },
  empty: {
    icon: FileQuestion,
    title: "No hay contenido disponible",
    description: "No encontramos registros para mostrar en esta sección por ahora.",
    colorVar: "--color-muted-foreground",
    badgeBg: "bg-muted border-border",
  },
};

export function ErrorState({
  variant = "error",
  title,
  description,
  onRetry,
  retryLabel = "Reintentar",
  onAction,
  actionLabel = "Volver al Inicio",
  secondaryAction,
  secondaryActionLabel = "Regresar",
  isRetrying = false,
  children,
}: ErrorStateProps) {
  const config = DEFAULT_CONFIGS[variant];
  const IconComponent = config.icon;

  const [resolvedColor] = useCSSVariable([config.colorVar]) as (string | undefined)[];
  const iconColor = resolvedColor || "#64748b";

  return (
    <View className="flex-1 items-center justify-center p-6 bg-background">
      <Card className="w-full max-w-md p-6 items-center text-center gap-5 border-border shadow-sm">
        {/* Contenedor del Icono con fondo tonal */}
        <View
          className={`w-20 h-20 rounded-full items-center justify-center border ${config.badgeBg}`}
        >
          <IconComponent size={38} color={iconColor} strokeWidth={1.8} />
        </View>

        {/* Título y Descripción */}
        <View className="gap-2 items-center">
          <Text size="2xl" weight="bold" className="text-center">
            {title || config.title}
          </Text>
          <Text size="sm" muted className="text-center leading-5 px-2">
            {description || config.description}
          </Text>
        </View>

        {/* Contenido adicional opcional */}
        {children}

        {/* Botones de Acción */}
        <View className="w-full gap-2.5 pt-2">
          {onRetry && (
            <Button
              className="w-full"
              loading={isRetrying}
              onPress={onRetry}
            >
              {retryLabel}
            </Button>
          )}

          {onAction && (
            <Button
              variant={onRetry ? "outline" : "primary"}
              className="w-full"
              onPress={onAction}
            >
              {actionLabel}
            </Button>
          )}

          {secondaryAction && (
            <Button
              variant="ghost"
              className="w-full"
              onPress={secondaryAction}
            >
              {secondaryActionLabel}
            </Button>
          )}
        </View>
      </Card>
    </View>
  );
}
