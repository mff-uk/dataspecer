import { WdClassHierarchyDescOnly, WdClassSurroundings, WdFilterByInstance, WdPropertyDescOnly } from "@dataspecer/wikidata-experimental-adapter";
import { ListItem, Typography, IconButton, ListItemText, Box } from "@mui/material";
import { SlovnikGovCzGlossary } from "../../../../slovnik.gov.cz/SlovnikGovCzGlossary";
import InfoTwoToneIcon from "@mui/icons-material/InfoTwoTone";
import { useTranslation } from "react-i18next";
import {
    LanguageStringFallback,
    LanguageStringUndefineable,
} from "../../../../helper/LanguageStringComponents";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { UseDialogOpenFunction } from "../../../../../dialog";
import { WikidataPropertySelectionDialog } from "../wikidata-property-selection-dialog/wikidata-property-selection-dialog";
import { useCallback, useContext } from "react";
import { PropertySelectionContext } from "../../contexts/property-selection-context";
import { PropertySelectionRecord } from "../../property-selection-record";

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
}

export const WikidataPropertyItem: React.FC<WikidataPropertyItemProps> = ({
    wdProperty,
    wdPropertyType,
    selectedWdClassSurroundings,
    includeInheritedProperties,
    wdFilterByInstance,
    openSelectionDialogFunc,
}) => {
    const { t } = useTranslation("ui");
    const propertySelectionContext = useContext(PropertySelectionContext);

    // Do not open property selection dialog when on an attribute with disabled inheritance.
    const onClickCallback = useCallback(() => { 
        if (!includeInheritedProperties && isWdPropertyTypeAttribute(wdPropertyType)) {
            const selectedWdClass = selectedWdClassSurroundings.classesMap.get(selectedWdClassSurroundings.startClassId) as WdClassHierarchyDescOnly;
            propertySelectionContext.addPropertySelectionRecord(new PropertySelectionRecord(wdPropertyType, wdProperty, selectedWdClass))
        } else {
            openSelectionDialogFunc({ 
                wdProperty, 
                wdPropertyType, 
                wdFilterByInstance,
                selectedWdClassSurroundings,
                includeInheritedProperties
            });
        }
    }, [includeInheritedProperties, openSelectionDialogFunc, propertySelectionContext, selectedWdClassSurroundings, wdFilterByInstance, wdProperty, wdPropertyType]);

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
                    <strong>
                        <LanguageStringFallback
                            from={wdProperty.labels}
                            fallback={<i>{t("no title")}</i>}
                        />
                    </strong>
                    <SlovnikGovCzGlossary cimResourceIri={wdProperty.iri as string} />
                    {wdPropertyType === WikidataPropertyType.ASSOCIATIONS && (
                        <ArrowForwardIcon
                            fontSize={"small"}
                            color={"disabled"}
                            sx={{ verticalAlign: "middle", mx: "1rem" }}
                        />
                    )}
                    {wdPropertyType === WikidataPropertyType.BACKWARD_ASSOCIATIONS && (
                        <ArrowBackIcon
                            fontSize={"small"}
                            color={"disabled"}
                            sx={{ verticalAlign: "middle", mx: "1rem" }}
                        />
                    )}
                </ListItemText>
                <IconButton size='small'>
                    <InfoTwoToneIcon fontSize='inherit' />
                </IconButton>
            </ListItem>
        </>
    );
};
