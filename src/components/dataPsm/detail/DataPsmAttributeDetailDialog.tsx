import React from "react";
import {Dialog, DialogContent, DialogTitle, Grid, IconButton, LinearProgress, Typography} from "@material-ui/core";
import {useTranslation} from "react-i18next";
import {useDataPsmAndInterpretedPim} from "../../../hooks/useDataPsmAndInterpretedPim";
import {DataPsmAttribute} from "model-driven-data/data-psm/model";
import {PimAttribute} from "model-driven-data/pim/model";
import {ComponentDataPsmAttribute} from "./components/ComponentDataPsmAttribute";
import {ComponentPimAttribute} from "./components/ComponentPimAttribute";
import {ComponentCimResource} from "./components/ComponentCimResource";
import {useDetailStyles} from "./dataPsmDetailCommon";
import CloseIcon from '@material-ui/icons/Close';


interface Parameters {
    dataPsmAttributeIri: string,

    isOpen: boolean,
    close: () => void,
}

export const DataPsmAttributeDetailDialog: React.FC<Parameters> = ({dataPsmAttributeIri, isOpen, close}) => {
    const {dataPsmResource: dataPsmAttribute, pimResource: pimAttribute, isLoading} = useDataPsmAndInterpretedPim<DataPsmAttribute, PimAttribute>(dataPsmAttributeIri);
    const {t} = useTranslation("psmAttribute-dialog");
    const styles = useDetailStyles();

    return <Dialog onClose={close} open={isOpen} maxWidth={"lg"} fullWidth >
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
                            Data PSM attribute
                        </Typography>
                        {dataPsmAttribute && <ComponentDataPsmAttribute dataPsmAttribute={dataPsmAttribute} isLoading={isLoading}/>}
                    </Grid>
                </Grid>
                <Grid container spacing={2} item xs={6}>
                    <Grid item xs={12}>
                        <Typography variant="h5" component="h2">
                            PIM attribute interpretation
                        </Typography>
                        {pimAttribute && <ComponentPimAttribute pimAttribute={pimAttribute} isLoading={isLoading}/>}
                    </Grid>

                    <Grid item xs={12}>
                        <Typography variant="h5" component="h2" className={"mt-3"}>
                            CIM attribute interpretation
                        </Typography>
                        {pimAttribute && pimAttribute.pimInterpretation && <ComponentCimResource cimResourceIri={pimAttribute.pimInterpretation}/>}
                    </Grid>

                </Grid>
            </Grid>
        </DialogContent>
    </Dialog>;
};
