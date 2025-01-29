import { useActions } from "../../action/actions-react-binding";
import { t } from "../../application";
import { Language } from "../../application/options";
import { getStringFromLanguageStringInLang } from "../../util/language-utils";
import { EditAttributeProfileDialogState } from "../attribute-profile/edit-attribute-profile-dialog-controller";
import { EditAttributeDialogState } from "../attribute/edit-attribute-dialog-controller";
import { DialogProps, DialogWrapper } from "../dialog-api";
import { createEditNodeAttributesState, EditNodeAttributeChangeablePartOfState, EditNodeAttributesState, IdentifierAndName, useEditNodeAttributesController } from "./edit-node-attributes-dialog-controller";
// TODO RadStr: Drag-drop Newly also in the dependencies of other editor (kinda funny that the upgrade happened literally at the same time)
import { DragDropContext, Draggable, Droppable, DropResult } from "@hello-pangea/dnd";

const dropContextsIdentifiers = [
  "visible-attributes",
  "invisible-attributes",
] as const;

const dropContextsIdentifiersToFieldMap: Record<typeof dropContextsIdentifiers[number], EditNodeAttributeChangeablePartOfState> = {
  "visible-attributes": "visibleAttributes",
  "invisible-attributes": "hiddenAttributes",
};

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
  // TODO RadStr: Not sure - maybe should also access in controller?
  const actions = useActions();

  // TODO RadStr: Maybe should be part of controller, but then I need to export the dropContextsIdentifiersToFieldMap and dropContextsIdentifiers,
  //              Same for others
  const handleDragEnd = (result: DropResult) => {
    if (!result.destination) {
      return;     // If dropped outside a valid drop zone
    }

    const sourceStateField = dropContextsIdentifiersToFieldMap[result.source.droppableId as typeof dropContextsIdentifiers[number]];
    const targetStateField = dropContextsIdentifiersToFieldMap[result.destination.droppableId as typeof dropContextsIdentifiers[number]];
    controller.moveToNewPosition(sourceStateField, targetStateField, result.source.index, result.destination.index);
  };
  const hideAttribute = (index: number) => {
    controller.moveToNewPosition("visibleAttributes", "hiddenAttributes", index, 0);
  };
  const showAttribute = (index: number) => {
    controller.moveToNewPosition("hiddenAttributes", "visibleAttributes", index, 0);
  };
  const onCreateNewAttribute = () => {
    const onConfirmCallback = (state: EditAttributeDialogState | EditAttributeProfileDialogState, createdAttributeIdentifier: string) => {
      const name = getStringFromLanguageStringInLang(state.name, state.language)[0] ?? createdAttributeIdentifier;
      // We have to use timeout - there is probably some issue with updating state of multiple dialogs when one closes.
      setTimeout(() => controller.addToVisibleAttributes({
        identifier: createdAttributeIdentifier,
        name
      }), 1);
    }
    actions.openCreateAttributeDialogForClass(state.classIdentifier, onConfirmCallback);
  }

  // TODO RadStr: Once finalized - use localization for the name
  return <div className="flex flex-row">
    <DragDropContext onDragEnd={handleDragEnd}>
      <DroppableArea name="Visible attributes:" dropContextIdentifier={dropContextsIdentifiers[0]}
        state={state} hideAttribute={hideAttribute} showAttribute={null} onCreateNewAttribute={onCreateNewAttribute}></DroppableArea>
      <DroppableArea name="Hidden attributes:" dropContextIdentifier={dropContextsIdentifiers[1]}
        state={state} hideAttribute={null} showAttribute={showAttribute} onCreateNewAttribute={null}></DroppableArea>
    </DragDropContext>
    <SimpleHorizontalLineSeparator/>
  </div>;
};

// TODO RadStr: Name should be localized
type DroppableAreaProps = {
  name: string,
  state: EditNodeAttributesState,
  dropContextIdentifier: typeof dropContextsIdentifiers[number],
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
  const fieldInState = dropContextsIdentifiersToFieldMap[props.dropContextIdentifier];

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
          {props.state[fieldInState].map((itemInField, index) => (
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

