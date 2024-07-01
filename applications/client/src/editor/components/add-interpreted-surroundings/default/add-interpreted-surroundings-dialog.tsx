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
import {AncestorSelectorPanel} from "./ancestor-selector-panel";
import {useAsyncMemo} from "../../../hooks/use-async-memo";
import {useDialog} from "../../../hooks/use-dialog";
import {PimAttributeDetailDialog} from "../../detail/pim-attribute-detail-dialog";
import InfoTwoToneIcon from '@mui/icons-material/InfoTwoTone';
import {PimAssociationToClassDetailDialog} from "../../detail/pim-association-to-class-detail-dialog";
import {dialog} from "../../../dialog";
import {DialogContent, DialogTitle} from "../../detail/common";
import {AssociationItem} from "./association-item";
import {translateFrom} from "../../helper/LanguageStringComponents";
import {useFederatedObservableStore, StoreContext} from "@dataspecer/federated-observable-store-react/store";
import {ReadOnlyMemoryStoreWithDummyPimSchema} from "@dataspecer/federated-observable-store/read-only-memory-store-with-dummy-pim-schema";

const useFilterForResource = <Resource extends CoreResource>(modelReader: CoreResourceReader | undefined, filter: (resource: CoreResource) => Promise<boolean>) => {
    const [resources] = useAsyncMemo<Resource[]>(async () => {
        const allResourcesIri = await modelReader?.listResources() as string[];
        const newAttributes: Resource[] = [];

        if (allResourcesIri) {
            for (const resourceIri of allResourcesIri) {
                const resource = await modelReader?.readResource(resourceIri) as CoreResource;
                if (await filter(resource)) {
                    newAttributes.push(resource as Resource);
                }
            }
        }

        return newAttributes;
    }, [modelReader]);

    return resources;
}

export interface AddInterpretedSurroundingDialogProperties {
    isOpen: boolean,
    close: () => void,

    dataPsmClassIri: string,

    selected: (operation: {
        resourcesToAdd: [string, boolean][],
        sourcePimModel: CoreResourceReader,
        forDataPsmClass: DataPsmClass,
    }) => void,
}

export const AddInterpretedSurroundingsDialog: React.FC<AddInterpretedSurroundingDialogProperties> = dialog({fullWidth: true, maxWidth: "lg"}, ({isOpen, close, selected, dataPsmClassIri}) => {
    const {t, i18n} = useTranslation("interpretedSurrounding");

    const {pimResource: pimClass, dataPsmResource: dataPsmClass} = useDataPsmAndInterpretedPim<DataPsmClass, PimClass>(dataPsmClassIri);
    const cimClassIri = pimClass?.pimInterpretation;

    const {cim} = React.useContext(ConfigurationContext);

    // For which CIM iris the loading is in progress
    const [currentCimClassIri, setCurrentCimClassIri] = useState<string>("");
    const [surroundings, setSurroundings] = useState<Record<string, CoreResourceReader | undefined>>({});

    const AttributeDetailDialog = useDialog(PimAttributeDetailDialog, ["iri"]);
    const AssociationToClassDetailDialog = useDialog(PimAssociationToClassDetailDialog, ["iri", "parentIri", "orientation"]);

    // Contains store with class hierarchy - resources in the AncestorSelectorPanel
    const [hierarchyStore, setHierarchyStore] = useState<CoreResourceReader | null>(null);

    // Following code creates a new store context containing downloaded data. This allow us to use standard application
    // components which render dialogs and other stuff

    const store = useFederatedObservableStore();
    useEffect(() => {
        const stores: CoreResourceReader[] = [];
        for (const iri in surroundings) {
            const surroundingStore = surroundings[iri];
            if (surroundingStore) {
                stores.push(surroundingStore);
            }
        }
        stores.forEach(s => store.addStore(s));
        return () => stores.forEach(s => store.removeStore(s));
    }, [surroundings, store]);

    /**
     * There can be multiple classes from the class hierarchy. A user can switch between them to select from which
     * class the user can select attributes and associations.
     */
    const switchCurrentCimClassIri = useCallback((newCurrentCimClassIri: string) => {
        setCurrentCimClassIri(newCurrentCimClassIri);
        if (!surroundings.hasOwnProperty(newCurrentCimClassIri)) {
            setSurroundings({...surroundings, [newCurrentCimClassIri]: undefined});

            cim.cimAdapter.getSurroundings(newCurrentCimClassIri).then(result => {
                const wrappedStore = new ReadOnlyMemoryStoreWithDummyPimSchema(result, "http://dummy-schema" + newCurrentCimClassIri);
                setSurroundings({...surroundings, [newCurrentCimClassIri]: wrappedStore});
            });
        }
    }, [surroundings, cim.cimAdapter]);

    /**
     * List of selected resources is an array of the selected resource iris and orientation.
     * true = the orientation is outgoing
     */
    const [selectedResources, setSelectedResources] = useState<[string, boolean][]>([]);
    const toggleSelectedResources = (pimResourceIri: string, orientation: boolean) => () => {
        if (selectedResources.some(([i, o]) => i === pimResourceIri && o === orientation)) {
            setSelectedResources(selectedResources.filter(([i, o]) => i !== pimResourceIri || o !== orientation));
        } else {
            setSelectedResources([...selectedResources, [pimResourceIri, orientation]]);
        }
    };

    // Opens the root class CIM
    useEffect(() => {
        if (isOpen && cimClassIri) {
            switchCurrentCimClassIri(cimClassIri);
        } else {
            setSelectedResources([]);
            setSurroundings({});
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isOpen, cimClassIri]); // change of switchCurrentCimClassIri should not trigger this effect

    const currentSurroundings = surroundings[currentCimClassIri];

    const attributes = useFilterForResource<PimAttribute>(currentSurroundings, async resource => PimAttribute.is(resource) && (await currentSurroundings?.readResource(resource.pimOwnerClass) as PimClass)?.pimInterpretation === currentCimClassIri);
    const forwardAssociations = useFilterForResource<PimAssociation>(currentSurroundings, async resource =>
        PimAssociation.is(resource) && (await currentSurroundings?.readResource((await currentSurroundings?.readResource(resource.pimEnd[0]) as PimAssociationEnd)?.pimPart as string) as PimClass)?.pimInterpretation === currentCimClassIri
    );
    const backwardAssociations = useFilterForResource<PimAssociation>(currentSurroundings, async resource =>
        PimAssociation.is(resource) && (await currentSurroundings?.readResource((await currentSurroundings?.readResource(resource.pimEnd[1]) as PimAssociationEnd)?.pimPart as string) as PimClass)?.pimInterpretation === currentCimClassIri
    );

    if (!cimClassIri) return null;

    return <StoreContext.Provider value={store}>
        <DialogTitle id="customized-dialog-title" close={close}>
            {t("title")}
        </DialogTitle>

        <DialogContent dividers>
            <Grid container spacing={3}>
                <Grid item xs={3} sx={{borderRight: theme => "1px solid " + theme.palette.divider}}>
                    <AncestorSelectorPanel forCimClassIri={cimClassIri} selectedAncestorCimIri={currentCimClassIri} selectAncestorCimIri={switchCurrentCimClassIri} hierarchyStore={hierarchyStore} setHierarchyStore={setHierarchyStore} />
                </Grid>
                <Grid item xs={9}>
                    {surroundings[currentCimClassIri] === undefined && <LoadingDialog />}

                    {surroundings[currentCimClassIri] === undefined ||
                        <>
                            <Typography variant="subtitle1" component="h2">{t('attributes')}</Typography>
                            {attributes && attributes.map((entity: PimAttribute) =>
                                <ListItem key={entity.iri} role={undefined} dense button onClick={toggleSelectedResources(entity.iri as string, true)}>
                                    <ListItemIcon>
                                        <Checkbox
                                            edge="start"
                                            checked={selectedResources.some(([i, o]) => i === entity.iri as string && o)}
                                            tabIndex={-1}
                                            disableRipple
                                        />
                                    </ListItemIcon>
                                    <ListItemText secondary={<Typography variant="body2" color="textSecondary" noWrap title={translateFrom(entity.pimHumanDescription, i18n.languages)}>{translateFrom(entity.pimHumanDescription, i18n.languages)}</Typography>}>
                                        <strong>{translateFrom(entity.pimHumanLabel, i18n.languages)}</strong>
                                        {" "}
                                        <SlovnikGovCzGlossary cimResourceIri={entity.pimInterpretation as string} />
                                    </ListItemText>

                                    <IconButton size="small" onClick={event => {AttributeDetailDialog.open({iri: entity.iri as string}); event.stopPropagation();}}><InfoTwoToneIcon fontSize="inherit" /></IconButton>
                                </ListItem>
                            )}
                            {attributes && attributes.length === 0 &&
                            <Typography color={"textSecondary"}>{t("no attributes")}</Typography>
                            }

                            <Typography variant="subtitle1" component="h2">{t('associations')}</Typography>
                            {forwardAssociations && forwardAssociations.map((entity: PimAssociation) =>
                                <AssociationItem
                                    key={entity.iri}
                                    pimAssociationIri={entity.iri as string}
                                    onClick={toggleSelectedResources(entity.iri as string, true)}
                                    selected={selectedResources.some(([i, o]) => i === entity.iri as string && o)}
                                    onDetail={() => AssociationToClassDetailDialog.open({iri: entity.iri as string, parentIri: "todo", orientation: true})}
                                    orientation={true}
                                />
                            )}

                            {(!forwardAssociations || forwardAssociations.length === 0) &&
                            <Typography color={"textSecondary"}>{t("no associations")}</Typography>
                            }

                            <Typography variant="subtitle1" component="h2">{t('backward associations')}</Typography>
                            {backwardAssociations && backwardAssociations.map((entity: PimAssociation) =>
                                <AssociationItem
                                    key={entity.iri}
                                    pimAssociationIri={entity.iri as string}
                                    onClick={toggleSelectedResources(entity.iri as string, false)}
                                    selected={selectedResources.some(([i, o]) => i === entity.iri as string && !o)}
                                    onDetail={() => AssociationToClassDetailDialog.open({iri: entity.iri as string, parentIri: "todo", orientation: false})}
                                    orientation={false}
                                />
                            )}

                            {(!backwardAssociations || backwardAssociations.length === 0) &&
                            <Typography color={"textSecondary"}>{t("no backward associations")}</Typography>
                            }

                        </>
                    }
                </Grid>
            </Grid>
        </DialogContent>
        <DialogActions>
            <Button onClick={close}>{t("close button")}</Button>
            <Button
                onClick={async () => {
                    const surroundingsStores = Object.values(surroundings).filter((s => s !== undefined) as (s: CoreResourceReader | undefined) => s is CoreResourceReader);
                    const allStores = ReadOnlyFederatedStore.createLazy([...(hierarchyStore ? [hierarchyStore] : []), ...surroundingsStores]);
                    selected({
                        resourcesToAdd: selectedResources,
                        sourcePimModel: allStores,
                        forDataPsmClass: dataPsmClass as DataPsmClass,
                    });
                    close();
                }}
                disabled={selectedResources.length === 0}>
                {t("confirm button")} ({selectedResources.length})
            </Button>
        </DialogActions>

        <AttributeDetailDialog.Component />
        <AssociationToClassDetailDialog.Component />
    </StoreContext.Provider>;
});
