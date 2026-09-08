# AGENTS.md — Reglas, Arquitectura y Guía de Desarrollo

> Este documento es la **fuente de verdad canónica** para asistentes de IA, agentes y desarrolladores que trabajen en este repositorio. Define las reglas estrictas de codificación, la estructura del proyecto y los patrones arquitectónicos obligatorios.

---

## 1. Visión General del Proyecto

Template moderno, escalable y listo para producción para **React Native** y **Expo** en su última generación:

- **Motor & Runtime**: Expo SDK 57 + React 19 + React Native 0.86 (Hermes, New Architecture habilitada con Fabric y TurboModules).
- **Enrutamiento**: Expo Router (File-based Routing con tipado estricto `typedRoutes: true`).
- **Arquitectura de Código**: **Feature-Driven Architecture** (módulos desacoplados en `features/`).
- **Estado del Servidor & Caché**: TanStack Query v5 + Axios estructurado por capas (API, Keys, Hooks).
- **Estado Global del Cliente**: Zustand v5 + `react-native-mmkv` (almacenamiento nativo en C++, síncrono y ultra-rápido).
- **Formularios & Validación**: **Única y exclusivamente `@tanstack/react-form` + `Zod v4`** (con funciones top-level `z.email()`, `{ error }`) mediante la especificación **Standard Schema** (`~standard`).
- **Sistema de Diseño**: Tailwind CSS v4 + `uniwind` (CSS Variables en vivo para temas claro/oscuro) + componentes de `panelui-native`.
- **Estabilidad de Compilación**: `.npmrc` con `node-linker=hoisted` para evitar limitaciones de rutas largas de Windows en CMake (`CMAKE_OBJECT_PATH_MAX`).

---

## 2. Estructura de Directorios

```text
d:/trabajo/template-react-native/
├── .agents/                      # Skills y recursos para agentes de IA
│   └── skills/                   # Guías especializadas (tanstack-form-zod, mmkv, etc.)
├── app/                          # Enrutamiento de Expo Router (Thin Route Adapters)
│   ├── (auth)/                   # Grupo público (Login, Registro, etc.)
│   │   ├── _layout.tsx           # Redirige a (app) si el usuario ya está autenticado
│   │   └── sign-in.tsx           # Ruta -> Renderiza @/features/auth
│   ├── (app)/                    # Grupo privado / protegido (Guard de sesión único)
│   │   ├── _layout.tsx           # 🛡️ Auth Guard central + Stack de navegación
│   │   ├── (tabs)/               # Pestañas nativas (NativeTabs)
│   │   │   ├── _layout.tsx       # UITabBar / Material Bottom Bar nativa
│   │   │   ├── index.tsx         # Tab Home -> @/features/home
│   │   │   ├── examples.tsx      # Tab Examples -> @/features/example
│   │   │   └── settings.tsx      # Tab Settings -> @/features/settings
│   │   ├── item-detail/          # Rutas dinámicas
│   │   │   └── [id].tsx          # Stack -> @/features/item-detail
│   │   └── errors/               # Rutas de error agrupadas
│   │       ├── server-error.tsx  # /errors/server-error (500)
│   │       ├── forbidden.tsx     # /errors/forbidden (403)
│   │       └── offline.tsx       # /errors/offline (Sin conexión)
│   ├── +not-found.tsx            # Pantalla global 404 para rutas inexistentes
│   └── _layout.tsx               # Root Layout (Providers de Tema, PanelUI, Query, ErrorBoundary)
├── components/                   # Componentes compartidos y transversales
│   ├── error-boundary-view.tsx   # Global React Error Boundary para capturar crashes
│   └── ui/
│       ├── error-state.tsx       # Componente reutilizable para estados 404, 500, 403, offline
│       └── icons.tsx             # Iconos del sistema con resolución de color por tema
├── config/                       # Configuración y variables de entorno
│   ├── api.ts                    # Instancia base de Axios con interceptores y cabeceras de dispositivo
│   ├── device-info.ts            # Extractor de telemetría y metadatos nativos del dispositivo
│   ├── env.ts                    # Validación y exportación de variables de entorno
│   └── i18n/                     # Sistema multi-idioma (i18next, locales, persistencia MMKV)
│       ├── index.ts              # Inicializador de i18n con detección de dispositivo y helpers
│       ├── types.ts              # Tipado estricto para react-i18next y selector de idiomas
│       └── locales/              # Diccionarios tipados (es.ts, en.ts)
├── features/                     # LÓGICA DE NEGOCIO Y VISTAS (Feature Pattern)
│   ├── auth/                     # Autenticación (SignInScreen, formularios, validación)
│   ├── home/                     # Pantalla principal Home
│   ├── example/                  # Ejemplos de componentes, CRUD items, stores y hooks
│   │   ├── api/                  # Endpoints y tipos de la feature
│   │   ├── components/           # Diálogos y bottom sheets controlados por Zustand
│   │   ├── hook/                 # Custom hooks de TanStack Query
│   │   ├── stores/               # Zustand slices locales de la feature
│   │   └── index.tsx             # Pantalla ExampleScreen
│   ├── item-detail/              # Detalle dinámico de item con React Query
│   ├── settings/                 # Configuración de tema, perfil y logout
│   └── errors/                   # Pantallas de error (404, 500, 403, offline)
├── lib/                          # Utilidades e integraciones de infraestructura
│   ├── auth-token.ts             # Almacenamiento seguro de tokens JWT
│   ├── decode-jwt.tsx            # Utilidad segura para decodificar JWTs sin dependencias CJS
│   ├── provider-react-query.tsx  # QueryClient configurado con manejo global de errores HTTP
│   └── safe-mmkv.ts              # Factory unificado de MMKV compatible con SSR, Web y Nativo
├── stores/                       # Stores globales de Zustand (Auth, persistencia MMKV)
│   └── auth-store.ts             # Estado de autenticación con sincronización MMKV
├── types/                        # Declaraciones globales de TypeScript
│   └── declarations.d.ts         # Tipos ambientales (@hugeicons, módulos sin tipos)
├── .env.example                  # Plantilla documentada de variables de entorno
└── AGENTS.md                     # Este archivo de reglas y especificación
```

---

## 3. Reglas de Navegación y Rutas (Expo Router)

### Regla 1: Thin Route Wrappers (Adaptadores Delgados)
Los archivos dentro de `app/` **NUNCA** deben contener lógica de negocio compleja, llamadas directas a APIs ni JSX extenso. Su única responsabilidad es importar el componente correspondiente desde `features/` y renderizarlo:

```tsx
// app/(app)/item-detail/[id].tsx — CORRECTO:
import ItemDetailScreen from "@/features/item-detail";

export default function ItemDetailRoute() {
  return <ItemDetailScreen />;
}
```

### Regla 2: Separación de Grupos `(auth)` vs `(app)`
- **`(auth)`**: Espacio público. En su `_layout.tsx`, si el usuario ya tiene sesión activa (`accessToken`), se redirige inmediatamente a `/(app)/(tabs)`:
  ```tsx
  if (accessToken) return <Redirect href="/(app)/(tabs)" />;
  ```
- **`(app)`**: Todo el espacio privado. En su `_layout.tsx`, si el usuario no tiene token, se redirige inmediatamente a `/(auth)/sign-in`:
  ```tsx
  if (!accessToken) return <Redirect href="/(auth)/sign-in" />;
  ```
- **Un único Auth Guard**: Al centralizar la validación en `app/(app)/_layout.tsx`, ninguna pantalla dentro de `(app)` necesita comprobar el token manualmente. Si el usuario cierra sesión, toda la pila se desmonta automáticamente.

### Regla 3: Rutas Dinámicas y Carpetas
- Para rutas con parámetros en la URL (como `/item-detail/:id`), se utiliza una carpeta con el nombre de la ruta y un archivo entre corchetes para el parámetro: `app/(app)/item-detail/[id].tsx`.
- Las pantallas estáticas agrupadas deben organizarse en subcarpetas semánticas (por ejemplo `app/(app)/errors/server-error.tsx`).

---

## 4. Reglas del Feature Pattern (`features/`)

Cada dominio o flujo funcional debe ser autocontenido dentro de su propio directorio en `features/<nombre-feature>/`:

### Estructura Estándar de una Feature:
```text
features/<nombre-feature>/
├── api/                          # Llamadas HTTP con Axios y tipos de datos
│   ├── types.ts                  # Interfaces y DTOs específicos del dominio
│   └── index.ts                  # Funciones API puras (get..., create..., update...)
├── hook/                         # Hooks de TanStack Query
│   └── use-<entidad>.ts          # Query keys factory, useQuery y useMutation
├── components/                   # Sub-componentes visuales específicos de la feature
├── stores/                       # Stores locales de Zustand (si la feature tiene UI state complejo)
└── index.tsx                     # Componente principal de la pantalla (Export default)
```

---

## 5. Reglas de APIs y TanStack Query (`features/*/api` y `features/*/hook`)

Toda integración con el backend debe implementarse siguiendo el patrón en 3 capas:

### Capa 1: Funciones API (`features/*/api/index.ts`)
Funciones asíncronas puras que reciben parámetros simples o DTOs y devuelven datos tipados:

```ts
import { api } from "@/config/api";
import type { Item, CreateItemDto } from "./types";

export const getItemsFn = async (params?: GetItemsParams): Promise<Item[]> => {
  const { data } = await api.get<Item[]>("/items", { params });
  return data;
};
```

### Capa 2: Query Key Factory (`features/*/hook/use-<feature>.ts`)
Estandariza las claves de caché para evitar errores tipográficos e invalidar estados de forma granular:

```ts
export const itemKeys = {
  all: ["items"] as const,
  lists: () => [...itemKeys.all, "list"] as const,
  list: (params?: GetItemsParams) => [...itemKeys.lists(), params] as const,
  details: () => [...itemKeys.all, "detail"] as const,
  detail: (id: string | number) => [...itemKeys.details(), id] as const,
};
```

### Capa 3: Hooks de React Query (`features/*/hook/use-<feature>.ts`)
Encapsulan `useQuery` y `useMutation` con tipado, invalidación automática de caché y feedback de usuario:

```ts
export const useItemsQuery = (params?: GetItemsParams) => {
  return useQuery({
    queryKey: itemKeys.list(params),
    queryFn: () => getItemsFn(params),
    staleTime: 1000 * 30,
  });
};

export const useCreateItemMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (dto: CreateItemDto) => createItemFn(dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: itemKeys.lists() });
      toast.show({ variant: "success", label: "Item creado exitosamente" });
    },
  });
};
```

### Manejo Global de Errores HTTP en `QueryClient` (`lib/provider-react-query.tsx`)
`QueryClient` tiene un interceptor global centralizado en `queryCache` y `queries.retry`:
- **401**: Resetea el store de sesión y redirige automáticamente a `/(auth)/sign-in`.
- **403**: Muestra toast de acceso denegado y redirige a `/errors/forbidden`.
- **404**: Muestra toast de recurso no encontrado y redirige a `+not-found` si la consulta tiene `meta: { redirectOn404: true }`.
- **500**: Muestra toast de error de servidor y en producción redirige a `/errors/server-error`.
- **Reintentos (`retry`)**: Los errores `401`, `403` y `404` están excluidos de reintentos automáticos.

### Telemetría y Cabeceras Automáticas de Dispositivo (`config/device-info.ts` + `config/api.ts`)
Cada solicitud HTTP realizada a través de la instancia central `api` incluye automáticamente metadatos contextuales y telemetría del cliente inyectados mediante interceptores de Axios:
- **Identificador Único (`X-Device-Id`)**: ID persistente que sobrevive a reinicios de la app (utiliza el `Android ID` por hardware en Android o un UUID v4 seguro persistido en `deviceStorage` de MMKV).
- **Hardware & Plataforma**: `X-Device-Platform`, `X-Device-Brand`, `X-Device-Manufacturer`, `X-Device-Model`, `X-Device-Type` (`phone`, `tablet`, `desktop`, `tv`), `X-Device-Is-Physical`.
- **Sistema Operativo**: `X-Device-OS-Name`, `X-Device-OS-Version`.
- **Localización & Pantalla**: `X-Device-Locale`, `X-Device-Timezone`, `X-Device-Screen` (ej: `1080x2400@2.75x`), `X-Device-Font-Scale`.
- **Aplicación & Sesión**: `X-App-Id`, `X-App-Name`, `X-App-Version`, `X-App-Build`, `X-App-Language`.
- **User-Agent Estandarizado (`X-Client-User-Agent`)**: Formato unificado `AppName/AppVersion (OS OSVersion; Brand Model; Locale)` para trazabilidad en logs y observabilidad de backend.

---

## 6. Reglas de Formularios y Validación (ESTRICTAS)

> [!IMPORTANT]
> **REGLA ABSOLUTA**: En este proyecto se utiliza **ÚNICA Y EXCLUSIVAMENTE `@tanstack/react-form`** validado con **`Zod`**.
> **PROHIBIDO**: No utilizar `react-hook-form`, `formik`, `yup` ni validaciones manuales ad-hoc.

### Integración con Standard Schema
Tanto `@tanstack/react-form` v1 como `zod` implementan la especificación nativa **Standard Schema** (`~standard`). **NO se deben instalar ni importar adaptadores obsoletos** como `@tanstack/zod-form-adapter`. El esquema Zod se pasa directamente en los callbacks de validación (`validators: { onChange: schema }` o `onBlur: schema`).

### Patrón Obligatorio para Formularios en React Native / PanelUI:

```tsx
import React from "react";
import { View } from "react-native";
import { useForm } from "@tanstack/react-form";
import { z } from "zod";
import { Input, Button, Text } from "panelui-native";

// 1. Esquema Zod v4 con funciones de primer nivel y parámetro { error }
const loginSchema = z.object({
  email: z.email({ error: "Ingresa un correo electrónico válido" }),
  password: z.string().min(6, { error: "La contraseña debe tener al menos 6 caracteres" }),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export function LoginForm() {
  // 2. Inicialización con useForm y validadores
  const form = useForm({
    defaultValues: {
      email: "",
      password: "",
    } as LoginFormValues,
    validators: {
      onChange: loginSchema, // Validación síncrona en cada cambio
    },
    onSubmit: async ({ value }) => {
      // value está garantizado de cumplir el esquema loginSchema
      await apiLogin(value);
    },
  });

  return (
    <View className="gap-4">
      {/* 3. Campo con binding bidireccional y control de errores por isTouched */}
      <form.Field name="email">
        {(field) => {
          const hasError = field.state.meta.isTouched && field.state.meta.errors.length > 0;
          return (
            <View className="gap-1">
              <Input
                label="Correo Electrónico"
                value={field.state.value}
                onChangeText={field.handleChange}
                onBlur={field.handleBlur}
                keyboardType="email-address"
                autoCapitalize="none"
              />
              {hasError && (
                <Text size="xs" className="text-destructive">
                  {field.state.meta.errors[0]}
                </Text>
              )}
            </View>
          );
        }}
      </form.Field>

      <form.Field name="password">
        {(field) => {
          const hasError = field.state.meta.isTouched && field.state.meta.errors.length > 0;
          return (
            <View className="gap-1">
              <Input
                label="Contraseña"
                value={field.state.value}
                onChangeText={field.handleChange}
                onBlur={field.handleBlur}
                secureTextEntry
              />
              {hasError && (
                <Text size="xs" className="text-destructive">
                  {field.state.meta.errors[0]}
                </Text>
              )}
            </View>
          );
        }}
      </form.Field>

      {/* 4. Botón Submit reactivo con form.Subscribe */}
      <form.Subscribe
        selector={(state) => [state.canSubmit, state.isSubmitting, state.isPristine]}
        children={([canSubmit, isSubmitting, isPristine]) => (
          <Button
            onPress={form.handleSubmit}
            disabled={!canSubmit || isPristine || isSubmitting}
            loading={isSubmitting}
          >
            {isSubmitting ? "Iniciando sesión..." : "Ingresar"}
          </Button>
        )}
      />
    </View>
  );
}
```

### Reglas Clave para Formularios:
1. **Binding en React Native**: Enlazar siempre `value={field.state.value}`, `onChangeText={field.handleChange}` y `onBlur={field.handleBlur}`.
2. **Estándares Modernos Zod v4 (OBLIGATORIO)**:
   - **Formatos de Primer Nivel**: Usar `z.email()`, `z.url()`, `z.uuid()`, `z.cuid()`, `z.ipv4()`, `z.iso.date()`, etc. Está **PROHIBIDO** encadenar métodos obsoletos como `z.string().email()`.
   - **Parámetro Unificado `{ error }`**: Usar siempre `{ error: "..." }` para personalizar mensajes de error en schemas, validadores y `.refine()`. Están **PROHIBIDOS** los parámetros obsoletos `message`, `invalid_type_error` y `required_error`.
   - **TypeScript Enums**: Usar `z.enum(MiEnum)` (el método `z.nativeEnum()` está obsoleto).
   - **Objetos Estrictos**: Usar `z.strictObject(...)` y `z.looseObject(...)` en lugar de `.strict()` y `.passthrough()`.
3. **Números en React Native**: Como `TextInput` opera con strings, usar `z.coerce.number()` en el esquema Zod o transformar con `Number(text)` en `onChangeText`.
4. **UX de Errores**: Mostrar errores condicionados a `field.state.meta.isTouched && field.state.meta.errors.length > 0` para no frustrar al usuario antes de interactuar.
5. **Validación Asíncrona con Debounce**: En comprobaciones de backend (ej. verificar email existente con `.refine(async ...)`), usar siempre `asyncDebounceMs={500}` en el campo para no saturar el servidor.

---

## 7. Estado del Cliente y Persistencia (Zustand + MMKV)

- **Persistencia Multiplataforma y SSR (`lib/safe-mmkv.ts`)**: Usar siempre `createSafeMMKV` de `@/lib/safe-mmkv` para instanciar almacenamientos MMKV:
  - **Soporte SSR / Expo Router Server Rendering**: En Node.js (durante renderizado estático/SSR de Expo Router en web), el acceso a `localStorage` lanza `Tried to access storage on the server`. `createSafeMMKV` detecta la falta de DOM y proporciona un almacén en memoria sin errores ni interrupciones.
  - **Navegador Web**: En cliente web, delega al `localStorage` del navegador omitiendo opciones no soportadas (`encryptionKey`, `path`).
  - **Nativo (Android & iOS)**: Utiliza la implementación completa de C++ (NitroModules) con cifrado AES-256 y persistencia en disco ultrarrápida.
- **Estructura del Store de Autenticación (`stores/auth-store.ts`)**:
  - `auth.accessToken`: Token JWT activo (o `null`).
  - `auth.user`: Objeto con la información del usuario autenticado (extraída de forma segura mediante `decodeJwt`).
  - Métodos `login()`, `logout()`, `setUser()`, `reset()`.

### Patrón de Diálogos y Overlays Controlados con Zustand (`manage-dialogs-zustand`)
Para mantener las pantallas y vistas limpias y desacopladas de modales, alertas y bottom sheets:

1. **Store de la Feature (`features/<feature>/stores/use-<feature>.ts`)**:
   - `open`: Identificador del diálogo activo (`DialogType | null`).
   - `currentRow`: Parámetros o entidad seleccionada (`RowType | null`).
   - Acciones `setOpen(type)` y `setCurrentRow(row)`.

2. **Orquestador Central (`features/<feature>/components/dialog.tsx`)**:
   - Componente único que se monta al final de la pantalla principal (`<Dialog />`).
   - Escucha el store y renderiza condicionalmente los diálogos o bottom sheets.
   - Cierra los modales reseteando tanto `open` como `currentRow` (`handleClose`).
   - Separa claramente diálogos simples de aquellos parametrizados (`open === "modal-params" && currentRow && <ExampleParamsDialog ... />`).

3. **Modales Puros y Controlados**:
   - Cada diálogo/sheet (`example-dialog.tsx`, `example-bottom-sheet.tsx`) recibe exclusivamente `open: boolean` y `onOpenChange: (open: boolean) => void`.
   - **PROHIBIDO** incluir `<Dialog.Trigger>` o `<BottomSheet.Trigger>` dentro de estos componentes; la visibilidad es controlada al 100% por props.

---

## 8. Sistema de Diseño, Temas y UI

- **Tokens & Variables CSS**: Toda la paleta de color vive en `global.css` como variables CSS (`--color-background`, `--color-card`, `--color-primary`, `--color-destructive`, etc.).
- **Uniwind**: Usar utilidades de Tailwind (`bg-background`, `text-foreground`, `border-border`, etc.). Para componentes de navegación nativos de React Navigation, sincronizar mediante `useCSSVariable()` como en `app/_layout.tsx`.
- **PanelUI Native**: Usar los componentes oficiales de `panelui-native` (`Button`, `Card`, `Input`, `Badge`, `BottomSheet`, `Accordion`, `Separator`, `Text`, `useToast`).
- **Nombres de Variantes en Botones**: En PanelUI `Button`, las variantes son `"primary" | "secondary" | "outline" | "ghost" | "destructive" | "social"`. No usar `"default"`.
- **Feedback Háptico**: Usar `expo-haptics` en botones y acciones críticas para mejorar la respuesta táctil nativa.

---

## 9. Manejo de Errores y Resiliencia

1. **Global Error Boundary (`components/error-boundary-view.tsx`)**:
   - Exportado desde `app/_layout.tsx` (`export { ErrorBoundary } from '@/components/error-boundary-view'`).
   - Captura cualquier excepción de renderizado o hook en la app con opción de reintento (`retry()`) y despliegue de stack trace técnico.
2. **Pantalla 404 Global (`app/+not-found.tsx`)**:
   - Captura deep links o rutas inexistentes en el router.
3. **Pantallas Dedicadas de Error (`app/(app)/errors/`)**:
   - `/errors/server-error`: Error 500 / mantenimiento.
   - `/errors/forbidden`: Error 403 / acceso denegado.
   - `/errors/offline`: Pérdida de conexión a internet.
4. **Componente Reutilizable `ErrorState` (`components/ui/error-state.tsx`)**:
   - Usar para renderizar estados vacíos o errores dentro de cualquier pantalla o lista.

---

## 10. Sistema de Internacionalización y Multi-idioma (i18n)

El proyecto cuenta con una arquitectura de internacionalización moderna, tipada y persistente basada en **`i18next`**, **`react-i18next`**, **`expo-localization`** y **`react-native-mmkv`**:

### Arquitectura de i18n (`config/i18n/`):
- **Detección Automática**: Al iniciar, `getInitialLanguage()` comprueba si el usuario tiene un idioma guardado en `preferenceStorage` (MMKV). Si no, detecta el idioma del dispositivo mediante `getLocales()` de `expo-localization`.
- **Persistencia en MMKV**: La elección del usuario se almacena instantáneamente en almacenamiento síncrono nativo en C++.
- **Tipado Estricto**: `config/i18n/types.ts` extiende el módulo `react-i18next` con `CustomTypeOptions` usando el esquema de `es.ts`, permitiendo que `t('clave.subclave')` cuente con **autocompletado total** y validación en tiempo de compilación.

### Patrón de Uso en Componentes y Vistas:
```tsx
import React from "react";
import { View } from "react-native";
import { useTranslation } from "react-i18next";
import { Text, Button } from "panelui-native";
import { changeLanguage } from "@/config/i18n";

export function ExampleI18n() {
  const { t, i18n } = useTranslation();

  return (
    <View className="gap-2">
      {/* 1. Uso tipado de cadenas de texto */}
      <Text size="lg" weight="bold">{t("settings.title")}</Text>
      <Text muted>{t("settings.subtitle")}</Text>

      {/* 2. Cambio de idioma en caliente */}
      <View className="flex-row gap-2">
        <Button onPress={() => changeLanguage("es")}>Español</Button>
        <Button onPress={() => changeLanguage("en")}>English</Button>
      </View>
    </View>
  );
}
```

---

## 11. Convenciones de Código y TypeScript

- **Modo Estricto**: TypeScript está configurado con `"strict": true`.
- **Cero Errores**: Todo cambio debe pasar `pnpm typecheck` (`tsc --noEmit`) con código de salida 0.
- **Nombres de Archivos**:
  - Rutas: `kebab-case.tsx` o `[param].tsx`.
  - Componentes y Vistas: `kebab-case.tsx` o `PascalCase.tsx`.
  - Hooks: `use-kebab-case.ts`.
  - Stores: `use-<nombre>.ts` o `<nombre>-store.ts`.
- **Importaciones con Alias**:
  - Usar siempre `@/*` para importar desde la raíz (ej: `@/features/auth`, `@/components/ui/error-state`, `@/stores/auth-store`).

---

## 12. Comandos Frecuentes

```bash
# Iniciar servidor de desarrollo Metro
pnpm start

# Iniciar servidor en navegador Web
pnpm web

# Ejecutar en emulador o dispositivo Android
pnpm android

# Ejecutar en simulador o dispositivo iOS
pnpm ios

# Verificación estricta de tipos de TypeScript (DEBE estar en verde)
pnpm typecheck
```
