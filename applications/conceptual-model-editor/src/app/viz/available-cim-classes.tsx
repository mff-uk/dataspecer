"use client";

import React from "react";
import { type CimClass } from "./model/cim-defs";
import { useCimContext2 } from "./utils/hooks/use-cim-context2";
import { useViewLayoutContext2 } from "./utils/hooks/use-view-layout-context2";

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
    const { cims } = useCimContext2();
    const { viewLayout, addClassToView, removeFromView, colorOfCim } = useViewLayoutContext2();

    return (
        <div className="mx-1">
            <h1 className="mb-2 text-xl">Classes in view</h1>
            <div className="flex flex-col">
                {[...viewLayout.elementPositionMapWithClassRef.keys()].map((c) => (
                    <PresentCimClassRow
                        cls={c}
                        key={`present-class-${c.id}`}
                        removeFromViewHandler={() => removeFromView(c)}
                    />
                ))}
            </div>
            <h2 className="mb-2 text-lg">Available Classes</h2>
            <div className="flex flex-col">
                {cims
                    .map((c) => c.classes)
                    .flat()
                    .filter((cls) => !viewLayout.elementPositionMapWithClassRef.has(cls))
                    .map((c) => (
                        <AvailableCimClassRow
                            cls={c}
                            key={`avail-class-${c.id}`}
                            bgcolor={colorOfCim(c.cimId)}
                            addToViewHandler={() => addClassToView(c)}
                        />
                    ))}
            </div>
        </div>
    );
};
