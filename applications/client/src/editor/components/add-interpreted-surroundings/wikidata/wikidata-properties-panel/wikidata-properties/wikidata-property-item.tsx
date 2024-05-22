import { WdClassHierarchyDescOnly, WdClassSurroundings, WdEntityId, WdFilterByInstance, WdPropertyDescOnly } from "@dataspecer/wikidata-experimental-adapter";
import { ListItem, Typography, IconButton, ListItemText, Box, Chip, Stack } from "@mui/material";
import InfoTwoToneIcon from "@mui/icons-material/InfoTwoTone";
import { useTranslation } from "react-i18next";
import {
    LanguageStringText,
    LanguageStringUndefineable,
} from "../../../../helper/LanguageStringComponents";
import { UseDialogOpenFunction } from "../../../../../dialog";
import { WikidataPropertySelectionDialog } from "../wikidata-property-selection-dialog/wikidata-property-selection-dialog";
import { useCallback, useContext } from "react";
import { WdPropertySelectionContext } from "../../contexts/wd-property-selection-context";
import { WdPropertySelectionRecord, getAllWdPropertySelections } from "../../property-selection-record/property-selection-record";
import { WikidataEntityDetailDialog } from "../../wikidata-entity-detail-dialog/wikidata-entity-detail-dialog";

// Maps to translations of headlines.
export enum WikidataPropertyType {
    ATTRIBUTES = "attributes",
    EXTERNAL_IDENTIFIERS_ATTRIBUTES = "external identifiers attributes",
    ASSOCIATIONS = "associations",
    BACKWARD_ASSOCIATIONS = "backward associations",
}

export function isWdPropertyTypeAttribute(wdPropertyType: WikidataPropertyType): boolean {
    return wdPropertyType === WikidataPropertyType.ATTRIBUTES || wdPropertyType === WikidataPropertyType.EXTERNAL_IDENTIFIERS_ATTRIBUTES;
}

export interface WikidataPropertyItemProps {
    wdProperty: WdPropertyDescOnly;
    wdPropertyType: WikidataPropertyType;
    selectedWdClassSurroundings: WdClassSurroundings;
    includeInheritedProperties: boolean;
    wdFilterByInstance: WdFilterByInstance | undefined;
    openSelectionDialogFunc: UseDialogOpenFunction<typeof WikidataPropertySelectionDialog>;
    openDetailDialogFunc: UseDialogOpenFunction<typeof WikidataEntityDetailDialog>;
}

export const WikidataPropertyItem: React.FC<WikidataPropertyItemProps> = ({
    wdProperty,
    wdPropertyType,
    selectedWdClassSurroundings,
    includeInheritedProperties,
    wdFilterByInstance,
    openSelectionDialogFunc,
    openDetailDialogFunc
}) => {
    const wdPropertySelectionContext = useContext(WdPropertySelectionContext);

    // Do not open property selection dialog when on an attribute with disabled inheritance.
    const onClickCallback = useCallback(() => { 
        if (!includeInheritedProperties && isWdPropertyTypeAttribute(wdPropertyType)) {
            const selectedWdClass = selectedWdClassSurroundings.classesMap.get(selectedWdClassSurroundings.startClassId) as WdClassHierarchyDescOnly;
            wdPropertySelectionContext.addWdPropertySelectionRecord(WdPropertySelectionRecord.createNew(wdPropertyType, wdProperty, selectedWdClass))
        } else {
            openSelectionDialogFunc({ 
                wdProperty, 
                wdPropertyType, 
                wdFilterByInstance,
                selectedWdClassSurroundings,
                includeInheritedProperties,
                editingWdPropertySelectionId: undefined,
            });
        }
    }, [includeInheritedProperties, openSelectionDialogFunc, selectedWdClassSurroundings, wdFilterByInstance, wdProperty, wdPropertySelectionContext, wdPropertyType]);

    return (
        <>
            <ListItem
                key={wdProperty.iri}
                role={undefined}
                dense
                button
                onClick={onClickCallback}
            >
                <ListItemText
                    secondary={
                        <Box style={{ display: "flex", gap: "1em" }}>
                            <LanguageStringUndefineable from={wdProperty.descriptions}>
                                {(text) =>
                                    text !== undefined ? (
                                        <Typography
                                            variant='body2'
                                            color='textSecondary'
                                            component={"span"}
                                            noWrap
                                            title={text}
                                        >
                                            {text}
                                        </Typography>
                                    ) : (
                                        <></>
                                    )
                                }
                            </LanguageStringUndefineable>
                        </Box>
                    }
                >
                    <Stack direction="row" spacing={4}>
                    <strong>
                        <LanguageStringText from={wdProperty.labels} />
                    </strong>
                    <SelectedWdPropertiesChips 
                        wdProperty={wdProperty} 
                        wdPropertyType={wdPropertyType} 
                        selectedWdClassId={selectedWdClassSurroundings.startClassId} 
                    />
                    </Stack>
                </ListItemText>
                <IconButton 
                    size='small'
                    onClick={(event) => {
                        event.stopPropagation();
                        openDetailDialogFunc({wdEntity: wdProperty})
                    }}
                >
                    <InfoTwoToneIcon fontSize='inherit' />
                </IconButton>
            </ListItem>
        </>
    );
};


interface SelectedWdPropertiesChipsProps {
    wdProperty: WdPropertyDescOnly;
    wdPropertyType: WikidataPropertyType;
    selectedWdClassId: WdEntityId;
}

const SelectedWdPropertiesChips: React.FC<SelectedWdPropertiesChipsProps> = (props) => {
    const { t } = useTranslation("interpretedSurrounding");
    const wdPropertySelectionContext = useContext(WdPropertySelectionContext);

    const propertySelections = getAllWdPropertySelections(props.wdProperty, props.wdPropertyType, wdPropertySelectionContext.wdPropertySelectionRecords);
    const isPropertyAttribute = isWdPropertyTypeAttribute(props.wdPropertyType);

    return (
        <>
            {
                propertySelections.length !== 0 &&
                <Box fontSize="13px" fontStyle="italic">
                    {isPropertyAttribute ? t("wikidata.selection.selected from ancestor from") : t("wikidata.selection.selected from ancestor from to")}
                    {propertySelections.map((selection) => {
                        return (
                            <Chip
                            key={selection.subjectWdClass.id}
                            label={
                                <>  
                                    <LanguageStringText from={selection.subjectWdClass.labels} />
                                    {!isPropertyAttribute && <>{" -> "}<LanguageStringText from={selection.objectWdClass.labels} /></>}
                                </>
                            } 
                            size="small" 
                            sx={{marginLeft: 2}}
                            color={"info"}
                            onDelete={() => {wdPropertySelectionContext.removeWdPropertySelectionRecord(selection)}}
                            />
                        );
                    })}
                </Box>
            }
        </>
    );
}