import { WdClassSurroundings, WdFilterByInstance, WdPropertyDescOnly } from "@dataspecer/wikidata-experimental-adapter"
import { Accordion, AccordionDetails, AccordionSummary, List, Typography } from "@mui/material";
import { useState } from "react";
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { useTranslation } from "react-i18next";
import InfiniteScroll from 'react-infinite-scroll-component';
import { WikidataPropertyItem, WikidataPropertyType } from "./wikidata-property-item";

export interface WikidataPropertiesAccordionProps {
    wdProperties: WdPropertyDescOnly[];
    selectedWdClassSurroundings: WdClassSurroundings;
    includeInheritedProperties: boolean;
    wdFilterByInstance: WdFilterByInstance | undefined;
    wdPropertyType: WikidataPropertyType;
}

const PROPERTIES_PER_PAGE = 50;

export const WikidataPropertiesAccordion: React.FC<WikidataPropertiesAccordionProps> = ({wdProperties, selectedWdClassSurroundings, includeInheritedProperties, wdFilterByInstance, wdPropertyType}) => {
    const {t} = useTranslation("interpretedSurrounding");
    const [expanded, setExpanded] = useState(false);
    const [listLength, setListLength] = useState(PROPERTIES_PER_PAGE);
    //const SelectionDialog = useDialog()

    const actualLength = wdProperties.length < listLength ? wdProperties.length : listLength;

    return (
        <>
            <Accordion 
                variant="outlined"
                expanded={expanded}
                onChange={(_, isExpanded) => setExpanded(isExpanded ? true : false)}
                elevation={0}
                disableGutters
                slotProps={{ transition: { unmountOnExit: true } }}
                // Color "#fafafa" to dim white, transparent for grid background, also can turn off left/right border
                sx={{backgroundColor: "transparent", '&:before':{height:'0px'}}} 
            >
                <AccordionSummary
                    expandIcon={<ExpandMoreIcon />}
                    aria-controls='panel1-content'
                    id='panel1-header'
                    sx={{
                        "&:hover": {
                            // color of hoover on ancestor panel classes
                            bgcolor: "#ebebeb" 
                        },
                        backgroundColor: (expanded ? "#ebebeb" : "inherit"),
                        '& .MuiTypography-root': {   
                                fontSize:'15px'             
                        },
                        maxHeight: 43,
                        minHeight: 15
                    }}
                >
                    <>
                        <Typography>{t(wdPropertyType)} ({wdProperties.length.toString()})</Typography>
                    </>
                </AccordionSummary>
                <AccordionDetails sx={{height: '500px', overflowY: 'scroll' }} id={wdPropertyType}>
                    <List>
                        <InfiniteScroll
                            dataLength={actualLength}
                            next={() => {
                                let newListLength = listLength + PROPERTIES_PER_PAGE;
                                if (newListLength > wdProperties.length) newListLength = wdProperties.length;
                                setListLength(newListLength);
                            }}
                            hasMore={actualLength < wdProperties.length}
                            scrollableTarget={wdPropertyType}
                            loader={<p>Loading...</p>}
                        >
                            {wdProperties.slice(0, actualLength).map((wdProperty) => {
                                return (
                                    <WikidataPropertyItem
                                        key={wdProperty.iri}
                                        wdProperty={wdProperty}
                                        selectedWdClassSurroundings={selectedWdClassSurroundings}
                                        includeInheritedProperties={includeInheritedProperties}
                                        wdFilterByInstance={wdFilterByInstance}
                                        wdPropertyType={wdPropertyType}
                                    />
                                );
                            })}
                        </InfiniteScroll>
                    </List>
                </AccordionDetails>
            </Accordion>
        </>
    );
}