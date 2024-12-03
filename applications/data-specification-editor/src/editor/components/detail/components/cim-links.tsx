import React from "react";
import {SlovnikGovCzGlossary} from "../../slovnik.gov.cz/SlovnikGovCzGlossary";
import {IconButton} from "@mui/material";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";

export const CimLinks: React.FC<{ iri: string }> = ({iri}) => {
    return <>
        <SlovnikGovCzGlossary cimResourceIri={iri}/>
        <IconButton sx={{ml: .5}} href={iri} target="_blank">
            <OpenInNewIcon/>
        </IconButton>
    </>;
}
