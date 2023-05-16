"use client";

import React, { useEffect, useRef, useState } from "react";
import { JointJsAdapterBuilder2 } from "./jointjs-adapter";
import { useCimContext } from "./utils/hooks/use-cim-context";
import { useViewLayoutContext } from "./utils/hooks/use-view-layout-context";
import { type DiaLibAdapter } from "./diagram-library-adapter";
import SyncDiaButton from "./components/sync-dia-button";
import { type ViewStyle } from "./layout/view-layout";

const ToggleCimClassStyle = (props: { stylee: ViewStyle; toggle: () => void }) => {
    return (
        <div className="absolute left-8 top-2">
            <button onClick={props.toggle} className="text-indigo-600 hover:text-lg hover:text-indigo-900">
                {props.stylee}
            </button>
        </div>
    );
};

export const Playground3: React.FC = () => {
    const { cimContext, focusOnElement, removeFocus } = useCimContext();
    const { viewLayoutContext, handleChangePosition, toggleViewStyle } = useViewLayoutContext();
    const canvasRef = useRef(null);

    const diaLibAdapterBuilder = new JointJsAdapterBuilder2();

    const [diaLibAdapter, setDiaLibAdapter] = useState<DiaLibAdapter | null>(null);

    useEffect(() => {
        const diaLibAdapter = diaLibAdapterBuilder
            .mountTo(canvasRef.current)
            .paperOptions({
                background: "#f9e7e7",
                height: viewLayoutContext.paperSize.y,
                width: viewLayoutContext.paperSize.x,
            })
            .getAdapter();

        diaLibAdapter.setOnCimClassPositionChangeHandler(handleChangePosition);
        diaLibAdapter.setCimClassClickListener(focusOnElement);
        diaLibAdapter.setOnBlankPaperClickHandler(removeFocus);

        diaLibAdapter.syncDiaToState(cimContext, viewLayoutContext);

        setDiaLibAdapter(diaLibAdapter);
    }, []);

    return (
        <div className="relative">
            <SyncDiaButton
                refresh={() => {
                    diaLibAdapter?.syncDiaToState(cimContext, viewLayoutContext);
                }}
            />
            <ToggleCimClassStyle stylee={viewLayoutContext.viewStyle} toggle={toggleViewStyle} />
            <div id="canvas420" ref={canvasRef} className="flex-shrink-0" />
        </div>
    );
};
