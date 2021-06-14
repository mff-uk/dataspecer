import {PsmSchema} from "model-driven-data";
import {Fab, Paper, Typography} from "@material-ui/core";
import React, {useCallback, useMemo} from "react";
import {StoreContext} from "../App";
import {PsmAssociationClassItem} from "./PsmAssociationClassItem";
import EditIcon from "@material-ui/icons/Edit";
import {LabelAndDescriptionLanguageStrings, LabelDescriptionEditor} from "../psmDetail/LabelDescriptionEditor";
import {useToggle} from "../../hooks/useToggle";

export const PsmSchemaItem: React.FC<{id: string}> = ({id}) => {
    const {store, psmUpdateHumanLabelAndDescription} = React.useContext(StoreContext);
    const schema = store[id] as PsmSchema;

    const labelDescriptionDialog = useToggle();
    const updateLabels = useCallback((data: LabelAndDescriptionLanguageStrings) => psmUpdateHumanLabelAndDescription(schema, data), [schema, psmUpdateHumanLabelAndDescription]);
    const labelsData: LabelAndDescriptionLanguageStrings = useMemo(() => {
        return {
            label: schema.psmHumanLabel ?? {},
            description: schema.psmHumanDescription ?? {},
        }
    }, [schema.psmHumanLabel, schema.psmHumanDescription]);
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
        <Typography variant="h5">{schema.psmHumanLabel?.cs || "[no label]"}</Typography>
        <Typography color="textSecondary">{schema.psmHumanDescription?.cs || "[no description]"}</Typography>
        <ul>
            {schema.psmRoots.map(root => <PsmAssociationClassItem id={root} key={root} />)}
        </ul>
    </Paper>
};