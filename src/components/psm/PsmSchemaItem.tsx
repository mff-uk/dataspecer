import {PsmClass, PsmSchema} from "model-driven-data";
import {Fab, Paper, Typography} from "@material-ui/core";
import React, {useCallback, useMemo} from "react";
import {StoreContext} from "../App";
import {PsmAssociationClassItem} from "./PsmAssociationClassItem";
import EditIcon from "@material-ui/icons/Edit";
import {LabelAndDescriptionLanguageStrings, LabelDescriptionEditor} from "../psmDetail/LabelDescriptionEditor";
import {useToggle} from "../../hooks/useToggle";
import {DragDropContext, DropResult} from "react-beautiful-dnd";
import {LanguageStringFallback} from "../helper/LanguageStringComponents";

export const PsmSchemaItem: React.FC<{id: string}> = ({id}) => {
    const {store, psmUpdateHumanLabelAndDescription, psmChangeOrder} = React.useContext(StoreContext);
    const schema = store[id] as PsmSchema;

    const labelDescriptionDialog = useToggle();
    const updateLabels = useCallback((data: LabelAndDescriptionLanguageStrings) => psmUpdateHumanLabelAndDescription(schema, data), [schema, psmUpdateHumanLabelAndDescription]);
    const labelsData: LabelAndDescriptionLanguageStrings = useMemo(() => {
        return {
            label: schema.psmHumanLabel ?? {},
            description: schema.psmHumanDescription ?? {},
        }
    }, [schema.psmHumanLabel, schema.psmHumanDescription]);

    const itemsDragged = useCallback(({draggableId, destination}: DropResult) => {
        if (destination) {
            psmChangeOrder(store[destination.droppableId] as PsmClass, store[draggableId], destination.index);
        }
    }, [psmChangeOrder, store]);

    return <Paper style={{padding: "1rem", margin: "1rem 0"}}>
        <Fab
            variant="extended"
            size="small"
            color="primary"
            aria-label="edit"
            style={{float: "right"}}
            onClick={labelDescriptionDialog.open}
        >
            <EditIcon />
            Edit labels
        </Fab>
        <LabelDescriptionEditor isOpen={labelDescriptionDialog.isOpen} close={labelDescriptionDialog.close} data={labelsData} update={updateLabels} />
        <LanguageStringFallback from={schema.psmHumanLabel}>{text => <Typography variant="h5">{text}</Typography>}</LanguageStringFallback>
        <LanguageStringFallback from={schema.psmHumanDescription}>{text => <Typography color="textSecondary">{text}</Typography>}</LanguageStringFallback>
        <DragDropContext onDragEnd={itemsDragged}>
            <ul>
                {schema.psmRoots.map(root => <PsmAssociationClassItem id={root} key={root} />)}
            </ul>
        </DragDropContext>
    </Paper>
};