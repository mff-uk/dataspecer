import { DialogProps, DialogWrapper } from "../dialog-api";
import { createEditNodeAttributesState, EditNodeAttributesState, IdentifierAndName, useEditNodeAttributesController } from "./edit-node-attributes-dialog-controller";
// TODO RadStr: Drag-drop Newly also in the dependencies of other editor (kinda funny that the upgrade happened literally at the same time)
import { DragDropContext, Draggable, Droppable, DropResult } from "@hello-pangea/dnd";

const dropContextsIdentifiers = [
  "visible-attributes",
  "invisible-attributes",
] as const;

const dropContextsIdentifiersToFieldMap: Record<typeof dropContextsIdentifiers[number], keyof EditNodeAttributesState> = {
  "visible-attributes": "attributes",
  "invisible-attributes": "relationships",
};

export const createEditClassAttributesDialog = (
  onConfirm: ((state: EditNodeAttributesState) => void) | null,
  attributes: IdentifierAndName[],
  relationships: IdentifierAndName[],
): DialogWrapper<EditNodeAttributesState> => {
  return {
    label: "edit-class-attributes-dialog.label",
    component: CreateEditNodeAttributesDialog,
    state: createEditNodeAttributesState(attributes, relationships),
    confirmLabel: "edit-class-attributes-dialog.btn-ok",
    cancelLabel: "edit-class-attributes-dialog.btn-cancel",
    validate: null,
    onConfirm,
    onClose: null,
    dialogClassNames: "base-dialog z-30 p-4 ",
  };
};

export const CreateEditNodeAttributesDialog = (props: DialogProps<EditNodeAttributesState>) => {
  const state = props.state;
  const controller = useEditNodeAttributesController(props);

  const handleDragEnd = (result: DropResult) => {
    if (!result.destination) {
      return;     // If dropped outside a valid drop zone
    }

    const sourceStateField = dropContextsIdentifiersToFieldMap[result.source.droppableId as typeof dropContextsIdentifiers[number]];
    const targetStateField = dropContextsIdentifiersToFieldMap[result.destination.droppableId as typeof dropContextsIdentifiers[number]];
    controller.moveToNewPosition(sourceStateField, targetStateField, result.source.index, result.destination.index);
  };

  // TODO RadStr: Once finalized - use localization for the name
  return <div>
    <DragDropContext onDragEnd={handleDragEnd}>
      <DroppableArea name="Visible attributes:" dropContextIdentifier={dropContextsIdentifiers[0]} state={state}></DroppableArea>
      <DroppableArea name="Hidden attributes:" dropContextIdentifier={dropContextsIdentifiers[1]} state={state}></DroppableArea>
    </DragDropContext>
    <SimpleHorizontalLineSeparator/>
  </div>;
};

// TODO RadStr: Name should be localized
type DroppableAreaProps = {
  name: string,
  state: EditNodeAttributesState,
  dropContextIdentifier: typeof dropContextsIdentifiers[number],
}

const DroppableArea = (props: DroppableAreaProps) => {
  const fieldInState = dropContextsIdentifiersToFieldMap[props.dropContextIdentifier];

  return <>
    <p className="font-bold">{props.name}</p>
    <Droppable droppableId={props.dropContextIdentifier}>
      {(provided) => (
        <div
          {...provided.droppableProps}
          ref={provided.innerRef}
          style={{ padding: 6, background: "#f0f0f0" }}
        >
          {props.state[fieldInState].map((itemInField, index) => (
            <Draggable key={itemInField.identifier} draggableId={itemInField.identifier} index={index}>
              {(provided) => (
                <div
                  ref={provided.innerRef}
                  {...provided.draggableProps}
                  {...provided.dragHandleProps}
                  style={{
                    padding: 6,
                    margin: "0 0 2px 0",
                    background: "white",
                    border: "1px solid #ddd",
                    borderRadius: 4,
                    ...provided.draggableProps.style,
                  }}
                >
                  {itemInField.name}
                </div>
              )}
            </Draggable>
          ))}
          {provided.placeholder}
        </div>
      )}
    </Droppable>
  </>;
};

const SimpleHorizontalLineSeparator = () => {
  return <div className="mb-2 mt-2 border-t border-gray-300"></div>;
};

