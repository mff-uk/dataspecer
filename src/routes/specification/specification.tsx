import React, {useCallback} from "react";
import {useParams} from "react-router-dom";
import {useAsyncMemoWithTrigger} from "../../use-async-memo-with-trigger";
import axios from "axios";
import {Box, Button, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography} from "@mui/material";
import {CreateDataPsm} from "./create-data-psm";
import {StoreSize} from "./store-size";

console.log(process.env);

const schemaGeneratorUrls = (process.env.REACT_APP_SCHEMA_GENERATOR as string).split(" ")
    .map((v, i, a) => i % 2 ? [a[i - 1], v] : null)
    .filter((v): v is [string, string] => v !== null);

export const Specification: React.FC<{}> = ({}) => {
    let {specificationId} = useParams();
    const [specification, isLoading, reloadSpecification] = useAsyncMemoWithTrigger(() => axios.get(`${process.env.REACT_APP_BACKEND}/specification/${specificationId}`), []);

    const deleteDataPsm = useCallback(async (id: string) => {
        await axios.delete(`${process.env.REACT_APP_BACKEND}/specification/${specificationId}/data-psm/${id}`);
        reloadSpecification?.();
    }, [reloadSpecification, specificationId]);

    return <>
        <Box height="30px"/>
        <Box display="flex" flexDirection="row" justifyContent="space-between">
            <Typography variant="h4" component="div" gutterBottom>{specification?.data.name}</Typography>
        </Box>

        <Typography variant="h5" component="div" gutterBottom sx={{mt: 5}}>
            Properties
        </Typography>
        <TableContainer component={Paper} sx={{mt: 3}}>
            <Table>
                <TableBody>
                    <StoreSize storeId={specification?.data?.pimStore ?? null}>
                        {(operations, resources) =>
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
                    </StoreSize>

                </TableBody>
            </Table>
        </TableContainer>

        <Box display="flex" flexDirection="row" justifyContent="space-between" sx={{mt: 5}}>
            <Typography variant="h5" component="div" gutterBottom>Data PSMs</Typography>
            {specificationId && <CreateDataPsm reload={reloadSpecification} specificationId={specificationId}/>}
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
                    {specification?.data.DataPsm.map((dataPsm: any) =>
                        <TableRow key={dataPsm.id}>
                            <TableCell component="th" scope="row" sx={{width: "25%"}}>
                                <Typography sx={{fontWeight: "bold"}}>
                                    {dataPsm.name}
                                </Typography>
                            </TableCell>
                            <StoreSize storeId={dataPsm?.store ?? null}>
                                {(operations, resources) =>
                                    <>
                                        <TableCell>
                                            <Typography>{operations ?? "-"}</Typography>
                                        </TableCell>
                                        <TableCell>
                                            <Typography>{resources ?? "-"}</Typography>
                                        </TableCell>
                                    </>
                                }
                            </StoreSize>

                            <TableCell align="right">
                                <Box
                                    sx={{
                                        display: "flex",
                                        gap: "1rem",
                                        justifyContent: "flex-end"
                                    }}>
                                    {schemaGeneratorUrls.map(([branch, url]) => {
                                            const urlObject = new URL(url);
                                            urlObject.searchParams.append('configuration', `${process.env.REACT_APP_BACKEND}/configuration/by-data-psm/${dataPsm.id}`);
                                            return <Button variant={"contained"} color={"primary"} key={url} href={urlObject.toString()}>Edit ({branch})</Button>;
                                        }
                                    )}
                                    <Button variant="outlined" color={"primary"} href={`${process.env.REACT_APP_BACKEND}/configuration/by-data-psm/${dataPsm.id}`}>See configuration</Button>
                                    <Button
                                        variant="outlined"
                                        color={"error"}
                                        onClick={() => deleteDataPsm(dataPsm.id)}>Delete</Button>
                                </Box>
                            </TableCell>
                        </TableRow>
                    )}
                </TableBody>
            </Table>
        </TableContainer>
    </>;
}
