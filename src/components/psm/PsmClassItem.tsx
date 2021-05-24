import React, {useState} from "react";
import {Store, PsmClass, PsmAttribute, PsmAssociation, PimClass} from "model-driven-data";
import {IconButton, Typography} from "@material-ui/core";
import { PsmAttributeItem } from "./PsmAttributeItem";
import { PsmAssociationItem } from "./PsmAssociationItem";
import AddIcon from "@material-ui/icons/Add";
import {AddInterpretedSurroundingDialog} from "../addInterpretedSurroundings/addInterpretedSurroundingDialog";

interface PsmElementProps {
    /** Whole MDD store */
    store: Store;

    /** Id of element to render */
    id: string;

    /** Request for surroundings dialog */
    osd: (cimId: string) => void;
}

export const PsmClassItem: React.FC<PsmElementProps> = ({store, id, osd}) => {
    const cls = store[id] as PsmClass;
    const interpretedCim = cls.psmInterpretation && (store[cls.psmInterpretation] as PimClass).pimInterpretation;

    return <li>
        <Typography display={"inline"} color={"primary"} style={{fontWeight: "bold"}} title={cls.id}>{cls.psmTechnicalLabel || "[no label]"}</Typography> - PSM class
        <IconButton size="small" onClick={() => {interpretedCim && osd(interpretedCim)}}><AddIcon /></IconButton>
        <br/>
        <Typography color={"textSecondary"}>{cls.id}</Typography>

        Interpretation:{' '}
        <Typography display={"inline"} color={"textSecondary"} title={cls.psmInterpretation && (store[cls.psmInterpretation] as PimClass).pimHumanDescription?.cs}>
            {cls.psmInterpretation && (store[cls.psmInterpretation] as PimClass).pimHumanLabel?.cs}
        </Typography>
        <br/>


        <ul>
            {cls.psmParts?.map(part => {
                if (PsmClass.is(store[part])) return <PsmClassItem id={part} store={store} osd={osd} />;
                if (PsmAttribute.is(store[part])) return <PsmAttributeItem id={part} store={store} />;
                if (PsmAssociation.is(store[part])) return <PsmAssociationItem id={part} store={store} osd={osd} />;
                return null;
            })}
        </ul>
    </li>;
}
