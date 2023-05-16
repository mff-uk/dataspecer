"use client";

import React, { Suspense } from "react";
import { getSampleCimOf } from "./model/cim-defs";
import Header from "../components/header";
import { getRandomViewLayoutFor } from "./layout/view-layout";
import { Playground3 } from "./playground3";
import { CimContext, type CimStateContextType } from "./utils/hooks/use-cim-context";
import { AvailableCimClasses } from "./available-cim-classes";
import { ViewLayoutContext } from "./utils/hooks/use-view-layout-context";
import Sidebar2 from "./sidebar2";

// const Page = () => {
//     const sampleCim50 = getSampleCimOf(50, 20);
//     const sampleCim30 = getSampleCimOf(30, 15);
//     const [state2, dispatch2] = useReducer(cimChangeReducer2, {
//         cims: [sampleCim50, sampleCim30],
//         viewLayout: getRandomViewLayoutFor({ x: 1500, y: 700 }, sampleCim50, sampleCim30),
//     } as CimState2);

//     return (
//         <>
//             <Header page="Cim Editor - Visualization mode" />
//             <div className="relative">
//                 <UglyAvailableCimClasses cimState={state2} cimDispatch={dispatch2} />
//                 <Playground2 cimState={state2} cimDispatch={dispatch2} />
//                 {state2.highlightedElement && <Sidebar cimState={state2} cimDispatch={dispatch2} />}
//             </div>
//         </>
//     );
// };

const sampleCim5 = getSampleCimOf(5, 6);
const viewLayout = getRandomViewLayoutFor({ x: 1400, y: 700 }, sampleCim5);

export default function Page() {
    // const sampleCim30 = getSampleCimOf(30, 15);
    // const cimContext = { cims: [sampleCim30], highlightedElement: sampleCim30.classes.at(0) } as CimStateContextType;
    // const viewLayoutContext = getRandomViewLayoutFor({ x: 1000, y: 700 }, sampleCim30);

    const cimContext = { cims: [sampleCim5], highlightedElement: undefined } as CimStateContextType;

    return (
        <>
            <Header page="Cim Editor - Viz mode" />

            <div className="flex flex-row">
                <Suspense fallback={<>Loading...</>}>
                    <CimContext.Provider value={cimContext}>
                        <ViewLayoutContext.Provider value={viewLayout}>
                            <AvailableCimClasses />
                            <Playground3 />
                            <Sidebar2 />
                        </ViewLayoutContext.Provider>
                    </CimContext.Provider>
                </Suspense>
            </div>
        </>
    );
}
