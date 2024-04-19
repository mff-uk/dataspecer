import {Button, DialogActions, Grid} from "@mui/material";
import React, {useState} from "react";
import {LoadingDialog} from "../../helper/LoadingDialog";
import {useTranslation} from "react-i18next";
import {DataPsmClass} from "@dataspecer/core/data-psm/model";
import {useDataPsmAndInterpretedPim} from "../../../hooks/use-data-psm-and-interpreted-pim";
import {PimClass} from "@dataspecer/core/pim/model";
import {ConfigurationContext} from "../../App";
import {dialog} from "../../../dialog";
import {DialogContent, DialogTitle} from "../../detail/common";
import {AddInterpretedSurroundingDialogProperties} from "../default/add-interpreted-surroundings-dialog";
import {WdEntityId, WikidataAdapter, wdIriToNumId} from "@dataspecer/wikidata-experimental-adapter";
import {QueryClientProvider} from "react-query";
import {WikidataAdapterContext} from "./contexts/wikidata-adapter-context";
import {queryClient} from "./contexts/react-query-context";
import { LoadingError } from "./helper/loading-error";
import { WikidataAncestorsSelectorPanel } from "./wikidata-ancestors-selector-panel";
import { useWdGetSurroundings } from "./helper/use-get-surroundings";
import { WikidataAssociationsPanel } from "./wikidata-associations-panel";

interface WikidataAddInterpretedSurroundingDialogContentProperties extends AddInterpretedSurroundingDialogProperties {
    pimClass: PimClass;
    dataPsmClass: DataPsmClass;
    wdRootClassId: WdEntityId;
}

export const WikidataAddInterpretedSurroundingsDialog: React.FC<AddInterpretedSurroundingDialogProperties> = dialog({fullWidth: true, maxWidth: "lg", PaperProps: { sx: { height: '90%' } } }, (props) => {
    const {cim} = React.useContext(ConfigurationContext);
    const {pimResource: pimClass, dataPsmResource: dataPsmClass} = useDataPsmAndInterpretedPim<DataPsmClass, PimClass>(props.dataPsmClassIri);
    const cimClassIri = pimClass?.pimInterpretation;
    
    if (props.isOpen && cimClassIri) {
        const wikidataAdapter = cim.cimAdapter as WikidataAdapter; 
        return (
            <WikidataAdapterContext.Provider value={{iriProvider: cim.iriProvider, wdAdapter: wikidataAdapter}}>
                <QueryClientProvider client={queryClient}>
                    <WikidataAddInterpretedSurroundingsDialogContent {...props} pimClass={pimClass} dataPsmClass={dataPsmClass} wdRootClassId={wdIriToNumId(pimClass.pimInterpretation)}/>
                </QueryClientProvider>
            </WikidataAdapterContext.Provider>
        );
    }

    return null;
});

const WikidataAddInterpretedSurroundingsDialogContent: React.FC<WikidataAddInterpretedSurroundingDialogContentProperties> = ({isOpen, close, selected, pimClass, dataPsmClass, wdRootClassId}) => {
    const {t, i18n} = useTranslation("interpretedSurrounding");
    const [selectedWdClassId, setSelectedWdClassId] = useState<WdEntityId>(wdRootClassId);
    const {wdClassSurroundings: rootWdClassSurroundings, isLoading, isError} = useWdGetSurroundings(wdRootClassId);
    
    return (<>
        <DialogTitle id="customized-dialog-title" close={close}>
            {t("title")}
        </DialogTitle>
        <DialogContent dividers>
            {isLoading && <LoadingDialog />}
            {isError && <LoadingError />} 
            {!isLoading && !isError && 
                <Grid container spacing={3}>
                    <Grid item xs={3} sx={{borderRight: theme => "1px solid " + theme.palette.divider}}>
                        <WikidataAncestorsSelectorPanel 
                            rootWdClassSurroundings={rootWdClassSurroundings} 
                            selectedWdClassId={selectedWdClassId} 
                            setSelectedWdClassId={setSelectedWdClassId}
                        />                    
                    </Grid>
                    <Grid item xs={9}>
                        <WikidataAssociationsPanel 
                            selectedWdClassId={selectedWdClassId} 
                            rootWdClassSurroundings={rootWdClassSurroundings} 
                        />
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