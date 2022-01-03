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

const schemaGeneratorUrls = (process.env.REACT_APP_SCHEMA_GENERATOR as string).split(" ")
    .map((v, i, a) => i % 2 ? [a[i - 1], v] : null)
    .filter((v): v is [string, string] => v !== null);

export const Specification: React.FC = () => {
    let {specificationId} = useParams();
    const [specification, , reloadSpecification] = useAsyncMemoWithTrigger(() => axios.get<DataSpecification>(`${process.env.REACT_APP_BACKEND}/specification/${specificationId}`), [specificationId]);

    const createDataStructure = useCallback(async () => {
        const result = await axios.post(`${process.env.REACT_APP_BACKEND}/specification/${specificationId}/data-psm`);
        const dataStructureId = result.data.id;

        const urlObject = new URL(schemaGeneratorUrls[0][1]);
        urlObject.searchParams.append('configuration', `${process.env.REACT_APP_BACKEND}/configuration/by-data-psm/${dataStructureId}`);

        window.location.href = urlObject.href;
    }, [specificationId]);

    const generateZip = async () => {
        const result = await axios.get<Configuration>(`${process.env.REACT_APP_BACKEND}/configuration/by-specification/${specificationId}`);
        const generator = new ArtifactBuilder(result.data);
        const data = await generator.build();
        saveAs(data, "artifact.zip");
    };

    return <>
        <Box height="30px"/>
        <Box display="flex" flexDirection="row" justifyContent="space-between">
            <Typography variant="h4" component="div" gutterBottom><small style={{fontWeight: "bold"}}>Data specification:</small>{" "}{specification?.data.name}</Typography>
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
                        <TableCell align="right">Actions</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {specification?.data.hasDataStructures.map(dataStructure =>
                        <DataStructureRow dataStructure={dataStructure} schemaGeneratorUrls={schemaGeneratorUrls} specificationId={specificationId as string} reloadSpecification={reloadSpecification as () => void}/>
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
                    {specification?.data.reusesDataSpecification.map(specification =>
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
            <Button variant="contained" onClick={generateZip}>Generate .ZIP file</Button>
        </Box>


        <Typography variant="h5" component="div" gutterBottom sx={{mt: 5}}>
            Technical properties
        </Typography>
        <TableContainer component={Paper} sx={{mt: 3}}>
            <Table>
                <TableBody>
                    <StoreInfo storeId={specification?.data?.pimStore ?? null}>
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
