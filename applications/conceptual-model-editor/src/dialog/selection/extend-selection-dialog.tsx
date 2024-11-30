import { createExtendSelectionState, ExtendSelectionState, ExtensionCheckboxData, useExtendSelectionController } from "./extend-selection-dialog-controller";
import { DialogProps, DialogWrapper } from "../dialog-api";
import { Selections } from "../../action/filter-selection-action";

export const createExtendSelectionDialog = (
    onConfirm: (state: ExtendSelectionState) => void | null,
    onClose: () => void,
    areIdentifiersFromVisualModel: boolean,
    selections: Selections,
    setSelectionsInDiagram: (newSelection: Selections) => void,
  ): DialogWrapper<ExtendSelectionState> => {
return {
    label: "extend-selection-dialog.label",
    component: CreateExtendSelectionDialog,
    state: createExtendSelectionState(selections, setSelectionsInDiagram, areIdentifiersFromVisualModel),
    confirmLabel: "extend-selection-dialog.btn-ok",
    cancelLabel: "extend-selection-dialog.btn-cancel",
    validate: null,
    onConfirm,
    onClose,
    dialogClassNames: "bg-white bg-opacity-60 mt-12",
    };
};


export const CreateExtendSelectionDialog = (props: DialogProps<ExtendSelectionState>) => {
    const state = props.state;
    const controller = useExtendSelectionController(props);

    //
    //

    /**
     * Component which renders given {@link CheckboxData} as checkbox.
     */
    const createExtensionCheckbox = (checkboxData: ExtensionCheckboxData, index: number) => {
        return <div>
                    <label title={checkboxData.checkboxTooltip}>
                        <input type="checkbox"
                                checked={checkboxData.checked}
                                onChange={(event) => {
                                    controller.setExtensionCheckboxActivness({index, isActive: event.target.checked})
                                }}>
                        </input>
                        {checkboxData.checkboxText}
                    </label>
        </div>;
    };


    /**
     * Represent grid based style which places elements at columns of size 2.
     */
    const gridContainerStyle = {
        display: "grid",
        gridAutoFlow: "column",
        gridTemplateRows: "repeat(2, auto)",
        gap: "0px",
        columnGap: "50px",
        justifyContent: "start",
    };


    /**
     * Component representing the part of dialog with the extension settings
     */
    const SelectorPanel = () => (
        <div>
            <div className="cursor-help" title="Blue color (🔵) indicates selected element, Red color (🔴) indicates element which was not selected, but will be. For example:
🔵⭢🔴=Extend current selection by association targets">
                                ℹ
            </div>
            <div className="flex flex-row">
                <div style={gridContainerStyle}>
                    {state.extensionCheckboxes.map((checkboxState, index) => {
                        return createExtensionCheckbox(checkboxState, index);
                    })}
                </div>

                <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-0 px-4 border border-blue-700 rounded ml-12"                        
                        onClick={controller.performExtensionBasedOnExtensionState}>
                    Extend
                </button>
            </div>
        </div>
    );

    //
    //

    const SimpleHorizontalLineSeparator = () => {
        return <div className="mb-2 mt-2 border-t border-gray-300"></div>;
    };


    /**
     * Component with the main content of dialog. So everything except header and footer.
     */
    const DialogContent = () => {
        return <div>
            <SelectorPanel/>
            <SimpleHorizontalLineSeparator/>
        </div>;
    };


    return <DialogContent/>;
};
