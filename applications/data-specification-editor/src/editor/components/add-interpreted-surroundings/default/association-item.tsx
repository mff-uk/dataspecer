import { SemanticModelClass, SemanticModelEntity, SemanticModelRelationship } from "@dataspecer/core-v2/semantic-model/concepts";
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import InfoTwoToneIcon from "@mui/icons-material/InfoTwoTone";
import ListRoundedIcon from "@mui/icons-material/ListRounded";
import { Box, Checkbox, IconButton, ListItem, ListItemIcon, ListItemText, Typography } from "@mui/material";
import { styled } from "@mui/material/styles";
import React from "react";
import { useTranslation } from "react-i18next";
import { LanguageStringFallback, LanguageStringUndefineable } from "../../helper/LanguageStringComponents";
import { SlovnikGovCzGlossary } from "../../slovnik.gov.cz/SlovnikGovCzGlossary";

const CodelistSpan = styled("span")(({theme}) => ({
    fontWeight: "bold",
    color: theme.palette.primary.main,
}));

export const AssociationItem: React.FC<{
    relationship: SemanticModelRelationship,
    onClick: () => void,
    selected: boolean,
    onDetail: () => void,
    orientation: boolean, // whether the association is forward association
    allEntities: SemanticModelEntity[],
}> = (props) => {
    const {t} = useTranslation("ui");

    const relationship = props.relationship;
    const correctEnd = relationship.ends[props.orientation ? 1 : 0];
    const cls = props.allEntities.find(e => e.id === correctEnd.concept) as SemanticModelClass;
    const isCodelist = false; //cls?.pimIsCodelist ?? false;


    return <ListItem role={undefined} dense button onClick={props.onClick}>
        <ListItemIcon>
            <Checkbox
                edge="start"
                checked={props.selected}
                tabIndex={-1}
                disableRipple
            />
        </ListItemIcon>
        <ListItemText secondary={
            <Box style={{display: "flex", gap: "1em"}}>
            {isCodelist && <CodelistSpan style={{flexShrink: 0}}><ListRoundedIcon fontSize={"small"} sx={{verticalAlign: "top", mr: ".0rem"}} /> {t("codelist")} </CodelistSpan>}
                <LanguageStringUndefineable from={relationship.ends[1].description}>
                    {text =>
                        text !== undefined ? <Typography variant="body2" color="textSecondary" component={"span"} noWrap title={text}>{text}</Typography> : <></>
                    }
                </LanguageStringUndefineable>
            </Box>}>
            <strong><LanguageStringFallback from={relationship.ends[1].name} fallback={<i>{t("no title")}</i>}/></strong>
            <SlovnikGovCzGlossary cimResourceIri={relationship.ends[1].iri as string}/>
            {props.orientation ?
                <ArrowForwardIcon fontSize={"small"} color={"disabled"} sx={{verticalAlign: "middle", mx: "1rem"}} /> :
                <ArrowBackIcon fontSize={"small"} color={"disabled"} sx={{verticalAlign: "middle", mx: "1rem"}} />
            }
            <span><LanguageStringFallback from={cls?.name ?? {}} fallback={<i>{t("no title")}</i>}/></span>
        </ListItemText>

        <IconButton size="small" onClick={event => {props.onDetail(); event.stopPropagation();}}><InfoTwoToneIcon fontSize="inherit" /></IconButton>
    </ListItem>
};