"use client";

import React, { useState } from "react";
import { type CimClass } from "./model/cim-defs";
import { useCimContext } from "./utils/hooks/use-cim-context";
import { useViewLayoutContext } from "./utils/hooks/use-view-layout-context";

const PresentCimClassRow: React.FC<{ cls: CimClass; removeFromViewHandler: () => void }> = ({
    cls,
    removeFromViewHandler,
}) => {
    return (
        <div className="mx-1 flex flex-row" key={cls.id}>
            <button className="mr-1 hover:bg-slate-200" onClick={removeFromViewHandler}>
                -
            </button>
            <span>{cls.name}</span>
        </div>
    );
};

const AvailableCimClassRow: React.FC<{ cls: CimClass; addToViewHandler: () => void; bgcolor?: string }> = ({
    cls,
    addToViewHandler,
    bgcolor,
}) => {
    const color = bgcolor ?? "";

    return (
        <div className="flex flex-row" style={{ background: color }} key={cls.id}>
            <button className="mr-1 hover:bg-slate-200" onClick={addToViewHandler}>
                +
            </button>
            <span>{cls.name}</span>
        </div>
    );
};

export const AvailableCimClasses: React.FC = () => {
    const { cimContext } = useCimContext();
    const { viewLayoutContext, addClassToView, removeClassFromView } = useViewLayoutContext();

    const [availClassesState, setAvailClassesState] = useState({ vl: viewLayoutContext, c: cimContext });

    const addClassToViewHandler = (cls: CimClass) => {
        console.log(`should add class ${cls.name} to view layout`);
        addClassToView(cls);
        setAvailClassesState({ vl: viewLayoutContext, c: cimContext });
    };

    const removeClassToViewHandler = (cls: CimClass) => {
        console.log("remove button clicked");
        removeClassFromView(cls);
        setAvailClassesState({ vl: viewLayoutContext, c: cimContext });
    };

    return (
        <div className="mx-1">
            <h1 className="mb-2 text-xl">Classes in view</h1>
            <div className="flex flex-col">
                {[...availClassesState.vl.elementPositionMapWithClassRef.keys()].map((c) => (
                    <PresentCimClassRow
                        cls={c}
                        key={`present-class-${c.id}`}
                        removeFromViewHandler={() => removeClassToViewHandler(c)}
                    />
                ))}
            </div>
            <h2 className="mb-2 text-lg">Available Classes</h2>
            <div className="flex flex-col">
                {availClassesState.c.cims
                    .map((c) => c.classes)
                    .flat()
                    .filter((cls) => !availClassesState.vl.elementPositionMapWithClassRef.has(cls))
                    .map((c) => (
                        <AvailableCimClassRow
                            cls={c}
                            key={`avail-class-${c.id}`}
                            bgcolor={viewLayoutContext.colorOfCim(c.cimId)}
                            addToViewHandler={() => addClassToViewHandler(c)}
                        />
                    ))}
            </div>
        </div>
    );
};
