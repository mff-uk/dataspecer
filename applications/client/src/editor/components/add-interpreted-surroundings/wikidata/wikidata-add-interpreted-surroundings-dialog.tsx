import { Button, DialogActions, Grid } from "@mui/material";
import React, { useContext, useState } from "react";
import { useTranslation } from "react-i18next";
import { DataPsmClass } from "@dataspecer/core/data-psm/model";
import { useDataPsmAndInterpretedPim } from "../../../hooks/use-data-psm-and-interpreted-pim";
import { PimClass } from "@dataspecer/core/pim/model";
import { ConfigurationContext } from "../../App";
import { dialog } from "../../../dialog";
import { DialogContent, DialogTitle } from "../../detail/common";
import { AddInterpretedSurroundingDialogProperties } from "../default/add-interpreted-surroundings-dialog";
import {
    WdEntityId,
    WikidataAdapter,
    wdIriToNumId,
} from "@dataspecer/wikidata-experimental-adapter";
import { QueryClientProvider } from "react-query";
import { WikidataAdapterContext } from "./contexts/wikidata-adapter-context";
import { queryClient } from "./contexts/react-query-context";
import { WikidataAncestorsSelectorPanel } from "./wikidata-ancestors-selector-panel/wikidata-ancestors-selector-panel";
import { useWdGetSurroundings } from "./hooks/use-wd-get-surroundings";
import { WikidataLoading } from "./helpers/wikidata-loading";
import { WikidataLoadingError } from "./helpers/wikidata-loading-error";
import { WdPropertySelectionContext } from "./contexts/wd-property-selection-context";
import { useWdPropertySelection } from "./hooks/use-wd-property-selection";
import { ReadOnlyMemoryStore } from "@dataspecer/core/core/index";
import { transformSelectedSurroundings } from "./property-selection-record/transform-selected-surroundings";
import { WikidataPropertiesPanel } from "./wikidata-properties-panel/wikidata-properties-panel";

interface WikidataAddInterpretedSurroundingDialogContentProps
    extends AddInterpretedSurroundingDialogProperties {
    pimClass: PimClass;
    dataPsmClass: DataPsmClass;
    wdRootClassId: WdEntityId;
}

export const WikidataAddInterpretedSurroundingsDialog: React.FC<AddInterpretedSurroundingDialogProperties> =
    dialog({ fullWidth: true, maxWidth: "xl", PaperProps: { sx: { height: "90%" } } }, (props) => {
        const { cim } = React.useContext(ConfigurationContext);
        const { pimResource: pimClass, dataPsmResource: dataPsmClass } =
            useDataPsmAndInterpretedPim<DataPsmClass, PimClass>(props.dataPsmClassIri);
        const cimClassIri = pimClass?.pimInterpretation;

        if (props.isOpen && cimClassIri) {
            const wikidataAdapter = cim.cimAdapter as WikidataAdapter;
            return (
                <WikidataAdapterContext.Provider
                    value={{ iriProvider: cim.iriProvider, wdAdapter: wikidataAdapter }}
                >
                    <QueryClientProvider client={queryClient}>
                        <WikidataAddInterpretedSurroundingsDialogContent
                            {...props}
                            pimClass={pimClass}
                            dataPsmClass={dataPsmClass}
                            wdRootClassId={wdIriToNumId(pimClass.pimInterpretation)}
                        />
                    </QueryClientProvider>
                </WikidataAdapterContext.Provider>
            );
        }

        return null;
    });

const WikidataAddInterpretedSurroundingsDialogContent: React.FC<
    WikidataAddInterpretedSurroundingDialogContentProps
> = ({ isOpen, close, selected, pimClass, dataPsmClass, wdRootClassId }) => {
    const { t } = useTranslation("interpretedSurrounding");
    const adapterContext = useContext(WikidataAdapterContext);
    const propertyWdSelectionContextValue = useWdPropertySelection();
    const [selectedWdClassId, setSelectedWdClassId] = useState<WdEntityId>(wdRootClassId);
    const {
        wdClassSurroundings: rootWdClassSurroundings,
        isLoading,
        isError,
    } = useWdGetSurroundings(wdRootClassId);

    return (
        <WdPropertySelectionContext.Provider value={propertyWdSelectionContextValue}>
            <DialogTitle id='customized-dialog-title' close={close}>
                {t("title")}
            </DialogTitle>
            <DialogContent dividers>
                {isLoading && <WikidataLoading />}
                {isError && (
                    <WikidataLoadingError
                        errorMessage={t("no ancestors no associations no attributes")}
                    />
                )}
                {!isLoading && !isError && (
                    <Grid container spacing={3}>
                        <Grid
                            item
                            xs={3}
                            sx={{ borderRight: (theme) => "1px solid " + theme.palette.divider }}
                            >
                            <WikidataAncestorsSelectorPanel
                                rootWdClassSurroundings={rootWdClassSurroundings}
                                selectedWdClassId={selectedWdClassId}
                                setSelectedWdClassId={setSelectedWdClassId}
                                />
                        </Grid>
                        <Grid item xs={9}>
                            <WikidataPropertiesPanel
                                key={selectedWdClassId.toString()}
                                selectedWdClassId={selectedWdClassId}
                                rootWdClassSurroundings={rootWdClassSurroundings}
                                />
                        </Grid>
                    </Grid>
                )}
            </DialogContent>
            <DialogActions>
                <Button onClick={close}>{t("close button")}</Button>
                <Button
                    onClick={async () => {
                        const [resourcesToAdd, resources] = transformSelectedSurroundings(
                            propertyWdSelectionContextValue.wdPropertySelectionRecords, adapterContext, rootWdClassSurroundings);
                        selected({
                            resourcesToAdd,
                            sourcePimModel: ReadOnlyMemoryStore.create(resources),
                            forDataPsmClass: dataPsmClass
                        })
                        close();
                    }}
                    disabled={propertyWdSelectionContextValue.wdPropertySelectionRecords.length === 0}
                    >
                    {t("confirm button")}
                </Button>
            </DialogActions>
        </WdPropertySelectionContext.Provider>
    );
};

