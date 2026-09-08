import { Button, Dialog } from "panelui-native";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const ExampleDialog = ({ open, onOpenChange }: Props) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <Dialog.Content>
        <Dialog.Title>Ejemplo de dialogo</Dialog.Title>
        <Dialog.Description>Dialogo sin parametros</Dialog.Description>
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
