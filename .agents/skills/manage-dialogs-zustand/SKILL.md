---
name: manage-dialogs-zustand
description: Managing Multiple Dialogs & BottomSheets using Zustand & Controlled Overlays in React Native
licence: MIT
metadata:
  author: danny gonzalez
  version: 2.0.0
---

# Skill: Managing Multiple Dialogs & BottomSheets using Zustand in React Native

This guide explains how to implement a clean, decoupled, and performance-optimized pattern for managing multiple **Dialogs** and **BottomSheets** within a feature module in **React Native** using **Zustand** and controlled overlay components.

---

## Why Use This Pattern?

- **Decoupled Markup**: The main screen code doesn't get cluttered with heavy dialog and bottom sheet JSX or nested portals.
- **Centralized Overlay State**: Opening, closing, resetting parameters, and switching active overlays is handled by a single, lightweight Zustand store.
- **Controlled Overlays**: Modals and sheets are controlled programmatically (`open={isOpen}`, `onOpenChange={handleClose}`), ensuring full predictability.
- **No In-Component Triggers**: We avoid embedding `<Dialog.Trigger>` or `<BottomSheet.Trigger>` inside modal components, which prevents unwanted UI elements or event interference in React Native.
- **Uniform Handling**: Dialogs and BottomSheets share the exact same opening, closing, and parameterized data flow.

---

## Recommended Folder Structure

Inside your feature folder (e.g. `features/[feature]/`):

```text
features/[feature]/
├── components/
│   ├── dialog.tsx                      # Orchestrator (renders all dialogs/sheets)
│   ├── example-dialog.tsx              # Simple Controlled Dialog
│   ├── example-params-dialog.tsx       # Parameterized Dialog
│   ├── example-bottom-sheet.tsx        # Simple Controlled BottomSheet
│   └── example-params-bottom-sheet.tsx # Parameterized BottomSheet
├── stores/
│   └── use-[feature].ts                # Zustand store for overlays & payloads
└── index.tsx                           # Feature Screen
```

---

## Step 1: Create the Feature Store (`stores/use-[feature].ts`)

Define the store that manages:
1. The currently open overlay identifier (`open`).
2. The context or payload passed to parameterized dialogs/sheets (`currentRow`).

```typescript
import { create } from "zustand";

// 1. Define all dialog and bottom sheet identifiers
export type DialogType =
  | "example-dialog"
  | "example-params"
  | "example-bottom-sheet"
  | "example-params-bottom-sheet";

// 2. Define the payload structure for parameterized overlays
export interface ParamsExampleParams {
  title: string;
  description: string;
}

interface FeatureState {
  open: DialogType | null;
  currentRow: ParamsExampleParams | null;
  setOpen: (open: DialogType | null) => void;
  setCurrentRow: (row: ParamsExampleParams | null) => void;
}

export const useFeatureStore = create<FeatureState>((set) => ({
  open: null,
  currentRow: null,
  setOpen: (open) =>
    set((state) => ({ open: state.open === open ? null : open })),
  setCurrentRow: (currentRow) => set({ currentRow }),
}));
```

---

## Step 2: Create Controlled Overlays

Each Dialog or BottomSheet is an isolated controlled component with `open` and `onOpenChange`.

> [!IMPORTANT]
> Do NOT include `<Dialog.Trigger>` or `<BottomSheet.Trigger>` inside these components, as visibility is managed exclusively by props from the orchestrator.

### 2A. Simple Controlled Dialog (`components/example-dialog.tsx`)

```tsx
import { Button, Dialog } from "panelui-native";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const ExampleDialog = ({ open, onOpenChange }: Props) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <Dialog.Content>
        <Dialog.Title>Ejemplo de diálogo</Dialog.Title>
        <Dialog.Description>Diálogo simple sin parámetros.</Dialog.Description>
        <Dialog.Footer>
          <Button variant="outline" onPress={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button variant="destructive" onPress={() => onOpenChange(false)}>
            Confirmar
          </Button>
        </Dialog.Footer>
      </Dialog.Content>
    </Dialog>
  );
};
```

### 2B. Parameterized Dialog (`components/example-params-dialog.tsx`)

```tsx
import { Button, Dialog } from "panelui-native";
import { ParamsExampleParams } from "../stores/use-[feature]";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentRow: ParamsExampleParams;
}

export const ExampleParamsDialog = ({
  open,
  onOpenChange,
  currentRow,
}: Props) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <Dialog.Content>
        <Dialog.Title>{currentRow.title}</Dialog.Title>
        <Dialog.Description>{currentRow.description}</Dialog.Description>
        <Dialog.Footer>
          <Button variant="outline" onPress={() => onOpenChange(false)}>
            Cerrar
          </Button>
        </Dialog.Footer>
      </Dialog.Content>
    </Dialog>
  );
};
```

### 2C. Simple Controlled BottomSheet (`components/example-bottom-sheet.tsx`)

```tsx
import { BottomSheet, Button, Input, Text } from "panelui-native";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const ExampleBottomSheet = ({ open, onOpenChange }: Props) => {
  return (
    <BottomSheet open={open} onOpenChange={onOpenChange}>
      <BottomSheet.Content>
        <Text size="lg" weight="semibold">
          Compartir Proyecto
        </Text>
        <Input placeholder="https://panelui.dev/p/xK2f9" />
        <Button onPress={() => onOpenChange(false)}>Copiar enlace</Button>
      </BottomSheet.Content>
    </BottomSheet>
  );
};
```

### 2D. Parameterized BottomSheet (`components/example-params-bottom-sheet.tsx`)

```tsx
import { BottomSheet, Button, Text } from "panelui-native";
import { ParamsExampleParams } from "../stores/use-[feature]";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentRow: ParamsExampleParams;
}

export const ExampleParamsBottomSheet = ({
  open,
  onOpenChange,
  currentRow,
}: Props) => {
  return (
    <BottomSheet open={open} onOpenChange={onOpenChange}>
      <BottomSheet.Content>
        <Text size="lg" weight="semibold">
          {currentRow.title}
        </Text>
        <Text size="sm" muted>
          {currentRow.description}
        </Text>
      </BottomSheet.Content>
      <BottomSheet.Footer>
        <Button variant="outline" onPress={() => onOpenChange(false)}>
          Cerrar
        </Button>
      </BottomSheet.Footer>
    </BottomSheet>
  );
};
```

---

## Step 3: Create the Overlay Orchestrator (`components/dialog.tsx`)

The orchestrator connects to the store and mounts whichever Dialog or BottomSheet is active. It also handles cleanup when dismissing.

```tsx
import { useFeatureStore } from "../stores/use-[feature]";
import { ExampleDialog } from "./example-dialog";
import { ExampleParamsDialog } from "./example-params-dialog";
import { ExampleBottomSheet } from "./example-bottom-sheet";
import { ExampleParamsBottomSheet } from "./example-params-bottom-sheet";

export const Dialog = () => {
  const { open, setOpen, currentRow, setCurrentRow } = useFeatureStore();

  const handleClose = () => {
    setCurrentRow(null);
    setOpen(null);
  };

  return (
    <>
      {/* 1. Simple Non-Parameterized Dialog */}
      <ExampleDialog
        open={open === "example-dialog"}
        onOpenChange={handleClose}
      />

      {/* 2. Parameter-Dependent Dialog */}
      {open === "example-params" && currentRow && (
        <ExampleParamsDialog
          open={open === "example-params"}
          onOpenChange={handleClose}
          currentRow={currentRow}
        />
      )}

      {/* 3. Simple Non-Parameterized BottomSheet */}
      <ExampleBottomSheet
        open={open === "example-bottom-sheet"}
        onOpenChange={handleClose}
      />

      {/* 4. Parameter-Dependent BottomSheet */}
      {open === "example-params-bottom-sheet" && currentRow && (
        <ExampleParamsBottomSheet
          open={open === "example-params-bottom-sheet"}
          onOpenChange={handleClose}
          currentRow={currentRow}
        />
      )}
    </>
  );
};
```

---

## Step 4: Use in Screen (`index.tsx`)

Trigger overlays directly from your UI components using `setOpen` and `setCurrentRow`, and render `<Dialog />` at the root of the screen.

```tsx
import { ScrollView, View } from "react-native";
import { Button } from "panelui-native";
import { useFeatureStore } from "./stores/use-[feature]";
import { Dialog } from "./components/dialog";

export default function FeatureScreen() {
  const { setOpen, setCurrentRow } = useFeatureStore();

  return (
    <View className="flex-1 bg-background">
      <ScrollView className="flex-1 p-4 gap-4">
        {/* Trigger simple dialog */}
        <Button variant="outline" onPress={() => setOpen("example-dialog")}>
          Abrir Diálogo
        </Button>

        {/* Trigger parameterized dialog */}
        <Button
          variant="outline"
          onPress={() => {
            setCurrentRow({
              title: "Detalles del Item",
              description: "Información cargada dinámicamente desde el store.",
            });
            setOpen("example-params");
          }}
        >
          Abrir Diálogo con Parámetros
        </Button>

        {/* Trigger simple bottom sheet */}
        <Button
          variant="outline"
          onPress={() => setOpen("example-bottom-sheet")}
        >
          Abrir BottomSheet
        </Button>

        {/* Trigger parameterized bottom sheet */}
        <Button
          variant="outline"
          onPress={() => {
            setCurrentRow({
              title: "Ficha Técnica",
              description: "Datos detallados presentados en BottomSheet.",
            });
            setOpen("example-params-bottom-sheet");
          }}
        >
          Abrir BottomSheet con Parámetros
        </Button>
      </ScrollView>

      {/* Orchestrator for all Dialogs and BottomSheets */}
      <Dialog />
    </View>
  );
}
```
