import {Box, Button, TableCell, TableRow, Typography} from "@mui/material";
import React from "react";
import {useResource} from "@dataspecer/federated-observable-store-react/use-resource";
import {DataPsmSchema} from "@dataspecer/core/data-psm/model";
import {DataSchemaNameCell} from "../../name-cells";
import {getEditorLink} from "../../shared/get-schema-generator-link";
import {Link} from "react-router-dom";

export interface DataStructureRowProps {
    specificationIri: string;
    dataStructureIri: string;
    onDelete: () => void;
}

export const DataStructureRow: React.FC<DataStructureRowProps>
    = ({specificationIri, dataStructureIri, onDelete}) => {

    const {resource} = useResource<DataPsmSchema>(dataStructureIri);

    return <TableRow>
        <TableCell component="th" scope="row" sx={{width: "25%"}}>
            <DataSchemaNameCell dataPsmSchemaIri={dataStructureIri as string} />
        </TableCell>
        <TableCell>
            <Typography>{resource?.dataPsmParts.length ?? "-"}</Typography>
        </TableCell>

        <TableCell align="right">
            <Box
                sx={{
                    display: "flex",
                    gap: "1rem",
                    justifyContent: "flex-end"
                }}>
                <Button
                    variant={"contained"}
                    color={"primary"}
                    component={Link}
                    to={getEditorLink(specificationIri, dataStructureIri)}
                >
                    Edit
                </Button>
                <Button
                    variant="outlined"
                    color={"error"}
                    onClick={onDelete}>Delete</Button>
            </Box>
        </TableCell>
    </TableRow>;
};
