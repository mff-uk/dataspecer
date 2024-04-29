import { Button, List, ListItem, ListItemSecondaryAction, ListItemText } from "@mui/material";
import { WdPropertySelectionRecord } from "../property-selection-record";
import { LanguageStringFallback } from "../../../helper/LanguageStringComponents";
import { useTranslation } from "react-i18next";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import HorizontalRuleIcon from '@mui/icons-material/HorizontalRule';
import React, { useContext } from "react";
import { WikidataPropertyType } from "../wikidata-properties/items/wikidata-property-item";
import { WdPropertyDescOnly } from "@dataspecer/wikidata-experimental-adapter";
import { WdPropertySelectionContext } from "../contexts/wd-property-selection-context";

export interface WikidataPropertySelectionListProps {
    selectionRecords: WdPropertySelectionRecord[];
    openSelectionDialog: (record: WdPropertySelectionRecord) => void;
}

export const WikidataPropertySelectionList: React.FC<WikidataPropertySelectionListProps> = (props) => {
    const { t } = useTranslation("ui");
    const wdPropertySelectionContext = useContext(WdPropertySelectionContext);

    return (
        <List component='nav' aria-label='main mailbox folders' dense>
            {props.selectionRecords.map((record) => {
                return (
                    <ListItem key={record.id} role={undefined} divider>
                        <ListItemText
                            primary={
                                <>  
                                    <LanguageStringFallback from={record.subjectWdClass.labels} fallback={<i>{t("no title")}</i>}/>
                                    <BackwardOrOutward wdProperty={record.wdProperty} wdPropertyType={record.wdPropertyType}/>
                                    {   
                                        record.objectWdClass != null &&
                                        <LanguageStringFallback from={record.objectWdClass.labels} fallback={<i>{t("no title")}</i>} />
                                    }
                                </>
                            }
                        >
                        </ListItemText>
                        <ListItemSecondaryAction>
                            <Button onClick={() => props.openSelectionDialog(record)}>edit</Button>
                            <Button 
                                onClick={() => wdPropertySelectionContext.removeWdPropertySelectionRecord(record)}
                                color="error"
                            >
                                delete
                            </Button>
                        </ListItemSecondaryAction>
                    </ListItem>
                );
            })}
        </List>
    );
}

interface BackwardOrOutwardProps {
    wdPropertyType: WikidataPropertyType;
    wdProperty: WdPropertyDescOnly;
}

const BackwardOrOutward: React.FC<BackwardOrOutwardProps> = (props) => {
    const { t } = useTranslation("ui");
    return (
      <>    
            {
                props.wdPropertyType === WikidataPropertyType.BACKWARD_ASSOCIATIONS ?
                <ArrowBackIcon color={"disabled"} sx={{ verticalAlign: "middle", mx: "1rem" }} /> :
                <HorizontalRuleIcon color={"disabled"} sx={{ verticalAlign: "middle", mx: "1rem" }} />
            }
            <LanguageStringFallback from={props.wdProperty.labels} fallback={<i>{t("no title")}</i>} />
            {
                props.wdPropertyType === WikidataPropertyType.BACKWARD_ASSOCIATIONS ?
                <HorizontalRuleIcon color={"disabled"} sx={{ verticalAlign: "middle", mx: "1rem" }} /> :
                <ArrowForwardIcon color={"disabled"} sx={{ verticalAlign: "middle", mx: "1rem" }} />
            }
            
        </>

    );




}