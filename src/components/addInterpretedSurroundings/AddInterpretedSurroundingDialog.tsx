import {Box, Button, Checkbox, Dialog, DialogActions, DialogContent, DialogTitle, FormControlLabel, Grid, IconButton, ListItem, ListItemIcon, ListItemText, Theme, Typography} from "@mui/material";
import React, {useCallback, useContext, useEffect, useMemo, useState} from "react";
import {SlovnikGovCzGlossary} from "../slovnik.gov.cz/SlovnikGovCzGlossary";
import {LoadingDialog} from "../helper/LoadingDialog";
import {createStyles, makeStyles} from "@mui/styles";
import {useTranslation} from "react-i18next";
import {DataPsmClass} from "model-driven-data/data-psm/model";
import {CoreResource, CoreResourceReader, ReadOnlyFederatedStore} from "model-driven-data/core";
import {useDataPsmAndInterpretedPim} from "../../hooks/useDataPsmAndInterpretedPim";
import {PimAssociation, PimAttribute, PimClass} from "model-driven-data/pim/model";
import {StoreContext} from "../App";
import {AncestorSelectorPanel} from "./AncestorSelectorPanel";
import {useAsyncMemo} from "../../hooks/useAsyncMemo";
import {useDialog} from "../../hooks/useDialog";
import {PimAttributeDetailDialog} from "../detail/pim-attribute-detail-dialog";
import InfoTwoToneIcon from '@mui/icons-material/InfoTwoTone';
import {PimAssociationToClassDetailDialog} from "../detail/pim-association-to-class-detail-dialog";
import {FederatedObservableStore, StoreWithMetadata} from "../../store/federated-observable-store";
import {StoreMetadataTag} from "../../configuration/configuration";

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

interface AddInterpretedSurroundingDialogProperties {
    isOpen: boolean,
    close: () => void,

    dataPsmClassIri: string,

    selected: (operation: {
        resourcesToAdd: [string, boolean][],
        sourcePimModel: CoreResourceReader,
        forDataPsmClass: DataPsmClass,
        replaceClassWithReference: boolean,
    }) => void,
}

export const AddInterpretedSurroundingDialog: React.FC<AddInterpretedSurroundingDialogProperties> = ({isOpen, close, selected, dataPsmClassIri}) => {
    const styles = useStyles();
    const {t} = useTranslation("interpretedSurrounding");

    const {pimResource: pimClass, dataPsmResource: dataPsmClass} = useDataPsmAndInterpretedPim<DataPsmClass, PimClass>(dataPsmClassIri);
    const cimClassIri = pimClass?.pimInterpretation;

    const {cim, configuration} = React.useContext(StoreContext);

    // For which CIM iris the loading is in progress
    const [currentCimClassIri, setCurrentCimClassIri] = useState<string>("");
    const [surroundings, setSurroundings] = useState<Record<string, CoreResourceReader | undefined>>({});

    const AttributeDetailDialog = useDialog(PimAttributeDetailDialog, ["iri"]);
    const AssociationToClassDetailDialog = useDialog(PimAssociationToClassDetailDialog, ["iri", "parentIri", "orientation"]);

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
                        tags: ["cim-as-pim"] as StoreMetadataTag[]
                    },
                });
            }
        }
        stores.forEach(s => store.addStore(s));
        return () => stores.forEach(s => store.removeStore(s));
    }, [surroundings]);

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
        PimAssociation.is(resource) && (await currentSurroundings?.readResource(resource.pimEnd[0]) as PimClass)?.pimInterpretation === currentCimClassIri
    );
    const backwardAssociations = useFilterForResource<PimAssociation>(currentSurroundings, async resource =>
        PimAssociation.is(resource) && (await currentSurroundings?.readResource(resource.pimEnd[1]) as PimClass)?.pimInterpretation === currentCimClassIri
    );

    const [replaceWithClassReference, setReplaceWithClassReference] = useState<boolean>(true);

    if (!cimClassIri) return null;

    return <Dialog onClose={close} open={isOpen} fullWidth maxWidth={"lg"}>
        <DialogTitle id="customized-dialog-title">
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
                            <Typography variant={"h6"}>{t("attributes")}</Typography>
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

                            <Typography variant={"h6"}>{t("associations")}</Typography>
                            {forwardAssociations && forwardAssociations.map((entity: PimAssociation) =>
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
                                        <SlovnikGovCzGlossary cimResourceIri={entity.pimInterpretation as string}/>
                                        {" "}
                                        {/*<IconButton size="small" onClick={(event) => {associationDialog.open({association: entity}); event.stopPropagation();}}><InfoTwoToneIcon fontSize="inherit" /></IconButton>*/}
                                        {" "}
                                        {/*entity.pimEnd[1].pimParticipant && currentSurroundings &&
                                        <span>({(currentSurroundings[entity.pimEnd[1].pimParticipant] as PimClass).pimHumanLabel?.cs}
                                            ){" "}
                                            <IconButton size="small" onClick={(event) => {entity.pimEnd[1].pimParticipant && classDialog.open({cls: currentSurroundings[entity.pimEnd[1].pimParticipant] as PimClass}); event.stopPropagation();}}><InfoTwoToneIcon fontSize="inherit" /></IconButton>
                                            </span>
                                        */}
                                    </ListItemText>

                                    <IconButton size="small" onClick={event => {AssociationToClassDetailDialog.open({iri: entity.iri as string, parentIri: "todo", orientation: true}); event.stopPropagation();}}><InfoTwoToneIcon fontSize="inherit" /></IconButton>
                                </ListItem>
                            )}

                            {(!forwardAssociations || forwardAssociations.length === 0) &&
                            <Typography color={"textSecondary"}>{t("no associations")}</Typography>
                            }

                            <Typography variant={"h6"}>{t("backward associations")}</Typography>
                            {backwardAssociations && backwardAssociations.map((entity: PimAssociation) =>
                                <ListItem key={entity.iri} role={undefined} dense button onClick={toggleSelectedResources(entity.iri as string, false)}>
                                    <ListItemIcon>
                                        <Checkbox
                                            edge="start"
                                            checked={selectedResources.some(([i, o]) => i === entity.iri as string && !o)}
                                            tabIndex={-1}
                                            disableRipple
                                        />
                                    </ListItemIcon>
                                    <ListItemText secondary={<Typography variant="body2" color="textSecondary" noWrap title={entity.pimHumanDescription?.cs}>{entity.pimHumanDescription?.cs}</Typography>}>
                                        {/*{entity.pimEnd[0].pimParticipant && <span>({currentSurroundings && (currentSurroundings[entity.pimEnd[0].pimParticipant] as PimClass).pimHumanLabel?.cs}
                                            ){" "}
                                            <IconButton size="small" onClick={(event) => {currentSurroundings && entity.pimEnd[0].pimParticipant && classDialog.open({cls: currentSurroundings[entity.pimEnd[0].pimParticipant] as PimClass}); event.stopPropagation();}}><InfoTwoToneIcon fontSize="inherit" /></IconButton>
                                            </span>}
                                        {" "}*/}
                                        <strong>{entity.pimHumanLabel?.cs}</strong>
                                        {" "}
                                        <SlovnikGovCzGlossary cimResourceIri={entity.pimInterpretation as string}/>
                                        {" "}
                                        {/*<IconButton size="small" onClick={(event) => {associationDialog.open({association: entity}); event.stopPropagation();}}><InfoTwoToneIcon fontSize="inherit" /></IconButton>*/}
                                    </ListItemText>

                                    <IconButton size="small" onClick={event => {AssociationToClassDetailDialog.open({iri: entity.iri as string, parentIri: "todo", orientation: false}); event.stopPropagation();}}><InfoTwoToneIcon fontSize="inherit" /></IconButton>
                                </ListItem>
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
            {/* This checkbox is shown only if configuration is presented, because only in that scenario it makes sense to ask for this option. */}
            {configuration && <FormControlLabel sx={{mx: 0}} control={<Checkbox checked={replaceWithClassReference} onChange={e => setReplaceWithClassReference(e.target.checked)} />} label={t("replace with class reference checkbox")}/>}
            <Box sx={{flexGrow: 1}} />

            <Button onClick={close} color="primary">{t("close button")}</Button>
            <Button
                onClick={() => {
                    close();
                    const surroundingsStores = Object.values(surroundings).filter((s => s !== undefined) as (s: CoreResourceReader | undefined) => s is CoreResourceReader);
                    const allStores = hierarchyStore !== null ? [hierarchyStore, ...surroundingsStores] : surroundingsStores;
                    selected({
                        resourcesToAdd: selectedResources,
                        sourcePimModel: ReadOnlyFederatedStore.createLazy(allStores),
                        forDataPsmClass: dataPsmClass as DataPsmClass,
                        replaceClassWithReference: (configuration !== undefined) && replaceWithClassReference, // False if no configuration because it would not find anything
                    });
                }}
                disabled={selectedResources.length === 0}
                color="secondary">
                {t("confirm button")} ({selectedResources.length})
            </Button>
        </DialogActions>

        <StoreContext.Provider value={NewStoreContext}>
            <AttributeDetailDialog.component />
            <AssociationToClassDetailDialog.component />
        </StoreContext.Provider>
    </Dialog>;
};
