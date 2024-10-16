import { SemanticModelClass } from "@dataspecer/core-v2/semantic-model/concepts";
import InfoTwoToneIcon from "@mui/icons-material/InfoTwoTone";
import { IconButton, ListItem, ListItemText, Typography } from "@mui/material";
import React from "react";
import { useTranslation } from "react-i18next";
import { LanguageStringUndefineable, translateFrom } from "../../helper/LanguageStringComponents";
import { SlovnikGovCzGlossary } from "../../slovnik.gov.cz/SlovnikGovCzGlossary";

export const Item: React.FC<{
  semanticModelClass: SemanticModelClass,
  onClick?: () => void,
  onInfo?: () => void,
}> = ({semanticModelClass, onClick, onInfo}) => {
  const {i18n} = useTranslation();

  return <ListItem dense button onClick={onClick}>
    <LanguageStringUndefineable from={semanticModelClass.description ?? {}}>
      {text =>
        <ListItemText secondary={<Typography variant="body2" color="textSecondary" noWrap title={text}>{text}</Typography>}>
          <strong>{translateFrom(semanticModelClass.name, i18n.languages)}</strong>
          {" "}
          <SlovnikGovCzGlossary cimResourceIri={semanticModelClass.id as string} />
        </ListItemText>
      }
    </LanguageStringUndefineable>
    <IconButton size="small" onClick={event => {
      onInfo?.();
      event.stopPropagation();
    }}><InfoTwoToneIcon fontSize="inherit"/></IconButton>
  </ListItem>;
}

