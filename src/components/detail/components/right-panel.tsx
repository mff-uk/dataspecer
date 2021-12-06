import React, {memo, useCallback, useEffect, useState} from "react";
import {DataPsmAssociationEnd, DataPsmAttribute, DataPsmClass} from "model-driven-data/data-psm/model";
import {StoreContext} from "../../App";
import {SetTechnicalLabel} from "../../../operations/set-technical-label";
import {SetDataPsmDatatype} from "../../../operations/set-data-psm-datatype";
import {Box, Button, Grid, IconButton, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TextField, Typography} from "@mui/material";
import {useTranslation} from "react-i18next";
import {DatatypeSelector, DatatypeSelectorValueType, getIriFromDatatypeSelectorValue} from "../../helper/datatype-selector";
import {knownDatatypes} from "../../../utils/known-datatypes";
import {isReadOnly} from "../../../store/federated-observable-store";
import {useDataPsmAndInterpretedPim} from "../../../hooks/useDataPsmAndInterpretedPim";
import {PimAssociationEnd, PimAttribute, PimClass} from "model-driven-data/pim/model";
import {Icons} from "../../../icons";
import {isEqual} from "lodash";
import {SetClassCodelist} from "../../../operations/set-class-codelist";

export const RightPanel: React.FC<{ iri: string, close: () => void }> = memo(({iri, close}) => {
    const {store} = React.useContext(StoreContext);

    const {dataPsmResource: resource, pimResource, dataPsmResourceStore: resourcesStore, pimResourceStore} = useDataPsmAndInterpretedPim<DataPsmAttribute | DataPsmAssociationEnd | DataPsmClass, PimAttribute | PimAssociationEnd | PimClass>(iri);

    const isAttribute = DataPsmAttribute.is(resource);
    const isAssociationEnd = DataPsmAssociationEnd.is(resource);
    const isClass = DataPsmClass.is(resource);
    const isCodelist = (isClass && (pimResource as PimClass)?.pimIsCodelist) ?? false;

    const readOnly = isReadOnly(resourcesStore);
    const pimReadOnly = isReadOnly(pimResourceStore);

    const [technicalLabel, setTechnicalLabel] = useState<string>("");
    const [datatype, setDatatype] = useState<DatatypeSelectorValueType>("");
    const [codelistUrl, setCodelistUrl] = useState<string[] | false>(false);
    const [codelistUrlAddString, setCodelistUrlAddString] = useState<string>("");
    const addCodeListItem = useCallback(() => {
        if (codelistUrl !== false && codelistUrlAddString.length > 0) {
            if (!codelistUrl.includes(codelistUrlAddString)) {
                setCodelistUrl([...codelistUrl, codelistUrlAddString]);
            }
            setCodelistUrlAddString("");
        }
    }, [codelistUrl, codelistUrlAddString]);

    useEffect(() => {
        setTechnicalLabel(resource?.dataPsmTechnicalLabel ?? "");

        if (isAttribute) {
            const datatype = resource?.dataPsmDatatype ?? "";
            const foundDatatype = knownDatatypes.find(type => type.iri === datatype);
            setDatatype(foundDatatype ?? datatype);
        }
    }, [resource]);

    useEffect(() => {
        if (isClass) {
            setCodelistUrl((pimResource as PimClass)?.pimIsCodelist ? ((pimResource as PimClass)?.pimCodelistUrl ?? []) : false);
        }
    }, [pimResource])

    const {t} = useTranslation("detail");

    /**
     * Action that happens after user click on confirm changes button.
     */
    const onConfirm = useCallback(async () => {
        if (resource) {
            if (resource.dataPsmTechnicalLabel !== technicalLabel) {
                await store.executeOperation(new SetTechnicalLabel(resource.iri as string, technicalLabel));
            }

            if (isAttribute && resource.dataPsmDatatype !== getIriFromDatatypeSelectorValue(datatype)) {
                await store.executeOperation(new SetDataPsmDatatype(resource.iri as string, getIriFromDatatypeSelectorValue(datatype) ?? ""));
            }
        }

        if (pimResource) {
            if (isClass && !isEqual(codelistUrl, (pimResource as PimClass)?.pimIsCodelist ? ((pimResource as PimClass)?.pimCodelistUrl ?? []) : false)) {
                await store.executeOperation(new SetClassCodelist(pimResource.iri as string, codelistUrl !== false, codelistUrl === false ? [] : codelistUrl));
            }
        }

        close();
    }, [resource?.iri, technicalLabel, datatype, isCodelist, codelistUrl, pimResource]);

    const changed = (resource &&
        ((resource.dataPsmTechnicalLabel ?? "") === (technicalLabel ?? "")) &&
        (!isAttribute || (resource.dataPsmDatatype ?? "") === (getIriFromDatatypeSelectorValue(datatype) ?? "")) &&
        (isEqual((pimResource as PimClass)?.pimIsCodelist ? ((pimResource as PimClass)?.pimCodelistUrl ?? false) : false, codelistUrl))) ?? false;

    return <>
        {isClass && codelistUrl !== false &&
            <Box sx={{mb: 3}}>
                <Typography variant="subtitle1" component="h2">
                    {t('codelist url title')}
                </Typography>
                <TableContainer component={Paper}>
                    <Table size="small">
                        <TableHead>
                            <TableRow>
                                <TableCell>URL</TableCell>
                                <TableCell align="right"/>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {codelistUrl.map((url) => (
                                <TableRow
                                    key={url}
                                    sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                                >
                                    <TableCell component="th" scope="row">
                                        {url}
                                    </TableCell>
                                    <TableCell align="right">
                                        {pimReadOnly ||
                                            <IconButton size="small" onClick={() => setCodelistUrl(codelistUrl.filter(u => u !== url))}>
                                                <Icons.Tree.Delete/>
                                            </IconButton>
                                        }
                                    </TableCell>
                                </TableRow>
                            ))}
                            {codelistUrl.length === 0 &&
                                <TableRow>
                                    <TableCell colSpan={2}>
                                        <Typography variant="body2" color="textSecondary">
                                            {t('no codelist url')}
                                        </Typography>
                                    </TableCell>
                                </TableRow>
                            }
                        </TableBody>
                    </Table>
                </TableContainer>
                {pimReadOnly || <>
                        <Grid container sx={{alignItems: "center"}} spacing={2}>
                            <Grid item xs={9}>
                                <TextField
                                    margin="dense"
                                    hiddenLabel
                                    size="small"
                                    fullWidth
                                    variant="filled"
                                    value={codelistUrlAddString}
                                    onChange={event => setCodelistUrlAddString(event.target.value)}
                                    onKeyDown={event => {
                                        if (event.key === "Enter") {
                                            event.preventDefault();
                                            addCodeListItem();
                                        }
                                    }}
                                />
                            </Grid>
                            <Grid item xs={3}>
                                <Button variant="contained" fullWidth onClick={addCodeListItem} disabled={codelistUrlAddString.length === 0}>
                                    {t('add')}
                                </Button>
                            </Grid>
                        </Grid>
                        <Button variant="contained" fullWidth onClick={() => setCodelistUrl(false)}>
                            {t('unset class as codelist')}
                        </Button>
                    </>
                }
            </Box>
        }

        {isClass && codelistUrl === false && !pimReadOnly &&
            <Box sx={{mb: 3}}>
                <Button variant="contained" fullWidth onClick={() => setCodelistUrl([])}>
                    {t('set class as codelist')}
                </Button>
            </Box>
        }

        <TextField
            autoFocus
            disabled={readOnly}
            margin="dense"
            label={t('label technical label')}
            fullWidth
            variant="filled"
            value={technicalLabel}
            onChange={event => setTechnicalLabel(event.target.value)}
            onKeyDown={event => {
                if (event.key === "Enter") {
                    event.preventDefault();
                    onConfirm().then();
                }
            }}
        />

        {isAttribute && <Box sx={{pt: 2}}>
            <DatatypeSelector disabled={readOnly} value={datatype} onChange={setDatatype} options={knownDatatypes} onEnter={event => {
                event.preventDefault();
                onConfirm().then();
            }} />
        </Box>}

        {(readOnly && pimReadOnly) ||
            <Grid container sx={{pt: 2}} spacing={2}>
                <Grid item xs={6}>
                    <Button variant="text" fullWidth onClick={close} disabled={changed}>
                        {t('discard changes')}
                    </Button>
                </Grid>
                <Grid item xs={6}>
                    <Button variant="contained" fullWidth onClick={onConfirm} disabled={changed}>
                        {t('confirm changes')}
                    </Button>
                </Grid>
            </Grid>
        }
    </>
});
