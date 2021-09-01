import React from "react";
import {Dialog, DialogContent, DialogTitle, Grid, IconButton, LinearProgress, Typography} from "@material-ui/core";
import {useTranslation} from "react-i18next";
import {useDataPsmAndInterpretedPim} from "../../../hooks/useDataPsmAndInterpretedPim";
import {DataPsmAssociationEnd, DataPsmClass} from "model-driven-data/data-psm/model";
import {PimAssociation, PimClass} from "model-driven-data/pim/model";
import {ComponentDataPsmAttribute} from "./components/ComponentDataPsmAttribute";
import {ComponentPimAttribute} from "./components/ComponentPimAttribute";
import {ComponentCimResource} from "./components/ComponentCimResource";
import {useDetailStyles} from "./dataPsmDetailCommon";
import CloseIcon from '@material-ui/icons/Close';


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

    return <Dialog onClose={close} open={isOpen} maxWidth={"lg"} fullWidth>
        <DialogTitle disableTypography className={styles.dialogTitle}>
            <Typography variant={"h6"}>{t("title")}</Typography>
            <IconButton aria-label="close" onClick={close} className={styles.closeButton}>
                <CloseIcon />
            </IconButton>
        </DialogTitle>
        <DialogContent>
            {isLoading && <LinearProgress />}

            <Grid container spacing={2} alignItems="flex-start" className={styles.fullContainer}>
                <Grid container spacing={2} item xs={6}>
                    <Grid item xs={12}>
                        <Typography variant="h5" component="h2">
                            Data PSM association
                        </Typography>
                        {dataPsmAssociation && <ComponentDataPsmAttribute dataPsmAttribute={dataPsmAssociation} isLoading={isLoading}/>}
                    </Grid>

                    <Grid item xs={12}>
                        <Typography variant="h5" component="h2">
                            PIM association interpretation
                        </Typography>
                        {pimAssociation && <ComponentPimAttribute pimAttribute={pimAssociation} isLoading={isLoading}/>}
                    </Grid>

                    <Grid item xs={12}>
                        <Typography variant="h5" component="h2" className={"mt-3"}>
                            CIM association interpretation
                        </Typography>
                        {pimAssociation && pimAssociation.pimInterpretation && <ComponentCimResource cimResourceIri={pimAssociation.pimInterpretation}/>}
                    </Grid>
                </Grid>
                <Grid container spacing={2} item xs={6}>
                    <Grid item xs={12}>
                        <Typography variant="h5" component="h2">
                            Data PSM class
                        </Typography>
                        {dataPsmClass && <ComponentDataPsmAttribute dataPsmAttribute={dataPsmClass} isLoading={isLoading}/>}
                    </Grid>

                    <Grid item xs={12}>
                        <Typography variant="h5" component="h2">
                            PIM class interpretation
                        </Typography>
                        {pimClass && <ComponentPimAttribute pimAttribute={pimClass} isLoading={isLoading}/>}
                    </Grid>

                    <Grid item xs={12}>
                        <Typography variant="h5" component="h2" className={"mt-3"}>
                            CIM class interpretation
                        </Typography>
                        {pimClass && pimClass.pimInterpretation && <ComponentCimResource cimResourceIri={pimClass.pimInterpretation}/>}
                    </Grid>
                </Grid>
            </Grid>
        </DialogContent>
    </Dialog>;
};
