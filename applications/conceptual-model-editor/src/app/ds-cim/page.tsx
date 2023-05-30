"use client";

import { SgovAdapter } from "@dataspecer/sgov-adapter";
import { httpFetch } from "@dataspecer/core/io/fetch/fetch-browser";
import { Suspense, useEffect, useRef, useState } from "react";
import { CimAdapter, IriProvider } from "@dataspecer/core/cim";
import { CimAdapterContext, useCimAdapterContext } from "./hooks/use-cim-adapter-context";
import { PimClass } from "@dataspecer/core/pim/model";
import Header from "../components/header";
import { JointJsAdapter4 } from "./jointjs-adapters";
import { ViewLayoutContext, getRandomViewLayoutFor, useViewLayoutContext } from "./view-layout";
import { RdfsFileAdapter } from "../../../../../packages/rdfs-adapter/lib";

class MyIriProvider implements IriProvider {
    cimToPim(cimId: string): string {
        return cimId; // keep shit the same
    }
    pimToCim(pimId: string): string {
        return pimId; // keep shit the same
    }
}

const getSgovAdapter = () => {
    const sgovAdapter = new SgovAdapter("https://slovník.gov.cz/sparql", httpFetch);
    sgovAdapter.setIriProvider(new MyIriProvider());
    return sgovAdapter;
};

const getSomeRDFsFileAdapter = () => {
    const rdfsAdapter = new RdfsFileAdapter(
        [
            "https://mff-uk.github.io/demo-vocabularies/original/adms.ttl",
            "https://mff-uk.github.io/demo-vocabularies/original/dublin_core_terms.ttl",
        ],
        httpFetch
    );
    rdfsAdapter.setIriProvider(new MyIriProvider());
    return rdfsAdapter;
};

// const HighlightedClassComponent = (props: { highlightedClass: PimClass | null }) => {
//     const { loadNeighbors } = useCimAdapterContext();
//     const { addClassToView } = useViewLayoutContext();

//     const highlightedClass = props.highlightedClass;

//     return (
//         <>
//             {highlightedClass && (
//                 <div>
//                     <div>{highlightedClass.iri}</div>
//                     <button
//                         className="rounded border border-indigo-600 bg-indigo-50 hover:bg-indigo-100"
//                         onClick={(e) => {
//                             e.preventDefault();
//                             loadNeighbors(highlightedClass);
//                         }}
//                     >
//                         Load neighbors of:
//                     </button>
//                     <button
//                         className="rounded border border-indigo-600 bg-indigo-50 hover:bg-indigo-100"
//                         onClick={(e) => {
//                             e.preventDefault();
//                             addClassToView(highlightedClass);
//                         }}
//                     >
//                         Add to view
//                     </button>
//                 </div>
//             )}
//         </>
//     );
// };

const SearchClassesComponent = () => {
    const { searchClasses } = useCimAdapterContext();
    const [searchedTerm, setSearchedTerm] = useState("");

    return (
        <div>
            <input
                type="text"
                className="rounded border-2 border-amber-600"
                value={searchedTerm}
                onChange={(e) => setSearchedTerm(e.target.value)}
            />
            <button
                className="rounded border border-indigo-600 bg-indigo-50 hover:bg-indigo-100"
                onClick={(e) => {
                    e.preventDefault();
                    searchClasses(searchedTerm);
                    setSearchedTerm("");
                }}
            >
                Load classes
            </button>
        </div>
    );
};

// const PimClassComponent = (props: { pimCls: PimClass; highlightedClassSetter: (cls: PimClass) => void }) => {
//     const cls = props.pimCls;
//     return (
//         <div
//             className="my-1 border border-indigo-200 hover:bg-indigo-50"
//             onClick={() => props.highlightedClassSetter(cls)}
//         >
//             <h1>{cls.iri}</h1>
//             <div>...</div>
//         </div>
//     );
// };

const PimClassComponent2 = (props: { pimCls: PimClass; fromCim: CimAdapter }) => {
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
    // const [highlightedCls, setHighlightedCls] = useState(null as unknown as PimClass);

    if (cims.length == 0) return <>No cim present</>;

    return (
        <div>
            <SearchClassesComponent />
            {/* <HighlightedClassComponent highlightedClass={highlightedCls} /> */}
            {/* <h1>Classes</h1>
            <div>
                {classes.map((pc) => (
                    <PimClassComponent pimCls={pc} highlightedClassSetter={setHighlightedCls} key={pc.iri} />
                ))}
            </div> */}

            <h1>Classes</h1>
            {[...classes2.keys()].map((cimAdapter, index) => (
                <div key={`cimAdapter${index}`}>
                    <h3>fromCim: CimAdapter{index}</h3>
                    <div>
                        {classes2.get(cimAdapter)?.map((cls) => (
                            // <PimClassComponent pimCls={cls} highlightedClassSetter={setHighlightedCls} key={cls.iri} />
                            <PimClassComponent2 pimCls={cls} fromCim={cimAdapter} key={cls.iri} />
                        ))}
                    </div>
                </div>
            ))}
        </div>
    );
};

const Visualisation = () => {
    const canvasRef = useRef(null);
    const { classes } = useCimAdapterContext();
    const { viewLayout } = useViewLayoutContext();

    const [adapter, setAdapter] = useState<JointJsAdapter4 | null>(null);

    useEffect(() => {
        if (!canvasRef.current) return;
        const newAdapter = new JointJsAdapter4(
            new Map(),
            { w: 1000, h: 500, bg: "lightpink" },
            canvasRef.current as unknown as Element
        );
        setAdapter(newAdapter);
    }, [canvasRef]);

    useEffect(() => {
        adapter?.sync(classes, viewLayout);
    }, [classes, viewLayout]);

    return (
        <>
            <button
                className="rounded border border-indigo-600 bg-indigo-50 hover:bg-indigo-100"
                onClick={() => adapter?.sync(classes, viewLayout)}
            >
                sync viz
            </button>
            <div id="canvas" className="h-[500px] w-full bg-amber-50" ref={canvasRef} />
        </>
    );
};

export default function Page() {
    const [cims, setCims] = useState<CimAdapter[]>([getSgovAdapter(), getSomeRDFsFileAdapter()]);
    const [classes, setClasses] = useState([] as PimClass[]);
    const [classes2, setClasses2] = useState(new Map<CimAdapter, PimClass[]>());
    const [viewLayout, setViewLayout] = useState(getRandomViewLayoutFor({ x: 1000, y: 500 }, cims));

    return (
        <>
            <Header page="Cim Adapter from @dataspecer/core" />
            <div className="mx-auto max-w-screen-lg">
                <Suspense fallback={<>Loading</>}>
                    <CimAdapterContext.Provider value={{ cims, setCims, classes, setClasses, classes2, setClasses2 }}>
                        <ViewLayoutContext.Provider value={{ viewLayout, setViewLayout }}>
                            <ListOfAvailableClasses />
                            <Visualisation />
                        </ViewLayoutContext.Provider>
                    </CimAdapterContext.Provider>
                </Suspense>
            </div>
        </>
    );
}
