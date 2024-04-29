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
    WdClassSurroundings,
    WdEntityId,
    WdEntityIri,
    WdUnderlyingType,
    WikidataAdapter,
    wdIriToNumId,
} from "@dataspecer/wikidata-experimental-adapter";
import { QueryClientProvider } from "react-query";
import { WikidataAdapterContext, WikidataAdapterContextValue } from "./contexts/wikidata-adapter-context";
import { queryClient } from "./contexts/react-query-context";
import { WikidataAncestorsSelectorPanel } from "./wikidata-ancestors-selector-panel";
import { useWdGetSurroundings } from "./hooks/use-wd-get-surroundings";
import { WikidataPropertiesPanel } from "./wikidata-properties-panel";
import { WikidataLoading } from "./helpers/wikidata-loading";
import { WikidataLoadingError } from "./helpers/wikidata-loading-error";
import { WdPropertySelectionContext } from "./contexts/wd-property-selection-context";
import { useWdPropertySelection } from "./hooks/use-wd-property-selection";
import { WdPropertySelectionRecord } from "./property-selection-record";
import { CoreResource } from "@dataspecer/core/core/core-resource";
import { ReadOnlyMemoryStore } from "@dataspecer/core/core/index";
import { WikidataPropertyType } from "./wikidata-properties/items/wikidata-property-item";

interface WikidataAddInterpretedSurroundingDialogContentProps
    extends AddInterpretedSurroundingDialogProperties {
    pimClass: PimClass;
    dataPsmClass: DataPsmClass;
    wdRootClassId: WdEntityId;
}

export const WikidataAddInterpretedSurroundingsDialog: React.FC<AddInterpretedSurroundingDialogProperties> =
    dialog({ fullWidth: true, maxWidth: "lg", PaperProps: { sx: { height: "90%" } } }, (props) => {
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

function transformSelectedSurroundings(
    selection: WdPropertySelectionRecord[], adapterContext: WikidataAdapterContextValue, surroundings: WdClassSurroundings
): [[string, boolean][], { [iri: string]: CoreResource }] {
    const resourcesToAdd: [string, boolean][] = [];
    const resources: { [iri: string]: CoreResource } = {};
    const loadedClassesSet = new Set<WdEntityId>();
    const loadedPropertiesSet = new Set<WdEntityIri>();

    // Load hierarchy
    adapterContext.wdAdapter.tryLoadClassesToResources(
        [surroundings.startClassId, ...surroundings.parentsIds], 
        resources, 
        loadedClassesSet, 
        surroundings.classesMap
    );

    // Load Properties with endpoints
    selection.forEach((record) => {
        if (record.wdProperty.underlyingType !== WdUnderlyingType.ENTITY) {
            transformSelectedAttribute(record, adapterContext, resources, resourcesToAdd, loadedClassesSet, loadedPropertiesSet);
        } else {
            transformSelectedAssociation(record, adapterContext, resources, resourcesToAdd, loadedClassesSet, loadedPropertiesSet);
        }
    });

    return [resourcesToAdd, resources];
}

function transformSelectedAttribute(
    record: WdPropertySelectionRecord, 
    adapterContext: WikidataAdapterContextValue, 
    resources: { [iri: string]: CoreResource }, 
    resourcesToAdd: [string, boolean][],
    loadedClassesSet: Set<WdEntityId>,
    loadedPropertiesSet: Set<WdEntityIri>
): void {
    const attribute = adapterContext.wdAdapter.tryLoadAttributeToResource(
        record.wdProperty, record.subjectWdClass, resources, loadedPropertiesSet
    );
    if (attribute !== undefined) {
        adapterContext.wdAdapter.tryLoadClassToResource(record.subjectWdClass, resources, loadedClassesSet);
        resourcesToAdd.push([attribute.iri, true]); 
    }
}

function transformSelectedAssociation(
    record: WdPropertySelectionRecord, 
    adapterContext: WikidataAdapterContextValue, 
    resources: { [iri: string]: CoreResource }, 
    resourcesToAdd: [string, boolean][],
    loadedClassesSet: Set<WdEntityId>,
    loadedPropertiesSet: Set<WdEntityIri>
): void {
    const isInward = record.wdPropertyType === WikidataPropertyType.BACKWARD_ASSOCIATIONS;
    let subject = record.subjectWdClass;
    let object = record.objectWdClass;
    if (isInward) {
        [subject, object] = [object, subject];
    }
    
    const association = adapterContext.wdAdapter.tryLoadAssociationToResource(
        record.wdProperty, subject, object, isInward, resources, loadedPropertiesSet
    );
    if (association !== undefined) {
        adapterContext.wdAdapter.tryLoadClassToResource(record.subjectWdClass, resources, loadedClassesSet);
        adapterContext.wdAdapter.tryLoadClassToResource(record.objectWdClass, resources, loadedClassesSet);
        resourcesToAdd.push([association.iri, !isInward]);
    }
}