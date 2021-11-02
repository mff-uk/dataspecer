import React, {memo, useCallback, useEffect, useState} from "react";
import {DataPsmAssociationEnd, DataPsmAttribute} from "model-driven-data/data-psm/model";
import {StoreContext} from "../../App";
import {SetTechnicalLabel} from "../../../operations/set-technical-label";
import {SetDataPsmDatatype} from "../../../operations/set-data-psm-datatype";
import {Box, Button, Grid, TextField} from "@mui/material";
import {useResource} from "../../../hooks/useResource";
import {useTranslation} from "react-i18next";
import {
    DatatypeSelector,
    DatatypeSelectorValueType,
    getIriFromDatatypeSelectorValue
} from "../../helper/datatype-selector";
import {knownDatatypes} from "../../../utils/known-datatypes";

export const RightPanel: React.FC<{ iri: string, close: () => void }> = memo(({iri, close}) => {
    const {store} = React.useContext(StoreContext);

    const {resource: dataPsmAttributeOrAssociation} = useResource<DataPsmAttribute | DataPsmAssociationEnd>(iri);
    const isAttribute = DataPsmAttribute.is(dataPsmAttributeOrAssociation);

    const [technicalLabel, setTechnicalLabel] = useState<string>("");
    const [datatype, setDatatype] = useState<DatatypeSelectorValueType>("");

    useEffect(() => {
        setTechnicalLabel(dataPsmAttributeOrAssociation?.dataPsmTechnicalLabel ?? "");

        if (isAttribute) {
            const datatype = dataPsmAttributeOrAssociation?.dataPsmDatatype ?? "";
            const foundDatatype = knownDatatypes.find(type => type.iri === datatype);
            setDatatype(foundDatatype ?? datatype);
        }
    }, [dataPsmAttributeOrAssociation]);

    const {t} = useTranslation("detail");

    /**
     * Action that happens after user click on confirm changes button.
     */
    const onConfirm = useCallback(async () => {
        if (dataPsmAttributeOrAssociation) {
            if (dataPsmAttributeOrAssociation.dataPsmTechnicalLabel !== technicalLabel) {
                await store.executeOperation(new SetTechnicalLabel(dataPsmAttributeOrAssociation.iri as string, technicalLabel));
            }

            if (isAttribute && dataPsmAttributeOrAssociation.dataPsmDatatype !== getIriFromDatatypeSelectorValue(datatype)) {
                await store.executeOperation(new SetDataPsmDatatype(dataPsmAttributeOrAssociation.iri as string, getIriFromDatatypeSelectorValue(datatype) ?? ""));
            }
        }

        close();
    }, [dataPsmAttributeOrAssociation?.iri, technicalLabel, datatype]);

    const changed = (dataPsmAttributeOrAssociation &&
        ((dataPsmAttributeOrAssociation.dataPsmTechnicalLabel ?? "") === (technicalLabel ?? "")) &&
        (!isAttribute || (dataPsmAttributeOrAssociation.dataPsmDatatype ?? "") === (getIriFromDatatypeSelectorValue(datatype) ?? ""))) ?? false;

    return <>

        <TextField
            autoFocus
            margin="dense"
            id="name"
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
            <DatatypeSelector value={datatype} onChange={setDatatype} options={knownDatatypes} onEnter={event => {
                event.preventDefault();
                onConfirm().then();
            }} />
        </Box>}

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
    </>
});
