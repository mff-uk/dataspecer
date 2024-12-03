import React, {useCallback} from "react";
import {Fab} from "@mui/material";
import ContentCopyTwoToneIcon from '@mui/icons-material/ContentCopyTwoTone';
import copy from "copy-to-clipboard";
import {useSnackbar} from "notistack";

export const CopyIri: React.FC<{iri: string}> = ({iri}) => {
  const {enqueueSnackbar} = useSnackbar();

  const copyIri = useCallback(() => {
    if (copy(iri)) {
      enqueueSnackbar("IRI copied to clipboard", {variant: "success"});
    } else {
      enqueueSnackbar("Unable to copy IRI to clipboard", {variant: "error"});
    }
  }, [iri, enqueueSnackbar]);

  return <Fab variant="extended" size="medium" color={"primary"} onClick={copyIri}>
    <ContentCopyTwoToneIcon sx={{mr: 1}}/>
    Copy IRI
  </Fab>;
};
