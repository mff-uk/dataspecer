import React, {useCallback} from "react";
import {Link, useParams} from "react-router-dom";
import {useAsyncMemoWithTrigger} from "../../use-async-memo-with-trigger";
import axios from "axios";
import {Box, Button, Fab, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography} from "@mui/material";
import {StoreInfo} from "./store-info";
import {ReuseDataSpecifications} from "./reuse-data-specifications";
import {DataSpecification} from "../../interfaces/data-specification";
import AddIcon from "@mui/icons-material/Add";
import {ArtifactBuilder} from "../../artifacts";
import {DataStructureRow} from "./data-structure-row";
import {Configuration} from "../../shared/configuration";
import {saveAs} from "file-saver";
import LoadingButton from '@mui/lab/LoadingButton';
import {processEnv} from "../../index";

export const Specification: React.FC = () => {
    let {specificationId} = useParams();
    const [specification, , reloadSpecification] = useAsyncMemoWithTrigger(
    async () => {
            const headers = new Headers();
            headers.append('pragma', 'no-cache');
            headers.append('cache-control', 'no-cache');

            const fetchResult = await fetch(
                `${processEnv.REACT_APP_BACKEND}/specification/${specificationId}`,
                {
                    method: 'GET',
                    headers,
                }
            );

            return await fetchResult.json() as DataSpecification;
        }, [specificationId]);

    const createDataStructure = useCallback(async () => {
        const result = await axios.post(`${processEnv.REACT_APP_BACKEND}/specification/${specificationId}/data-psm`);
        const dataStructureId = result.data.id;

        const editSchemaGeneratorUrl = new URL(processEnv.REACT_APP_SCHEMA_GENERATOR as string);
        editSchemaGeneratorUrl.searchParams.append('configuration', `${processEnv.REACT_APP_BACKEND}/configuration/by-data-psm/${dataStructureId}`);
        editSchemaGeneratorUrl.searchParams.append('backlink', window.location.href);

        window.location.href = editSchemaGeneratorUrl.href;
    }, [specificationId]);

    const [zipLoading, setZipLoading] = React.useState(false);
    const generateZip = async () => {
        setZipLoading(true);
        const result = await axios.get<Configuration>(`${processEnv.REACT_APP_BACKEND}/configuration/by-specification/${specificationId}`);
        const generator = new ArtifactBuilder(result.data);
        const data = await generator.build();
        saveAs(data, "artifact.zip");
        setZipLoading(false);
    };

    return <>
        <Box height="30px"/>
        <Box display="flex" flexDirection="row" justifyContent="space-between">
            <Typography variant="h4" component="div" gutterBottom><small style={{fontWeight: "bold"}}>Data specification:</small>{" "}{specification?.name}</Typography>
        </Box>

        <Box display="flex" flexDirection="row" justifyContent="space-between" sx={{mt: 5}}>
            <Typography variant="h5" component="div" gutterBottom>Data structures </Typography>
            {specificationId && <Fab variant="extended" size="medium" color={"primary"} onClick={createDataStructure}>
                <AddIcon sx={{mr: 1}}/>
                Create new
            </Fab>}
        </Box>
        <TableContainer component={Paper} sx={{mt: 3}}>
            <Table>
                <TableHead>
                    <TableRow>
                        <TableCell sx={{width: "25%"}}>Name</TableCell>
                        <TableCell>Operations</TableCell>
                        <TableCell>Resources</TableCell>
                        <TableCell align="center">JSON</TableCell>
                        <TableCell align="center">XML</TableCell>
                        <TableCell align="center">CSV</TableCell>
                        <TableCell align="right">Actions</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {specification?.hasDataStructures.map(dataStructure =>
                        <DataStructureRow dataStructure={dataStructure} specificationId={specificationId as string} reloadSpecification={reloadSpecification as () => void}/>
                    )}
                </TableBody>
            </Table>
        </TableContainer>

        <Box display="flex" flexDirection="row" justifyContent="space-between" sx={{mt: 5}}>
            <Typography variant="h5" component="div" gutterBottom>Reused data specifications</Typography>
            {specificationId && <ReuseDataSpecifications reload={reloadSpecification} specificationId={specificationId}/>}
        </Box>
        <TableContainer component={Paper} sx={{mt: 3}}>
            <Table>
                <TableHead>
                    <TableRow>
                        <TableCell sx={{width: "100%"}}>Name</TableCell>
                        <TableCell/>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {specification?.reusesDataSpecification.map(specification =>
                        <TableRow key={specification.id}>
                            <TableCell component="th" scope="row" sx={{width: "25%"}}>
                                <Typography sx={{fontWeight: "bold"}}>
                                    {specification.name}
                                </Typography>
                            </TableCell>
                            <TableCell align="right">
                                <Box sx={{
                                    display: "flex",
                                    gap: "1rem",
                                }}>
                                    <Button variant="outlined" color={"primary"} component={Link}
                                            to={`/specification/${specification.id}`}>Detail</Button>
                                </Box>
                            </TableCell>
                        </TableRow>
                    )}
                </TableBody>
            </Table>
        </TableContainer>


        <Typography variant="h5" component="div" gutterBottom sx={{mt: 5}}>
            Generate artifacts
        </Typography>
        <Box sx={{
            height: "5rem",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
        }}>
            <LoadingButton variant="contained" onClick={generateZip} loading={zipLoading}>Generate .ZIP file</LoadingButton>
        </Box>


        <Typography variant="h5" component="div" gutterBottom sx={{mt: 5}}>
            Technical properties
        </Typography>
        <TableContainer component={Paper} sx={{mt: 3}}>
            <Table>
                <TableBody>
                    <StoreInfo storeId={specification?.pimStore ?? null}>
                        {(name, operations, resources) =>
                            <>
                                <TableRow>
                                    <TableCell component="th" scope="row" sx={{width: "25%"}}>
                                        <Typography sx={{fontWeight: "bold"}}>PIM store operations</Typography>
                                    </TableCell>
                                    <TableCell>
                                        <Typography>
                                            {operations ?? "-"}
                                        </Typography>
                                    </TableCell>
                                </TableRow>
                                <TableRow>
                                    <TableCell component="th" scope="row" sx={{width: "25%"}}>
                                        <Typography sx={{fontWeight: "bold"}}>PIM store resources</Typography>
                                    </TableCell>
                                    <TableCell>
                                        <Typography>
                                            {resources ?? "-"}
                                        </Typography>
                                    </TableCell>
                                </TableRow>
                            </>
                        }
                    </StoreInfo>

                </TableBody>
            </Table>
        </TableContainer>

    </>;
}
