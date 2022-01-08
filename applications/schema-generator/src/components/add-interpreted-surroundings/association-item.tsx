import React from "react";
import {Checkbox, IconButton, ListItem, ListItemIcon, ListItemText, Typography} from "@mui/material";
import {SlovnikGovCzGlossary} from "../slovnik.gov.cz/SlovnikGovCzGlossary";
import InfoTwoToneIcon from "@mui/icons-material/InfoTwoTone";
import {useResource} from "../../hooks/useResource";
import {PimAssociation, PimClass} from "@model-driven-data/core/pim/model";
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import {LanguageStringFallback, LanguageStringUndefineable} from "../helper/LanguageStringComponents";
import {useTranslation} from "react-i18next";
import ListRoundedIcon from "@mui/icons-material/ListRounded";
import {styled} from "@mui/material/styles";

const CodelistSpan = styled("span")(({theme}) => ({
    fontWeight: "bold",
    color: theme.palette.primary.main,
}));

export const AssociationItem: React.FC<{
    pimAssociationIri: string,
    onClick: () => void,
    selected: boolean,
    onDetail: () => void,
    orientation: boolean, // whether the association is forward association
}> = (props) => {
    const {t} = useTranslation("ui");
    const {resource: association} = useResource<PimAssociation>(props.pimAssociationIri);
    const {resource: cls} = useResource<PimClass>(association?.pimEnd?.[props.orientation ? 1 : 0] ?? null);
    const isCodelist = cls?.pimIsCodelist ?? false;

    if (!association) {
        return null;
    }

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
            <>
            {isCodelist && <CodelistSpan><ListRoundedIcon fontSize={"small"} sx={{verticalAlign: "top", mr: ".0rem"}} /> {t("codelist")} </CodelistSpan>}
                <LanguageStringUndefineable from={association.pimHumanDescription}>
                    {text =>
                        text !== undefined ? <Typography variant="body2" color="textSecondary" component={"span"} noWrap title={text}>{text}</Typography> : <></>
                    }
                </LanguageStringUndefineable>
            </>}>
            <strong><LanguageStringFallback from={association.pimHumanLabel} fallback={<i>{t("no title")}</i>}/></strong>
            <SlovnikGovCzGlossary cimResourceIri={association.pimInterpretation as string}/>
            {props.orientation ?
                <ArrowForwardIcon fontSize={"small"} color={"disabled"} sx={{verticalAlign: "middle", mx: "1rem"}} /> :
                <ArrowBackIcon fontSize={"small"} color={"disabled"} sx={{verticalAlign: "middle", mx: "1rem"}} />
            }
            <span><LanguageStringFallback from={cls?.pimHumanLabel ?? {}} fallback={<i>{t("no title")}</i>}/></span>
        </ListItemText>

        <IconButton size="small" onClick={event => {props.onDetail(); event.stopPropagation();}}><InfoTwoToneIcon fontSize="inherit" /></IconButton>
    </ListItem>
};
