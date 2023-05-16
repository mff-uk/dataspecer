// NOT USED, TODO: remove if not needed

import type { CimClass, Association, Cim, Attribute } from "./model/cim-defs";
import type { CimLayout, Position } from "./layout/cim-layout";
import type { ViewLayout } from "./layout/view-layout";

export enum CimActionKind {
    ADD_ATTRIBUTE,
    REMOVE_ATTRIBUTE,
    FOCUS,
    REMOVE_FOCUS,
    ELEMENT_MOVE,
    SYNC_DONE,
    ADD_CLASS_TO_VIEW,
    REMOVE_CLASS_FROM_VIEW,
}

export type CimActionPayload = Attribute | Position | ViewLayout;

export interface CimAction {
    type: CimActionKind;
    clsId?: string;
    cls?: CimClass;
    payload?: CimActionPayload;
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

export interface CimState2 {
    cims: Cim[];
    viewLayout: ViewLayout;
    highlightedElement?: CimClass;
    needsSync: boolean;
}

export const cimChangeReducer2: (state: CimState2, action: CimAction) => CimState2 = (state, action) => {
    const { type, clsId, cls, payload } = action;
    const cim = state.cims.filter((c) => c.classes.find((cls) => cls.id === clsId)).at(0); // should be exactly one
    if (!cim) {
        console.log(action);
        console.log(state.cims);
    }

    switch (type) {
        case CimActionKind.ADD_ATTRIBUTE:
            cls?.addAttribute(payload as Attribute);

            return { ...state, needsSync: true, highlightedElement: cls };
        case CimActionKind.REMOVE_ATTRIBUTE:
            cls?.removeAttribute((payload as Attribute).name);

            return {
                ...state,
                highlightedElement: cls,
                needsSync: true,
            };
        case CimActionKind.FOCUS:
            return { ...state, highlightedElement: cls };

        case CimActionKind.REMOVE_FOCUS:
            return { ...state, highlightedElement: undefined };

        case CimActionKind.ADD_CLASS_TO_VIEW:
            if (cls) {
                (payload as ViewLayout).addClassToView(cls);
            } else {
                throw new Error(
                    "CimAction.ADD_CLASS_TO_VIEW should only be called with cimClass in cls and viewLayout as payload"
                );
            }

            return { ...state, needsSync: true };

        case CimActionKind.REMOVE_CLASS_FROM_VIEW:
            if (cls) {
                const successfullyRemoved = (payload as ViewLayout).removeClassFromView(cls);
                return successfullyRemoved ? { ...state, needsSync: true } : state;
            } else {
                throw new Error(
                    "CimAction.REMOVE_CLASS_FROM_VIEW should only be called with cimClass in cls and viewLayout as payload"
                );
            }

        case CimActionKind.ELEMENT_MOVE:
            const pos = action.payload as Position;
            const newLayout = state.viewLayout;
            if (!newLayout) throw new Error(`CimLayout for ${cim ? cim.id : ""} should be defined`);
            if (cls) newLayout.setPositionWithRef(cls, pos); // set by class reference

            return { ...state, viewLayout: newLayout };

        case CimActionKind.SYNC_DONE:
            return {
                ...state,
                needsSync: false,
            };

        default:
            return { ...state, highlightedElement: undefined };
    }
};
