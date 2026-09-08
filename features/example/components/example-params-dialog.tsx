import { Button, Dialog } from "panelui-native";
import { ParamsExampleParams } from "../stores/use-componentes";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentRow: ParamsExampleParams; // Optional if no parameters are needed
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
            Cancel
          </Button>
          <Button variant="destructive" onPress={() => onOpenChange(false)}>
            Delete
          </Button>
        </Dialog.Footer>
      </Dialog.Content>
    </Dialog>
  );
};
