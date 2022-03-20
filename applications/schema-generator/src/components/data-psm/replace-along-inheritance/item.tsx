import {IconButton, ListItem, ListItemText, Typography} from "@mui/material";
import {LanguageStringUndefineable, translateFrom} from "../../helper/LanguageStringComponents";
import InfoTwoToneIcon from "@mui/icons-material/InfoTwoTone";
import React from "react";
import {useResource} from "@model-driven-data/federated-observable-store-react/use-resource";
import {PimClass} from "@model-driven-data/core/pim/model";
import {SlovnikGovCzGlossary} from "../../slovnik.gov.cz/SlovnikGovCzGlossary";
import {useTranslation} from "react-i18next";

export const Item: React.FC<{
  pimClassIri: string,
  onClick?: () => void,
  onInfo?: () => void,
}> = ({pimClassIri, onClick, onInfo}) => {
  const {resource} = useResource<PimClass>(pimClassIri);
  const {i18n} = useTranslation();

  return <ListItem dense button onClick={onClick}>
    <LanguageStringUndefineable from={resource?.pimHumanDescription ?? {}}>
      {text =>
        <ListItemText secondary={<Typography variant="body2" color="textSecondary" noWrap title={text}>{text}</Typography>}>
          <strong>{translateFrom(resource?.pimHumanLabel, i18n.languages)}</strong>
          {" "}
          <SlovnikGovCzGlossary cimResourceIri={resource?.pimInterpretation as string} />
        </ListItemText>
      }
    </LanguageStringUndefineable>
    <IconButton size="small" onClick={event => {
      onInfo?.();
      event.stopPropagation();
    }}><InfoTwoToneIcon fontSize="inherit"/></IconButton>
  </ListItem>;
}

