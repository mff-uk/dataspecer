import React, {memo, useCallback, useEffect, useState} from "react";
import {DataPsmAssociationEnd, DataPsmAttribute, DataPsmClass} from "@dataspecer/core/data-psm/model";
import {SetTechnicalLabel} from "../../../operations/set-technical-label";
import {SetDataPsmDatatype} from "../../../operations/set-data-psm-datatype";
import {Alert, Box, Button, Card, Checkbox, Collapse, FormControlLabel, FormGroup, Grid, IconButton, Table, TableBody, TableCell, TableHead, TableRow, TextField, Typography} from "@mui/material";
import {useTranslation} from "react-i18next";
import {DatatypeSelector, DatatypeSelectorValueType, getIriFromDatatypeSelectorValue} from "../../helper/datatype-selector";
import {knownDatatypes} from "../../../utils/known-datatypes";
import {useDataPsmAndInterpretedPim} from "../../../hooks/use-data-psm-and-interpreted-pim";
import {PimAssociationEnd, PimAttribute, PimClass} from "@dataspecer/core/pim/model";
import {Icons} from "../../../icons";
import {isEqual} from "lodash";
import {SetClassCodelist} from "../../../operations/set-class-codelist";
import {useSaveHandler} from "../../helper/save-handler";
import {CardContent} from "../../../mui-overrides";
import {TransitionGroup} from "react-transition-group";
import {Cardinality, cardinalityFromPim, CardinalitySelector} from "../../helper/cardinality-selector";
import {SetCardinality} from "../../../operations/set-cardinality";
import {useFederatedObservableStore} from "@dataspecer/federated-observable-store-react/store";
import {SetDematerialize} from "../../../operations/set-dematerialize";
import { SetPimDatatype } from "../../../operations/set-pim-datatype";
import { RegexField } from "../../helper/regex-field";
import { StringExamplesField } from "../../helper/string-examples-field";
import { SetAttributeRegex } from "../../../operations/set-attribute-regex";
import { SetAttributeExample } from "../../../operations/set-attribute-example";

export const RightPanel: React.FC<{ iri: string, close: () => void }> = memo(({iri}) => {
    const store = useFederatedObservableStore();

    const {dataPsmResource: resource, pimResource} = useDataPsmAndInterpretedPim<DataPsmAttribute | DataPsmAssociationEnd | DataPsmClass, PimAttribute | PimAssociationEnd | PimClass>(iri);

    const isAttribute = DataPsmAttribute.is(resource);
    const isAssociationEnd = DataPsmAssociationEnd.is(resource);
    const isClass = DataPsmClass.is(resource);
    //const isCodelist = (isClass && (pimResource as PimClass)?.pimIsCodelist) ?? false;

    const readOnly = false;
    const pimReadOnly = false;

    const [technicalLabel, setTechnicalLabel] = useState<string>("");
    const [regex, setRegex] = useState<string>("");
    const [examples, setExamples] = useState<string[]|null>([]);
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
    }, [pimResource, isClass]);

    useEffect(() => {
        if (isAttribute) {
            setRegex((pimResource as PimAttribute)?.pimRegex ?? "");
            setExamples((pimResource as PimAttribute)?.pimExample ?? null);
        }
    }, [pimResource, isAttribute]);

    const {t} = useTranslation("detail");

    useSaveHandler(
        resource !== null && (resource.dataPsmTechnicalLabel ?? "") !== technicalLabel,
        useCallback(async () => resource && await store.executeComplexOperation(new SetTechnicalLabel(resource.iri as string, technicalLabel)), [resource, store, technicalLabel]),
    );

    useSaveHandler(
        resource !== null && isAttribute && resource.dataPsmDatatype !== getIriFromDatatypeSelectorValue(datatype),
        useCallback(async () => {
            if (resource) {
                await store.executeComplexOperation(new SetDataPsmDatatype(resource.iri as string, getIriFromDatatypeSelectorValue(datatype)));
                // Todo: let user choose where to set the datatype
                if (pimResource) {
                    await store.executeComplexOperation(new SetPimDatatype(pimResource.iri as string, getIriFromDatatypeSelectorValue(datatype)));
                }
            }
        }, [resource, store, datatype, pimResource]),
    );

    useSaveHandler(
        isClass && !isEqual(codelistUrl, (pimResource as PimClass)?.pimIsCodelist ? ((pimResource as PimClass)?.pimCodelistUrl ?? []) : false),
        useCallback(
            async () => pimResource && await store.executeComplexOperation(new SetClassCodelist(pimResource.iri as string, codelistUrl !== false, codelistUrl === false ? [] : codelistUrl)),
            [pimResource, codelistUrl, store]
        ),
    );

    // region association end dematerialization

    const [isAssociationDematerialized, setIsAssociationDematerialized] = useState<boolean>(false);

    useEffect(() => {
        if (isAssociationEnd) {
            setIsAssociationDematerialized(!!(resource as DataPsmAssociationEnd).dataPsmIsDematerialize);
        }
    }, [resource, isAssociationEnd]);

    useSaveHandler(
        isAssociationEnd && isAssociationDematerialized !== !!(resource as DataPsmAssociationEnd).dataPsmIsDematerialize,
        useCallback(
            async () => resource && await store.executeComplexOperation(new SetDematerialize(resource.iri as string, isAssociationDematerialized)),
            [resource, store, isAssociationDematerialized]
        ),
    );

    // endregion association end dematerialization

    // region regex and examples

    const isStringDatatype = isAttribute && [
        "https://ofn.gov.cz/zdroj/základní-datové-typy/2020-07-01/řetězec",
        "https://ofn.gov.cz/zdroj/základní-datové-typy/2020-07-01/url"
    ].includes(getIriFromDatatypeSelectorValue(datatype));

    const normalizedRegex = regex === "" ? null : regex;
    useSaveHandler(
        isStringDatatype && normalizedRegex !== (pimResource as PimAttribute)?.pimRegex,
        useCallback(async () => {
            await store.executeComplexOperation(new SetAttributeRegex(pimResource.iri as string, normalizedRegex));
        }, [normalizedRegex, pimResource.iri, store])
    );

    const normalizedExamples = examples === null || examples.length === 0 ? null : examples;
    useSaveHandler(
        isStringDatatype && !isEqual(normalizedExamples, (pimResource as PimAttribute)?.pimExample),
        useCallback(async () => {
            await store.executeComplexOperation(new SetAttributeExample(pimResource.iri as string, normalizedExamples));
        }, [normalizedExamples, pimResource.iri, store])
    );

    // endregion regex and examples

    const [cardinality, setCardinality] = useState<Cardinality | null>(null);

    useEffect(() => {
        if (isAttribute || isAssociationEnd) {
            setCardinality(cardinalityFromPim(pimResource as PimAttribute & PimAssociationEnd));
        }
    }, [pimResource, isAttribute, isAssociationEnd]);

    useSaveHandler(
        (isAttribute || isAssociationEnd) && !isEqual(cardinality, cardinalityFromPim(pimResource as PimAttribute & PimAssociationEnd)),
        useCallback(
            async () => (isAttribute || isAssociationEnd) && pimResource && cardinality && await store.executeComplexOperation(new SetCardinality(pimResource.iri as string, cardinality.cardinalityMin, cardinality.cardinalityMax)),
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

        {isAttribute && <>
            <Box sx={{mb: 3}}>
                <Typography variant="subtitle1" component="h2">
                    {t('title data type')}
                </Typography>

                <DatatypeSelector disabled={readOnly} value={datatype} onChange={setDatatype} options={knownDatatypes}/>
            </Box>
            {/* <Collapse in={!!datatype} appear={false}> */}
            {isStringDatatype &&
                <RegexField disabled={readOnly} value={regex} onChange={setRegex}  />
            }
            {/* </Collapse> */}
        </>}

        {(isAttribute || isAssociationEnd) &&
            <Box sx={{mb: 3}}>
                <Typography variant="subtitle1" component="h2">
                    {t('title cardinality')}
                </Typography>

                {cardinality && <CardinalitySelector value={cardinality} onChange={setCardinality} disabled={pimReadOnly} />}
            </Box>
        }

        {isAssociationEnd &&
            <Box sx={{mb: 3}}>
                <Typography variant="subtitle1" component="h2">
                  {t('dematerialization.title')}
                </Typography>

                <Alert severity="info">{t('dematerialization.help')}</Alert>
                <Alert severity={
                    isAssociationDematerialized ? (
                        (cardinality?.cardinalityMax ?? 2) > 1 ? "error" : "success"
                    ): "info"
                }>{t('dematerialization.cardinality restriction')}</Alert>

                {/* "Set dematerialized" checkbox */}
                <FormControlLabel
                    control={<Checkbox
                        checked={isAssociationDematerialized}
                        onChange={event => setIsAssociationDematerialized(event.target.checked)}
                    />}
                    label={t('dematerialization.checkbox') as string}
                />
          </Box>
        }

        {isStringDatatype &&
            <StringExamplesField value={examples} onChange={setExamples} disabled={pimReadOnly} regex={regex} />
        }
    </>
});
