"use client";

import React, { useEffect, useRef, useState } from "react";
import { type DiaLibAdapter } from "./diagram-library-adapter";
import { useViewLayoutContext2 } from "./utils/hooks/use-view-layout-context2";
import { useCimContext2 } from "./utils/hooks/use-cim-context2";
import { JointJsAdapterBuilder3 } from "./jointjs-adapter3";

const ToggleCimClassStyle = () => {
    const { viewLayout, toggleViewStyle } = useViewLayoutContext2();

    return (
        <div className="absolute left-2 top-2">
            <button onClick={toggleViewStyle} className="text-indigo-600 hover:text-lg hover:text-indigo-900">
                {viewLayout.viewStyle}
            </button>
        </div>
    );
};

export const Playground4: React.FC = () => {
    const { cims } = useCimContext2();
    const { viewLayout, colorOfCim, highlightElement, setPositionOf } = useViewLayoutContext2();
    const canvasRef = useRef(null);

    const diaLibAdapterBuilder = new JointJsAdapterBuilder3();

    const [diaLibAdapter, setDiaLibAdapter] = useState(null as unknown as DiaLibAdapter);

    useEffect(() => {
        console.log("first use effect  called, ref", canvasRef.current);
        if (!canvasRef.current) return;
        const diaLibAdapter = diaLibAdapterBuilder
            .mountTo(canvasRef.current)
            .paperOptions({
                background: "#f9e7e7",
                height: viewLayout.paperSize.y,
                width: viewLayout.paperSize.x,
            })
            .getAdapter();

        console.log("adapter created, canvas: ", canvasRef);

        diaLibAdapter.setOnCimClassPositionChangeHandler(setPositionOf);
        diaLibAdapter.setCimClassClickListener(highlightElement);

        setDiaLibAdapter(diaLibAdapter);
        console.log("dia adapter set", diaLibAdapter);
        diaLibAdapter.sync(cims, viewLayout, colorOfCim);
    }, [canvasRef]);

    useEffect(() => {
        console.log("view layout changed");
        diaLibAdapter?.sync(cims, viewLayout, colorOfCim);
    }, [viewLayout]);

    return (
        <div className="relative">
            <ToggleCimClassStyle />
            <div id="canvas420" ref={canvasRef} className="flex-shrink-0">
                <div id="xyuz"></div>
            </div>
        </div>
    );
};
