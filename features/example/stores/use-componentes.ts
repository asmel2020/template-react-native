import { create } from "zustand";

// 1. Define the possible dialog types (identifiers)
type DialogType =
  | "example-dialog"
  | "example-params"
  | "example-bottom-sheet"
  | "example-params-bottom-sheet";

// 2. Define the payload structure for parameterized dialogs
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
