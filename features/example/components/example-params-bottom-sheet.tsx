import { BottomSheet, Button, Dialog, Text } from "panelui-native";
import { ParamsExampleParams } from "../stores/use-componentes";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentRow: ParamsExampleParams; // Optional if no parameters are needed
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
        <Text size="lg" weight="semibold">
          {currentRow.description}
        </Text>

        <Button>Copy link</Button>
      </BottomSheet.Content>
      <BottomSheet.Footer>
        <Button onPress={() => onOpenChange(false)}>Cancel</Button>
      </BottomSheet.Footer>
    </BottomSheet>
  );
};
