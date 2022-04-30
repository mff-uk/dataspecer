import {Box, Button, TableCell, TableRow, Typography} from "@mui/material";
import React, {useCallback, useContext} from "react";
import {BackendConnectorContext, DataSpecificationsContext} from "../../app";
import {useResource} from "@dataspecer/federated-observable-store-react/use-resource";
import {DataPsmSchema} from "@dataspecer/core/data-psm/model";
import {DataSchemaNameCell} from "../../name-cells";
import {getSchemaGeneratorLink} from "../../shared/get-schema-generator-link";

export interface DataStructureRowProps {
    specificationIri: string;
    dataStructureIri: string;
}

export const DataStructureRow: React.FC<DataStructureRowProps>
    = ({specificationIri, dataStructureIri}) => {

    const {resource} = useResource<DataPsmSchema>(dataStructureIri);

    const backendConnector = useContext(BackendConnectorContext);
    const {dataSpecifications, setDataSpecifications} = useContext(DataSpecificationsContext);

    /**
     * Deletes this data structure and updates the data specification.
     */
    const deleteDataPsm = useCallback(async () => {
        await backendConnector.deleteDataStructure(specificationIri, dataStructureIri);
        setDataSpecifications({
            ...dataSpecifications,
            [specificationIri]: {
                ...dataSpecifications[specificationIri],
                psms: dataSpecifications[specificationIri].psms.filter(psm => psm !== dataStructureIri),
                psmStores: Object.fromEntries(
                    Object.entries(dataSpecifications[specificationIri].psmStores).filter(([psmIri, storeInfo]) => psmIri !== dataStructureIri)
                ),
            }
        });
    }, [backendConnector, dataSpecifications, dataStructureIri, setDataSpecifications, specificationIri]);

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
                <Button variant={"contained"} color={"primary"} href={getSchemaGeneratorLink(specificationIri, dataStructureIri)}>Edit</Button>
                <Button
                    variant="outlined"
                    color={"error"}
                    onClick={deleteDataPsm}>Delete</Button>
            </Box>
        </TableCell>
    </TableRow>;
};
