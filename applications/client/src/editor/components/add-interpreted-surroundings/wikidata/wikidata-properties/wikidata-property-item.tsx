import { WdPropertyDescOnly } from "@dataspecer/wikidata-experimental-adapter"
import { ListItem, Typography, IconButton, ListItemText, Box } from "@mui/material";
import { SlovnikGovCzGlossary } from "../../../slovnik.gov.cz/SlovnikGovCzGlossary";
import InfoTwoToneIcon from "@mui/icons-material/InfoTwoTone";
import { useTranslation } from "react-i18next";
import { LanguageStringFallback, LanguageStringUndefineable } from "../../../helper/LanguageStringComponents";
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

// Maps to translations of headlines.
export enum WikidataPropertyType {
    ATTRIBUTES = "attributes",
    EXTERNAL_IDENTIFIERS_ATTRIBUTES = "external identifiers attributes",
    ASSOCIATIONS = "associations",
    BACKWARD_ASSOCIATIONS = "backward associations"
}

export interface WikidataPropertyItemProps {
    wdProperty: WdPropertyDescOnly;
    wdPropertyType: WikidataPropertyType;
    openSelectionDialog: () => void;
}

export const WikidataPropertyItem: React.FC<WikidataPropertyItemProps> = ({wdProperty, wdPropertyType, openSelectionDialog}) => {
    const {t} = useTranslation("ui");
    
    return (
        <>
            <ListItem key={"item" + wdProperty.iri} role={undefined} dense button onClick={() => openSelectionDialog()}>
                <ListItemText secondary={
                    <Box style={{display: "flex", gap: "1em"}}>
                        <LanguageStringUndefineable from={wdProperty.descriptions}>
                            {text =>
                                text !== undefined ? <Typography variant="body2" color="textSecondary" component={"span"} noWrap title={text}>{text}</Typography> : <></>
                            }
                        </LanguageStringUndefineable>
                    </Box>
                }>
                    <strong><LanguageStringFallback from={wdProperty.labels} fallback={<i>{t("no title")}</i>}/></strong>
                    <SlovnikGovCzGlossary cimResourceIri={wdProperty.iri as string}/>
                    { wdPropertyType === WikidataPropertyType.ASSOCIATIONS &&
                        <ArrowForwardIcon fontSize={"small"} color={"disabled"} sx={{verticalAlign: "middle", mx: "1rem"}} />
                    }
                    { wdPropertyType === WikidataPropertyType.BACKWARD_ASSOCIATIONS &&
                        <ArrowBackIcon fontSize={"small"} color={"disabled"} sx={{verticalAlign: "middle", mx: "1rem"}} />
                    }
                </ListItemText>
                <IconButton size="small"><InfoTwoToneIcon fontSize="inherit" /></IconButton>
            </ListItem>
        </>
    );
}