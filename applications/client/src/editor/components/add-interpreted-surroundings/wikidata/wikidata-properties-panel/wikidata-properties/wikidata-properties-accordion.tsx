import {
    WdClassSurroundings,
    WdFilterByInstance,
    WdPropertyDescOnly,
} from "@dataspecer/wikidata-experimental-adapter";
import { Accordion, AccordionDetails, AccordionSummary, Typography } from "@mui/material";
import { useCallback, useState } from "react";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { useTranslation } from "react-i18next";
import { WikidataPropertyItem, WikidataPropertyType } from "./wikidata-property-item";
import { WikidataPropertySelectionDialog } from "../wikidata-property-selection-dialog/wikidata-property-selection-dialog";
import { useDialog } from "../../../../../dialog";
import { WikidataInfinityScrollList } from "../../helpers/wikidata-infinity-scroll-list";
import { WikidataEntityDetailDialog } from "../../../../detail/wikidata-entity-detail/wikidata-entity-detail-dialog";

export interface WikidataPropertiesAccordionProps {
    wdProperties: WdPropertyDescOnly[];
    selectedWdClassSurroundings: WdClassSurroundings;
    includeInheritedProperties: boolean;
    wdFilterByInstance: WdFilterByInstance | undefined;
    wdPropertyType: WikidataPropertyType;
}

export const WikidataPropertiesAccordion: React.FC<WikidataPropertiesAccordionProps> = ({
    wdProperties,
    selectedWdClassSurroundings,
    includeInheritedProperties,
    wdFilterByInstance,
    wdPropertyType,
}) => {
    const { t } = useTranslation("interpretedSurrounding");
    const [expanded, setExpanded] = useState(false);
    const WdPropertySelectionDialog = useDialog(WikidataPropertySelectionDialog);
    const WdPropertyDetailDialog = useDialog(WikidataEntityDetailDialog);

    const mapWdPropertyFunc = useCallback(
        (wdProperty) => {
            return (
                <WikidataPropertyItem
                    key={wdProperty.iri}
                    wdProperty={wdProperty}
                    wdPropertyType={wdPropertyType}
                    includeInheritedProperties={includeInheritedProperties}
                    wdFilterByInstance={wdFilterByInstance}
                    selectedWdClassSurroundings={selectedWdClassSurroundings}
                    openSelectionDialogFunc={WdPropertySelectionDialog.open}
                    openDetailDialogFunc={WdPropertyDetailDialog.open}
                />
            );
        },
        [WdPropertyDetailDialog.open, WdPropertySelectionDialog.open, includeInheritedProperties, selectedWdClassSurroundings, wdFilterByInstance, wdPropertyType]);

    return (
        <>
            <Accordion
                variant='outlined'
                expanded={expanded}
                onChange={(_, isExpanded) => setExpanded(isExpanded ? true : false)}
                elevation={0}
                disableGutters
                slotProps={{ transition: { unmountOnExit: true } }}
                // Color "#fafafa" to dim white, transparent for grid background, also can turn off left/right border
                sx={{ backgroundColor: "transparent", "&:before": { height: "0px" } }}
            >
                <AccordionSummary
                    expandIcon={<ExpandMoreIcon />}
                    aria-controls='panel1-content'
                    id='panel1-header'
                    sx={{
                        "&:hover": {
                            // color of hover on ancestor panel classes
                            bgcolor: "#ebebeb",
                        },
                        backgroundColor: expanded ? "#ebebeb" : "inherit",
                        "& .MuiTypography-root": {
                            fontSize: "15px",
                        },
                        maxHeight: 43,
                        minHeight: 15,
                    }}
                >
                    <>
                        <Typography>
                            {t(wdPropertyType)} ({wdProperties.length.toString()})
                        </Typography>
                    </>
                </AccordionSummary>
                <AccordionDetails sx={{ height: "500px", overflowY: "scroll" }} id={wdPropertyType}>
                    <WikidataInfinityScrollList<WdPropertyDescOnly>
                        wdEntities={wdProperties}
                        scrollableTargetId={wdPropertyType}
                        mapWdEntityFunc={mapWdPropertyFunc}
                    />
                </AccordionDetails>
            </Accordion>
            <WdPropertySelectionDialog.Component />
            <WdPropertyDetailDialog.Component />
        </>
    );
};
