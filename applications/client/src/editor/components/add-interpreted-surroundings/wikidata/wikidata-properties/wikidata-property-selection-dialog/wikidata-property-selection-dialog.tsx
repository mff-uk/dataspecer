import React from "react";
import { dialog } from "../../../../../dialog";
import { WdClassSurroundings, WdFilterByInstance, WdPropertyDescOnly } from "@dataspecer/wikidata-experimental-adapter";
import { WikidataPropertyType } from "../items/wikidata-property-item";
import { WikidaPropertySelectionDialogContent } from "./wikidata-property-selection-dialog-content";

export interface WikidataPropertySelectionDialogProps {
    isOpen: boolean;
    close: () => void;

    wdProperty: WdPropertyDescOnly | undefined,
    selectedWdClassSurroundings: WdClassSurroundings | undefined;
    includeInheritedProperties: boolean;
    wdFilterByInstance: WdFilterByInstance | undefined;
    wdPropertyType: WikidataPropertyType | undefined;
}

export const WikidataPropertySelectionDialog: React.FC<WikidataPropertySelectionDialogProps> = dialog({fullWidth: true, maxWidth: "md", PaperProps: { sx: { height: '90%' } } }, (props) => {
    if (props.isOpen && props.wdProperty && props.selectedWdClassSurroundings && props.wdPropertyType) {
        return <WikidaPropertySelectionDialogContent {...props} />
    }
    return null
});
