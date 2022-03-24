import React, {useContext} from "react";
import {DataSpecificationsContext} from "../app";
import {Chip, Stack} from "@mui/material";

/**
 * Shows tags for given specification by its IRI.
 * @param iri
 * @constructor
 */
export const SpecificationTags: React.FC<{iri: string}> = ({iri}) => {
    const {dataSpecifications} = useContext(DataSpecificationsContext);
    const specification = dataSpecifications[iri];

    return <Stack direction="row" spacing={1} sx={{ml: 1}}>
        {specification?.tags?.map(tag => <Chip label={tag} key={tag} size="small" />)}
    </Stack>
}
