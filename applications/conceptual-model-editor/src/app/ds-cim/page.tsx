"use client";

import React, { Suspense, useState } from "react";
import { CimAdapter } from "@dataspecer/core/cim";
import { CimAdapterContext, useCimAdapterContext } from "./hooks/use-cim-adapter-context";
import { PimClass } from "@dataspecer/core/pim/model";
import Header from "../components/header";
import { ViewLayoutContext, getRandomViewLayoutFor, useViewLayoutContext } from "./view-layout";
import { Vocabularies } from "./vocabularies";
import { NewCimAdapter, getSampleAdapters } from "./cim-adapters/cim-adapters";
import { LocalChange, LocalChangesContext } from "./hooks/use-local-changes-context";
import { HtmlVisualisation } from "./visualizations/html-visualisation";

const SearchClassesComponent = () => {
    const { searchClasses } = useCimAdapterContext();
    const [searchedTerm, setSearchedTerm] = useState("");

    const search = (e: React.FormEvent) => {
        e.preventDefault();
        searchClasses(searchedTerm);
        setSearchedTerm("");
    };

    return (
        <div>
            <form onSubmit={search}>
                <input
                    type="text"
                    className="rounded border-2 border-amber-600"
                    value={searchedTerm}
                    onChange={(e) => setSearchedTerm(e.target.value)}
                />
                <input
                    className="rounded border border-indigo-600 bg-indigo-50 hover:bg-indigo-100"
                    type="submit"
                    value="Load classes"
                />
            </form>
        </div>
    );
};

const PimClassComponent = (props: { pimCls: PimClass; fromCim: CimAdapter }) => {
    const { loadNeighbors } = useCimAdapterContext();
    const { addClassToView2 } = useViewLayoutContext();

    const cls = props.pimCls;
    const fromCim = props.fromCim;
    return (
        <div className="my-1 flex flex-row justify-between border border-indigo-200 hover:bg-indigo-50">
            <div>
                <h1>{cls.iri}</h1>
                <div>...</div>
            </div>
            <div className="flex flex-col">
                <button
                    className="rounded border border-indigo-600 bg-indigo-50 hover:bg-indigo-100"
                    onClick={(e) => {
                        e.preventDefault();
                        console.log(cls);
                        loadNeighbors(cls);
                    }}
                >
                    Load my neighbors
                </button>
                <button
                    className="rounded border border-indigo-600 bg-indigo-50 hover:bg-indigo-100"
                    onClick={(e) => {
                        e.preventDefault();
                        addClassToView2(cls, fromCim);
                    }}
                >
                    Add me to view
                </button>
            </div>
        </div>
    );
};

const ListOfAvailableClasses = () => {
    const { cims, classes2 } = useCimAdapterContext();

    if (cims.length == 0) return <>No cim present</>;

    return (
        <div>
            <SearchClassesComponent />

            <h1>Classes</h1>
            {[...classes2.keys()].map((cimAdapter, index) => (
                <div key={`cimAdapter${index}`}>
                    <h3>fromCim: CimAdapter{index}</h3>
                    <div>
                        {classes2.get(cimAdapter)?.map((cls) => (
                            <PimClassComponent pimCls={cls} fromCim={cimAdapter} key={cls.iri} />
                        ))}
                    </div>
                </div>
            ))}
        </div>
    );
};

// source https://stackoverflow.com/a/46403589
const svgExporter = (svgElement: SVGSVGElement, name: string) => {
    if (!svgElement) return null;

    console.log("this should export something to .svg file.");
    return;

    const svgData = svgElement.outerHTML;
    const preface = '<?xml version="1.0" standalone="no"?>\r\n';
    const svgBlob = new Blob([preface, svgData], { type: "image/svg+xml;charset=utf-8" });
    const svgUrl = URL.createObjectURL(svgBlob);
    const downloadLink = document.createElement("a");
    downloadLink.href = svgUrl;
    downloadLink.download = name;
    svgElement.appendChild(downloadLink);
    downloadLink.click();
    svgElement.removeChild(downloadLink);
};

export default function Page() {
    // const [cims, setCims] = useState<CimAdapter[]>([getSgovAdapter(), getSomeRDFsFileAdapter()]);
    const [cims, setCims] = useState<NewCimAdapter[]>(getSampleAdapters());
    const [classes, setClasses] = useState([] as PimClass[]);
    const [classes2, setClasses2] = useState(new Map<NewCimAdapter, PimClass[]>());
    const [viewLayout, setViewLayout] = useState(getRandomViewLayoutFor({ x: 1000, y: 500 }, cims));
    const [localChanges, setLocalChanges] = useState([] as LocalChange[]);

    return (
        <>
            <Header page="Cim Adapter from @dataspecer/core" />
            <Suspense fallback={<>Loading</>}>
                <CimAdapterContext.Provider value={{ cims, setCims, classes, setClasses, classes2, setClasses2 }}>
                    <LocalChangesContext.Provider value={{ localChanges, setLocalChanges }}>
                        <ViewLayoutContext.Provider value={{ viewLayout, setViewLayout }}>
                            <div className="my-0 grid h-[calc(100%-48px)] grid-cols-[20%_auto_20%] grid-rows-1">
                                <Vocabularies />
                                {/* <ListOfAvailableClasses /> */}
                                <HtmlVisualisation />
                                <div>sidebar</div>
                            </div>
                        </ViewLayoutContext.Provider>
                    </LocalChangesContext.Provider>
                </CimAdapterContext.Provider>
            </Suspense>
        </>
    );
}
