import { isSemanticModelRelationPrimitive, isSemanticModelRelationship, SemanticModelClass, SemanticModelEntity, SemanticModelRelationship } from "@dataspecer/core-v2/semantic-model/concepts";
import { DataPsmClass } from "@dataspecer/core/data-psm/model";
import { StoreContext } from "@dataspecer/federated-observable-store-react/store";
import { useResource } from "@dataspecer/federated-observable-store-react/use-resource";
import InfoTwoToneIcon from '@mui/icons-material/InfoTwoTone';
import { Button, Checkbox, DialogActions, Grid, IconButton, ListItem, ListItemIcon, ListItemText, Typography } from "@mui/material";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { dialog } from "../../../dialog";
import { useDataPsmAndInterpretedPim } from "../../../hooks/use-data-psm-and-interpreted-pim";
import { useDialog } from "../../../hooks/use-dialog";
import { useNewFederatedObservableStoreFromSemanticEntities } from "../../../hooks/use-new-federated-observable-store-from-semantic-entities";
import { ConfigurationContext } from "../../App";
import { DialogContent, DialogTitle } from "../../detail/common";
import { PimAssociationToClassDetailDialog } from "../../detail/pim-association-to-class-detail-dialog";
import { PimAttributeDetailDialog } from "../../detail/pim-attribute-detail-dialog";
import { translateFrom } from "../../helper/LanguageStringComponents";
import { LoadingDialog } from "../../helper/LoadingDialog";
import { SlovnikGovCzGlossary } from "../../slovnik.gov.cz/SlovnikGovCzGlossary";
import { AncestorSelectorPanel } from "./ancestor-selector-panel";
import { AssociationItem } from "./association-item";

export interface AddInterpretedSurroundingDialogProperties {
    isOpen: boolean,
    close: () => void,

    dataPsmClassIri: string,
    // If it actually goes for another PIM class than the class is interpreted to
    forPimClassIri?: string,

    selected: (operation: {
        resourcesToAdd: [string, boolean][],
        sourcePimModel: SemanticModelEntity[],
        forDataPsmClass: DataPsmClass,
    }) => void,
}

export const AddInterpretedSurroundingsDialog: React.FC<AddInterpretedSurroundingDialogProperties> = dialog({fullWidth: true, maxWidth: "lg"}, ({isOpen, close, selected, dataPsmClassIri, forPimClassIri}) => {
    const {t, i18n} = useTranslation("interpretedSurrounding");

    const {resource: forPimClass} = useResource(forPimClassIri);
    const {pimResource: pimClass, dataPsmResource: dataPsmClass} = useDataPsmAndInterpretedPim<DataPsmClass, SemanticModelClass>(dataPsmClassIri);
    const cimClassIri = forPimClass?.iri ?? pimClass?.iri; // ! toto je CIM na kterem stavime

    const {sourceSemanticModel} = React.useContext(ConfigurationContext);

    // For which CIM iris the loading is in progress
    const [currentCimClassIri, setCurrentCimClassIri] = useState<string>("");
    const [surroundings, setSurroundings] = useState<Record<string, SemanticModelEntity[] | undefined>>({});

    const AttributeDetailDialog = useDialog(PimAttributeDetailDialog, ["iri"]);
    const AssociationToClassDetailDialog = useDialog(PimAssociationToClassDetailDialog, ["iri", "parentIri", "orientation"]);

    // Contains store with class hierarchy - resources in the AncestorSelectorPanel
    const [hierarchyStore, setHierarchyStore] = useState<SemanticModelEntity[] | null>(null);

    /**
     * There can be multiple classes from the class hierarchy. A user can switch between them to select from which
     * class the user can select attributes and associations.
     *
     * ! this is basically going along hierarchy
     */
    const switchCurrentCimClassIri = useCallback((newCurrentCimClassIri: string) => {
        setCurrentCimClassIri(newCurrentCimClassIri);
        if (!surroundings.hasOwnProperty(newCurrentCimClassIri)) {
            setSurroundings({...surroundings, [newCurrentCimClassIri]: undefined});

            sourceSemanticModel.getSurroundings(newCurrentCimClassIri).then(result => {
                setSurroundings({...surroundings, [newCurrentCimClassIri]: result});
            });
        }
    }, [surroundings, sourceSemanticModel]);

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

    const flatSurroundings = useMemo(() => Object.values(surroundings).filter(e => e).flat(1) as SemanticModelEntity[], [surroundings]);
    const newStore = useNewFederatedObservableStoreFromSemanticEntities(flatSurroundings);

    const currentSurroundings = surroundings[currentCimClassIri];

    const attributes = useMemo(() => currentSurroundings
        ?.filter(isSemanticModelRelationship)
        .filter(isSemanticModelRelationPrimitive)
        .filter(r => r.ends[0].concept === currentCimClassIri)
        ?? [], [currentSurroundings, currentCimClassIri]);
    const forwardAssociations = useMemo(() => currentSurroundings
        ?.filter(isSemanticModelRelationship)
        .filter(r => !isSemanticModelRelationPrimitive(r))
        .filter(r => r.ends[0].concept === currentCimClassIri)
        ?? [], [currentSurroundings, currentCimClassIri]);
    const backwardAssociations = useMemo(() => currentSurroundings
        ?.filter(isSemanticModelRelationship)
        .filter(r => !isSemanticModelRelationPrimitive(r))
        .filter(r => r.ends[1].concept === currentCimClassIri)
        ?? [], [currentSurroundings, currentCimClassIri]);

    if (!cimClassIri) return null;

    return <StoreContext.Provider value={newStore}>
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
                            {attributes && attributes.map((entity: SemanticModelRelationship) =>
                                <ListItem key={entity.id} role={undefined} dense button onClick={toggleSelectedResources(entity.id as string, true)}>
                                    <ListItemIcon>
                                        <Checkbox
                                            edge="start"
                                            checked={selectedResources.some(([i, o]) => i === entity.id as string && o)}
                                            tabIndex={-1}
                                            disableRipple
                                        />
                                    </ListItemIcon>
                                    <ListItemText secondary={<Typography variant="body2" color="textSecondary" noWrap title={translateFrom(entity.ends[1].description, i18n.languages)}>{translateFrom(entity.ends[1].description, i18n.languages)}</Typography>}>
                                        <strong>{translateFrom(entity.ends[1].name, i18n.languages)}</strong>
                                        {" "}
                                        <SlovnikGovCzGlossary cimResourceIri={entity.iri as string} />
                                    </ListItemText>

                                    <IconButton size="small" onClick={event => {AttributeDetailDialog.open({iri: entity.id as string}); event.stopPropagation();}}><InfoTwoToneIcon fontSize="inherit" /></IconButton>
                                </ListItem>
                            )}
                            {attributes && attributes.length === 0 &&
                            <Typography color={"textSecondary"}>{t("no attributes")}</Typography>
                            }

                            <Typography variant="subtitle1" component="h2">{t('associations')}</Typography>
                            {forwardAssociations && forwardAssociations.map((entity: SemanticModelRelationship) =>
                                <AssociationItem
                                    key={entity.id}
                                    relationship={entity}
                                    onClick={toggleSelectedResources(entity.id as string, true)}
                                    selected={selectedResources.some(([i, o]) => i === entity.id as string && o)}
                                    onDetail={() => AssociationToClassDetailDialog.open({iri: entity.id as string, parentIri: "todo", orientation: true})}
                                    orientation={true}
                                    allEntities={currentSurroundings as SemanticModelEntity[]}
                                />
                            )}

                            {(!forwardAssociations || forwardAssociations.length === 0) &&
                            <Typography color={"textSecondary"}>{t("no associations")}</Typography>
                            }

                            <Typography variant="subtitle1" component="h2">{t('backward associations')}</Typography>
                            {backwardAssociations && backwardAssociations.map((entity: SemanticModelRelationship) =>
                                <AssociationItem
                                    key={entity.id}
                                    relationship={entity}
                                    onClick={toggleSelectedResources(entity.id as string, false)}
                                    selected={selectedResources.some(([i, o]) => i === entity.id as string && !o)}
                                    onDetail={() => AssociationToClassDetailDialog.open({iri: entity.id as string, parentIri: "todo", orientation: false})}
                                    orientation={false}
                                    allEntities={currentSurroundings as SemanticModelEntity[]}
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
                    selected({
                        resourcesToAdd: selectedResources,
                        sourcePimModel: [...(hierarchyStore ?? []), ...Object.values(surroundings).flat()],
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
