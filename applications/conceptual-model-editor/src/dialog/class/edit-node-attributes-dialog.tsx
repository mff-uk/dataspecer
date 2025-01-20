import { DialogProps, DialogWrapper } from "../dialog-api";
import { createEditNodeAttributesState, EditNodeAttributesState, IdentifierAndName, useEditNodeAttributesController } from "./edit-node-attributes-dialog-controller";
// TODO RadStr: Drag-drop Newly also in the dependencies of other editor (kinda funny that the upgrade happened literally at the same time)
import { DragDropContext, Draggable, Droppable, DropResult } from "@hello-pangea/dnd";


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

  // TODO RadStr: Should be in controller
  const handleDragEnd = (result: DropResult) => {
    if (!result.destination) {
      return;     // If dropped outside a valid drop zone
    }
    controller.moveAttributeToNewPosition(result.source.index, result.destination.index);
  };


  // TODO RadStr: Once finalized - use localization for the "Attributes" header
  return <div>
    <p className="font-bold">Attributes:</p>
    <DragDropContext onDragEnd={handleDragEnd}>
      <Droppable droppableId="droppable">
        {(provided) => (
          <div
            {...provided.droppableProps}
            ref={provided.innerRef}
            style={{ padding: 6, background: "#f0f0f0" }}
          >
            {state.attributes.map((attribute, index) => (
              <Draggable key={attribute.identifier} draggableId={attribute.identifier} index={index}>
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
                    {attribute.name}
                  </div>
                )}
              </Draggable>
            ))}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </DragDropContext>
    <SimpleHorizontalLineSeparator/>
    <p className="font-bold">Relationships:</p>
    {state.relationships.map(relationship => <div>{relationship.name}</div>)}
  </div>;
};

const SimpleHorizontalLineSeparator = () => {
  return <div className="mb-2 mt-2 border-t border-gray-300"></div>;
};

