import React, {useCallback} from "react";
import {Link} from "react-router-dom";
import {Box, Button, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography} from "@mui/material";
import {useAsyncMemoWithTrigger} from "../../use-async-memo-with-trigger";
import axios from "axios";
import {CreateSpecification} from "./create-specification";
import {DataSpecification} from "../../interfaces/data-specification";
import {processEnv} from "../../index";

export const Home: React.FC<{}> = () => {
    const [specifications, , reloadSpecifications]
        = useAsyncMemoWithTrigger(() => axios.get<DataSpecification[]>(`${processEnv.REACT_APP_BACKEND}/specification`), []);

    const deleteSpecification = useCallback(async (id: string) => {
        await axios.delete(`${processEnv.REACT_APP_BACKEND}/specification/${id}`);
        reloadSpecifications?.();
    }, [reloadSpecifications]);

    return <>
        <Box height="30px"/>
        <Box display="flex" flexDirection="row" justifyContent="space-between">
            <Typography variant="h4" component="div" gutterBottom>
                List of data specifications
            </Typography>
            <CreateSpecification reload={reloadSpecifications}/>
        </Box>


        <TableContainer component={Paper}>
            <Table>
                <TableHead>
                    <TableRow>
                        <TableCell sx={{width: "100%"}}>Name</TableCell>
                        <TableCell>Actions</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {specifications?.data?.map(row => (
                        <TableRow
                            key={row.name}
                            sx={{'&:last-child td, &:last-child th': {border: 0}}}
                        >
                            <TableCell component="th" scope="row">
                                <Typography sx={{fontWeight: "bold"}}>
                                    {row.name}
                                </Typography>
                            </TableCell>
                            <TableCell align="right">
                                <Box sx={{
                                    display: "flex",
                                    gap: "1rem",
                                }}>
                                    <Button variant="outlined" color={"primary"} component={Link}
                                            to={`specification/${row.id}`}>Detail</Button>
                                    <Button variant="outlined" color={"error"}
                                            onClick={() => deleteSpecification(row.id)}>Delete</Button>
                                </Box>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </TableContainer>
    </>;
}
