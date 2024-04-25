import { WdClassHierarchyDescOnly, WdClassHierarchySurroundingsDescOnly } from "@dataspecer/wikidata-experimental-adapter"
import { ListItem, Typography, IconButton, ListItemText, Box, ListItemIcon, Checkbox, Radio } from "@mui/material";
import { SlovnikGovCzGlossary } from "../../../../slovnik.gov.cz/SlovnikGovCzGlossary";
import InfoTwoToneIcon from "@mui/icons-material/InfoTwoTone";
import { useTranslation } from "react-i18next";
import { LanguageStringFallback, LanguageStringUndefineable } from "../../../../helper/LanguageStringComponents";
import React from "react";

export interface WikidataClassItemProps {
    wdClass: WdClassHierarchyDescOnly;
    selectedWdClass: WdClassHierarchyDescOnly | undefined;
    setSelectedWdClass: (wdClass: WdClassHierarchyDescOnly | undefined) => void;
}

export const WikidataClassItem: React.FC<WikidataClassItemProps> = ({wdClass, selectedWdClass, setSelectedWdClass}) => {
    const {t} = useTranslation("ui");
    const currentClassIsSelected = wdClass.id === selectedWdClass?.id;

    return (
        <>
            <ListItem key={wdClass.iri} role={undefined} dense button onClick={() => setSelectedWdClass(currentClassIsSelected ? undefined : wdClass)}>
                <ListItemIcon>
                <Radio
                    edge="start"
                    checked={currentClassIsSelected}
                    tabIndex={-1}
                    disableRipple
                />
                </ListItemIcon>
                <ListItemText secondary={
                    <Box style={{display: "flex", gap: "1em"}}>
                        <LanguageStringUndefineable from={wdClass.descriptions}>
                            {text =>
                                text !== undefined ? <Typography variant="body2" color="textSecondary" component={"span"} noWrap title={text}>{text}</Typography> : <></>
                            }
                        </LanguageStringUndefineable>
                    </Box>
                }>
                    <strong><LanguageStringFallback from={wdClass.labels} fallback={<i>{t("no title")}</i>}/></strong>
                    <SlovnikGovCzGlossary cimResourceIri={wdClass.iri as string}/>
                </ListItemText>
                <IconButton size="small"><InfoTwoToneIcon fontSize="inherit" /></IconButton>
            </ListItem>
        </>
    );
}