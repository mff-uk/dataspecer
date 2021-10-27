import React, {memo, useCallback, useState} from "react";
import {DataPsmAssociationEnd, DataPsmAttribute} from "model-driven-data/data-psm/model";
import {StoreContext} from "../../App";
import {SetTechnicalLabel} from "../../../operations/set-technical-label";
import {SetDataPsmDatatype} from "../../../operations/set-data-psm-datatype";
import {Button, Grid, TextField} from "@mui/material";
import {useResource} from "../../../hooks/useResource";
import {useTranslation} from "react-i18next";

export const RightPanel: React.FC<{ iri: string, close: () => void }> = memo(({iri, close}) => {
    const {store} = React.useContext(StoreContext);

    const {resource: dataPsmAttributeOrAssociation} = useResource<DataPsmAttribute | DataPsmAssociationEnd>(iri);
    const isAttribute = DataPsmAttribute.is(dataPsmAttributeOrAssociation);

    const [technicalLabel, setTechnicalLabel] = useState<string>(dataPsmAttributeOrAssociation?.dataPsmTechnicalLabel ?? "");
    const [datatype, setDatatype] = useState<string>(isAttribute ? (dataPsmAttributeOrAssociation.dataPsmDatatype ?? "") : "");

    const {t} = useTranslation("detail");

    /**
     * Action that happens after user click on confirm changes button.
     */
    const onConfirm = useCallback(async () => {
        if (dataPsmAttributeOrAssociation) {
            if (dataPsmAttributeOrAssociation.dataPsmTechnicalLabel !== technicalLabel) {
                await store.executeOperation(new SetTechnicalLabel(dataPsmAttributeOrAssociation.iri as string, technicalLabel));
            }

            if (isAttribute && dataPsmAttributeOrAssociation.dataPsmDatatype !== datatype) {
                await store.executeOperation(new SetDataPsmDatatype(dataPsmAttributeOrAssociation.iri as string, datatype));
            }
        }

        close();
    }, [dataPsmAttributeOrAssociation?.iri, technicalLabel, datatype]);

    const changed = (dataPsmAttributeOrAssociation && (dataPsmAttributeOrAssociation.dataPsmTechnicalLabel === technicalLabel) && (!isAttribute || dataPsmAttributeOrAssociation.dataPsmDatatype === datatype)) ?? false;

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

        {isAttribute &&
            <TextField
                margin="dense"
                label={t('label datatype')}
                fullWidth
                variant="filled"
                value={datatype}
                onChange={event => setDatatype(event.target.value)}
                onKeyDown={event => {
                    if (event.key === "Enter") {
                        event.preventDefault();
                        onConfirm().then();
                    }
                }}
            />
        }

        {/*<FormControl fullWidth variant="filled" sx={{ mt: 2 }}>
         <InputLabel id="demo-simple-select-label">Datatype</InputLabel>
         <Select
         id="demo-simple-select"
         labelId="demo-simple-select-label"
         label="Datatype"
         fullWidth
         >
         <MenuItem value={10}>Ten</MenuItem>
         <MenuItem value={20}>Twenty</MenuItem>
         <MenuItem value={30}>Thirty</MenuItem>
         </Select>
         </FormControl>*/}

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
