import {DataStructure} from "../../interfaces/data-structure";
import {StoreInfo} from "./store-info";
import {Box, Button, Switch, TableCell, TableRow, Typography} from "@mui/material";
import React, {useCallback, useEffect} from "react";
import axios from "axios";
import {processEnv} from "../../index";

export interface DataStructureRowProps {
    dataStructure: DataStructure;

    specificationId: string;
    reloadSpecification: () => void;
}

export const DataStructureRow: React.FC<DataStructureRowProps> = ({dataStructure, specificationId, reloadSpecification}) => {
    const deleteDataPsm = useCallback(async () => {
        await axios.delete(`${processEnv.REACT_APP_BACKEND}/specification/${specificationId}/data-psm/${dataStructure.id}`);
        reloadSpecification?.();
    }, [reloadSpecification, specificationId, dataStructure.id]);

    const [switchLoading, setSwitchLoading] = React.useState<string[]>([]);
    useEffect(() => {
        setSwitchLoading([]);
    }, [dataStructure]);

    const switchChanged = useCallback(async (type: string) => {
        setSwitchLoading([...switchLoading, type]);
        const artifacts = [] as string[];
        if (dataStructure.artifact_xml !== (type === "xml")) {
            artifacts.push("xml");
        }
        if (dataStructure.artifact_json !== (type === "json")) {
            artifacts.push("json");
        }
        await axios.post(`${processEnv.REACT_APP_BACKEND}/specification/${specificationId}/data-psm/${dataStructure.id}`, {artifacts});
        reloadSpecification?.();
    }, [reloadSpecification, specificationId, switchLoading, dataStructure]);

    const editSchemaGeneratorUrl = new URL(processEnv.REACT_APP_SCHEMA_GENERATOR as string);
    editSchemaGeneratorUrl.searchParams.append('configuration', `${processEnv.REACT_APP_BACKEND}/configuration/by-data-psm/${dataStructure.id}`);

    return <TableRow key={dataStructure.id}>
        <StoreInfo storeId={dataStructure?.store ?? null}>
            {(name, operations, resources) =>
                <>
                    <TableCell component="th" scope="row" sx={{width: "25%"}}>
                        <Typography sx={{fontWeight: "bold"}}>
                            {name ?? "-"}
                        </Typography>
                    </TableCell>
                    <TableCell>
                        <Typography>{operations ?? "-"}</Typography>
                    </TableCell>
                    <TableCell>
                        <Typography>{resources ?? "-"}</Typography>
                    </TableCell>
                </>
            }
        </StoreInfo>

        <TableCell>
            <Switch checked={dataStructure.artifact_json} disabled={switchLoading.includes('json')} onClick={() => switchChanged('json')}/>
        </TableCell>
        <TableCell>
            <Switch checked={dataStructure.artifact_xml} disabled={switchLoading.includes('xml')} onClick={() => switchChanged('xml')}/>
        </TableCell>
        <TableCell align="right">
            <Box
                sx={{
                    display: "flex",
                    gap: "1rem",
                    justifyContent: "flex-end"
                }}>
                <Button variant={"contained"} color={"primary"} href={editSchemaGeneratorUrl.toString()}>Edit</Button>
                {/*<Button variant="outlined" color={"primary"} href={`${processEnv.REACT_APP_BACKEND}/configuration/by-data-psm/${dataStructure.id}`}>See configuration</Button>*/}
                <Button
                    variant="outlined"
                    color={"error"}
                    onClick={deleteDataPsm}>Delete</Button>
            </Box>
        </TableCell>
    </TableRow>;
};
