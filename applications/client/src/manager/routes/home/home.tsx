import React, {useCallback, useContext, useMemo, useState} from "react";
import {Link} from "react-router-dom";
import {Box, Button, Checkbox, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Toolbar, Typography} from "@mui/material";
import {CreateSpecification} from "./create-specification";
import {DataSpecificationsContext} from "../../app";
import {DataSpecificationDetailInfoCell, DataSpecificationNameCell} from "../../name-cells";
import {SpecificationTags} from "../../components/specification-tags";
import {FilterByTag, FilterContext} from "./filter-by-tag";
import {alpha} from "@mui/material/styles";
import {GenerateDialog} from "../../artifacts/generate-dialog";
import {useToggle} from "../../use-toggle";
import {useDialog} from "../../../editor/dialog";
import {DeleteDataSpecificationForm} from "../../components/delete-data-specification-form";

export const Home: React.FC = () => {
    const {
        dataSpecifications,
        rootDataSpecificationIris,
    } = useContext(DataSpecificationsContext);

    const DeleteForm = useDialog(DeleteDataSpecificationForm);

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

    const [selected, setSelected] = useState<string[]>([]);
    const handleSelect = useCallback((event: React.MouseEvent<unknown>, iri: string) => {
       if (selected.includes(iri)) {
           setSelected(selected.filter(i => i !== iri));
       } else {
           setSelected([...selected, iri]);
       }
    }, [selected, setSelected]);

    const generateDialogOpen = useToggle();

    return <>
        <Box height="30px"/>
        <Box display="flex" flexDirection="row" justifyContent="space-between">
            <Typography variant="h4" component="div" gutterBottom>
                Data specifications
            </Typography>
            <CreateSpecification />
        </Box>

        <Paper sx={{mt: 3}}>
            <Toolbar
                sx={{
                    pl: { sm: 2 },
                    pr: { xs: 1, sm: 1 },
                    ...(selected.length > 0 && {
                        bgcolor: (theme) =>
                            alpha(theme.palette.primary.main, theme.palette.action.activatedOpacity),
                    }),
                }}
            >
                {selected.length > 0 ? (
                    <Typography
                        sx={{ flex: '1' }}
                        color="inherit"
                        variant="subtitle1"
                        component="div"
                    >
                        {selected.length} selected
                    </Typography>
                ) : (
                    <Typography
                        sx={{ flex: '1', fontWeight: "normal" }}
                        variant="h6"
                        id="tableTitle"
                        component="div"
                    >
                        Available data specifications
                    </Typography>
                )}
                {selected.length > 0 ? <Box sx={{display: "flex", gap: 2}}>
                    <Button onClick={generateDialogOpen.open}>Generate to .ZIP</Button>
                    <Button color="error">Delete</Button>
                </Box> : <FilterByTag />}
            </Toolbar>
            <TableContainer>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell padding="checkbox">
                                <Checkbox
                                    // todo fix hidden specifications
                                    indeterminate={selected.length > 0 && selected.length < specificationsToShow.length}
                                    checked={selected.length > 0 && selected.length === specificationsToShow.length}
                                    onChange={() => selected.length > 0 ? setSelected([]) : setSelected([...specificationsToShow])}
                                />
                            </TableCell>
                            <TableCell>Name</TableCell>
                            <TableCell>Tags</TableCell>
                            <TableCell sx={{width: 0}}>Actions</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {specificationsToShow.map(dataSpecificationIri => (
                            <TableRow
                                key={dataSpecificationIri}
                                sx={{'&:last-child td, &:last-child th': {border: 0}}}
                                hover
                                onClick={(event) => handleSelect(event, dataSpecificationIri)}
                                role="checkbox"
                                selected={selected.includes(dataSpecificationIri)}
                            >
                                <TableCell padding="checkbox">
                                    <Checkbox
                                        color="primary"
                                        checked={selected.includes(dataSpecificationIri)}
                                    />
                                </TableCell>
                                <TableCell component="th" scope="ro
                                w">
                                    <div>
                                        <Box sx={{display: "flex", flexDirection: 'row'}}>
                                            <strong>
                                            <DataSpecificationNameCell dataSpecificationIri={dataSpecificationIri as string} />

                                            </strong>
                                            <Typography sx={theme => ({color: theme.palette.text.disabled, ml: 2})}>
                                                <DataSpecificationDetailInfoCell dataSpecificationIri={dataSpecificationIri as string} />
                                            </Typography>
                                        </Box>
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <SpecificationTags iri={dataSpecificationIri} />
                                </TableCell>
                                <TableCell align="right">
                                    <Box sx={{
                                        display: "flex",
                                        gap: 2,
                                    }}>
                                        {dataSpecificationIri &&
                                            <Button color={"primary"} component={Link}
                                                    to={`specification?dataSpecificationIri=${encodeURIComponent(dataSpecificationIri)}`}>Detail</Button>
                                        }
                                        <Button color={"error"} onClick={e => {
                                            e.stopPropagation();
                                            DeleteForm.open({dataSpecificationIris: [dataSpecificationIri]});
                                        }}>Delete</Button>
                                    </Box>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>
        </Paper>

        <GenerateDialog isOpen={generateDialogOpen.isOpen} close={generateDialogOpen.close} dataSpecifications={selected} />
        <DeleteForm.Component />
    </>;
}
