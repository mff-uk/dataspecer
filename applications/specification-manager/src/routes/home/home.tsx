import React, {useCallback, useContext, useMemo} from "react";
import {Link} from "react-router-dom";
import {Box, Button, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography} from "@mui/material";
import {CreateSpecification} from "./create-specification";
import {BackendConnectorContext, DataSpecificationsContext} from "../../app";
import {DataSpecificationNameCell} from "../../name-cells";
import {SpecificationTags} from "../../components/specification-tags";
import {FilterByTag, FilterContext} from "./filter-by-tag";

export const Home: React.FC = () => {
    const {
        dataSpecifications,
        setDataSpecifications,
        rootDataSpecificationIris,
        setRootDataSpecificationIris
    } = useContext(DataSpecificationsContext);
    const backendConnector = useContext(BackendConnectorContext);

    const deleteSpecification = useCallback(async (id: string) => {
        await backendConnector.deleteDataSpecification(id);
        const newDataSpecifications = {...dataSpecifications};
        delete newDataSpecifications[id];
        setDataSpecifications(newDataSpecifications);
        setRootDataSpecificationIris(rootDataSpecificationIris.filter(iri => iri !== id));
    }, [backendConnector, dataSpecifications, setDataSpecifications, setRootDataSpecificationIris, rootDataSpecificationIris]);

    const [filter] = useContext(FilterContext);
    const specificationsToShow = useMemo(() =>
        rootDataSpecificationIris.filter(iri =>
            filter === "_" ||
            (
                dataSpecifications[iri] &&
                dataSpecifications[iri].tags.includes(filter)
            )
        )
    , [rootDataSpecificationIris, dataSpecifications, filter]);

    return <>
        <Box height="30px"/>
        <Box display="flex" flexDirection="row" justifyContent="space-between">
            <Typography variant="h4" component="div" gutterBottom>
                List of data specifications
            </Typography>
            <FilterByTag />
            <CreateSpecification />
        </Box>


        <TableContainer component={Paper}>
            <Table>
                <TableHead>
                    <TableRow>
                        <TableCell sx={{width: "80%"}}>Name</TableCell>
                        <TableCell sx={{width: "20%"}}>Tags</TableCell>
                        <TableCell>Actions</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {specificationsToShow.map(dataSpecificationIri => (
                        <TableRow
                            key={dataSpecificationIri}
                            sx={{'&:last-child td, &:last-child th': {border: 0}}}
                        >
                            <TableCell component="th" scope="row">
                                <Box sx={{display: "flex", flexDirection: 'row'}}>
                                    <DataSpecificationNameCell dataSpecificationIri={dataSpecificationIri as string} />
                                    <SpecificationTags iri={dataSpecificationIri} />
                                </Box>
                            </TableCell>
                            <TableCell>
                            </TableCell>
                            <TableCell align="right">
                                <Box sx={{
                                    display: "flex",
                                    gap: "1rem",
                                }}>
                                    {dataSpecificationIri &&
                                        <Button variant="outlined" color={"primary"} component={Link}
                                                to={`specification?dataSpecificationIri=${encodeURIComponent(dataSpecificationIri)}`}>Detail</Button>
                                    }
                                    <Button variant="outlined" color={"error"}
                                            onClick={() => dataSpecificationIri && deleteSpecification(dataSpecificationIri)}>Delete</Button>
                                </Box>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </TableContainer>
    </>;
}
