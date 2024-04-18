import {Button, Checkbox, DialogActions, Grid, IconButton, ListItem, ListItemIcon, ListItemText, Typography} from "@mui/material";
import React, {useCallback, useEffect, useState} from "react";
import {SlovnikGovCzGlossary} from "../../slovnik.gov.cz/SlovnikGovCzGlossary";
import {LoadingDialog} from "../../helper/LoadingDialog";
import {useTranslation} from "react-i18next";
import {DataPsmClass} from "@dataspecer/core/data-psm/model";
import {CoreResource, CoreResourceReader, ReadOnlyFederatedStore} from "@dataspecer/core/core";
import {useDataPsmAndInterpretedPim} from "../../../hooks/use-data-psm-and-interpreted-pim";
import {PimAssociation, PimAssociationEnd, PimAttribute, PimClass} from "@dataspecer/core/pim/model";
import {ConfigurationContext} from "../../App";
import {dialog} from "../../../dialog";
import {DialogContent, DialogTitle} from "../../detail/common";
import { AddInterpretedSurroundingDialogProperties } from "../default/add-interpreted-surroundings-dialog";
import { WikidataAdapter } from "@dataspecer/wikidata-experimental-adapter";

export const WikidataAddInterpretedSurroundingsDialog: React.FC<AddInterpretedSurroundingDialogProperties> = dialog({fullWidth: true, maxWidth: "lg"}, ({isOpen, close, selected, dataPsmClassIri}) => {
    const {t, i18n} = useTranslation("interpretedSurrounding");

    const {pimResource: pimClass, dataPsmResource: dataPsmClass} = useDataPsmAndInterpretedPim<DataPsmClass, PimClass>(dataPsmClassIri);
    const cimClassIri = pimClass?.pimInterpretation;

    const [currentCimClassIri, setCurrentCimClassIri] = useState<string>("");
    const [selectedResources, setSelectedResources] = useState<[string, boolean][]>([]);
    const [surroundings, setSurroundings] = useState<Record<string, CoreResourceReader | undefined>>({});

    const {cim} = React.useContext(ConfigurationContext);
    
    // Opens the root class CIM
    useEffect(() => {
        if (isOpen && cimClassIri) {
            setCurrentCimClassIri(cimClassIri);
        } else {
            setSelectedResources([]);
            setSurroundings({});
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isOpen, cimClassIri]); // change of switchCurrentCimClassIri should not trigger this effect

    if (!cimClassIri) return null;

    return (<>
        <DialogTitle id="customized-dialog-title" close={close}>
            {t("title")}
        </DialogTitle>
        <DialogContent dividers>
            <Grid container spacing={3}>
                <Grid item xs={3} sx={{borderRight: theme => "1px solid " + theme.palette.divider}}>
                    ancestors                    
                </Grid>
                <Grid item xs={9}>
                    surroundings
                </Grid>
            </Grid>
        </DialogContent>
        <DialogActions>
            <Button onClick={close}>{t("close button")}</Button>
            <Button
                onClick={async () => {
                    close();
                }}
                disabled={true}>
                {t("confirm button")} ({0})
            </Button>
        </DialogActions>
    </>);
});
