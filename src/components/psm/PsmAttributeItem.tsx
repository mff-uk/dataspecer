import React from "react";
import {Store, PsmClass} from "model-driven-data";
import {Typography} from "@material-ui/core";

interface PsmAttributeProps {
    /** Whole MDD store */
    store: Store;

    /** Id of element to render */
    id: string;
}

export const PsmAttributeItem: React.FC<PsmAttributeProps> = ({store, id}) => {
    const cls = store[id] as PsmClass;
    return <li>
        <Typography display={"inline"} color={"primary"} style={{fontWeight: "bold"}} title={cls.id}>{cls.psmTechnicalLabel || "[no label]"}</Typography> - PSM attribute<br/>
        Interpretation: <Typography display={"inline"} color={"textSecondary"}>{cls.psmInterpretation || "-"}</Typography><br/>
    </li>;
}
