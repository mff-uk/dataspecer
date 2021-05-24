import React, {useState} from "react";
import {AppBar, Box, Container, Fab, Toolbar, Typography} from "@material-ui/core";
import CssBaseline from "@material-ui/core/CssBaseline";
import AddRootButton from "./cimSearch/AddRootButton";
import {
    CreatePsmAssociation,
    CreatePsmClass,
    CreatePsmSchema,
    IdProvider,
    PimAssociation,
    PimAttribute,
    PimClass,
    PsmClass,
    PsmSchema,
    Store,
    UpdatePsmClassInterpretation
} from "model-driven-data";
import LoadSavedButton from "./savedStore/LoadSavedButton";
import {PsmSchemaItem} from "./psm/PsmSchemaItem";
import {AddInterpretedSurroundingDialog} from "./addInterpretedSurroundings/addInterpretedSurroundingDialog";
import UndoIcon from '@material-ui/icons/Undo';
import RedoIcon from '@material-ui/icons/Redo';


const App: React.FC = () => {
    const [store, setStoreInternal] = useState<Store>({});
    const [sh, ssh] = useState<Store[]>([{}]);
    const [shi, sshi] = useState(0);

    //#region Experiment: Store history
    const setStore = (newStore: Store) => {
        ssh([...sh.slice(0, sh.length - shi), newStore]);
        sshi(0);
        setStoreInternal(newStore);
    }
    const back = () => {
        sshi(shi - 1);
        setStoreInternal(sh[sh.length - 1 + shi - 1 ]);
    }
    const forward = () => {
        sshi(shi + 1);
        setStoreInternal(sh[sh.length - 1 + shi + 1 ]);
    }
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
    }

    const [surroundingDialogOpen, setSurroundingDialogOpen] = useState(false);
    const [SDcim, setSDcim] = useState<string>("");
    const openSurroundingDialog = (cimId: string) => {
        setSDcim(cimId);
        setSurroundingDialogOpen(true);
    }

    const SDselected = (pimStore: Store, attributes: PimAttribute[], associations: PimAssociation[]) => {
        let newStore = {...store};
        const idProvider = new IdProvider();

        // For every PimAssociation
        for (let association of associations) {
            // First, ensure both PIM ends exists
            // Secondly, each PIM must have PSM class
            for (let {pimParticipant: pimId} of association.pimEnd) {
                if (!pimId) continue;
                if (!newStore[pimId]) newStore[pimId] = pimStore[pimId];
                const psmId = idProvider.psmFromPim(pimId);
                if (!newStore[psmId]) {
                    newStore = (new CreatePsmClass()).execute(newStore, {id: psmId});
                    newStore = (new UpdatePsmClassInterpretation()).execute(newStore, {id: psmId, interpretation: pimId});
                }
                // todo hack for now
                if (pimId === association.pimEnd[0].pimParticipant) {
                    const modifiedClass = {...newStore[psmId], psmParts: [...(newStore[psmId] as PsmClass).psmParts, idProvider.psmFromPim(association.id)]} as PsmClass;
                    newStore = {...newStore, [psmId]: modifiedClass};
                }
            }
            // We can create the association now
            const [fromId, toId] = association.pimEnd.map(({pimParticipant}) => pimParticipant ?? "").map(idProvider.psmFromPim);
            newStore = (new CreatePsmAssociation()).execute(newStore, {id: idProvider.psmFromPim(association.id), toId});
        }
        setStore(newStore);
    }

    const schemas = Object.values(store).filter(PsmSchema.is).map(it => <PsmSchemaItem store={store} id={it.id} key={it.id} osd={openSurroundingDialog} />);

    return <>
        <CssBaseline />
        <AppBar position="static">
            <Toolbar>
                <Typography variant="h6">
                    Schema Generator
                </Typography>
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
                <AddRootButton selected={addRootElement} />
            </Box>
            {schemas}
            {schemas.length === 0 &&
                <Typography color={"textSecondary"}>Create a root or load a store</Typography>
            }
        </Container>

        <AddInterpretedSurroundingDialog isOpen={surroundingDialogOpen} close={() => setSurroundingDialogOpen(false)} selected={SDselected} cimId={SDcim} />
    </>;
}

export default App;