import React from "react";
import { dialog } from "../../../../../dialog";
import {
    WdClassSurroundings,
    WdFilterByInstance,
    WdPropertyDescOnly,
} from "@dataspecer/wikidata-experimental-adapter";
import { WikidataPropertyType, isWdPropertyTypeAttribute } from "../wikidata-properties/wikidata-property-item";
import { WikidaPropertySelectionDialogContent } from "./wikidata-property-selection-dialog-content";

export interface WikidataPropertySelectionDialogProps {
    isOpen: boolean;
    close: () => void;

    wdProperty: WdPropertyDescOnly | undefined;
    selectedWdClassSurroundings: WdClassSurroundings | undefined;
    includeInheritedProperties: boolean;
    wdFilterByInstance: WdFilterByInstance | undefined;
    wdPropertyType: WikidataPropertyType | undefined;
    editingWdPropertySelectionId: number | undefined
}

/**
 * Upon call to this function, all props should be non null/undefined, except filter by instance (which is set by the user).
 * Assuming it is called on:
 *  1. accosications/backward association to select endpoints
 *  2. on attributes when switch to include inherited properties is on
 * The selection must never create records that contain the same definition.  
 */
export const WikidataPropertySelectionDialog: React.FC<WikidataPropertySelectionDialogProps> =
    dialog({ fullWidth: true, maxWidth: "md", PaperProps: { sx: { height: "90%" } } }, (props) => {
        if (
            props.isOpen &&
            props.wdProperty &&
            props.selectedWdClassSurroundings &&
            props.wdPropertyType
        ) {
            if (props.includeInheritedProperties || !isWdPropertyTypeAttribute(props.wdPropertyType))
                return <WikidaPropertySelectionDialogContent {...props} />;
        }
        return null;
    });
