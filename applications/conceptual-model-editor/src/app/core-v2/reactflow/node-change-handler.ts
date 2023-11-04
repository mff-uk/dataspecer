import { NodeChange } from "reactflow";

export const handleNodeChanges = (changes: NodeChange[]) => {
    for (const change of changes) {
        if (change.type == "position" && change.dragging === false) {
            // put that info into node position map
        }
    }
};
