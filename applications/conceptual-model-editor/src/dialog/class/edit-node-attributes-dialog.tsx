import { t } from "../../application";
import { Language } from "../../application/options";
import { DialogProps, DialogWrapper } from "../dialog-api";
import { ChangeablePartOfEditNodeAttributeState, changeablePartOfEditNodeAttributeStateAsArray, createEditNodeAttributesState, EditNodeAttributesState, IdentifierAndName, useEditNodeAttributesController } from "./edit-node-attributes-dialog-controller";
import { DragDropContext, Draggable, Droppable } from "@hello-pangea/dnd";

export const createEditClassAttributesDialog = (
  onConfirm: ((state: EditNodeAttributesState) => void) | null,
  visibleAttributes: IdentifierAndName[],
  hiddenAttributes: IdentifierAndName[],
  classIdentifier: string,
  language: Language
): DialogWrapper<EditNodeAttributesState> => {
  return {
    label: "edit-class-attributes-dialog.label",
    component: CreateEditNodeAttributesDialog,
    state: createEditNodeAttributesState(visibleAttributes, hiddenAttributes, classIdentifier, language),
    confirmLabel: "edit-class-attributes-dialog.btn-ok",
    cancelLabel: "edit-class-attributes-dialog.btn-cancel",
    validate: null,
    onConfirm,
    onClose: null,
    dialogClassNames: "base-dialog z-30 p-4",
  };
};

export const CreateEditNodeAttributesDialog = (props: DialogProps<EditNodeAttributesState>) => {
  const state = props.state;
  const controller = useEditNodeAttributesController(props);

  const hideAttribute = (index: number) => {
    controller.moveToNewPosition("visibleAttributes", "hiddenAttributes", index, 0);
  };
  const showAttribute = (index: number) => {
    controller.moveToNewPosition("hiddenAttributes", "visibleAttributes", index, 0);
  };

  return <div className="flex flex-row">
    <DragDropContext onDragEnd={controller.handleDragEnd}>
      <DroppableArea name={t("edit-class-attributes-visible-attributes-column-header")}
        dropContextIdentifier={changeablePartOfEditNodeAttributeStateAsArray[0]}
        state={state} hideAttribute={hideAttribute} showAttribute={null} onCreateNewAttribute={controller.onCreateNewAttribute}></DroppableArea>
      <DroppableArea name={t("edit-class-attributes-hidden-attributes-column-header")}
        dropContextIdentifier={changeablePartOfEditNodeAttributeStateAsArray[1]}
        state={state} hideAttribute={null} showAttribute={showAttribute} onCreateNewAttribute={null}></DroppableArea>
    </DragDropContext>
    <SimpleHorizontalLineSeparator/>
  </div>;
};

type DroppableAreaProps = {
  name: string,
  state: EditNodeAttributesState,
  dropContextIdentifier: ChangeablePartOfEditNodeAttributeState,
  hideAttribute: ((index: number) => void) | null,
  showAttribute: ((index: number) => void) | null,
  onCreateNewAttribute: (() => void) | null,
}

const getDroppableAreaStyle = (isDraggingOver: boolean): React.CSSProperties => ({
  background: isDraggingOver ? "lightblue" : "rgb(241 245 249)",
  padding: 6,
  width: "300px",
  maxHeight: "300px",
  overflow: "auto",
});

const DroppableArea = (props: DroppableAreaProps) => {
  return <div style={{ flex: 1 }}>
    <p className="font-bold">
      {props.name}
      {props.onCreateNewAttribute === null ?
        null :
        <button title={t("node-add-attribute")}onClick={props.onCreateNewAttribute}>➕</button>}
    </p>
    <Droppable droppableId={props.dropContextIdentifier}>
      {(provided, snapshot) => (
        <div
          {...provided.droppableProps}
          ref={provided.innerRef}
          style={getDroppableAreaStyle(snapshot.isDraggingOver)}
        >
          {props.state[props.dropContextIdentifier].map((itemInField, index) => (
            <Draggable key={itemInField.identifier} draggableId={itemInField.identifier} index={index}>
              {(provided) => (
                <div
                  ref={provided.innerRef}
                  {...provided.draggableProps}
                  {...provided.dragHandleProps}
                  className="relative flex w-full flex-row justify-between z-50"
                  style={{
                    padding: 1,
                    margin: "0 0 2px 0",
                    background: "white",
                    border: "1px solid #ddd",
                    fontSize: "12px",
                    ...provided.draggableProps.style,
                  }}
                >
                  - {itemInField.name}
                  {
                    props.hideAttribute === null ?
                      null :
                      <button onClick={(_) => props.hideAttribute!(index)}>🕶️</button>
                  }
                  {
                    props.showAttribute === null ?
                      null :
                      <button onClick={(_) => props.showAttribute!(index)}>👁️</button>
                  }
                </div>
              )}
            </Draggable>
          ))}
          {provided.placeholder}
        </div>
      )}
    </Droppable>
  </div>;
};

const SimpleHorizontalLineSeparator = () => {
  return <div className="mb-2 mt-2 border-t border-gray-300"></div>;
};

