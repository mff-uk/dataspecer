import { CimClass, Association, Cim } from "./model/cim-defs";
import { CimLayout, Position } from "./layout/cim-layout";
import { ViewLayout } from "./layout/view-layout";

export enum CimActionKind {
    ADD_ATTRIBUTE,
    REMOVE_ATTRIBUTE,
    REMOVE_FOCUS,
    ELEMENT_MOVE,
    SYNC_DONE,
}

export interface CimAction {
    type: CimActionKind;
    clsId?: string;
    payload?: any;
}

export interface CimState {
    cim: Cim;
    classes: CimClass[];
    associations: Association[];
    cimLayout: CimLayout;
    highlightedElement?: CimClass;
    needsSync: boolean;
}

export type CimDispatch = React.Dispatch<CimAction>;

export const cimChangeReducer: (state: CimState, action: CimAction) => CimState = (state, action) => {
    const { type, clsId, payload } = action;
    switch (type) {
        case CimActionKind.ADD_ATTRIBUTE:
            const oldClassesAdd = state.cim.classes;
            const moddedCls = oldClassesAdd.find((c) => c.id === clsId)!;

            moddedCls.addAttribute(payload);
            const newCimClasses = [...oldClassesAdd.filter((c) => c.id !== clsId), moddedCls];
            const newCim = state.cim;
            newCim.classes = newCimClasses;
            const newState: CimState = {
                ...state,
                cim: newCim,
                classes: newCimClasses,
                highlightedElement: moddedCls,
                needsSync: true,
            };
            return newState;
        case CimActionKind.REMOVE_ATTRIBUTE:
            const oldClassesRem = state.classes;
            const clsToRemoveAttribute = oldClassesRem.find((c) => c.id === clsId)!;

            clsToRemoveAttribute.removeAttribute(payload.name);

            const newCimClassesRem = [...oldClassesRem.filter((c) => c.id !== clsId), clsToRemoveAttribute];
            const newCimRem = state.cim;
            newCimRem.classes = newCimClassesRem;

            return {
                ...state,
                cim: newCimRem,
                classes: newCimClassesRem,
                highlightedElement: clsToRemoveAttribute,
                needsSync: true,
            };

        case CimActionKind.REMOVE_FOCUS:
            return { ...state, highlightedElement: undefined } as CimState;

        case CimActionKind.ELEMENT_MOVE:
            const pos = payload.position as Position;
            const newLayout = state.cimLayout;
            newLayout.setPosition(clsId!, pos);
            // console.log(pos);
            return { ...state, cimLayout: newLayout };

        case CimActionKind.SYNC_DONE:
            return {
                ...state,
                needsSync: false,
            };

        default:
            return { ...state, highlightedElement: undefined } as CimState;
    }
};

export interface CimState2 {
    cims: Cim[];
    viewLayout: ViewLayout;
    highlightedElement?: CimClass;
    needsSync: boolean;
}

export const cimChangeReducer2: (state: CimState2, action: CimAction) => CimState2 = (state, action) => {
    const { type, clsId, payload } = action;
    const cim = state.cims.filter((c) => c.classes.find((cls) => cls.id === clsId)).at(0)!; // should be exactly one
    if (!cim) {
        console.log(action);
        console.log(state.cims);
    }

    switch (type) {
        case CimActionKind.ADD_ATTRIBUTE:
            const oldClassesAdd = cim.classes;
            const moddedCls = oldClassesAdd.find((c) => c.id === clsId)!;

            moddedCls.addAttribute(payload);
            const newCimClasses = [...oldClassesAdd.filter((c) => c.id !== clsId), moddedCls];
            const newCim = cim;
            newCim.classes = newCimClasses;
            const newState: CimState2 = {
                ...state,
                cims: [...state.cims.filter((c) => c.id !== cim.id), newCim],
                highlightedElement: moddedCls,
                needsSync: true,
            };
            return newState;
        case CimActionKind.REMOVE_ATTRIBUTE:
            const oldClassesRem = cim.classes;
            const clsToRemoveAttribute = oldClassesRem.find((c) => c.id === clsId)!;

            clsToRemoveAttribute.removeAttribute(payload.name);

            const newCimClassesRem = [...oldClassesRem.filter((c) => c.id !== clsId), clsToRemoveAttribute];
            const newCimRem = cim;
            newCimRem.classes = newCimClassesRem;

            return {
                ...state,
                cims: [...state.cims.filter((c) => c.id !== cim.id), newCimRem],
                highlightedElement: clsToRemoveAttribute,
                needsSync: true,
            } as CimState2;

        case CimActionKind.REMOVE_FOCUS:
            return { ...state, highlightedElement: undefined } as CimState2;

        case CimActionKind.ELEMENT_MOVE:
            const pos = payload.position as Position;
            const newLayout = state.viewLayout;
            if (!newLayout) throw new Error("CimLayout for " + cim.id + " should be defined");
            newLayout.setPosition(clsId!, pos);
            return { ...state, viewLayout: newLayout } as CimState2;

        case CimActionKind.SYNC_DONE:
            return {
                ...state,
                needsSync: false,
            };

        default:
            return { ...state, highlightedElement: undefined } as CimState2;
    }
};
