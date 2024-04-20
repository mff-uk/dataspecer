import { WdClassSurroundings, WdFilterByInstance, WdPropertyDescOnly } from "@dataspecer/wikidata-experimental-adapter"
import { Accordion, AccordionDetails, AccordionSummary, List, ListItem, Typography } from "@mui/material";
import { useState } from "react";
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { useTranslation } from "react-i18next";

// Maps to translations of headlines.
export enum WdPropertyAccordionType {
    ATTRIBUTES = "attributes",
    EXTERNAL_IDENTIFIERS_ATTRIBUTES = "external identifiers attributes",
    ASSOCIATIONS = "associations",
    BACKWARD_ASSOCIATIONS = "backward associations"
}

export interface WikidataAssociationsAccordionProperties {
    wdProperties: WdPropertyDescOnly[];
    selectedWdClassSurroundings: WdClassSurroundings;
    includeInheritedProperties: boolean;
    wdFilterByInstance: WdFilterByInstance | undefined;
    wdPropertyAccordionType: WdPropertyAccordionType;
}

const PROPERTIES_PER_PAGE = 50;

export const WikidataAssiciationsAccordion: React.FC<WikidataAssociationsAccordionProperties> = ({wdProperties, selectedWdClassSurroundings, includeInheritedProperties, wdFilterByInstance, wdPropertyAccordionType}) => {
    const {t} = useTranslation("interpretedSurrounding");
    const [listLength, setListLength] = useState(PROPERTIES_PER_PAGE);
    
    const length = wdProperties.length < listLength ? wdProperties.length : listLength;

    return (
        <>
                <Accordion 
                    variant="outlined" 
                    elevation={0}
                    slotProps={{ transition: { unmountOnExit: true } }}
                    sx={{backgroundColor: "#fafafa", '&:before':{height:'0px'}}} 
                >
                    <AccordionSummary
                        expandIcon={<ExpandMoreIcon />}
                        aria-controls='panel1-content'
                        id='panel1-header'
                        sx={{
                            '& .MuiTypography-root': {   //use sx and select related class
                                    fontSize:'15px'             // change its style
                            },
                            maxHeight: 40,
                            minHeight: 15
                            
                        }}
                    >
                        <>
                            <Typography>{t(wdPropertyAccordionType)} ({wdProperties.length.toString()})</Typography>
                        </>
                    </AccordionSummary>
                    <AccordionDetails sx={{height: '600px', overflowY: 'scroll' }} id={wdPropertyAccordionType}>
                        <List>
                            <ListItem>ahoj</ListItem>
                        </List>
                    </AccordionDetails>
            </Accordion>
        </>
    );
}