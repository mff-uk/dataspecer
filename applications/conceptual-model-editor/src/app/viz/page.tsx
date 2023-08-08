"use client";

import React, { Suspense, useRef, useState } from "react";
import { getSampleCimOf } from "./model/cim-defs";
import { CimContext2, CimContext2Type, useCimContext2 } from "./utils/hooks/use-cim-context2";
import { getRandomViewLayoutFor } from "./layout/view-layout";
import Header from "../components/header";
import { Playground4 } from "./playground4";
import Sidebar2 from "./sidebar2";
import { ViewLayoutContext2 } from "./utils/hooks/use-view-layout-context2";
import { AvailableCimClasses } from "./available-cim-classes";

const sampleCim5 = getSampleCimOf(5, 6);

const Page = () => {
    const [cims, setCims] = useState([getSampleCimOf(3, 5), sampleCim5]);
    const [viewLayout, setViewLayout] = useState(getRandomViewLayoutFor({ x: 1400, y: 700 }, ...cims));

    return (
        <>
            <Header page="Cim Editor - Viz mode" />

            <div className="flex flex-row">
                <Suspense fallback={<>Loading...</>}>
                    <CimContext2.Provider value={{ cims, setCims } as CimContext2Type}>
                        <ViewLayoutContext2.Provider value={{ viewLayout, setViewLayout }}>
                            <AvailableCimClasses />
                            <Playground4 />
                            <Sidebar2 />
                        </ViewLayoutContext2.Provider>
                    </CimContext2.Provider>
                </Suspense>
            </div>
        </>
    );
};

export default Page;
