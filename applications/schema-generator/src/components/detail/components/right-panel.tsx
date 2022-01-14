import React, {memo, useCallback, useEffect, useState} from "react";
import {DataPsmAssociationEnd, DataPsmAttribute, DataPsmClass} from "@model-driven-data/core/data-psm/model";
import {StoreContext} from "../../App";
import {SetTechnicalLabel} from "../../../operations/set-technical-label";
import {SetDataPsmDatatype} from "../../../operations/set-data-psm-datatype";
import {Box, Button, Card, Checkbox, Collapse, FormControlLabel, FormGroup, Grid, IconButton, Table, TableBody, TableCell, TableHead, TableRow, TextField, Typography} from "@mui/material";
import {useTranslation} from "react-i18next";
import {DatatypeSelector, DatatypeSelectorValueType, getIriFromDatatypeSelectorValue} from "../../helper/datatype-selector";
import {knownDatatypes} from "../../../utils/known-datatypes";
import {isReadOnly} from "../../../store/federated-observable-store";
import {useDataPsmAndInterpretedPim} from "../../../hooks/useDataPsmAndInterpretedPim";
import {PimAssociationEnd, PimAttribute, PimClass} from "@model-driven-data/core/pim/model";
import {Icons} from "../../../icons";
import {isEqual} from "lodash";
import {SetClassCodelist} from "../../../operations/set-class-codelist";
import {useSaveHandler} from "../../helper/save-handler";
import {CardContent} from "../../../mui-overrides";
import {TransitionGroup} from "react-transition-group";
import {Cardinality, cardinalityFromPim, CardinalitySelector} from "../../helper/cardinality-selector";
import {SetCardinality} from "../../../operations/set-cardinality";

export const RightPanel: React.FC<{ iri: string, close: () => void }> = memo(({iri}) => {
    const {store} = React.useContext(StoreContext);

    const {dataPsmResource: resource, pimResource, dataPsmResourceStore: resourcesStore, pimResourceStore} = useDataPsmAndInterpretedPim<DataPsmAttribute | DataPsmAssociationEnd | DataPsmClass, PimAttribute | PimAssociationEnd | PimClass>(iri);

    const isAttribute = DataPsmAttribute.is(resource);
    const isAssociationEnd = DataPsmAssociationEnd.is(resource);
    const isClass = DataPsmClass.is(resource);
    //const isCodelist = (isClass && (pimResource as PimClass)?.pimIsCodelist) ?? false;

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
    }, [resource, isAttribute]);

    useEffect(() => {
        if (isClass) {
            setCodelistUrl((pimResource as PimClass)?.pimIsCodelist ? ((pimResource as PimClass)?.pimCodelistUrl ?? []) : false);
        }
    }, [pimResource, isClass])

    const {t} = useTranslation("detail");

    useSaveHandler(
        resource !== null && (resource.dataPsmTechnicalLabel ?? "") !== technicalLabel,
        useCallback(async () => resource && await store.executeOperation(new SetTechnicalLabel(resource.iri as string, technicalLabel)), [resource, store, technicalLabel]),
    );

    useSaveHandler(
        resource !== null && isAttribute && resource.dataPsmDatatype !== getIriFromDatatypeSelectorValue(datatype),
        useCallback(async () => resource && await store.executeOperation(new SetDataPsmDatatype(resource.iri as string, getIriFromDatatypeSelectorValue(datatype))), [resource, store, datatype]),
    );

    useSaveHandler(
        isClass && !isEqual(codelistUrl, (pimResource as PimClass)?.pimIsCodelist ? ((pimResource as PimClass)?.pimCodelistUrl ?? []) : false),
        useCallback(
            async () => pimResource && await store.executeOperation(new SetClassCodelist(pimResource.iri as string, codelistUrl !== false, codelistUrl === false ? [] : codelistUrl)),
            [pimResource, codelistUrl, store]
        ),
    );

    const [cardinality, setCardinality] = useState<Cardinality | null>(null);

    useEffect(() => {
        if (isAttribute || isAssociationEnd) {
            setCardinality(cardinalityFromPim(pimResource as PimAttribute & PimAssociationEnd));
        }
    }, [pimResource, isAttribute, isAssociationEnd]);

    useSaveHandler(
        (isAttribute || isAssociationEnd) && !isEqual(cardinality, cardinalityFromPim(pimResource as PimAttribute & PimAssociationEnd)),
        useCallback(
            async () => (isAttribute || isAssociationEnd) && pimResource && cardinality && await store.executeOperation(new SetCardinality(pimResource.iri as string, cardinality.cardinalityMin, cardinality.cardinalityMax)),
            [pimResource, cardinality, isAttribute, isAssociationEnd, store]
        ),
    );

    return <>
        <Box sx={{mb: 3}}>
            <Typography variant="subtitle1" component="h2">
                {t('label technical label')}
            </Typography>
            <TextField
                autoFocus
                disabled={readOnly}
                margin="dense"
                //label={t('label technical label')}
                hiddenLabel
                fullWidth
                variant="filled"
                value={technicalLabel}
                onChange={event => setTechnicalLabel(event.target.value)}
               /* onKeyDown={event => {
                    if (event.key === "Enter") {
                        event.preventDefault();
                        onConfirm().then();
                    }
                }}*/
            />
        </Box>

        {isClass &&
            <Box sx={{mb: 3}}>
                <Typography variant="subtitle1" component="h2">
                    {t('codelist')}
                </Typography>

                <Card>
                    <CardContent>
                        <FormGroup>
                            <FormControlLabel control={<Checkbox checked={codelistUrl !== false} onChange={() => setCodelistUrl(codelistUrl !== false ? false : [])} />}
                                              label={t('is codelist') as string} />
                        </FormGroup>
                        <TransitionGroup>
                            {codelistUrl !== false &&
                                <Collapse>
                                <Box sx={{mb: 3}}>
                                    <Table size="small">
                                        <TableHead>
                                            <TableRow>
                                                <TableCell>{t('codelist url')}</TableCell>
                                                <TableCell align="right"/>
                                            </TableRow>
                                        </TableHead>
                                        <TableBody>
                                            {codelistUrl.map((url) => (
                                                <TableRow key={url}>
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
                                    {pimReadOnly || <>
                                        <Grid container sx={{alignItems: "center", mt: 1}} spacing={2}>
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
                                    </>
                                    }
                                </Box>
                            </Collapse>
                            }
                        </TransitionGroup>
                    </CardContent>
                </Card>
            </Box>
        }

        {isAttribute &&
            <Box sx={{mb: 3}}>
                <Typography variant="subtitle1" component="h2">
                    {t('title data type')}
                </Typography>

                <DatatypeSelector disabled={readOnly} value={datatype} onChange={setDatatype} options={knownDatatypes}/>
            </Box>
        }

        {(isAttribute || isAssociationEnd) &&
            <Box sx={{mb: 3}}>
                <Typography variant="subtitle1" component="h2">
                    {t('title cardinality')}
                </Typography>

                {cardinality && <CardinalitySelector value={cardinality} onChange={setCardinality} disabled={pimReadOnly} />}
            </Box>
        }
    </>
});
