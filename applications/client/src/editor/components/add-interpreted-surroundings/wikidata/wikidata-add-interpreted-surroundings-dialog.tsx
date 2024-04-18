import {Button, DialogActions, Grid} from "@mui/material";
import React, {useContext} from "react";
import {LoadingDialog} from "../../helper/LoadingDialog";
import {useTranslation} from "react-i18next";
import {DataPsmClass} from "@dataspecer/core/data-psm/model";
import {useDataPsmAndInterpretedPim} from "../../../hooks/use-data-psm-and-interpreted-pim";
import {PimClass} from "@dataspecer/core/pim/model";
import {ConfigurationContext} from "../../App";
import {dialog} from "../../../dialog";
import {DialogContent, DialogTitle} from "../../detail/common";
import {AddInterpretedSurroundingDialogProperties} from "../default/add-interpreted-surroundings-dialog";
import {WikidataAdapter, isErrorResponse, wdIriToNumId} from "@dataspecer/wikidata-experimental-adapter";
import {useQuery, QueryClientProvider} from "react-query";
import {WikidataAdapterContext} from "./contexts/wikidata-adapter-context";
import {queryClient} from "./contexts/react-query-context";
import { LoadingError } from "./helper/LoadingError";

interface WikidataAddInterpretedSurroundingDialogContentProperties extends AddInterpretedSurroundingDialogProperties {
    pimClass: PimClass;
    dataPsmClass: DataPsmClass;
}

export const WikidataAddInterpretedSurroundingsDialog: React.FC<AddInterpretedSurroundingDialogProperties> = dialog({fullWidth: true, maxWidth: "lg"}, (props) => {
    const {cim} = React.useContext(ConfigurationContext);
    const {pimResource: pimClass, dataPsmResource: dataPsmClass} = useDataPsmAndInterpretedPim<DataPsmClass, PimClass>(props.dataPsmClassIri);
    const cimClassIri = pimClass?.pimInterpretation;
    
    if (props.isOpen && cimClassIri) {
        const wikidataAdapter = cim.cimAdapter as WikidataAdapter; 
        return (
            <WikidataAdapterContext.Provider value={{iriProvider: cim.iriProvider, wdAdapter: wikidataAdapter}}>
                <QueryClientProvider client={queryClient}>
                    <WikidataAddInterpretedSurroundingsDialogContent {...props} pimClass={pimClass} dataPsmClass={dataPsmClass} />
                </QueryClientProvider>
            </WikidataAdapterContext.Provider>
        );
    }

    return null;
});

const WikidataAddInterpretedSurroundingsDialogContent: React.FC<WikidataAddInterpretedSurroundingDialogContentProperties> = ({isOpen, close, selected, pimClass, dataPsmClass}) => {
    const {t, i18n} = useTranslation("interpretedSurrounding");
    const adapterContext = useContext(WikidataAdapterContext);
    const rootSurroundingsQuery = useQuery(['surroundings', pimClass.pimInterpretation], async () => {
            return await adapterContext.wdAdapter.connector.getClassSurroundings(wdIriToNumId(pimClass.pimInterpretation));
    });
    
    const queryFailed = !rootSurroundingsQuery.isLoading && (rootSurroundingsQuery.isError || isErrorResponse(rootSurroundingsQuery.data));

    return (<>
        <DialogTitle id="customized-dialog-title" close={close}>
            {t("title")}
        </DialogTitle>
        <DialogContent dividers>
            {rootSurroundingsQuery.isLoading && <LoadingDialog />}
            {queryFailed && <LoadingError />} 
            {!rootSurroundingsQuery.isLoading && !queryFailed && 
                <Grid container spacing={3}>
                    <Grid item xs={3} sx={{borderRight: theme => "1px solid " + theme.palette.divider}}>
                        ancestors                    
                    </Grid>
                    <Grid item xs={9}>
                        surroundings
                    </Grid>
                </Grid>}
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
}