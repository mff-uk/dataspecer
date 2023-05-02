"use client";

import React, { useReducer } from "react";
import { getSampleCimOf } from "./model/cim-defs";
import { CimState2, cimChangeReducer2 } from "./cim-change-reducer";
import Playground from "./components/playground";
import { Sidebar } from "./components/sidebar";
import Header from "../components/header";
import { getRandomViewLayoutFor } from "./layout/view-layout";
import UglyAvailableCimClasses from "./components/ugly-available-cim-classes";

const Page = () => {
    const sampleCim50 = getSampleCimOf(50, 20);
    const sampleCim30 = getSampleCimOf(30, 15);
    const [state2, dispatch2] = useReducer(cimChangeReducer2, {
        cims: [sampleCim50, sampleCim30],
        viewLayout: getRandomViewLayoutFor({ x: 1500, y: 700 }, sampleCim50, sampleCim30),
    } as CimState2);

    return (
        <>
            <Header page="Cim Editor - Visualization mode" />
            <div className="relative">
                <Playground cimState={state2} cimDispatch={dispatch2} />
                {state2.highlightedElement && (
                    <>
                        <UglyAvailableCimClasses cimState={state2} cimDispatch={dispatch2} />
                        <Sidebar cimState={state2} cimDispatch={dispatch2} />
                    </>
                )}
            </div>
        </>
    );
};

export default Page;
