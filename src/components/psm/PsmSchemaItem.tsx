import {PsmSchema} from "model-driven-data";
import {Paper, Typography} from "@material-ui/core";
import React from "react";
import {StoreContext} from "../App";
import {PsmAssociationClassItem} from "./PsmAssociationClassItem";

export const PsmSchemaItem: React.FC<{id: string}> = ({id}) => {
    const {store} = React.useContext(StoreContext);
    const schema = store[id] as PsmSchema;
    return <Paper style={{padding: "1rem", margin: "1rem 0"}}>
        <Typography variant="h5">{schema.psmHumanLabel?.cs || "[no label]"}</Typography>
        <Typography color="textSecondary">{schema.psmHumanDescription?.cs || "[no description]"}</Typography>
        <ul>
            {schema.psmRoots.map(root => <PsmAssociationClassItem id={root} key={root} />)}
        </ul>
    </Paper>
};