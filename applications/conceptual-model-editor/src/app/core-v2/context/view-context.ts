import React, { useContext, useEffect, useMemo, useState } from "react";
import { type Position } from "../visualization/position";
import { LanguageString } from "@dataspecer/core/core";
import { getRandomPosition } from "../util/utils";
import { useBackendConnection } from "../backend-connection";
import { useModelGraphContext } from "./graph-context";
import { usePackageSearch } from "../util/package-search";

export type ViewLayout = {
    id: string;
    name: LanguageString;
    elementPositionMap: Map<string, Position>; // [class.id, position]
};

export type ViewContextType = {
    activeViewId: string;
    setActiveViewId: React.Dispatch<React.SetStateAction<string>>;
    viewLayouts: ViewLayout[];
    setViewLayouts: React.Dispatch<React.SetStateAction<ViewLayout[]>>;
};

export const ViewContext = React.createContext(null as unknown as ViewContextType);

export const useViewContext = () => {
    const { activeViewId, viewLayouts, setActiveViewId, setViewLayouts } = useContext(ViewContext);
    const { getViewsFromBackend } = useBackendConnection();
    const { packageId } = usePackageSearch();
    const [classesAndPositions, setClassesAndPositions] = useState<Map<string, Position> | undefined>();

    // todo: how to deal with views? will they be loaded along with the package from backend?
    useEffect(() => {
        if (!packageId) return;
        const callSyncViewsWithBackend = () => {
            syncViewsWithBackend(packageId);
        };
        callSyncViewsWithBackend();
    }, [packageId]);

    const activeView = useMemo(() => viewLayouts.find((vl) => vl.id == activeViewId), [activeViewId, viewLayouts]);

    useEffect(() => {
        setClassesAndPositions(new Map(activeView?.elementPositionMap));
    }, [activeViewId, viewLayouts]);

    const syncViewsWithBackend = async (forWhatPackageId: string) => {
        const vls = await getViewsFromBackend(forWhatPackageId);
        const maybeViewId = vls.at(0)?.id;
        if (maybeViewId) {
            setActiveViewId(maybeViewId);
        }
        setViewLayouts(vls);
    };

    const addClassToActiveView = (classId: string) => {
        if (!activeView) return; // TODO: what if active view is undefined?
        const pos = getRandomPosition();
        activeView?.elementPositionMap.set(classId, pos);
        setViewLayouts((prev) => [...prev]);
    };

    const createView = (id: string, name: LanguageString) => {
        const vl = { id, name, elementPositionMap: new Map() } as ViewLayout;
        setViewLayouts((prev) => prev.concat(vl));
    };

    const updateClassPosition = (classId: string, position: Position | undefined) => {
        if (!position) return;
        activeView?.elementPositionMap.set(classId, position);
        // setClassesAndPositions((prev) => prev?.set(classId, position));
        setViewLayouts((prev) => [...prev]);
    };

    return {
        activeViewId,
        addClassToActiveView,
        viewLayouts,
        setActiveViewId,
        classesAndPositions,
        updateClassPosition,
    };
};
