import React, {useCallback} from "react";
import {Link, useParams} from "react-router-dom";
import {useAsyncMemoWithTrigger} from "../../use-async-memo-with-trigger";
import axios from "axios";
import {Box, Button, Fab, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography} from "@mui/material";
import {StoreInfo} from "./store-info";
import {ReuseDataSpecifications} from "./reuse-data-specifications";
import {DataSpecification} from "../../interfaces/data-specification";
import AddIcon from "@mui/icons-material/Add";

const schemaGeneratorUrls = (process.env.REACT_APP_SCHEMA_GENERATOR as string).split(" ")
    .map((v, i, a) => i % 2 ? [a[i - 1], v] : null)
    .filter((v): v is [string, string] => v !== null);

export const Specification: React.FC = () => {
    let {specificationId} = useParams();
    const [specification, , reloadSpecification] = useAsyncMemoWithTrigger(() => axios.get<DataSpecification>(`${process.env.REACT_APP_BACKEND}/specification/${specificationId}`), [specificationId]);

    const deleteDataPsm = useCallback(async (id: string) => {
        await axios.delete(`${process.env.REACT_APP_BACKEND}/specification/${specificationId}/data-psm/${id}`);
        reloadSpecification?.();
    }, [reloadSpecification, specificationId]);

    const createDataStructure = useCallback(async () => {
        const result = await axios.post(`${process.env.REACT_APP_BACKEND}/specification/${specificationId}/data-psm`);
        const dataStructureId = result.data.id;

        const urlObject = new URL(schemaGeneratorUrls[0][1]);
        urlObject.searchParams.append('configuration', `${process.env.REACT_APP_BACKEND}/configuration/by-data-psm/${dataStructureId}`);

        window.location.href = urlObject.href;
    }, [specificationId]);

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
                        <TableCell align="right">Actions</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {specification?.data.hasDataStructures.map(dataStructure =>
                        <TableRow key={dataStructure.id}>
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

                            <TableCell align="right">
                                <Box
                                    sx={{
                                        display: "flex",
                                        gap: "1rem",
                                        justifyContent: "flex-end"
                                    }}>
                                    {schemaGeneratorUrls.map(([branch, url]) => {
                                            const urlObject = new URL(url);
                                            urlObject.searchParams.append('configuration', `${process.env.REACT_APP_BACKEND}/configuration/by-data-psm/${dataStructure.id}`);
                                            return <Button variant={"contained"} color={"primary"} key={url} href={urlObject.toString()}>Edit ({branch})</Button>;
                                        }
                                    )}
                                    <Button variant="outlined" color={"primary"} href={`${process.env.REACT_APP_BACKEND}/configuration/by-data-psm/${dataStructure.id}`}>See configuration</Button>
                                    <Button
                                        variant="outlined"
                                        color={"error"}
                                        onClick={() => deleteDataPsm(dataStructure.id)}>Delete</Button>
                                </Box>
                            </TableCell>
                        </TableRow>
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
