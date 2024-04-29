import { Button, DialogActions, Typography } from "@mui/material";
import React, { useContext, useMemo } from "react";
import { DialogContent, DialogTitle } from "../../../detail/common";
import { WdClassSurroundings } from "@dataspecer/wikidata-experimental-adapter";
import { dialog, useDialog } from "../../../../dialog";
import { useTranslation } from "react-i18next";
import { WdPropertySelectionContext } from "../contexts/wd-property-selection-context";
import { WikidataPropertySelectionDialog } from "../wikidata-properties/wikidata-property-selection-dialog/wikidata-property-selection-dialog";
import { WikidataPropertyType } from "../wikidata-properties/items/wikidata-property-item";
import { WikidataPropertySelectionList } from "./wikidata-property-selection-list";
import { WdPropertySelectionRecord } from "../property-selection-record";

export interface WikidataShowSelectedDialogProps {
    isOpen: boolean;
    close: () => void;

    rootWdClassSurroundings: WdClassSurroundings | undefined;
}

export const WikidataShowSelectedDialog: React.FC<WikidataShowSelectedDialogProps> =
    dialog({ fullWidth: true, maxWidth: "md", PaperProps: { sx: { height: "90%" } } }, (props) => {
        if (props.isOpen && props.rootWdClassSurroundings) {
            return <WikidataShowSelectedDialogContent {...props} />
        }
        return null;
    });

function filterSelectionGroup(propertySelections: WdPropertySelectionRecord[], wdPropertyType: WikidataPropertyType): WdPropertySelectionRecord[] {
    return propertySelections.filter((selection) => selection.wdPropertyType === wdPropertyType).sort((a, b) => a.wdProperty.id - b.wdProperty.id);
}

const GROUPS = ['attributes', 'external identifiers attributes', 'associations', 'backward associations']
const WikidataShowSelectedDialogContent: React.FC<WikidataShowSelectedDialogProps> = ({close, rootWdClassSurroundings}) => {
    const { t } = useTranslation("interpretedSurrounding");
    const wdPropertySelectionContext = useContext(WdPropertySelectionContext);
    const WdPropertySelectionDialog = useDialog(WikidataPropertySelectionDialog);

    const selectionGroups = useMemo(() => {
        return {
            attributes: filterSelectionGroup(wdPropertySelectionContext.wdPropertySelectionRecords, WikidataPropertyType.ATTRIBUTES),
            externalIdentifiers: filterSelectionGroup(wdPropertySelectionContext.wdPropertySelectionRecords, WikidataPropertyType.EXTERNAL_IDENTIFIERS_ATTRIBUTES),
            associations: filterSelectionGroup(wdPropertySelectionContext.wdPropertySelectionRecords, WikidataPropertyType.ASSOCIATIONS),
            backwardAssociation: filterSelectionGroup(wdPropertySelectionContext.wdPropertySelectionRecords, WikidataPropertyType.BACKWARD_ASSOCIATIONS),
        }
    }, [wdPropertySelectionContext.wdPropertySelectionRecords])

    return (
        <>
            <DialogTitle id='customized-dialog-title' close={close}>
                {t("show selected title")}
            </DialogTitle>
            <DialogContent dividers>
                {
                    Object.entries(selectionGroups).map(([key, value], idx) => {
                        if (value.length === 0) return <></>
                        else return (
                            <>  
                                <Typography variant="subtitle1" component="h2"> <>{t(GROUPS[idx])}</></Typography>
                                <WikidataPropertySelectionList 
                                    selectionRecords={value} 
                                    openSelectionDialog={(record: WdPropertySelectionRecord) => {
                                        WdPropertySelectionDialog.open({
                                            wdProperty: record.wdProperty,
                                            selectedWdClassSurroundings: rootWdClassSurroundings,
                                            includeInheritedProperties: true,
                                            wdFilterByInstance: undefined,
                                            wdPropertyType: record.wdPropertyType,
                                            editingWdPropertySelectionId: record.id
                                        })
                                    }}
                                />
                            </>
                        );
                    })
                }
            </DialogContent>
            <DialogActions>
                <Button onClick={close}>{t("close button")}</Button>
            </DialogActions>
            <WdPropertySelectionDialog.Component />
        </>
    );
}

