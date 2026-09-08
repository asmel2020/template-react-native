import { useFeatureStore } from "../stores/use-componentes";
import { ExampleBottomSheet } from "./example-bottom-sheet";
import { ExampleDialog } from "./example-dialog";
import { ExampleParamsBottomSheet } from "./example-params-bottom-sheet";
import { ExampleParamsDialog } from "./example-params-dialog";

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

      {/* 3. Simple Non-Parameterized Dialog */}
      <ExampleBottomSheet
        open={open === "example-bottom-sheet"}
        onOpenChange={handleClose}
      />

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
