import { BottomSheet, Button, Dialog, Input, Text } from "panelui-native";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const ExampleBottomSheet = ({ open, onOpenChange }: Props) => {
  return (
    <BottomSheet open={open} onOpenChange={onOpenChange}>
      <BottomSheet.Content>
        <Text size="lg" weight="semibold">
          Share project
        </Text>
        <Input placeholder="https://panelui.dev/p/xK2f9" />
        <Button>Copy link</Button>
      </BottomSheet.Content>
    </BottomSheet>
  );
};
