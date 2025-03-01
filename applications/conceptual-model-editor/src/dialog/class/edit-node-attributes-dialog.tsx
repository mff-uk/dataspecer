import { t } from "../../application";
import { Language } from "../../configuration/options";
import { DialogProps, DialogWrapper } from "../dialog-api";
import {
  ChangeablePartOfEditNodeAttributeState,
  changeablePartOfEditNodeAttributeStateAsArray,
  createEditNodeAttributesState,
  EditNodeAttributesState,
  AttributeData,
  useEditNodeAttributesController
} from "./edit-node-attributes-dialog-controller";
import { DragDropContext, Draggable, Droppable } from "@hello-pangea/dnd";

export const createEditClassAttributesDialog = (
  onConfirm: ((state: EditNodeAttributesState) => void) | null,
  visibleAttributes: AttributeData[],
  hiddenAttributes: AttributeData[],
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
    <DragDropContext onDragEnd={controller.handleDrop}>
      <DroppableArea name={t("edit-class-attributes-visible-attributes-column-header")}
        dropContextIdentifier={changeablePartOfEditNodeAttributeStateAsArray[0]}
        state={state} hideAttribute={hideAttribute} showAttribute={null}
        onCreateNewAttribute={controller.onCreateNewAttribute}>
      </DroppableArea>
      <DroppableArea name={t("edit-class-attributes-hidden-attributes-column-header")}
        dropContextIdentifier={changeablePartOfEditNodeAttributeStateAsArray[1]}
        state={state} hideAttribute={null}
        showAttribute={showAttribute} onCreateNewAttribute={null}>
      </DroppableArea>
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

const getDroppableAreaStyle = (isDraggingOver: boolean): string => {
  return `p-1.5 w-[400px] max-h-[300px] overflow-auto ${isDraggingOver ? "bg-sky-200" : "bg-slate-100"}`;
}

const DroppableArea = (props: DroppableAreaProps) => {
  return <div style={{ flex: 1 }}>
    <p className="font-bold">
      {props.name}
      {props.onCreateNewAttribute === null ?
        null :
        <button title={t("node-add-attribute")} onClick={props.onCreateNewAttribute}>➕</button>}
    </p>
    <Droppable droppableId={props.dropContextIdentifier}>
      {(provided, snapshot) => (
        <div
          {...provided.droppableProps}
          ref={provided.innerRef}
          className={getDroppableAreaStyle(snapshot.isDraggingOver)}
          // Style={getDroppableAreaStyle(snapshot.isDraggingOver)}
        >
          {props.state[props.dropContextIdentifier].map((itemInField, index) => (
            <Draggable key={itemInField.identifier} draggableId={itemInField.identifier} index={index}>
              {(provided) => (
                <div
                  ref={provided.innerRef}
                  {...provided.draggableProps}
                  {...provided.dragHandleProps}
                  className="relative flex w-full flex-row justify-between z-50 p-[1px] mb-[2px] bg-white border border-gray-300 text-[12px]"
                  style={{...provided.draggableProps.style}}
                >
                  {/* TODO RadStr: Copy-paste from the entity-node - maybe could be separate component */}
                  <div>
                    <span>
                      - {itemInField.name}
                    </span>
                    {itemInField.profileOf === null ? null : (
                      <>
                        &nbsp;
                        <span className="text-gray-600 underline">
                          profile
                        </span>
                        &nbsp;of&nbsp;
                        <span>
                          {itemInField.profileOf}
                        </span>
                      </>
                    )}
                  </div>
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

