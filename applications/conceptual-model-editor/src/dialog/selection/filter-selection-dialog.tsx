import { DialogProps, DialogWrapper } from "../dialog-api";
import { createFilterSelectionState, SelectionFilterState, useFilterSelectionController } from "./filter-selection-dialog-controller";
import { Selections, SelectionsWithIdInfo } from "../../action/filter-selection-action";


/**
 * Represents one concrete filter data used to render checkbox for the filter.
 */
type CheckboxData = {
    checked: boolean;
    checkboxText: string;
    checkboxTooltip: string;
}

//
//

export const createFilterSelectionDialog = (
    onConfirm: (state: SelectionFilterState) => void | null,
    selections: SelectionsWithIdInfo,
    setSelectionInDiagram: (selections: Selections) => void,
): DialogWrapper<SelectionFilterState> => {
    return {
        label: "filter-selection-dialog.label",
        component: CreateFilterSelectionDialog,
        state: createFilterSelectionState(selections, setSelectionInDiagram),
        confirmLabel: "filter-selection-dialog.btn-ok",
        cancelLabel: "filter-selection-dialog.btn-cancel",
        validate: null,
        onConfirm,
        onClose: null,
        dialogClassNames: "",
    };
};


export const CreateFilterSelectionDialog = (props: DialogProps<SelectionFilterState>) => {
    const state = props.state;
    const controller = useFilterSelectionController(props);


    /**
     * Component which renders given {@link CheckboxData} as checkbox.
     */
    const createCheckboxComponent = (checkboxData: CheckboxData, index: number) => {
        return <div>
                    <label title={checkboxData.checkboxTooltip}>
                        <input type="checkbox"
                                checked={checkboxData.checked}
                                onChange={(event) => {
                                    controller.setFilterActivness({index, isActive: event.target.checked});
                                }}>
                        </input>
                        {checkboxData.checkboxText}
                    </label>
        </div>;
    };


    /**
     * Component with controls for the reduction of current selection.
     */
    const FilterControls = () => {
        return <div>
            {state.selectionFilters.map((checkboxState, index) => {
                return createCheckboxComponent(checkboxState, index);
            })}
        </div>;
    };


    const SimpleHorizontalLineSeparator = () => {
        return <div className="mb-2 mt-2 border-t border-gray-300"></div>;
    };


    /**
     * Component with the main content of dialog. So everything except header and footer.
     */
    const DialogContent = () => {
        return <div>
            <FilterControls/>
            <SimpleHorizontalLineSeparator/>
        </div>;
    };


    return <DialogContent/>;
};
