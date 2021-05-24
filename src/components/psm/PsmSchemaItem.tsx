import { Store, PsmSchema } from "model-driven-data";
import {Paper, Typography} from "@material-ui/core";
import {PsmClassItem} from "./PsmClassItem";
import React from "react";

interface PsmSchemaItemProps {
    /** Whole MDD store */
    store: Store;

    /** Id of element to render */
    id: string;

    /** Request for surroundings dialog */
    osd: (cimId: string) => void;
}

export const PsmSchemaItem: React.FC<PsmSchemaItemProps> = ({store, id, osd}) => {
    const schema = store[id] as PsmSchema;
    return <Paper style={{padding: "1rem", margin: "1rem 0"}}>
        <Typography variant="h5">{schema.psmHumanLabel?.cs || "[no label]"}</Typography>
        <Typography color="textSecondary">{schema.psmHumanDescription?.cs || "[no description]"}</Typography>
        <ul>
            {schema.psmRoots.map(root => <PsmClassItem store={store} id={root} osd={osd} />)}
        </ul>
    </Paper>
};