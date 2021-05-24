import React from "react";
import {Store, PsmClass, PsmAttribute} from "model-driven-data";
import {Typography} from "@material-ui/core";
import { PsmAttributeItem } from "./PsmAttributeItem";
import { PsmClassItem } from "./PsmClassItem";

interface PsmAssociationItemProps {
    /** Whole MDD store */
    store: Store;

    /** Id of element to render */
    id: string;

    /** Request for surroundings dialog */
    osd: (cimId: string) => void;
}

export const PsmAssociationItem: React.FC<PsmAssociationItemProps> = ({store, id, osd}) => {
    const cls = store[id] as PsmClass;
    return <li>
        <Typography display={"inline"} color={"secondary"} style={{fontWeight: "bold"}} title={cls.id}>{cls.psmTechnicalLabel || "[no label]"}</Typography> - PSM association<br/>
        Interpretation: <Typography display={"inline"} color={"textSecondary"}>{cls.psmInterpretation || "-"}</Typography><br/>
        <ul>
            {cls.psmParts?.map(part => !PsmAttribute.is(store[part]) ? <PsmClassItem id={part} store={store} osd={osd}/> : <PsmAttributeItem id={part} store={store} />)}
        </ul>
    </li>;
}
