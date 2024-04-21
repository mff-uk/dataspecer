import React from "react";
import { dialog } from "../../../../dialog";
import { WdClassSurroundings, WdFilterByInstance, WdPropertyDescOnly } from "@dataspecer/wikidata-experimental-adapter";
import { WikidataPropertyType } from "./wikidata-property-item";
import { useTranslation } from "react-i18next";
import { DialogContent, DialogTitle } from "../../../detail/common";
import { Button, DialogActions } from "@mui/material";

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


const WikidaPropertySelectionDialogContent: React.FC<WikidataPropertySelectionDialogProps> = ({isOpen, close, wdProperty, wdPropertyType, wdFilterByInstance, selectedWdClassSurroundings}) => {
    const {t} = useTranslation("interpretedSurrounding");

    return (
        <>
        <DialogTitle id="customized-dialog-title" close={close}>
            {t("title")}
        </DialogTitle>
        <DialogContent dividers>
            {wdProperty.id}
        </DialogContent>
        <DialogActions>
            <Button onClick={close}>{t("close button")}</Button>
            <Button
                onClick={async () => {
                    close();
                }}
                disabled={true}>
                {t("confirm button")}
            </Button>
        </DialogActions>
        </>
    );
}