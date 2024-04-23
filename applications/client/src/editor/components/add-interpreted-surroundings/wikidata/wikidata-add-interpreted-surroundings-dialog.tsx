import {Button, DialogActions, Grid} from "@mui/material";
import React, {useState} from "react";
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
import { WikidataAncestorsSelectorPanel } from "./wikidata-ancestors-selector-panel";
import { useWdGetSurroundings } from "./hooks/use-wd-get-surroundings";
import { WikidataPropertiesPanel } from "./wikidata-properties-panel";
import { WikidataLoading } from "./helpers/wikidata-loading";
import { WikidataLoadingError } from "./helpers/wikidata-loading-error";

interface WikidataAddInterpretedSurroundingDialogContentProps extends AddInterpretedSurroundingDialogProperties {
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

const WikidataAddInterpretedSurroundingsDialogContent: React.FC<WikidataAddInterpretedSurroundingDialogContentProps> = ({isOpen, close, selected, pimClass, dataPsmClass, wdRootClassId}) => {
    const {t} = useTranslation("interpretedSurrounding");
    const [selectedWdClassId, setSelectedWdClassId] = useState<WdEntityId>(wdRootClassId);
    const {wdClassSurroundings: rootWdClassSurroundings, isLoading, isError} = useWdGetSurroundings(wdRootClassId);
    
    return (<>
        <DialogTitle id="customized-dialog-title" close={close}>
            {t("title")}
        </DialogTitle>
        <DialogContent dividers>
            {isLoading && <WikidataLoading />}
            {isError && <WikidataLoadingError errorMessage={t("no ancestors no associations no attributes")} />} 
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
                        <WikidataPropertiesPanel 
                            selectedWdClassId={selectedWdClassId} 
                            rootWdClassSurroundings={rootWdClassSurroundings} 
                        />
                    </Grid>
                </Grid>}
        </DialogContent>
        <DialogActions>
            <Button>{t("show selected")} ({0})</Button>
            <Button onClick={close}>{t("close button")}</Button>
            <Button
                onClick={async () => {
                    close();
                }}
                disabled={true}>
                {t("confirm button")}
            </Button>
        </DialogActions>
    </>);
}