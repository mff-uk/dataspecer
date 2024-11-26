import { ExtendedSemanticModelClass, ExtendedSemanticModelRelationship, ExtendedSemanticModelRelationshipEnd } from "@dataspecer/core-v2/semantic-model/concepts";
import { DataPsmAssociationEnd, DataPsmAttribute, DataPsmClass } from "@dataspecer/core/data-psm/model";
import { useFederatedObservableStore } from "@dataspecer/federated-observable-store-react/store";
import {
    Alert,
    Box,
    Button,
    Card,
    Checkbox,
    Collapse,
    FormControl,
    FormControlLabel,
    FormGroup,
    Grid,
    IconButton, Radio, RadioGroup,
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableRow,
    TextField,
    Typography
} from "@mui/material";
import { isEqual } from "lodash";
import React, { memo, useCallback, useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { TransitionGroup } from "react-transition-group";
import { InfoHelp } from "../../../../components/info-help";
import { useDataPsmAndInterpretedPim } from "../../../hooks/use-data-psm-and-interpreted-pim";
import { Icons } from "../../../icons";
import { CardContent } from "../../../mui-overrides";
import { SetCardinality } from "../../../operations/set-cardinality";
import { SetClassCodelist } from "../../../operations/set-class-codelist";
import { SetDataPsmDatatype } from "../../../operations/set-data-psm-datatype";
import { SetDematerialize } from "../../../operations/set-dematerialize";
import { SetExample } from "../../../operations/set-example";
import { SetInstancesHaveIdentity } from "../../../operations/set-inastances-have-identity";
import { SetIsClosed } from "../../../operations/set-is-closed";
import { SetPimDatatype } from "../../../operations/set-pim-datatype";
import { SetRegex } from "../../../operations/set-regex";
import { SetTechnicalLabel } from "../../../operations/set-technical-label";
import { knownDatatypes } from "../../../utils/known-datatypes";
import { Cardinality, CardinalitySelector, cardinalityFromPim } from "../../helper/cardinality-selector";
import { DatatypeSelector, DatatypeSelectorValueType, getIriFromDatatypeSelectorValue } from "../../helper/datatype-selector";
import { RegexField } from "../../helper/regex-field";
import { useSaveHandler } from "../../helper/save-handler";
import { StringExamplesField } from "../../helper/string-examples-field";

export const RightPanel: React.FC<{ iri: string, close: () => void }> = memo(({iri}) => {
    const store = useFederatedObservableStore();

    const {dataPsmResource: resource, pimResource} = useDataPsmAndInterpretedPim<DataPsmAttribute | DataPsmAssociationEnd | DataPsmClass, ExtendedSemanticModelRelationship | ExtendedSemanticModelClass>(iri);

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

    /**
     * The correct end of the relationship that is being edited.
     * For attributes, this is the second end.
     * For associations this depends on the direction of the association.
     */
    let semanticRelationshipEnd: ExtendedSemanticModelRelationshipEnd | null = null;
    let semanticRelationshipEndIndex: number | null = null;
    if (isAttribute) {
        semanticRelationshipEndIndex = 1;
        semanticRelationshipEnd = (pimResource as ExtendedSemanticModelRelationship).ends[semanticRelationshipEndIndex];
    } else if (isAssociationEnd) {
        semanticRelationshipEndIndex = 1;// todo
        semanticRelationshipEnd = (pimResource as ExtendedSemanticModelRelationship).ends[semanticRelationshipEndIndex];
    }

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
            setCodelistUrl((pimResource as ExtendedSemanticModelClass)?.isCodelist ? ((pimResource as ExtendedSemanticModelClass)?.codelistUrl ?? []) : false);
        }
    }, [pimResource, isClass]);

    useEffect(() => {
        const entity = semanticRelationshipEnd ?? pimResource as ExtendedSemanticModelClass;
        if (isAttribute || isClass) {
            setRegex(entity!.regex ?? "");
            setExamples(entity!.example ?? null);
        }
    }, [semanticRelationshipEnd, pimResource, isAttribute, isClass]);

    const {t} = useTranslation("detail");

    useSaveHandler(
        resource !== null && (resource.dataPsmTechnicalLabel ?? "") !== technicalLabel,
        useCallback(async () => resource && await store.executeComplexOperation(new SetTechnicalLabel(resource.iri as string, technicalLabel)), [resource, store, technicalLabel]),
    );

    const [datatypeLangsText, setDatatypeLangsText] = useState<string>("");
    const setDatatypeLangs = (langs: string[]) => {
        setDatatypeLangsText(langs.join(","));
    }
    const datatypeLangsArray = useMemo(() => datatypeLangsText.split(",").map(lang => lang.trim()).filter(lang => lang.length > 0), [datatypeLangsText]);
    useEffect(() => {
        if (isAttribute) {
            const attr = semanticRelationshipEnd;
            if (attr?.concept === "https://ofn.gov.cz/zdroj/základní-datové-typy/2020-07-01/text") {
                setDatatypeLangs((attr?.languageStringRequiredLanguages ?? []));
            }
        }
    }, [semanticRelationshipEnd, isAttribute]);

    const isLanguageStringDatatype = isAttribute && getIriFromDatatypeSelectorValue(datatype) === "https://ofn.gov.cz/zdroj/základní-datové-typy/2020-07-01/text";
    useSaveHandler(
        resource !== null &&
        isAttribute &&
        (resource.dataPsmDatatype !== getIriFromDatatypeSelectorValue(datatype) ||
        (
            isLanguageStringDatatype &&
            !isEqual(new Set(semanticRelationshipEnd.languageStringRequiredLanguages ?? []), new Set(datatypeLangsArray))
        )
        ),
        useCallback(async () => {
            if (resource) {
                await store.executeComplexOperation(new SetDataPsmDatatype(resource.iri as string, getIriFromDatatypeSelectorValue(datatype)));
                // Todo: let user choose where to set the datatype
                if (pimResource) {
                    await store.executeComplexOperation(new SetPimDatatype(pimResource.id as string, getIriFromDatatypeSelectorValue(datatype), datatypeLangsArray));
                }
            }
        }, [resource, store, datatype, pimResource, datatypeLangsArray]),
    );

    useSaveHandler(
        isClass && !isEqual(codelistUrl, (pimResource as ExtendedSemanticModelClass)?.isCodelist ? ((pimResource as ExtendedSemanticModelClass)?.codelistUrl ?? []) : false),
        useCallback(
            async () => pimResource && await store.executeComplexOperation(new SetClassCodelist(pimResource.id as string, codelistUrl !== false, codelistUrl === false ? [] : codelistUrl)),
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

    let currentRegex = null;
    let currentExamples = null;
    if (isStringDatatype || isClass) {
        if (isClass) {
            currentRegex = (pimResource as ExtendedSemanticModelClass)?.regex ?? null;
            currentExamples = (pimResource as ExtendedSemanticModelClass)?.example ?? null;
        } else if (isAttribute) {
            currentRegex = semanticRelationshipEnd.regex ?? null;
            currentExamples = semanticRelationshipEnd.example ?? null;
        }
    }

    const normalizedRegex = regex === "" ? null : regex;
    useSaveHandler(
        (isStringDatatype || isClass) && normalizedRegex !== currentRegex,
        useCallback(async () => {
            await store.executeComplexOperation(new SetRegex(pimResource?.id as string, normalizedRegex));
        }, [normalizedRegex, pimResource?.id, store])
    );

    const normalizedExamples = examples === null || examples.length === 0 ? null : examples;
    useSaveHandler(
        (isStringDatatype || isClass) && !isEqual(normalizedExamples, currentExamples),
        useCallback(async () => {
            await store.executeComplexOperation(new SetExample(pimResource?.id as string, normalizedExamples));
        }, [normalizedExamples, pimResource?.id, store])
    );

    // endregion regex and examples

    const [cardinality, setCardinality] = useState<Cardinality | null>(null);

    useEffect(() => {
        if (isAttribute || isAssociationEnd) {
            setCardinality(cardinalityFromPim(semanticRelationshipEnd));
        }
    }, [semanticRelationshipEnd, isAttribute, isAssociationEnd]);

    useSaveHandler(
        (isAttribute || isAssociationEnd) && !isEqual(cardinality, cardinalityFromPim(semanticRelationshipEnd)),
        useCallback(
            async () => (isAttribute || isAssociationEnd) && pimResource && cardinality && await store.executeComplexOperation(new SetCardinality(pimResource.id as string, semanticRelationshipEndIndex, cardinality.cardinalityMin, cardinality.cardinalityMax)),
            [semanticRelationshipEndIndex, cardinality, isAttribute, isAssociationEnd, store, pimResource]
        ),
    );

    // region class is closed

    const [isClassClosed, setIsClassClosed] = useState<boolean | null>(null);
    let isSourceClassClosed: boolean | null = null;
    if (isClass) {
        isSourceClassClosed = (resource as unknown as DataPsmClass).dataPsmIsClosed ?? null;
    }

    useEffect(() => {
        if (isClass) {
            setIsClassClosed(isSourceClassClosed);
        }
    }, [isSourceClassClosed, isClass]);

    useSaveHandler(
        isClass && isSourceClassClosed !== isClassClosed,
        useCallback(
            async () => resource && await store.executeComplexOperation(new SetIsClosed(resource.iri as string, isClassClosed)),
            [resource, store, isClassClosed]
        ),
    );

    // endregion class is closed

    // region instances have identity

    const [instancesHaveIdentity, setInstancesHaveIdentity] = useState<"ALWAYS" | "OPTIONAL" | "NEVER" | undefined>(undefined);
    const currentInstancesHaveIdentity = (resource as DataPsmClass).instancesHaveIdentity;
    useEffect(() => {
        if (isClass) {
            setInstancesHaveIdentity(currentInstancesHaveIdentity);
        }
    }, [isClass, resource, currentInstancesHaveIdentity]);

    useSaveHandler(
        isClass && currentInstancesHaveIdentity !== instancesHaveIdentity,
        useCallback(
            async () => resource && await store.executeComplexOperation(new SetInstancesHaveIdentity(resource.iri as string, instancesHaveIdentity)),
            [resource, store, instancesHaveIdentity]
        )
    );

    // endregion instances have identity

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
                {isLanguageStringDatatype &&
                    <TextField
                        margin="dense"
                        label="Required languages"
                        fullWidth
                        variant="filled"
                        value={datatypeLangsText}
                        onChange={e => setDatatypeLangsText(e.target.value)}
                        helperText={<>Comma separated list of languages, for example <code>cs,en</code></>}
                    />
                }
            </Box>
        </>}

        {isClass && <>
             <Typography variant="subtitle1" component="h2">
                {t('instancesHaveIdentity.title')} <InfoHelp text={t('iri parameters help')} />
            </Typography>
            <RadioGroup
                row
                value={instancesHaveIdentity ?? "DEFAULT"}
                onChange={el => setInstancesHaveIdentity(el.target.value === "DEFAULT" ? undefined : el.target.value as "ALWAYS" | "OPTIONAL" | "NEVER" | undefined)}
            >
                <FormControlLabel value="ALWAYS" control={<Radio />} label={t('instancesHaveIdentity.value.always')} />
                <FormControlLabel value="OPTIONAL" control={<Radio />} label={t('instancesHaveIdentity.value.optional')} />
                <FormControlLabel value="NEVER" control={<Radio />} label={t('instancesHaveIdentity.value.never')} />
                <FormControlLabel value="DEFAULT" control={<Radio />} label={t('instancesHaveIdentity.value.default')} />
            </RadioGroup>
        </>}

        {(!isClass || (isClass && instancesHaveIdentity !== "NEVER")) &&
         <>
            {(isStringDatatype || isClass) &&
                <RegexField disabled={readOnly} value={regex} onChange={setRegex} forIri={isClass} />
            }

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
                        isClassClosed ? (
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

            {(isStringDatatype || isClass) &&
                <StringExamplesField value={examples} onChange={setExamples} disabled={pimReadOnly} regex={regex} />
            }

         </>
        }


        {isClass && <FormControl>
            <Typography variant="subtitle1" component="h2">
                {t('class-closed.title')} <InfoHelp text={t('class-closed.help')} />
            </Typography>
            <RadioGroup
                row
                value={isClassClosed === true ? "true" : isClassClosed === false ? "false" : "null"}
                onChange={el => setIsClassClosed(el.target.value === "true" ? true : el.target.value === "false" ? false : null)}
            >
                <FormControlLabel value="true" control={<Radio />} label={t('class-closed.yes')} />
                <FormControlLabel value="false" control={<Radio />} label={t('class-closed.no')} />
                <FormControlLabel value="null" control={<Radio />} label={t('class-closed.implicit')} />
            </RadioGroup>
        </FormControl>}
    </>
});
