import {Button, Checkbox, DialogActions, Grid, IconButton, ListItem, ListItemIcon, ListItemText, Theme, Typography} from "@mui/material";
import React, {useCallback, useContext, useEffect, useMemo, useState} from "react";
import {SlovnikGovCzGlossary} from "../slovnik.gov.cz/SlovnikGovCzGlossary";
import {LoadingDialog} from "../helper/LoadingDialog";
import {createStyles, makeStyles} from "@mui/styles";
import {useTranslation} from "react-i18next";
import {DataPsmClass} from "@model-driven-data/core/data-psm/model";
import {CoreResource, CoreResourceReader, ReadOnlyFederatedStore} from "@model-driven-data/core/core";
import {useDataPsmAndInterpretedPim} from "../../hooks/useDataPsmAndInterpretedPim";
import {PimAssociation, PimAssociationEnd, PimAttribute, PimClass} from "@model-driven-data/core/pim/model";
import {StoreContext} from "../App";
import {AncestorSelectorPanel} from "./ancestor-selector-panel";
import {useAsyncMemo} from "../../hooks/useAsyncMemo";
import {useDialog} from "../../hooks/useDialog";
import {PimAttributeDetailDialog} from "../detail/pim-attribute-detail-dialog";
import InfoTwoToneIcon from '@mui/icons-material/InfoTwoTone';
import {PimAssociationToClassDetailDialog} from "../detail/pim-association-to-class-detail-dialog";
import {FederatedObservableStore, StoreWithMetadata} from "../../store/federated-observable-store";
import {StoreMetadataTag} from "../../configuration/configuration";
import {dialog} from "../../dialog";
import {DialogContent, DialogTitle} from "../detail/common";
import {AssociationItem} from "./association-item";

const useStyles = makeStyles((theme: Theme) =>
    createStyles({
        ancestorPane: {
            borderRight: "1px solid " + theme.palette.divider
        },
    }),
);

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
    const styles = useStyles();
    const {t} = useTranslation("interpretedSurrounding");

    const {pimResource: pimClass, dataPsmResource: dataPsmClass} = useDataPsmAndInterpretedPim<DataPsmClass, PimClass>(dataPsmClassIri);
    const cimClassIri = pimClass?.pimInterpretation;

    const {cim} = React.useContext(StoreContext);

    // For which CIM iris the loading is in progress
    const [currentCimClassIri, setCurrentCimClassIri] = useState<string>("");
    const [surroundings, setSurroundings] = useState<Record<string, CoreResourceReader | undefined>>({});

    const AttributeDetailDialog = useDialog(PimAttributeDetailDialog, ["iri"]);
    const AssociationToClassDetailDialog = useDialog(PimAssociationToClassDetailDialog, ["iri", "parentIri", "orientation"]);

    // Contains store with class hierarchy - resources in the AncestorSelectorPanel
    const [hierarchyStore, setHierarchyStore] = useState<CoreResourceReader | null>(null);

    // Following code creates a new store context containing downloaded data. This allow us to use standard application
    // components which render dialogs and other stuff

    const storeContext = useContext(StoreContext);
    const [store] = useState(() => new FederatedObservableStore());
    const NewStoreContext = useMemo(() => ({...storeContext, store}), [storeContext, store]);
    useEffect(() => {
        const stores: StoreWithMetadata[] = [];
        for (const iri in surroundings) {
            if (surroundings[iri]) {
                stores.push({
                    store: surroundings[iri] as CoreResourceReader,
                    metadata: {
                        tags: ["cim-as-pim", "read-only"] as StoreMetadataTag[]
                    },
                });
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
                setSurroundings({...surroundings, [newCurrentCimClassIri]: result});
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

    const attributes = useFilterForResource<PimAttribute>(currentSurroundings, async resource => PimAttribute.is(resource));
    const forwardAssociations = useFilterForResource<PimAssociation>(currentSurroundings, async resource =>
        PimAssociation.is(resource) && (await currentSurroundings?.readResource((await currentSurroundings?.readResource(resource.pimEnd[0]) as PimAssociationEnd)?.pimPart as string) as PimClass)?.pimInterpretation === currentCimClassIri
    );
    const backwardAssociations = useFilterForResource<PimAssociation>(currentSurroundings, async resource =>
        PimAssociation.is(resource) && (await currentSurroundings?.readResource((await currentSurroundings?.readResource(resource.pimEnd[1]) as PimAssociationEnd)?.pimPart as string) as PimClass)?.pimInterpretation === currentCimClassIri
    );

    if (!cimClassIri) return null;

    return <StoreContext.Provider value={NewStoreContext}>
        <DialogTitle id="customized-dialog-title" close={close}>
            {t("title")}
        </DialogTitle>

        <DialogContent dividers>
            <Grid container spacing={3}>
                <Grid item xs={3} className={styles.ancestorPane}>
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
                                    <ListItemText secondary={<Typography variant="body2" color="textSecondary" noWrap title={entity.pimHumanDescription?.cs}>{entity.pimHumanDescription?.cs}</Typography>}>
                                        <strong>{entity.pimHumanLabel?.cs}</strong>
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
