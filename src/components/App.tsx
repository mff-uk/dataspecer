import React, {useState} from "react";
import {AppBar, Box, Container, Divider, Fab, Toolbar, Typography} from "@material-ui/core";
import CssBaseline from "@material-ui/core/CssBaseline";
import AddRootButton from "./cimSearch/AddRootButton";
import {
    CreatePsmAssociation,
    CreatePsmAttribute,
    CreatePsmClass,
    CreatePsmSchema,
    IdProvider,
    ModelResource,
    PimAssociation,
    PimAttribute,
    PimBase,
    PimClass,
    PsmAssociation,
    PsmAttribute,
    PsmBase,
    PsmClass,
    PsmSchema,
    Store,
    UpdatePsmClassInterpretation
} from "model-driven-data";
import LoadSavedButton from "./savedStore/LoadSavedButton";
import {PsmSchemaItem} from "./psm/PsmSchemaItem";
import UndoIcon from '@material-ui/icons/Undo';
import RedoIcon from '@material-ui/icons/Redo';
import {GenerateArtifacts} from "./generateArtifacts/GenerateArtifacts";
import {SnackbarProvider} from "notistack";
import {LabelAndDescriptionLanguageStrings} from "./psmDetail/LabelDescriptionEditor";
import arrayMove from "array-move";
import {LanguageSelector} from "./LanguageSelector";
import {Trans, useTranslation} from "react-i18next";

interface StoreContextInterface {
    store: Store,
    psmModifyTechnicalLabel: (entity: PsmBase, label: string) => void,
    psmModifyAttribute: (attribute: PsmAttribute, technicalLabel: string, dataType: string) => void,
    psmDeleteAttribute: (attribute: PsmAttribute) => void,
    psmSelectedInterpretedSurroundings: (forClass: PsmClass, pimStore: Store, attributes: PimAttribute[], associations: PimAssociation[]) => void,
    psmUpdateHumanLabelAndDescription: (entity: PsmBase, data: LabelAndDescriptionLanguageStrings) => void,
    psmChangeOrder: (parent: PsmClass, child: PsmBase, newIndex: number) => void,
    psmRemoveFromPart: (from: PsmClass, index: number) => void,
}

// equal and truthy
function eqt(a: any, b: any) {return a && a === b}

function loopPrevention(store: Store, entity: ModelResource, entityChain: ModelResource[] = []): boolean {
    if (entityChain.includes(entity)) {
        alert("Sorry, this operation is not implemented yet. You have caused a loop.");
        return false;
    }
    if (PsmClass.is(entity) || PsmAssociation.is(entity)) {
        const newChain = [...entityChain, entity];
        for (const iri of entity.psmParts) {
            if (store[iri]) {
                if (!loopPrevention(store, store[iri], newChain)) return false;
            }
        }
    }

    return true;
}

// @ts-ignore
export const StoreContext = React.createContext<StoreContextInterface>(null);

const App: React.FC = () => {
    const { t } = useTranslation('ui');
    const [store, setStoreInternal] = useState<Store>({});
    const [sh, ssh] = useState<Store[]>([{}]);
    const [shi, sshi] = useState(0);

    //#region Experiment: Store history
    const setStore = (newStore: Store) => {
        ssh([...sh.slice(0, sh.length - shi), newStore]);
        sshi(0);
        setStoreInternal(newStore);

    };
    const back = () => {
        sshi(shi - 1);
        setStoreInternal(sh[sh.length - 1 + shi - 1 ]);
    };
    const forward = () => {
        sshi(shi + 1);
        setStoreInternal(sh[sh.length - 1 + shi + 1 ]);
    };
    //#endregion

    const addRootElement = (root: PimClass) => {
        let newStore: Store = {[root.id]: root};
        const idProvider = new IdProvider();
        const psmClassId = idProvider.psmFromPim(root.id);

        newStore = (new CreatePsmSchema()).execute(newStore, {id: "__root_schema"});
        newStore = (new CreatePsmClass()).execute(newStore, {id: psmClassId});

        // hack
        (newStore["__root_schema"] as PsmSchema).psmRoots.push(psmClassId);

        newStore = (new UpdatePsmClassInterpretation()).execute(newStore, {id: psmClassId, interpretation: root.id});

        setStore(newStore);
    };

    const psmSelectedInterpretedSurroundings = (forClass: PsmClass, pimStore: Store, attributes: PimAttribute[], associations: PimAssociation[]) => {
        let newStore = {...store};
        const idProvider = new IdProvider();

        // For every PimAssociation
        for (let association of associations) {
            const associationPsmId = idProvider.psmFromPim(association.id);

            let firstEnd = null;
            let secondEnd = null;

            // First, ensure both PIM ends exists
            // Secondly, each PIM must have PSM class
            for (let {pimParticipant: pimId} of association.pimEnd) {
                if (!pimId) continue;
                if (!newStore[pimId]) newStore[pimId] = pimStore[pimId];

                // Find class or create one
                const end: PimBase = pimStore[pimId];
                // eslint-disable-next-line no-loop-func
                const psmEnd = Object.values(newStore).filter(PsmClass.is).find(cls => cls.psmInterpretation && eqt((newStore[cls.psmInterpretation] as PimClass)?.pimInterpretation, end.pimInterpretation));
                const psmId = psmEnd?.id ?? idProvider.psmFromPim(pimId);
                if (!newStore[psmId]) {
                    newStore = (new CreatePsmClass()).execute(newStore, {id: psmId});
                }
                newStore = (new UpdatePsmClassInterpretation()).execute(newStore, {id: psmId, interpretation: pimId});

                // todo hack for now
                if (pimId === association.pimEnd[0].pimParticipant) { firstEnd = psmId; }
                if (pimId === association.pimEnd[1].pimParticipant) { secondEnd = psmId; }
            }

            if (secondEnd === forClass.id) [firstEnd, secondEnd] = [secondEnd, firstEnd];

            if (!secondEnd || !firstEnd) continue;

            // Update PSM class
            const originalClass = newStore[forClass.id] as PsmClass;
            const modifiedClass = {...originalClass, psmParts: [...originalClass.psmParts, associationPsmId]} as PsmClass;
            newStore = {...newStore, [modifiedClass.id]: modifiedClass};

            // We can create the association now
            newStore = (new CreatePsmAssociation()).execute(newStore, {id: associationPsmId, toId: secondEnd});
            (newStore[associationPsmId] as PsmAssociation).psmInterpretation = association.id;
            newStore = {[association.id]: association, ...newStore};
        }

        // Process attributes
        for (const attribute of attributes) {
            if (!attribute.pimHasClass) {
                console.warn("PIM attribute has no PIM class assigned to it.", attribute);
                continue;
            }

            // Create PIM class
            if (!newStore[attribute.pimHasClass]) newStore[attribute.pimHasClass] = pimStore[attribute.pimHasClass];

            // Create PIM attribute
            newStore[attribute.id] = attribute;

            // Create PSM attribute
            const psmId = idProvider.psmFromPim(attribute.id);
            newStore = (new CreatePsmAttribute()).execute(newStore, {id: psmId, classId: forClass.id});
            (newStore[forClass.id] as PsmClass).psmParts.push(psmId);
            (newStore[psmId] as PsmAttribute).psmInterpretation = attribute.id;
        }

        // Loop PSM prevention
        const schemas = Object.values(store).filter(PsmSchema.is);
        for (const schema of schemas) {
            for (const root of schema.psmRoots) {
                if (!loopPrevention(newStore, newStore[root])) return;
            }
        }

        setStore(newStore);
    };

    const psmModifyTechnicalLabel = (entity: PsmBase, label: string) => {
        const modified = {...entity, psmTechnicalLabel: label} as PsmBase;
        setStore({...store, [entity.id]: modified});
    };

    const psmModifyAttribute = (attribute: PsmAttribute, technicalLabel: string, dataType: string) => {
        const modified = {...attribute, psmTechnicalLabel: technicalLabel, type: dataType} as PsmAttribute;
        setStore({...store, [attribute.id]: modified});
    };

    const psmDeleteAttribute = (attribute: PsmAttribute) => {
        const parent = Object.values(store).filter(PsmClass.is).find(c => c.psmParts.includes(attribute.id));
        if (!parent) throw new Error("Unable to remove PSM attribute from non existing PSM class.");
        const newParent = {...parent, psmParts: parent.psmParts.filter(c => c !== attribute.id)} as PsmClass;
        const newStore = {...store, [newParent.id]: newParent};
        delete newStore[attribute.id];
        setStore(newStore);
    };

    /**
     * Removes specific element from PsmClass list of parts
     * @param from
     * @param index
     */
    const psmRemoveFromPart = (from: PsmClass, index: number) => {
        setStore({...store, [from.id]: {...from, psmParts: from.psmParts.filter((_, i) => i !== index)} as PsmClass});
    };

    const psmUpdateHumanLabelAndDescription = (entity: PsmBase, data: LabelAndDescriptionLanguageStrings) => {
        setStore({...store, [entity.id]: {...entity, psmHumanLabel: data.label, psmHumanDescription: data.description} as PsmBase});
    };

    const psmChangeOrder = (parent: PsmClass, child: PsmBase, newIndex: number) => {
        setStore({...store, [parent.id]: {...parent, psmParts: arrayMove(parent.psmParts, parent.psmParts.indexOf(child.id), newIndex)} as PsmClass});
    };

    const storeContextData: StoreContextInterface = {
        store,
        psmModifyTechnicalLabel,
        psmDeleteAttribute,
        psmSelectedInterpretedSurroundings,
        psmUpdateHumanLabelAndDescription,
        psmChangeOrder,
        psmRemoveFromPart,
        psmModifyAttribute
    };

    const schemas = Object.values(store).filter(PsmSchema.is).map(it => <PsmSchemaItem id={it.id} key={it.id} />);

    return <>
        <SnackbarProvider maxSnack={3}>
            <CssBaseline />
            <AppBar position="static">
                <Toolbar>
                    <Typography variant="h6">
                        {t("title")}
                    </Typography>
                    <Box display="flex" flexGrow="1" justifyContent="flex-end">
                        <LanguageSelector />
                    </Box>
                </Toolbar>
            </AppBar>
            <Container>
                <Box height="30px"/>
                <Box display="flex" flexDirection="row" justifyContent="space-between">
                    <Typography variant="h4" paragraph>slovník.gov.cz</Typography>
                    <div>
                        <Fab variant="extended" disabled={sh.length + shi <= 1} size="medium" color="secondary" onClick={back} style={{marginRight: "1rem"}}><UndoIcon /></Fab>
                        <Fab variant="extended" disabled={shi >= 0} size="medium" color="secondary" onClick={forward}><RedoIcon /></Fab>
                    </div>
                    <LoadSavedButton store={setStore}  />
                    <GenerateArtifacts store={store} setStore={setStore} />
                    <AddRootButton selected={addRootElement} />
                </Box>
                <StoreContext.Provider value={storeContextData}>
                    {schemas}
                </StoreContext.Provider>
                {schemas.length === 0 &&
                    <Typography color={"textSecondary"}>Create a root or load a store</Typography>
                }
                <Divider style={{margin: "1rem 0 1rem 0"}} />
                <Trans i18nKey="footer report bug" t={t}>
                    Report a bug on <a href="https://github.com/sstenchlak/schema-generator/issues">GitHub</a>.
                </Trans>
            </Container>
        </SnackbarProvider>
    </>;
};

export default App;
