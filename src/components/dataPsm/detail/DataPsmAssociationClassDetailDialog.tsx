import React from "react";
import {Dialog, DialogContent, DialogTitle, Grid, IconButton, LinearProgress, Typography} from "@mui/material";
import {useTranslation} from "react-i18next";
import {useDataPsmAndInterpretedPim} from "../../../hooks/useDataPsmAndInterpretedPim";
import {DataPsmAssociationEnd, DataPsmClass} from "model-driven-data/data-psm/model";
import {PimAssociation, PimClass} from "model-driven-data/pim/model";
import {ComponentDataPsmResource} from "./components/ComponentDataPsmResource";
import {ComponentPimResource} from "./components/ComponentPimResource";
import {ComponentCimResource} from "./components/ComponentCimResource";
import {useDetailStyles} from "./dataPsmDetailCommon";
import CloseIcon from '@mui/icons-material/Close';


interface Parameters {
    dataPsmAssociationIri: string,
    dataPsmClassIri: string,

    isOpen: boolean,
    close: () => void,
}

export const DataPsmAssociationClassDetailDialog: React.FC<Parameters> = ({dataPsmAssociationIri, dataPsmClassIri, isOpen, close}) => {
    const {dataPsmResource: dataPsmAssociation, pimResource: pimAssociation, isLoading: isAssociationLoading} = useDataPsmAndInterpretedPim<DataPsmAssociationEnd, PimAssociation>(dataPsmAssociationIri);
    const {dataPsmResource: dataPsmClass, pimResource: pimClass, isLoading: isClassLoading} = useDataPsmAndInterpretedPim<DataPsmClass, PimClass>(dataPsmClassIri);
    const isLoading = isAssociationLoading || isClassLoading;

    const {t} = useTranslation("psmAttribute-dialog");
    const styles = useDetailStyles();

    return (
        <Dialog onClose={close} open={isOpen} maxWidth={"lg"} fullWidth>
            <DialogTitle className={styles.dialogTitle}>
                <Typography variant={"h6"}>{t("title")}</Typography>
                <IconButton
                    aria-label="close"
                    onClick={close}
                    className={styles.closeButton}
                    size="large">
                    <CloseIcon />
                </IconButton>
            </DialogTitle>
            <DialogContent>
                {isLoading && <LinearProgress />}

                

                <Grid container spacing={2} alignItems="flex-start" className={styles.fullContainer}>
                    <Grid container spacing={2} item xs={6}>
                        <Grid item xs={12}>
                            <Typography variant="h5" component="h2" gutterBottom>
                                Data PSM association
                            </Typography>
                            {dataPsmAssociation && <ComponentDataPsmResource dataPsmResource={dataPsmAssociation} isLoading={isLoading} showIri showTechnicalLabel showLabelAndDescription />}
                        </Grid>

                        <Grid item xs={12}>
                            <Typography variant="h5" component="h2" gutterBottom>
                                PIM association interpretation
                            </Typography>
                            {pimAssociation && <ComponentPimResource pimResource={pimAssociation} isLoading={isLoading} showIri showLabelAndDescription />}
                        </Grid>

                        <Grid item xs={12}>
                            <Typography variant="h5" component="h2" gutterBottom className={"mt-3"}>
                                CIM association interpretation
                            </Typography>
                            {pimAssociation && pimAssociation.pimInterpretation && <ComponentCimResource cimResourceIri={pimAssociation.pimInterpretation}/>}
                        </Grid>
                    </Grid>
                    <Grid container spacing={2} item xs={6}>
                        <Grid item xs={12}>
                            <Typography variant="h5" component="h2" gutterBottom>
                                Data PSM class
                            </Typography>
                            {dataPsmClass && <ComponentDataPsmResource dataPsmResource={dataPsmClass} isLoading={isLoading} showIri showLabelAndDescription />}
                        </Grid>

                        <Grid item xs={12}>
                            <Typography variant="h5" component="h2" gutterBottom>
                                PIM class interpretation
                            </Typography>
                            {pimClass && <ComponentPimResource pimResource={pimClass} isLoading={isLoading} showIri showLabelAndDescription/>}
                        </Grid>

                        <Grid item xs={12}>
                            <Typography variant="h5" component="h2" gutterBottom className={"mt-3"}>
                                CIM class interpretation
                            </Typography>
                            {pimClass && pimClass.pimInterpretation && <ComponentCimResource cimResourceIri={pimClass.pimInterpretation}/>}
                        </Grid>
                    </Grid>
                </Grid>
            </DialogContent>
        </Dialog>
    );
};
