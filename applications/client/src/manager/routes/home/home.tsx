import React, {memo, useCallback, useContext, useMemo, useRef, useState} from "react";
import {Link, useNavigate } from "react-router-dom";
import {Box, Button, Checkbox, IconButton, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Toolbar, Typography} from "@mui/material";
import {CreateSpecificationButton} from "./create-specification-button";
import {DataSpecificationsContext} from "../../app";
import {DataSpecificationDetailInfoCell, DataSpecificationNameCell} from "../../name-cells";
import {SpecificationTags} from "../../components/specification-tags";
import {FilterByTagSelect, FilterContext} from "./filter-by-tag-select";
import {alpha} from "@mui/material/styles";
import {GenerateDialog} from "../../artifacts/generate-dialog";
import {useToggle} from "../../use-toggle";
import {useDialog} from "../../../editor/dialog";
import {DeleteDataSpecificationForm} from "../../components/delete-data-specification-form";
import {useTranslation} from "react-i18next";
import MoreVertIcon from '@mui/icons-material/MoreVert';
import { SpecificationMoreMenu } from "../../components/specification-more-menu";
import {ImportButton} from "../../import/import-button";

function getSpecificationUrl(dataSpecificationIri: string) {
    return `specification?dataSpecificationIri=${encodeURIComponent(dataSpecificationIri)}`;
}

const MoreButton = (props: { dataSpecificationIri: string }) => {
    const element = useRef<HTMLButtonElement>(null);
    const toggle = useToggle();

    return <>
        <IconButton
            ref={element}
            onClick={e => {
                e.preventDefault();
                e.stopPropagation();
                toggle.open();
            }}
        >
            <MoreVertIcon />
        </IconButton>
        <SpecificationMoreMenu
            anchorEl={element.current}
            open={toggle.isOpen}
            onClose={toggle.close}
            specificationIri={props.dataSpecificationIri}
        />
    </>;
}

/**
 * List of data specifications page component.
 */
export const Home: React.FC = memo(() => {
    const {t} = useTranslation("ui");
    const navigate = useNavigate();
    const redirect = useCallback((dataSpecificationIri: string) => navigate(getSpecificationUrl(dataSpecificationIri)), [navigate]);

    const {
        dataSpecifications,
        rootDataSpecificationIris,
    } = useContext(DataSpecificationsContext);

    const DeleteForm = useDialog(DeleteDataSpecificationForm);

    const [filter] = useContext(FilterContext);
    const specificationsToShow = useMemo(() =>
        rootDataSpecificationIris.filter(iri =>
            filter === null ||
            (
                dataSpecifications[iri] &&
                dataSpecifications[iri].tags.includes(filter)
            )
        )
    , [rootDataSpecificationIris, dataSpecifications, filter]);

    const [selected, setSelected] = useState<string[]>([]);
    const handleSelect = useCallback((value: boolean, iri: string) => {
       if (!value) {
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
                {t("data specifications")}
            </Typography>
            <div style={{display: "flex", alignItems: "center", gap: "1rem"}}>
                <ImportButton />
                <CreateSpecificationButton onSpecificationCreated={redirect} />
            </div>
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
                        {t("available data specifications")}
                    </Typography>
                )}
                {selected.length > 0 ? <Box sx={{display: "flex", gap: 2}}>
                    <Button onClick={generateDialogOpen.open}>Generate to .ZIP</Button>
                    {/*<Button color="error">Delete</Button>*/}
                </Box> : <FilterByTagSelect />}
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
                            <TableCell>{t("name")}</TableCell>
                            <TableCell>{t("tags")}</TableCell>
                            <TableCell sx={{width: 0}}>{t("actions")}</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {specificationsToShow.map(dataSpecificationIri => (
                            <TableRow
                                key={dataSpecificationIri}
                                sx={{'&:last-child td, &:last-child th': {border: 0}}}
                                hover
                                role="checkbox"
                                selected={selected.includes(dataSpecificationIri)}
                                >
                                <TableCell padding="checkbox">
                                    <Checkbox
                                        onChange={(event) => handleSelect(event.target.checked, dataSpecificationIri)}
                                        color="primary"
                                        checked={selected.includes(dataSpecificationIri)}
                                    />
                                </TableCell>
                                <TableCell component="th" scope="ro
                                w">
                                    <div>
                                        <Box sx={{display: "flex", flexDirection: 'row'}}>
                                            <DataSpecificationNameCell dataSpecificationIri={dataSpecificationIri as string} />
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
                                                    to={getSpecificationUrl(dataSpecificationIri)}>{t("detail")}</Button>
                                        }
                                        <Button color={"error"} onClick={e => {
                                            e.stopPropagation();
                                            DeleteForm.open({dataSpecificationIris: [dataSpecificationIri]});
                                        }}>{t("delete")}</Button>
                                        <MoreButton dataSpecificationIri={dataSpecificationIri} />
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
});
